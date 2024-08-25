import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import { Chess } from "chess.js";

const App = () => {
  const [board, setBoard] = useState(new Chess().board());
  const [socket, setSocket] = useState(null);
  useEffect(() => {
    const newSocket = io("http://localhost:3000");
    setSocket(newSocket);
    newSocket.on("boardState", (fen) => {
      const updatedChess = new Chess(fen);
      setBoard(updatedChess.board());
    });
    newSocket.on("over", (turn) => {
      console.log(
        `Game Over : ${turn === "w" ? "Black wins.." : "White wins..."}`
      );
    });
    return () => {
      newSocket.disconnect();
    };
  }, []);
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
  let draggedPiece = null;
  let sourceSquare = null;

  function handleDragStart(col, rowIndex, colIndex) {
    draggedPiece = col;
    sourceSquare = col.square;
  }

  function handleDrop(rowIndex, colIndex) {
    if (!draggedPiece) return;
    const move = {
      from: sourceSquare,
      to: `${String.fromCharCode(97 + colIndex)}${8 - rowIndex}`,
    };
    if (draggedPiece.type === "p" && (rowIndex === 0 || rowIndex === 7)) {
      move.promotion = "q";
    }
    socket.emit("move", move);
    draggedPiece = null;
    sourceSquare = null;
  }

  return (
    <>
      <div className="w-full min-h-full flex items-center justify-center bg-slate-900">
        <div className="w-[32rem] h-[32rem]">
          {board.map((row, rowIndex) => (
            <div key={rowIndex} className="w-full flex">
              {row.map((col, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`h-16 w-16 text-4xl flex items-center justify-center ${
                    (rowIndex + colIndex) % 2 === 0
                      ? "bg-[#fbf5de]"
                      : "bg-[#f2ca5c]"
                  }`}
                  onDragOver={(e) => {
                    e.preventDefault();
                  }}
                  onDrop={() => handleDrop(rowIndex, colIndex)}
                >
                  <div
                    draggable
                    className="hover:cursor-grab"
                    onDragStart={() => handleDragStart(col, rowIndex, colIndex)}
                  >
                    {col &&
                      pieces.find((p) => {
                        return p.type === col.type && p.color === col.color;
                      }).logo}
                  </div>
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
