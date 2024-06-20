import { Chess } from "chess.js";
import { createCanvas, loadImage } from "canvas";
import { applyDefaultConfig } from "./config.js";
import path from "path";
import fs from "fs";

export class ChessImageGenerator {
  /**
   * Generate and save png image from FEN
   *
   * @param FEN target position
   * @param out path to save image at
   * @returns path where image is saved
   */
  static async fromFEN(FEN, lastMove, out) {
    const chess = new Chess(FEN);
    const bf = await this.generateBuffer(chess, lastMove);
    return await this.generatePNG(bf, out);
  }

  /**
   * generate png from
   *
   * @param buffer image buffer
   * @param path output
   * @returns output path
   */
  static async generatePNG(buffer, path) {
    await fs.writeFileSync(path, buffer);
    return path;
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

    ctx.fillStyle = "rgba(0, 255, 0, 0.2)";
    ctx.fillRect(
      fromX * squareSize,
      fromY * squareSize,
      squareSize,
      squareSize
    );
    ctx.fillRect(toX * squareSize, toY * squareSize, squareSize, squareSize);
  }

  /**
   * Generate image buffer of desired chess position
   *
   * @param chess chess.js instance containing desired fen for generation
   * @param config Config
   * @returns Image buffer
   */
  static async generateBuffer(chess, lastMove, config) {
    const _config = applyDefaultConfig(config);
    const cv = createCanvas(_config.size, _config.size);
    const ctx = cv.getContext("2d");

    ctx.beginPath();
    ctx.rect(0, 0, _config.size, _config.size);
    ctx.fillStyle = _config.light;
    ctx.fill();

    this.highlightMove(ctx, chess.move(lastMove));

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

    return cv.toBuffer("image/png");
  }
}
