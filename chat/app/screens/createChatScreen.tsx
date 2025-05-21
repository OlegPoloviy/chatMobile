import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Keyboard,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  createChatApi,
  getUserByNicknameApi,
} from "../../services/chatService";
import { useUser } from "../context/userContext";

export default function CreateChatScreen() {
  const [username, setUsername] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  const handleCreateChat = async () => {
    if (!username.trim()) return;

    setIsLoading(true);
    try {
      // Перевірка, чи є об'єкт користувача
      if (!user || !user.id) {
        console.error("[Android] User not logged in:", { user });
        throw new Error("You are not logged in");
      }

      console.log("[Android] Starting chat creation process:", {
        currentUser: user.id,
        targetUsername: username.trim(),
      });

      // Отримання користувача за нікнеймом
      const secondUser = await getUserByNicknameApi(username.trim());
      console.log("[Android] Second user found:", secondUser);

      // Перевірка отриманого користувача
      if (!secondUser || !secondUser.id) {
        console.error("[Android] Invalid user data:", secondUser);
        throw new Error("Invalid user data received");
      }

      console.log("[Android] Creating chat:", {
        firstUser: user.id,
        secondUser: secondUser.id,
      });

      // Створення чату
      const chat = await createChatApi(user.id, secondUser.id);
      console.log("[Android] Chat created:", chat);

      // Навігація до екрану чату
      router.replace({
        pathname: "/chat",
        params: {
          username: username.trim(),
          chatId: chat.id,
        },
      });
    } catch (error: any) {
      console.error("[Android] Chat creation error:", {
        message: error.message,
        stack: error.stack,
        error,
        platform: Platform.OS,
        version: Platform.Version,
      });

      let errorMessage = "Failed to create chat. Please try again.";
      if (error.message.includes("not logged in")) {
        errorMessage = "Please log in to create a chat";
      } else if (error.message.includes("User not found")) {
        errorMessage = "User not found. Please check the username";
      } else if (error.message.includes("Server error")) {
        errorMessage = "Server error. Please try again later";
      }

      Alert.alert("Error", errorMessage, [{ text: "OK" }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.closeButton}
            onPress={() => router.back()}
          >
            <Ionicons name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.title}>New Chat</Text>
        </View>

        <View style={styles.content}>
          <View style={styles.inputContainer}>
            <Text style={styles.label}>Username</Text>
            <TextInput
              style={styles.input}
              value={username}
              onChangeText={setUsername}
              placeholder="Enter username of your friend"
              placeholderTextColor="#999"
              autoCapitalize="none"
              autoCorrect={false}
              autoFocus
              editable={!isLoading}
            />
          </View>

          <TouchableOpacity
            style={[
              styles.createButton,
              (!username.trim() || isLoading) && styles.createButtonDisabled,
            ]}
            onPress={handleCreateChat}
            disabled={!username.trim() || isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.createButtonText}>Start Chat</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#333",
  },
  closeButton: {
    padding: 8,
    backgroundColor: "#222",
    borderRadius: 20,
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#fff",
  },
  content: {
    flex: 1,
    padding: 24,
    paddingTop: 40,
  },
  inputContainer: {
    marginBottom: 32,
  },
  label: {
    fontSize: 16,
    color: "#fff",
    marginBottom: 12,
    fontWeight: "500",
  },
  input: {
    backgroundColor: "#222",
    borderRadius: 14,
    padding: 18,
    fontSize: 16,
    color: "#fff",
    borderWidth: 1,
    borderColor: "#333",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  createButton: {
    backgroundColor: "#007AFF",
    borderRadius: 14,
    padding: 18,
    alignItems: "center",
    justifyContent: "center",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  createButtonDisabled: {
    backgroundColor: "#333",
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: 0.5,
  },
});
