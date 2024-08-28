const express = require("express");
//explicitly creating the server so that we can have more control over it,
//the functionality is the same as app.listen(creates a server as well)
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const { Chess } = require("chess.js");
const { v4: uuidv4 } = require("uuid");

const path = require("path");
let roomId = uuidv4();
let tempRoomId = roomId;
const app = express();
const server = createServer(app);
require("dotenv").config();
const PORT = process.env.PORT || 3000;

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
  console.log("temproomId", tempRoomId);
  socket.data.roomId = tempRoomId;

  if (!games[tempRoomId]?.white) {
    games[tempRoomId] = { white: socket.id, chess: new Chess() };
    socket.join(tempRoomId);
    console.log(`Player ${games[tempRoomId].white} has joined the game.`);
    socket.emit("playerRole", { role: "w", roomId: tempRoomId });
    console.log(`white has joined the room ${tempRoomId}`);
  } else if (!games[tempRoomId]?.black) {
    games[tempRoomId].black = socket.id;
    socket.emit("playerRole", { role: "b", roomId: tempRoomId });
    socket.join(tempRoomId);
    console.log(`black has joined the room ${tempRoomId}`);
    io.to(tempRoomId).emit("bothPlayersConnected");
    tempRoomId = uuidv4();
  }

  roomId = socket.data.roomId;
  socket.to(roomId).emit("boardState", games[roomId].chess.fen());

  socket.on("disconnect", () => {
    if (socket.id === games[roomId]?.white) {
      delete games[roomId].white;
      console.log("player white left...");
    } else if (socket.id === games[roomId]?.black) {
      delete games[roomId].black;
      console.log("player black left...");
    }
    console.log(games);
  });

  socket.on("move", ({ move, roomId }) => {
    console.log("this move is made for the game : ", roomId);
    try {
      // Ensure only the correct player can make a move
      if (
        games[roomId].chess.turn() === "w" &&
        games[roomId].white !== socket.id
      )
        return;
      if (
        games[roomId].chess.turn() === "b" &&
        games[roomId].black !== socket.id
      )
        return;

      let result = games[roomId].chess.move(move);
      if (result) {
        io.to(roomId).emit("move", move);
        if (games[roomId].chess.isGameOver()) {
          io.to(roomId).emit("over", games[roomId].chess.turn());
          games[roomId].chess.reset();
        } else {
          io.to(roomId).emit("boardState", games[roomId].chess.fen());
        }
      } else {
        console.log("invalid move...");
        socket.emit("invalidMove", move);
      }
    } catch (err) {
      console.log(err);
      socket.emit("invalidMove", move);
    }
  });
});

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
