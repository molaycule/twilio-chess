import { validateFen } from "chess.js";
import extractJSON from "./extractJSON.js";
import constants from "../constants/index.js";

export default async function promptRandomizedFEN({ openai, retryCount = 0 }) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: `You are a chess engine. Generate a random FEN string where it is White's turn to play and both White and Black have equal chances of winning.
        Your response should always be formatted as follows in JSON:
        { "fen": "" }`
      }
    ],
    model: "gpt-4o"
  });
  const response = completion.choices[0].message.content;
  const json = extractJSON(response);
  console.log("extracted json containing FEN from response", json);
  const { fen } = json;
  const result = validateFen(fen);
  if (result.ok) {
    return fen;
  }

  if (retryCount <= constants.maxRetryCount) {
    return await promptRandomizedFEN({ retryCount: retryCount + 1, openai });
  } else {
    return constants.defaultFEN;
  }
}
