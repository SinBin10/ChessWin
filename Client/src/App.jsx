import { useEffect } from "react";
import { io } from "socket.io-client";
import { Chess } from "chess.js";

const App = () => {
  useEffect(() => {
    const socket = io("http://localhost:3000");
    return () => {
      socket.disconnect();
    };
  }, []);
  let draggedPiece = null;
  let sourceSquare = null;
  let playerRole = null;
  const pieces = [
    { type: "p", color: "w", logo: "♙" },
    { type: "r", color: "w", logo: "♖" },
    { type: "n", color: "w", logo: "♘" },
    { type: "b", color: "w", logo: "♗" },
    { type: "q", color: "w", logo: "♕" },
    { type: "k", color: "w", logo: "♔" },

    { type: "p", color: "b", logo: "♟" },
    { type: "r", color: "b", logo: "♜" },
    { type: "n", color: "b", logo: "♞" },
    { type: "b", color: "b", logo: "♝" },
    { type: "q", color: "b", logo: "♛" },
    { type: "k", color: "b", logo: "♚" },
  ];

  const chess = new Chess();
  return (
    <>
      <div className="w-full min-h-full flex items-center justify-center bg-slate-900">
        <div className="w-[32rem] h-[32rem]">
          {chess.board().map((row, rowIndex) => (
            <div key={rowIndex} className="w-full flex">
              {row.map((col, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`h-16 w-16 text-4xl flex items-center justify-center ${
                    (rowIndex + colIndex) % 2 === 0
                      ? "bg-[#fbf5de]"
                      : "bg-[#f2ca5c]"
                  }`}
                >
                  {col &&
                    pieces.find((p) => {
                      return p.type === col.type && p.color === col.color;
                    }).logo}
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default App;
