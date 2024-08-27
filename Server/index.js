const express = require("express");
//explicitly creating the server so that we can have more control over it,
//the functionality is the same as app.listen(creates a server as well)
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const { Chess } = require("chess.js");
const { v4: uuidv4 } = require("uuid");

const path = require("path");
let roomId = uuidv4();
const app = express();
const server = createServer(app);
const chess = new Chess();
require("dotenv").config();
const PORT = process.env.PORT || 3000;

let players = {};
let games = {};

const io = new Server(server, {
  cors: {
    origin: `http://localhost:5173`, // The Vite dev server address
    methods: ["GET", "POST"],
  },
});

// const __dirname1 = path.resolve();
// app.use(express.static(path.join(__dirname1, "/Client/dist")));
// app.get("*", (req, res) => {
//   res.sendFile(path.resolve(__dirname1, "Client", "dist", "index.html"));
// });

io.on("connection", (socket) => {
  console.log("server connected...");
  if (!games[roomId]?.white) {
    games[roomId] = { white: socket.id };
    socket.join(roomId);
    console.log(`Player ${games[roomId].white} has joined the game.`);
    // socket
    //   .to(roomId)
    //   .emit("message", `Player ${socket.id} has joined the game.`);
    console.log(`white has joined the room ${roomId}`);
    console.log(games);
    socket.emit("playerRole", "w");
  } else if (!games[roomId]?.black) {
    games[roomId] = { ...games[roomId], black: socket.id };
    socket.emit("playerRole", "b");
    socket.join(roomId);
    // socket
    //   .to(roomId)
    //   .emit("message", `Player ${socket.id} has joined the game.`);
    console.log(`black has joined the room ${roomId}`);
    console.log(games);
    io.to(roomId).emit("bothPlayersConnected");
    // io.emit("bothPlayersConnected");
    // players = {};
    roomId = uuidv4();
  }

  socket.to(roomId).emit("boardState", chess.fen());
  // socket.emit("boardState", chess.fen());

  // console.log(players);
  socket.on("disconnect", () => {
    console.log(roomId);
    if (socket.id === games[roomId].white) {
      delete games[roomId].white;
      console.log("player white left...");
    } else if (socket.id === games[roomId].black) {
      delete games[roomId].black;
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
          io.emit("boardState", chess.fen());
          chess.reset();
        } else {
          io.emit("boardState", chess.fen());
        }
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
