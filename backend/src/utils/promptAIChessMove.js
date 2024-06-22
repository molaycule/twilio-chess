export default async function promptAIChessMove({
  currentFEN,
  playerMove,
  openai
}) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a chess engine. You will always play as the black pieces.
        Analyze the current state of the chessboard given in FEN format and suggest the best valid move.
        First, determine if the black king is in check.
        If the black king is in check, prioritize suggesting a move to free the black king from check.
        Consider factors such as material balance, piece activity, king safety, and control of the center.
        Each move should be documented in standard chess notation.
        Your move should include both the starting and ending positions in a single string, separated by a hyphen.
        After each move, display the current state of the board using Forsyth-Edwards Notation (FEN).
        Your response should always be formatted as follows in JSON:
        { "move": "", "comment": "" }`
      },
      {
        role: "user",
        content: `Given my move ${playerMove} provide a brief, witty, funny and engaging comment about it.
        Given the current board position, the FEN string is: ${currentFEN}
        Please provide the best valid move only in standard chess notation.
        Focus on the black pieces you have left and the position of each black piece.
        To ensure the starting position and ending position of the suggested move is valid based on the FEN string.`
      }
    ],
    model: "gpt-4o"
  });
  return completion.choices[0].message.content;
}
