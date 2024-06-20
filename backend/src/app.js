import express from "express";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sessions } from "./db/schema.js";
import { ChessImageGenerator } from "./pkg/chess-image-generator/index.js";
import { config } from "dotenv";

config({ path: "./src/.env" });

const app = express();
app.use(express.json());

app.get("/api/chess/", async (req, res) => {
  res.json({ hello: "index route" });
});

app.post("/api/chess/initiate", async (req, res) => {
  const sql = neon(process.env.DATABASE_CONN_STRING);
  const db = drizzle(sql);
  const userData = req.body;
  await db.insert(sessions).values({ ...userData });

  if (userData.setup === "clean") {
    const fen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1"; // Example FEN
    const lastMove = "e2e4"; // Example move
    await ChessImageGenerator.fromFEN(fen, lastMove, "./chessboard.png");
  }
  res.json({ hello: "world" });
});

// Run the server!
const port = 4000;
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
