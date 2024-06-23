import { Chess } from "chess.js";
import { createCanvas, loadImage } from "canvas";
import { applyDefaultConfig } from "./config.js";
import getGeneratedChessboardDirectory from "../../utils/getGeneratedChessboardDirectory.js";
import path from "path";
import fs from "fs";

export class ChessImageGenerator {
  static async fromFEN(FEN, lastMove, fileName) {
    const chess = new Chess(FEN);
    const buffer = await this.generateBuffer(chess, lastMove);
    return this.generatePNG(buffer, fileName);
  }

  static generatePNG(buffer, fileName) {
    let dir = getGeneratedChessboardDirectory();
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    const filePath = path.join(dir, fileName);
    fs.writeFileSync(filePath, buffer);
    return filePath;
  }

  static highlightMove(ctx, move) {
    const from = move.from;
    const to = move.to;
    const fromX = from.charCodeAt(0) - "a".charCodeAt(0);
    const fromY = 8 - parseInt(from[1]);
    const toX = to.charCodeAt(0) - "a".charCodeAt(0);
    const toY = 8 - parseInt(to[1]);
    const _config = applyDefaultConfig({});
    const squareSize = _config.size / 8;

    ctx.lineWidth = 2;
    ctx.strokeStyle = "rgba(0, 255, 0, 0.5)";
    ctx.strokeRect(
      fromX * squareSize,
      fromY * squareSize,
      squareSize,
      squareSize
    );
    ctx.strokeRect(toX * squareSize, toY * squareSize, squareSize, squareSize);
  }

  static async generateBuffer(chess, lastMove, config) {
    let move;
    const _config = applyDefaultConfig(config);
    const cv = createCanvas(_config.size, _config.size);
    const ctx = cv.getContext("2d");

    ctx.beginPath();
    ctx.rect(0, 0, _config.size, _config.size);
    ctx.fillStyle = _config.light;
    ctx.fill();

    if (lastMove) {
      move = chess.move(lastMove);
    }

    const col = _config.view === "w" ? r => r + 1 : r => 7 - r + 1;
    const row = c => "abcdefgh"[_config.view === "w" ? c : 7 - c];
    const tile = (r, c) => row(r) + col(c);

    //draw chessboard canvas
    for (let c = 0; c < 8; c++) {
      for (let r = 0; r < 8; r++) {
        if ((c + r) % 2 === 0) {
          // Tile is dark tile
          ctx.beginPath();
          ctx.rect(
            (_config.size / 8) * (7 - r + 1) - _config.size / 8,
            (_config.size / 8) * c,
            _config.size / 8,
            _config.size / 8
          );
          ctx.fillStyle = _config.dark;
          ctx.fill();
        }

        const piece = chess.get(tile(r, c));

        if (piece) {
          //Tile contains piece
          const imagePath = `images/${_config.pieceStyle}/${piece.color}/${piece.type}.png`;
          const dir = path.dirname(new URL(import.meta.url).pathname);
          const image = await loadImage(path.join(dir, imagePath));

          ctx.drawImage(
            image,
            (_config.size / 8) * (7 - r + 1) - _config.size / 8,
            (_config.size / 8) * c,
            _config.size / 8,
            _config.size / 8
          );
        }
      }
    }

    if (move) {
      this.highlightMove(ctx, move);
    }

    return cv.toBuffer("image/png");
  }
}
