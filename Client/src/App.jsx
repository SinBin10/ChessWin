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
                  className={`h-16 w-16 ${
                    (rowIndex + colIndex) % 2 === 0
                      ? "bg-[#fbf5de]"
                      : "bg-[#f8e7bb]"
                  }`}
                ></div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default App;
