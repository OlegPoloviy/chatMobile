import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import { chatRouter } from "./routes/ChatRouter.js";
import "dotenv/config";

// Створюємо Express додаток
const app = express();
const PORT = process.env.PORT || 3000;

// Створюємо HTTP сервер на основі Express додатку
const httpServer = createServer(app);

// Налаштовуємо Express middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Налаштовуємо Express маршрути
app.use("/api/chat", chatRouter);

// Додаємо базовий маршрут для перевірки роботи сервера
app.get("/", (req, res) => {
  res.send("Server is running correctly!");
});

// Створюємо Socket.IO сервер, що використовує той самий HTTP сервер
const io = new Server(httpServer, {
  cors: {
    origin: "*", // В production замініть на URL вашого фронтенду
    methods: ["GET", "POST"],
  },
});

// Зберігаємо підключених користувачів
const users = new Map();

// Обробляємо Socket.IO з'єднання
io.on("connection", (socket) => {
  console.log("A user connected");

  // Обробка приєднання користувача
  socket.on("user:join", (username) => {
    users.set(socket.id, username);
    socket.broadcast.emit("user:joined", username);
    io.emit("users:list", Array.from(users.values()));
  });

  // Обробка повідомлень чату
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

  // Обробка статусу набору тексту
  socket.on("typing:start", () => {
    const username = users.get(socket.id);
    if (username) {
      socket.broadcast.emit("typing:status", username);
    }
  });

  socket.on("typing:stop", () => {
    socket.broadcast.emit("typing:status", null);
  });

  // Обробка відключення
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

// Запускаємо HTTP сервер, який обслуговує як REST API, так і Socket.IO з'єднання
httpServer.listen(PORT, () => {
  console.log(
    `Server is running on port ${PORT} (handling both HTTP and Socket.IO)`
  );
});
