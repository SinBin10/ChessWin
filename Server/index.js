const express = require("express");
//explicitly creating the server so that we can have more control over it,
//the functionality is the same as app.listen(creates a server as well)
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const { Chess } = require("chess.js");

const app = express();
const server = createServer(app);

let players = {};
let currentPlayer = "w";

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // The Vite dev server address
    methods: ["GET", "POST"],
  },
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
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
