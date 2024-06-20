import Chessground from "@react-chess/chessground";
import "chessground/assets/chessground.base.css";
import "chessground/assets/chessground.brown.css";
import "chessground/assets/chessground.cburnett.css";

export default function Chessboard() {
  const params = new URLSearchParams(window.location.search);
  const fenFromUrl = params.get("fen");
  const defaultFen = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1";

  return (
    <div className="flex items-center justify-center h-screen">
      <div id="chessboard">
        <Chessground config={{ fen: fenFromUrl || defaultFen }} />
      </div>
    </div>
  );
}
