export default async function promptWinMessage({ type, openai }) {
  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "user",
        content: {
          ai: "Compose an brief exceptional in-app message when a chess ai wins a player.",
          player:
            "Compose an exceptional in-app congratulatory message for a chess player who has won a game."
        }[type]
      }
    ],
    model: "gpt-4o"
  });
  return completion.choices[0].message.content;
}
