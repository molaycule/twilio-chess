import express from "express";
import Twilio from "twilio";
import AWS from "aws-sdk";
import fs from "fs";
import bodyParser from "body-parser";
import getGeneratedChessboardDirectory from "./utils/getGeneratedChessboardDirectory.js";
import s3Uploader from "./utils/s3Uploader.js";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { sessions } from "./db/schema.js";
import { ChessImageGenerator } from "./pkg/chess-image-generator/index.js";
import { config } from "dotenv";
import constants from "./constants/index.js";

config({ path: "./src/.env" });

const twilioClient = Twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: "us-east-1"
});
const s3 = new AWS.S3();

const app = express();
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(getGeneratedChessboardDirectory()));

app.post("/api/chess/initiate", async (req, res) => {
  try {
    let chessboardImageUrl = "";
    const sql = neon(process.env.DATABASE_CONN_STRING);
    const db = drizzle(sql);
    const userData = req.body;
    await db.insert(sessions).values({ ...userData });

    if (userData.contact && userData.setup === "clean") {
      await ChessImageGenerator.fromFEN(
        constants.defaultFen,
        undefined,
        `./public/${userData.contact.split(".")[0]}.png`
      );
    }

    const dir = getGeneratedChessboardDirectory();
    if (fs.existsSync(dir)) {
      const file = `${dir}/${userData.contact}.png`;
      chessboardImageUrl = await s3Uploader(s3, file);
    }

    if (userData.contact && userData.medium === "whatsapp") {
      if (fs.existsSync(dir)) {
        await twilioClient.messages.create({
          body: "Welcome to Twilio Chess, just reply by sending your move in standard algebraic notation",
          mediaUrl: chessboardImageUrl,
          from: `whatsapp:${process.env.TWILIO_PHONE_NUMBER}`,
          to: `whatsapp:${userData.contact}`
        });
      }
    }

    res.json({ success: true, message: "Chess initiated" });
  } catch (error) {
    console.log(error);
    res.json({ success: false, error });
  }
});

app.post("/api/chess/reply", async (req, res) => {
  try {
    const message = req.body.Body;
    const from = req.body.From;
    console.log(`Received message: "${message}" from ${from}`);
    console.log("req.body", JSON.stringify(req.body));
    res.json({
      success: true,
      message: `Received message: "${message}" from ${from}`
    });
  } catch (error) {
    console.log(error);
    res.json({ success: false, error });
  }
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
