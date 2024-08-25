const express = require("express");
//explicitly creating the server so that we can have more control over it,
//the functionality is the same as app.listen(creates a server as well)
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const { Chess } = require("chess.js");
const path = require("path");

const app = express();
const server = createServer(app);
const chess = new Chess();
require("dotenv").config();
const PORT = process.env.PORT || 3000;

let players = {};

const io = new Server(server, {
  cors: {
    origin: `https://localhost:${PORT}`, // The Vite dev server address
    methods: ["GET", "POST"],
  },
});

const __dirname1 = path.resolve();
app.use(express.static(path.join(__dirname1, "/Client/dist")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname1, "Client", "dist", "index.html"));
});

io.on("connection", (socket) => {
  console.log("server connected...");
  if (!players.white) {
    players.white = socket.id;
    socket.emit("playerRole", "w");
  } else if (!players.black) {
    players.black = socket.id;
    socket.emit("playerRole", "b");
  } else {
    socket.emit("spectator");
  }

  socket.emit("boardState", chess.fen());

  console.log(players);
  socket.on("disconnect", () => {
    if (socket.id === players.white) {
      delete players.white;
      console.log("player white left...");
    } else if (socket.id === players.black) {
      delete players.black;
      console.log("player black left...");
    }
  });
  socket.on("move", (move) => {
    try {
      // During white's turn black cannot move and vice versa
      if (chess.turn() === "w" && socket.id !== players.white) return;
      if (chess.turn() === "b" && socket.id !== players.black) return;
      let result = chess.move(move);
      if (result) {
        io.emit("move", move);
        if (chess.isGameOver()) {
          io.emit("over", chess.turn());
          delete players.white;
          delete players.black;
          chess.reset();
        }
        io.emit("boardState", chess.fen());
      } else {
        console.log("invalid move...");
        socket.emit("invalid move", move);
      }
    } catch (err) {
      console.log(err);
      socket.emit("invalid move", move);
    }
  });
});

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
