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
    socket.data.tempRoomId = tempRoomId;
    games[tempRoomId] = { white: socket.id };
    games[tempRoomId] = { ...games[tempRoomId], chess: new Chess() };
    socket.join(tempRoomId);
    console.log(`Player ${games[tempRoomId].white} has joined the game.`);
    // socket
    //   .to(tempRoomId)
    //   .emit("message", `Player ${socket.id} has joined the game.`);
    console.log(`white has joined the room ${tempRoomId}`);
    console.log(games);
    socket.emit("playerRole", "w");
  } else if (!games[tempRoomId]?.black) {
    games[tempRoomId] = { ...games[tempRoomId], black: socket.id };
    socket.emit("playerRole", "b");
    socket.join(tempRoomId);
    // socket
    //   .to(tempRoomId)
    //   .emit("message", `Player ${socket.id} has joined the game.`);
    console.log(`black has joined the room ${tempRoomId}`);
    console.log(games);
    io.to(tempRoomId).emit("bothPlayersConnected");
    // io.emit("bothPlayersConnected");
    // players = {};
    tempRoomId = uuidv4();
    console.log("after black joins room id", tempRoomId);
  }
  roomId = socket.data.roomId;
  // console.log(games[roomId]);
  socket.to(roomId).emit("boardState", games[roomId].chess.fen());
  // socket.emit("boardState", games[roomId].chess.fen());
  // console.log(players);
  socket.on("disconnect", () => {
    console.log(roomId);
    if (socket.id === games[roomId]?.white) {
      delete games[roomId].white;
      console.log("player white left...");
    } else if (socket.id === games[roomId]?.black) {
      delete games[roomId].black;
      console.log("player black left...");
    }
    console.log(games);
  });
  socket.on("move", (move) => {
    console.log("this move is made for the game : ", roomId);
    try {
      // During white's turn black cannot move and vice versa
      if (
        games[roomId].chess.turn() === "w" &&
        games[roomId]?.id !== games[roomId].white
      )
        return;
      if (
        games[roomId].chess.turn() === "b" &&
        games[roomId]?.id !== games[roomId].white
      )
        return;
      let result = games[roomId].chess.move(move);
      if (result) {
        io.to(roomId).emit("move", move);
        if (games[roomId].chess.isGameOver()) {
          io.to(roomId).emit("over", games[roomId].chess.turn());
          delete games[roomId]?.white;
          delete games[roomId]?.black;
          io.to(roomId).emit("boardState", games[roomId].chess.fen());
          games[roomId].chess.reset();
        } else {
          io.to(roomId).emit("boardState", games[roomId].chess.fen());
        }
      } else {
        console.log("invalid move...");
        socket.to(roomId).emit("invalid move", move);
      }
    } catch (err) {
      console.log(err);
      socket.to(roomId).emit("invalid move", move);
    }
  });
});

server.listen(PORT, () => {
  console.log(`server running at http://localhost:${PORT}`);
});
