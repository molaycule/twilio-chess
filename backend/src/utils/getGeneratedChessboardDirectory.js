import path from "path";
import { fileURLToPath } from 'url';

export default function getGeneratedChessboardDirectory() {
  const __filename = fileURLToPath(import.meta.url);
  let dir = path.dirname(__filename);
  dir = path.join(dir.split("/src")[0], "public");
  return dir;
}
