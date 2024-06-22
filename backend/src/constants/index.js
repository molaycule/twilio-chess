export default {
  defaultFEN: "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  s3BucketNamePrefix: "twilio-chess",
  maxRetryCount: 5,
  aiMaxRetryMessage:
    "The AI couldn't find a great move and decided to forfeit.",
  gameStatusMap: {
    isCheckmate: "checkmate",
    isDraw: "draw",
    isStalemate: "stalemate",
    isInsufficientMaterial: "insufficientMaterial",
    isThreefoldRepetition: "threefoldRepetition"
  }
};
