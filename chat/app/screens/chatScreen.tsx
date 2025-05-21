import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getMessages, saveMessages } from "../../services/chatService";
import { socketService } from "../../services/socketService";
import { useUser } from "../context/userContext";

interface Message {
  id: string;
  chat_id: string;
  content: string;
  sender_id: string;
  created_at: string;
}

export default function ChatScreen() {
  const { username, chatId } = useLocalSearchParams<{
    username: string;
    chatId: string;
  }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const insets = useSafeAreaInsets();
  const { user } = useUser();
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadMessages();
    setupSocket();

    return () => {
      socketService.disconnect();
    };
  }, [chatId]);

  const setupSocket = () => {
    if (!user?.username) return;

    socketService.connect(user.username);

    socketService.onMessageReceived((data) => {
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          chat_id: chatId,
          content: data.message,
          sender_id: data.username === user.username ? user.id : "other",
          created_at: data.timestamp,
        },
      ]);
    });

    socketService.onTypingStatus((typingUsername) => {
      setIsTyping(typingUsername !== null && typingUsername !== user.username);
    });
  };

  const loadMessages = async () => {
    try {
      setIsLoading(true);
      const chatMessages = await getMessages(chatId);
      setMessages(chatMessages);
    } catch (error) {
      console.error("Error loading messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !user?.id) return;

    try {
      // Save message to database
      await saveMessages(chatId, user.id, newMessage.trim());

      // Send message through socket
      socketService.sendMessage(newMessage.trim());

      setNewMessage("");
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleTyping = (text: string) => {
    setNewMessage(text);
    if (text.trim()) {
      socketService.startTyping();
    } else {
      socketService.stopTyping();
    }
  };

  const renderMessage = ({ item }: { item: Message }) => {
    const isOwnMessage = item.sender_id === user?.id;

    return (
      <View
        style={[
          styles.messageContainer,
          isOwnMessage ? styles.ownMessage : styles.otherMessage,
        ]}
      >
        {!isOwnMessage && <Text style={styles.username}>{username}</Text>}
        <Text style={styles.messageText}>{item.content}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.created_at).toLocaleTimeString()}
        </Text>
      </View>
    );
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "padding"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 90 : 0}
    >
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messagesList}
        inverted={false}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />

      {isTyping && (
        <View style={styles.typingContainer}>
          <Text style={styles.typingText}>{username} is typing...</Text>
        </View>
      )}

      <View style={[styles.inputContainer, { paddingBottom: insets.bottom }]}>
        <TextInput
          style={styles.input}
          value={newMessage}
          onChangeText={handleTyping}
          placeholder="Type a message..."
          placeholderTextColor="#999"
          multiline
        />
        <TouchableOpacity
          style={[
            styles.sendButton,
            !newMessage.trim() && styles.sendButtonDisabled,
          ]}
          onPress={handleSendMessage}
          disabled={!newMessage.trim()}
        >
          <Ionicons
            name="send"
            size={24}
            color={newMessage.trim() ? "#007AFF" : "#999"}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  messagesList: {
    padding: 16,
  },
  messageContainer: {
    maxWidth: "80%",
    marginVertical: 4,
    padding: 12,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#007AFF",
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#333",
  },
  username: {
    color: "#999",
    fontSize: 12,
    marginBottom: 4,
  },
  messageText: {
    color: "#fff",
    fontSize: 16,
  },
  timestamp: {
    color: "#999",
    fontSize: 12,
    marginTop: 4,
    alignSelf: "flex-end",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 16,
    backgroundColor: "#111",
    borderTopWidth: 1,
    borderTopColor: "#333",
  },
  input: {
    flex: 1,
    backgroundColor: "#222",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    color: "#fff",
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  typingContainer: {
    padding: 8,
    backgroundColor: "#111",
  },
  typingText: {
    color: "#666",
    fontSize: 12,
    fontStyle: "italic",
  },
});
