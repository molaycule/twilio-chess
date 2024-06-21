import path from "path";

export default function getGeneratedChessboardDirectory() {
  let dir = path.dirname(new URL(import.meta.url).pathname);
  dir = path.join(dir.split("/src")[0], "public");
  return dir;
}
