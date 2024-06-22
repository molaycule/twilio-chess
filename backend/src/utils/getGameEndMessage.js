import constants from "../constants/index.js";

export default function getGameEndMessage(gameStatus) {
  const statusMap = constants.gameStatusMap;
  if (gameStatus === statusMap.isCheckmate) {
    return "The game ended in a checkmate";
  } else if (gameStatus === statusMap.isDraw) {
    return "The game ended in a draw.";
  } else if (gameStatus === statusMap.isStalemate) {
    return "The game ended in a stalemate.";
  } else if (gameStatus === statusMap.isThreefoldRepetition) {
    return "The game ended due to threefold repetition.";
  } else if (gameStatus === statusMap.isInsufficientMaterial) {
    return "The game ended due to insufficient material on the board.";
  } else {
    return null;
  }
}
