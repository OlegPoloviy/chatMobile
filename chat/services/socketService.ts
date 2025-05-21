import Constants from "expo-constants";
import { Platform } from "react-native";
import { io, Socket } from "socket.io-client";

const getSocketUrl = () => {
  const socketUrl = Constants.expoConfig?.extra?.apiBaseUrl;
  if (socketUrl) {
    return socketUrl;
  }

  // Fallback values for development
  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  } else if (Platform.OS === "ios") {
    return "http://localhost:3000";
  }
  return "http://localhost:3000";
};

class SocketService {
  private socket: Socket | null = null;

  connect(username: string) {
    if (this.socket?.connected) return;

    this.socket = io(getSocketUrl(), {
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.log("Socket connected");
      this.socket?.emit("user:join", username);
    });

    this.socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(message: string) {
    if (!this.socket?.connected) {
      console.error("Socket not connected");
      return;
    }
    this.socket.emit("message:send", message);
  }

  onMessageReceived(
    callback: (data: {
      username: string;
      message: string;
      timestamp: string;
    }) => void
  ) {
    this.socket?.on("message:receive", callback);
  }

  onUserJoined(callback: (username: string) => void) {
    this.socket?.on("user:joined", callback);
  }

  onUserLeft(callback: (username: string) => void) {
    this.socket?.on("user:left", callback);
  }

  onTypingStatus(callback: (username: string | null) => void) {
    this.socket?.on("typing:status", callback);
  }

  startTyping() {
    this.socket?.emit("typing:start");
  }

  stopTyping() {
    this.socket?.emit("typing:stop");
  }
}

export const socketService = new SocketService();
