const express = require("express");
//explicitly creating the server so that we can have more control over it,
//the functionality is the same as app.listen(creates a server as well)
const { createServer } = require("node:http");
const { Server } = require("socket.io");
const path = require("path");
const { Chess } = require("chess.js");

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // The Vite dev server address
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("a user connected...");
  socket.on("disconnect", () => {
    console.log("user disconncted...");
  });
});

server.listen(3000, () => {
  console.log("server running at http://localhost:3000");
});
