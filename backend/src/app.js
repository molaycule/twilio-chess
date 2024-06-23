import express from "express";
import TwilioSDK from "twilio";
import OpenAI from "openai";
import cors from "cors";
import configureAWS from "./utils/configureAWS.js";
import handleTwilioResponse from "./utils/handleTwilioResponse.js";
import handleS3Uploader from "./utils/handleS3Uploader.js";
import handleSessionUpdate from "./utils/handleSessionUpdate.js";
import getDBClient from "./utils/getDBClient.js";
import getCorsOptions from "./utils/getCorsOptions.js";
import getGeneratedChessboardDirectory from "./utils/getGeneratedChessboardDirectory.js";
import getUpdatedFenAfterPlayerMove from "./utils/getUpdatedFenAfterPlayerMove.js";
import getAIMoveAndComment from "./utils/getAIMoveAndComment.js";
import getGameEndMessage from "./utils/getGameEndMessage.js";
import promptWinMessage from "./utils/promptWinMessage.js";
import promptRandomizedFEN from "./utils/promptRandomizedFEN.js";
import emailOrPhoneSchema from "./utils/emailOrPhoneSchema.js";
import deleteS3Bucket from "./utils/deleteS3Bucket.js";
import constants from "./constants/index.js";
import { eq } from "drizzle-orm";
import { sessions } from "./db/schema.js";
import { ChessImageGenerator } from "./pkg/chess-image-generator/index.js";
import { config } from "dotenv";

config({ path: "./src/.env" });
configureAWS();

const twilioClient = TwilioSDK(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(express.static(getGeneratedChessboardDirectory()));
app.use(cors(getCorsOptions()));

app.post("/api/chess/initiate", async (req, res) => {
  let db, startingFEN, returnedData;
  try {
    db = getDBClient();
    const userData = req.body;
    emailOrPhoneSchema.parse(userData.contact);

    if (userData.setup.toLowerCase() === "clean") {
      startingFEN = constants.defaultFEN;
    } else if (userData.setup.toLowerCase() === "random") {
      startingFEN = await promptRandomizedFEN({ openai });
    } else {
      throw new Error(
        "Invalid setup value, setup can either be `clean` or `random`"
      );
    }

    if (
      userData.medium.toLowerCase() !== "whatsapp" &&
      userData.medium.toLowerCase() !== "email"
    ) {
      throw new Error(
        "Invalid medium value, medium can either be `whatsapp` or `email`"
      );
    }

    returnedData = await db
      .insert(sessions)
      .values({ ...userData, fen: startingFEN })
      .returning();
    await ChessImageGenerator.fromFEN(
      startingFEN,
      undefined,
      `${userData.contact.split(".")[0]}.png`
    );

    const chessboardImageUrl = await handleS3Uploader(
      userData.contact,
      returnedData[0].id
    );
    if (userData.medium.toLowerCase() === "whatsapp") {
      await twilioClient.messages.create({
        body: "Welcome to Twilio Chess, reply by sending your move in standard chess notation",
        mediaUrl: chessboardImageUrl,
        from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
        to: `whatsapp:${userData.contact}`
      });
    }

    res.json({
      success: true,
      message: "Game On! Your Chess Match Has Begun."
    });
  } catch (error) {
    console.log(error);
    if (returnedData) {
      const sessionId = returnedData[0].id;
      await db.delete(sessions).where(eq(sessions.id, sessionId));
      await deleteS3Bucket(sessionId);
    }
    res.status(400).json({ success: false, error: error.message });
  }
});

app.post("/api/chess/reply", async (req, res) => {
  let db, whatsappNumber, gameEndMessage, session;
  let sessionIsLocked = false;
  const newGameMessage = ` Start a new game by visiting ${process.env.WEB_URL}`;

  try {
    db = getDBClient();
    whatsappNumber = `+${req.body.WaId}`;
    const playerMove = req.body.Body;
    const sessionList = await db.query.sessions.findMany({
      where: (sessions, { eq }) => eq(sessions.contact, whatsappNumber)
    });

    if (sessionList.length == 0) {
      throw new Error("Whatsapp number record not found");
    }

    session = sessionList[0];
    if (session.locked) {
      handleTwilioResponse(
        res,
        "Your previous move is still been processed. Please wait before sending a new reply"
      );
      return;
    }

    await handleSessionUpdate({
      data: { locked: true },
      db,
      whatsappNumber
    });
    sessionIsLocked = true;

    const currentFEN = session.fen;
    const { afterPlayerMoveFEN, gameStatusAfterPlayerMove } =
      await getUpdatedFenAfterPlayerMove({
        move: playerMove,
        currentFEN
      });
    gameEndMessage = getGameEndMessage(gameStatusAfterPlayerMove);
    if (gameEndMessage) {
      await db.delete(sessions).where(eq(sessions.contact, whatsappNumber));
      await deleteS3Bucket(session.id);
      if (gameEndMessage.includes("checkmate")) {
        const playerWinMessage = await promptWinMessage({
          type: "player",
          openai
        });
        handleTwilioResponse(res, playerWinMessage.concat(newGameMessage));
      } else {
        handleTwilioResponse(res, gameEndMessage.concat(newGameMessage));
      }
      return;
    }

    const { aiMove, comment, gameStatusAfterAIMove } =
      await getAIMoveAndComment({
        currentFEN: afterPlayerMoveFEN,
        playerMove,
        openai
      });
    const afterAIMoveFEN = aiMove.after;
    gameEndMessage = getGameEndMessage(gameStatusAfterAIMove);
    if (gameEndMessage) {
      await db.delete(sessions).where(eq(sessions.contact, whatsappNumber));
      await deleteS3Bucket(session.id);
      if (gameEndMessage.includes("checkmate")) {
        const aiWinMessage = await promptWinMessage({ type: "ai", openai });
        handleTwilioResponse(res, aiWinMessage.concat(newGameMessage));
      } else {
        handleTwilioResponse(res, gameEndMessage.concat(newGameMessage));
      }
      return;
    }

    await handleSessionUpdate({
      data: { fen: afterAIMoveFEN },
      db,
      whatsappNumber
    });
    await ChessImageGenerator.fromFEN(
      afterPlayerMoveFEN,
      aiMove.lan,
      `${whatsappNumber}.png`
    );

    const chessboardImageUrl = await handleS3Uploader(
      whatsappNumber,
      session.id
    );
    await twilioClient.messages.create({
      body: `${comment} Reply by sending your move in standard chess notation`,
      mediaUrl: chessboardImageUrl,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${whatsappNumber}`
    });

    res.json({ success: true });
  } catch (error) {
    console.log(error);
    if (error.message.includes("Invalid player move")) {
      handleTwilioResponse(
        res,
        "Invalid move. Please use standard chess notation (e.g. e4, e2e4, or e2-e4) and ensure your king isn't in check."
      );
    } else if (error.message.includes(constants.aiMaxRetryMessage)) {
      await db.delete(sessions).where(eq(sessions.contact, whatsappNumber));
      await deleteS3Bucket(session.id);
      handleTwilioResponse(
        res,
        constants.aiMaxRetryMessage.concat(newGameMessage)
      );
    } else {
      res.status(400).json({ success: false, error: error.message });
    }
  } finally {
    if (whatsappNumber && sessionIsLocked) {
      await handleSessionUpdate({
        data: { locked: false },
        db,
        whatsappNumber
      });
    }
  }
});

// Run the server!
const port = process.env.PORT || 4000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

// Handle termination signals
["SIGINT", "SIGTERM"].forEach(signal =>
  process.on(signal, () => {
    console.log(`Process ${signal} received.`);
    process.exit(0);
  })
);
