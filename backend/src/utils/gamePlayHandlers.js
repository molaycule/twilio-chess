import { eq } from "drizzle-orm";
import { sessions } from "../db/schema.js";
import { ChessImageGenerator } from "../pkg/chess-image-generator/index.js";
import constants from "../constants/index.js";
import handleSessionUpdate from "./handleSessionUpdate.js";
import getUpdatedFenAfterPlayerMove from "./getUpdatedFenAfterPlayerMove.js";
import getGameEndMessage from "./getGameEndMessage.js";
import promptWinMessage from "./promptWinMessage.js";
import getAIMoveAndComment from "./getAIMoveAndComment.js";
import handleTwilioResponse from "./handleTwilioResponse.js";
import handleS3Uploader from "./handleS3Uploader.js";
import deleteS3Bucket from "./deleteS3Bucket.js";

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

export { gamePlayFlow, gamePlayFlowErrorHandler };
