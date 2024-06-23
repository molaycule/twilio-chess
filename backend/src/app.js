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
import userContactSchema from "./utils/userContactSchema.js";
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
    userContactSchema.parse([userData.medium, userData.contact]);

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
      userData.medium.toLowerCase() !== "facebook"
    ) {
      throw new Error(
        "Invalid medium value, medium can either be `whatsapp` or `facebook`"
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
      message: "Game On! Your Chess Match Has Begun." // for whatsapp TODO: for facebook
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

app.post("/api/chess/facebook/user-initiate", async (req, res) => {
  let db, fbUserId, session;
  let sessionIsLocked = false;
  const newGameMessage = ` Start a new game by visiting ${process.env.WEB_URL}`;

  try {
    db = getDBClient();
    const playerMove = req.body.Body || "e4";
    const userId = req.body.From || "messenger:7737511812969346";
    fbUserId = userId.split("messenger:")[1];
    const sessionList = await db.query.sessions.findMany({
      where: (sessions, { eq }) => eq(sessions.contact, fbUserId)
    });

    if (sessionList.length == 0) {
      throw new Error("Facebook user id record not found");
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
      userContact: fbUserId,
      db
    });
    sessionIsLocked = true;

    if (session.fbInit === null) {
      await handleSessionUpdate({
        data: { fbInit: true },
        userContact: fbUserId,
        db
      });
      await ChessImageGenerator.fromFEN(
        session.fen,
        undefined,
        `${fbUserId}.png`
      );
      const chessboardImageUrl = await handleS3Uploader(fbUserId, session.id);
      handleTwilioResponse(
        res,
        `Welcome to Twilio Chess, reply by sending your move in standard chess notation. Link to preview current chess board ${chessboardImageUrl}`
      );
    } else if (session.fbInit) {
      const { comment, chessboardImageUrl } = await gamePlayFlow({
        userContact: fbUserId,
        session,
        playerMove,
        db,
        openai,
        res,
        newGameMessage
      });
      handleTwilioResponse(
        res,
        `${comment} Link to preview current chess board ${chessboardImageUrl}. Reply by sending your move in standard chess notation`
      );
    }
  } catch (error) {
    await gamePlayFlowErrorHandler({
      userContact: fbUserId,
      error,
      db,
      res,
      session,
      newGameMessage
    });
  } finally {
    if (fbUserId && sessionIsLocked) {
      await handleSessionUpdate({
        data: { locked: false },
        userContact: fbUserId,
        db
      });
    }
  }
});

app.post("/api/chess/reply", async (req, res) => {
  let db, whatsappNumber, session;
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
      userContact: whatsappNumber,
      db
    });
    sessionIsLocked = true;

    const { comment, chessboardImageUrl } = await gamePlayFlow({
      userContact: whatsappNumber,
      session,
      playerMove,
      db,
      openai,
      res,
      newGameMessage
    });
    await twilioClient.messages.create({
      body: `${comment} Reply by sending your move in standard chess notation`,
      mediaUrl: chessboardImageUrl,
      from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
      to: `whatsapp:${whatsappNumber}`
    });

    res.json({ success: true });
  } catch (error) {
    await gamePlayFlowErrorHandler({
      userContact: whatsappNumber,
      error,
      db,
      res,
      session,
      newGameMessage
    });
  } finally {
    if (whatsappNumber && sessionIsLocked) {
      await handleSessionUpdate({
        data: { locked: false },
        userContact: whatsappNumber,
        db
      });
    }
  }
});

async function gamePlayFlow({
  session,
  playerMove,
  db,
  userContact,
  openai,
  res,
  newGameMessage
}) {
  const currentFEN = session.fen;
  const { afterPlayerMoveFEN, gameStatusAfterPlayerMove } =
    await getUpdatedFenAfterPlayerMove({
      move: playerMove,
      currentFEN
    });

  let gameEndMessage = getGameEndMessage(gameStatusAfterPlayerMove);
  if (gameEndMessage) {
    await db.delete(sessions).where(eq(sessions.contact, userContact));
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

  const { aiMove, comment, gameStatusAfterAIMove } = await getAIMoveAndComment({
    currentFEN: afterPlayerMoveFEN,
    playerMove,
    openai
  });
  const afterAIMoveFEN = aiMove.after;
  gameEndMessage = getGameEndMessage(gameStatusAfterAIMove);
  if (gameEndMessage) {
    await db.delete(sessions).where(eq(sessions.contact, userContact));
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
    userContact,
    db
  });
  await ChessImageGenerator.fromFEN(
    afterPlayerMoveFEN,
    aiMove.lan,
    `${userContact}.png`
  );
  const chessboardImageUrl = await handleS3Uploader(userContact, session.id);
  return { comment, chessboardImageUrl };
}

async function gamePlayFlowErrorHandler({
  error,
  db,
  res,
  session,
  userContact,
  newGameMessage
}) {
  console.log(error);
  try {
    if (error.message.includes("Invalid player move")) {
      handleTwilioResponse(
        res,
        "Invalid move. Please use standard chess notation (e.g. e4, e2e4, or e2-e4) and ensure your king isn't in check."
      );
    } else if (error.message.includes(constants.aiMaxRetryMessage)) {
      await db.delete(sessions).where(eq(sessions.contact, userContact));
      await deleteS3Bucket(session.id);
      handleTwilioResponse(
        res,
        constants.aiMaxRetryMessage.concat(newGameMessage)
      );
    } else {
      res.status(400).json({ success: false, error: error.message });
    }
  } catch (innerError) {
    console.error("Error handling game play flow error:", innerError);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
}

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
