import { Chess } from "chess.js";
import promptAIChessMove from "./promptAIChessMove.js";
import constants from "../constants/index.js";
import extractJSON from "./extractJSON.js";

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

export default async function getAIMoveAndComment({
  currentFEN,
  playerMove,
  openai,
  retryCount = 0
}) {
  try {
    if (retryCount > constants.maxRetryCount) {
      throw new Error(constants.aiMaxRetryMessage);
    }

    const statusMap = constants.gameStatusMap;
    const response = await promptAIChessMove({
      currentFEN,
      playerMove,
      openai
    });
    const json = extractJSON(response);
    console.log("extracted json from response", json);
    const { move, comment } = json;
    const chess = new Chess(currentFEN);
    const aiMove = chess.move(move);
    const gameStatus =
      Object.entries(statusMap).find(([method]) => chess[method]())?.[1] ||
      null;
    return { gameStatusAfterAIMove: gameStatus, aiMove, comment };
  } catch (error) {
    console.log("err", error);
    if (error.message.includes("Invalid move")) {
      const backoffTimeMs = Math.pow(2, retryCount) * 1000;
      const backoffTimeSec = backoffTimeMs / 1000;
      console.log(`Retrying in ${backoffTimeSec} seconds...`);
      await delay(backoffTimeMs);
      return await getAIMoveAndComment({
        retryCount: retryCount + 1,
        currentFEN,
        openai
      });
    }
    throw error;
  }
}
