import { io } from "socket.io-client";

const socket = io("http://localhost:3000");

socket.on("connect", () => {
  console.log("Connected to server");

  socket.emit("ping", "hello");

  socket.on("pong", (data) => {
    console.log("Received from server:", data);
  });
});
