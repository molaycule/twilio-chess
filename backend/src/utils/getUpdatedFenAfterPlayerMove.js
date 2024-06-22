import { Chess } from "chess.js";
import constants from "../constants/index.js";

export default async function getUpdatedFenAfterPlayerMove({
  currentFEN,
  move
}) {
  try {
    const statusMap = constants.gameStatusMap;
    const chess = new Chess(currentFEN);
    const playerMove = chess.move(move);
    const gameStatus =
      Object.entries(statusMap).find(([method]) => chess[method]())?.[1] ||
      null;
    return {
      afterPlayerMoveFEN: playerMove.after,
      gameStatusAfterPlayerMove: gameStatus
    };
  } catch (error) {
    if (error.message.includes("Invalid move")) {
      throw new Error("Invalid player move");
    }
    throw error;
  }
}
