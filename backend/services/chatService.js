// chatService.js
import { supabaseClient } from "../supabaseClient.js";

export const createChat = async (firstUser, secondUser) => {
  try {
    console.log(`Creating chat between users ${firstUser} and ${secondUser}`);

    // Використовуємо правильні назви колонок: user1_id і user2_id
    const { data, error } = await supabaseClient
      .from("chats")
      .insert([
        {
          user1_id: firstUser,
          user2_id: secondUser,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating chat:", error);
      throw new Error(`Failed to create chat: ${error.message}`);
    }

    if (!data || data.length === 0) {
      throw new Error("No data returned after creating chat");
    }

    console.log("Chat created successfully:", data[0]);
    return data[0];
  } catch (err) {
    console.error("Error creating chat:", err);
    throw new Error(`Failed to create chat: ${err.message}`);
  }
};

export const getUserByNickname = async (username) => {
  try {
    // Перевірка наявності імені користувача
    if (!username || typeof username !== "string") {
      console.error("Invalid username:", username);
      throw new Error("Valid username is required");
    }

    console.log(`Searching for user with username: "${username}"`);

    const { data: user, error } = await supabaseClient
      .from("users")
      .select("*")
      .eq("username", username)
      .maybeSingle();

    if (error) {
      console.error("Supabase error fetching user:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!user) {
      console.log(`User with username "${username}" not found`);
      throw new Error("User not found");
    }

    console.log("User found:", user);
    return user;
  } catch (err) {
    console.error("Error in getUserByNickname function:", err);
    throw err; // Перекидаємо помилку для кращої обробки на вищому рівні
  }
};

// Функція для отримання користувача за ID
export const getUserById = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const { data: user, error } = await supabaseClient
      .from("users")
      .select("*")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user by ID:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    if (!user) {
      throw new Error("User not found");
    }

    return user;
  } catch (err) {
    console.error("Error in getUserById function:", err);
    throw err;
  }
};

export const getChatsById = async (userId) => {
  try {
    if (!userId) {
      throw new Error("User ID is required");
    }

    const { data: chats, error } = await supabaseClient
      .from("chats")
      .select("*")
      .or(`user1_id.eq.${userId},user2_id.eq.${userId}`);

    if (error) {
      console.error("Error fetching chats by user ID:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    return chats;
  } catch (err) {
    console.error("Error in getChatsById function:", err);
    throw err;
  }
};

export const createMessages = async (chatId, senderId, message) => {
  try {
    if (!chatId || !senderId || !message) {
      throw new Error("Chat ID, sender ID, and message are required");
    }

    const { data, error } = await supabaseClient
      .from("messages")
      .insert([
        {
          chat_id: chatId,
          sender_id: senderId,
          content: message,
        },
      ])
      .select();

    if (error) {
      console.error("Error creating message:", error);
      throw new Error(`Failed to create message: ${error.message}`);
    }

    return data[0];
  } catch (err) {
    console.error("Error in createMessages function:", err);
    throw err;
  }
};

export const getMessagesByChatId = async (chatId) => {
  try {
    if (!chatId) {
      throw new Error("Chat ID is required");
    }

    const { data: messages, error } = await supabaseClient
      .from("messages")
      .select("*")
      .eq("chat_id", chatId);

    if (error) {
      console.error("Error fetching messages by chat ID:", error);
      throw new Error(`Database error: ${error.message}`);
    }

    return messages;
  } catch (err) {
    console.error("Error in getMessagesByChatId function:", err);
    throw err;
  }
};
