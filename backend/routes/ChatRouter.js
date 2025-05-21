// ChatRouter.js
import { Router } from "express";
import {
  createChat,
  getUserByNickname,
  getUserById,
  getChatsById,
  createMessages,
  getMessagesByChatId,
} from "../services/chatService.js";
export const chatRouter = Router();

// Middleware для логування всіх запитів
chatRouter.use((req, res, next) => {
  console.log(`[ChatRouter] ${req.method} ${req.originalUrl}`);
  if (req.params) {
    console.log("Request params:", req.params);
  }
  if (req.query && Object.keys(req.query).length > 0) {
    console.log("Request query:", req.query); // Добавляем логирование query параметров
  }
  if (req.body && Object.keys(req.body).length > 0) {
    console.log("Request body:", req.body);
  }
  next();
});

// Базовий маршрут для перевірки API
chatRouter.get("/", (req, res) => {
  console.log("[ChatRouter] Root endpoint accessed");

  // Проверяем, если запрос содержит userId, то это запрос на получение чатов
  if (req.query.userId) {
    console.log(`[ChatRouter] Запрос чатов перенаправлен на /chats`);
    return res.redirect(`/api/chat/chats?userId=${req.query.userId}`);
  }

  res.json({
    message: "Chat API is working",
    timestamp: new Date().toISOString(),
  });
});

// Маршрут для створення чату
chatRouter.post("/createChat", async (req, res) => {
  const { firstUser, secondUser } = req.body;
  console.log(
    `[ChatRouter] Creating chat between users: ${firstUser} and ${secondUser}`
  );
  try {
    // Перевірка, чи існують обидва користувачі (опціонально)
    try {
      await getUserById(firstUser);
      await getUserById(secondUser);
    } catch (userError) {
      console.error("[ChatRouter] User validation error:", userError.message);
      return res.status(404).json({ error: userError.message });
    }
    const chat = await createChat(firstUser, secondUser);
    console.log("[ChatRouter] Chat created successfully:", chat);
    res.status(201).json(chat);
  } catch (error) {
    console.error("[ChatRouter] Error creating chat:", error);
    res
      .status(500)
      .json({ error: "Failed to create chat", details: error.message });
  }
});

// Маршрут для отримання користувача за нікнеймом
chatRouter.get("/user/:username", async (req, res) => {
  // Отримуємо ім'я користувача з параметрів маршруту
  const usernameParam = req.params.username;
  // Декодуємо ім'я користувача (важливо для імен з пробілами)
  const username = decodeURIComponent(usernameParam);
  console.log(
    `[ChatRouter] Getting user by nickname: "${username}" (raw param: "${usernameParam}")`
  );
  try {
    const user = await getUserByNickname(username);
    console.log("[ChatRouter] User found:", user);
    res.status(200).json(user);
  } catch (error) {
    console.error(
      "[ChatRouter] Error getting user by nickname:",
      error.message
    );
    if (error.message === "User not found") {
      res.status(404).json({ error: "User not found" });
    } else {
      res
        .status(500)
        .json({ error: "Failed to get user", details: error.message });
    }
  }
});

// Новий маршрут для отримання користувача за ID
chatRouter.get("/user/id/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log(`[ChatRouter] Getting user by ID: ${userId}`);
  try {
    const user = await getUserById(userId);
    console.log("[ChatRouter] User found by ID:", user);
    res.status(200).json(user);
  } catch (error) {
    console.error("[ChatRouter] Error getting user by ID:", error.message);
    if (error.message === "User not found") {
      res.status(404).json({ error: "User not found" });
    } else {
      res
        .status(500)
        .json({ error: "Failed to get user", details: error.message });
    }
  }
});

chatRouter.get("/chats/:userId", async (req, res) => {
  const { userId } = req.params;
  console.log(
    `[ChatRouter] GET /chats - получение чатов для пользователя: ${userId}`
  );

  try {
    if (!userId) {
      return res.status(400).json({ error: "User ID is required" });
    }

    const chats = await getChatsById(userId);
    console.log("[ChatRouter] Найдено чатов:", chats.length);

    // Возвращаем результат в формате, ожидаемом фронтендом
    res.status(200).json({ chats: chats });
  } catch (error) {
    console.error("[ChatRouter] Error getting chats:", error.message);
    res
      .status(500)
      .json({ error: "Failed to get chats", details: error.message });
  }
});

chatRouter.post("/createMessages", async (req, res) => {
  const { chatId, senderId, message } = req.body;
  console.log(
    `[ChatRouter] Creating message in chat ${chatId} from user ${senderId}: ${message}`
  );
  try {
    if (!chatId || !senderId || !message) {
      return res
        .status(400)
        .json({ error: "Chat ID, sender ID, and message are required" });
    }
    const { data, error } = await createMessages(chatId, senderId, message);
    if (error) {
      console.error("[ChatRouter] Error creating message:", error.message);
      return res
        .status(500)
        .json({ error: "Failed to create message", details: error.message });
    }
    console.log("[ChatRouter] Message created successfully:", data);
    res.status(201).json({ message: "Message created successfully", data });
  } catch (error) {
    console.error("[ChatRouter] Error creating message:", error.message);
    res
      .status(500)
      .json({ error: "Failed to create message", details: error.message });
  }
});

chatRouter.get("/messages/:chatId", async (req, res) => {
  const { chatId } = req.params;
  console.log(`[ChatRouter] Getting messages for chat ID: ${chatId}`);
  try {
    if (!chatId) {
      return res.status(400).json({ error: "Chat ID is required" });
    }

    const messages = await getMessagesByChatId(chatId);
    console.log("[ChatRouter] Messages found:", messages.length);

    res.status(200).json({ messages });
  } catch (error) {
    console.error("[ChatRouter] Error getting messages:", error.message);
    res
      .status(500)
      .json({ error: "Failed to get messages", details: error.message });
  }
});
