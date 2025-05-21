// api.ts
import axios, { AxiosError } from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

// Get base URL from app config
const getBaseUrl = () => {
  const apiBaseUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (apiBaseUrl) {
    return apiBaseUrl;
  }

  // Fallback values for development
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  } else if (Platform.OS === "ios") {
    return "http://localhost:3000";
  }
  return "http://localhost:3000";
};

// Створення базової конфігурації для axios
const api = axios.create({
  baseURL: getBaseUrl(),
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

interface ChatResponse {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

interface UserResponse {
  id: string;
  username: string;
  // Add other user fields as needed
}

// Додаємо перехоплювач для логування всіх запитів
api.interceptors.request.use(
  (config) => {
    console.log(
      `API Request: ${config.method?.toUpperCase()} ${config.baseURL}${
        config.url
      }`
    );
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Добавляем перехватчик для логирования ответов
api.interceptors.response.use(
  (response) => {
    console.log(`API Response status: ${response.status}`);
    console.log("API Response data:", response.data);
    return response;
  },
  (error) => {
    if (error.response) {
      console.error(`API Error Response: ${error.response.status}`);
      console.error("API Error Response data:", error.response.data);
    } else if (error.request) {
      console.error("API No Response Received");
    } else {
      console.error("API Error:", error.message);
    }
    return Promise.reject(error);
  }
);

// Функція для створення чату
export const createChatApi = async (
  firstUser: string,
  secondUser: string
): Promise<ChatResponse> => {
  try {
    const response = await api.post<ChatResponse>("/api/chat/createChat", {
      firstUser,
      secondUser,
    });
    return response.data;
  } catch (error) {
    console.error("Error creating chat via API:", error);
    if (error instanceof AxiosError) {
      if (error.response) {
        console.error("Server error data:", error.response.data);
        console.error("Server error status:", error.response.status);
      } else if (error.request) {
        console.error("No response received:", error.request);
      } else {
        console.error("Error message:", error.message);
      }
    }
    throw error;
  }
};

export const getUserByNicknameApi = async (
  username: string
): Promise<UserResponse> => {
  try {
    // Важливо: НЕ обрізаємо пробіли, оскільки вони можуть бути частиною імені користувача
    // Використовуємо encodeURIComponent для правильного передавання URL-параметрів
    const encodedUsername = encodeURIComponent(username);
    console.log(
      `Requesting user with username: "${username}" (encoded: ${encodedUsername})`
    );

    const response = await api.get<UserResponse>(
      `/api/chat/user/${encodedUsername}`
    );
    return response.data;
  } catch (error) {
    console.error("Error getting user by nickname via API:", error);
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        console.error("User not found error:", error.response.data);
        throw new Error("User not found");
      } else if (error.response) {
        console.error("Server error:", error.response.data);
      } else if (error.request) {
        console.error(
          "No response received. Check your network connection and server status."
        );
      }
    }
    throw error;
  }
};

// Додаткова функція для пошуку користувача за ID
export const getUserByIdApi = async (userId: string): Promise<UserResponse> => {
  try {
    const response = await api.get<UserResponse>(`/api/chat/user/id/${userId}`);
    return response.data;
  } catch (error) {
    console.error("Error getting user by ID via API:", error);
    if (error instanceof AxiosError && error.response?.status === 404) {
      throw new Error("User not found");
    }
    throw error;
  }
};

export const getUserChats = async (userId: string): Promise<ChatResponse[]> => {
  try {
    console.log(`Requesting chats for user ID: ${userId}`);

    // Исправляем путь в соответствии с новым маршрутом в ChatRouter
    const response = await api.get<{ chats: ChatResponse[] }>(
      `/api/chat/chats/${userId}`
    );

    console.log(`Received chats:`, response.data);
    return response.data.chats || [];
  } catch (error) {
    console.error("Error getting chats by ID via API:", error);
    if (error instanceof AxiosError) {
      if (error.response?.status === 404) {
        throw new Error("User not found");
      } else if (error.response) {
        console.error("Server response error:", error.response.data);
      } else if (error.request) {
        console.error("No response received from server");
      }
    }
    throw error;
  }
};

// Додайте інші API функції за потреби
export const saveMessages = async (
  chatId: string,
  senderId: string,
  message: string
) => {
  try {
    const response = await api.post(`/api/chat/createMessages`, {
      chatId,
      senderId,
      message,
    });

    // Якщо потрібно, можете повернути відповідь або логувати її
    console.log("[saveMessages] Message saved successfully:", response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "[saveMessages] Error saving message:",
      error?.response?.data || error.message
    );
    // Рекомендується прокидати далі помилку, якщо потрібно обробити її в компоненті
    throw error;
  }
};

export const getMessages = async (chatId: string) => {
  try {
    const response = await api.get(`/api/chat/messages/${chatId}`);
    console.log(
      "[getMessages] Messages fetched successfully:",
      response.data.messages
    );
    return response.data.messages;
  } catch (error: any) {
    console.error(
      "[getMessages] Error fetching messages:",
      error?.response?.data || error.message
    );
    throw error;
  }
};
