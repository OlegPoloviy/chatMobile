import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import "dotenv/config";

const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 3000;
const io = new Server(httpServer, {
  cors: {
    origin: "*", // In production, replace with your frontend URL
    methods: ["GET", "POST"],
  },
});

// Store connected users
const users = new Map();

io.on("connection", (socket) => {
  console.log("A user connected");

  // Handle user joining
  socket.on("user:join", (username) => {
    users.set(socket.id, username);
    socket.broadcast.emit("user:joined", username);
    io.emit("users:list", Array.from(users.values()));
  });

  // Handle chat messages
  socket.on("message:send", (message) => {
    const username = users.get(socket.id);
    if (username) {
      io.emit("message:receive", {
        username,
        message,
        timestamp: new Date().toISOString(),
      });
    }
  });

  // Handle typing status
  socket.on("typing:start", () => {
    const username = users.get(socket.id);
    if (username) {
      socket.broadcast.emit("typing:status", username);
    }
  });

  socket.on("typing:stop", () => {
    socket.broadcast.emit("typing:status", null);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    const username = users.get(socket.id);
    if (username) {
      users.delete(socket.id);
      io.emit("user:left", username);
      io.emit("users:list", Array.from(users.values()));
    }
    console.log("User disconnected");
  });
});

httpServer.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
