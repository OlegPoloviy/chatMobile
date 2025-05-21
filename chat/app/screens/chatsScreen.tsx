import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { getUserByIdApi, getUserChats } from "../../services/chatService";
import { useUser } from "../context/userContext";

interface Chat {
  id: string;
  user1_id: string;
  user2_id: string;
  created_at: string;
}

interface ChatWithUser extends Chat {
  otherUser: {
    id: string;
    username: string;
  };
}

export default function ChatsScreen() {
  const [chats, setChats] = useState<ChatWithUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const insets = useSafeAreaInsets();
  const { user } = useUser();

  useEffect(() => {
    loadChats();
  }, [user?.id]);

  const loadChats = async () => {
    if (!user?.id) return;

    try {
      setIsLoading(true);
      const userChats = await getUserChats(user.id);

      if (!userChats || userChats.length === 0) {
        setChats([]);
        return;
      }

      // Enrich chats with other user's information
      const enrichedChats = await Promise.all(
        userChats.map(async (chat) => {
          const otherUserId =
            chat.user1_id === user.id ? chat.user2_id : chat.user1_id;
          try {
            const otherUser = await getUserByIdApi(otherUserId);
            return {
              ...chat,
              otherUser: {
                id: otherUser.id,
                username: otherUser.username,
              },
            };
          } catch (error) {
            console.error("Error fetching user info:", error);
            return {
              ...chat,
              otherUser: {
                id: otherUserId,
                username: "Unknown User",
              },
            };
          }
        })
      );

      setChats(enrichedChats);
    } catch (error) {
      console.error("Error loading chats:", error);
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatPress = (chat: ChatWithUser) => {
    router.push({
      pathname: "/chat",
      params: {
        username: chat.otherUser.username,
        chatId: chat.id,
      },
    });
  };

  const renderChatItem = ({ item }: { item: ChatWithUser }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => handleChatPress(item)}
    >
      <View style={styles.avatarContainer}>
        <Ionicons name="person" size={24} color="#666" />
      </View>
      <View style={styles.chatInfo}>
        <Text style={styles.username}>{item.otherUser.username}</Text>
        <Text style={styles.lastMessage}>Tap to open chat</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Chats</Text>
      </View>

      {chats.length === 0 ? (
        <View style={styles.emptyStateContainer}>
          <Ionicons name="chatbubble-ellipses-outline" size={64} color="#666" />
          <Text style={styles.emptyStateTitle}>No Chats Yet</Text>
          <Text style={styles.emptyStateText}>
            Start a new chat by tapping the + button below
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.chatsList}
        />
      )}

      <TouchableOpacity
        style={[styles.addButton, { bottom: insets.bottom + 20 }]}
        onPress={() => {
          router.push("/screens/createChatScreen");
        }}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </SafeAreaView>
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
  header: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#222",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  chatsList: {
    padding: 16,
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    backgroundColor: "#111",
    borderRadius: 12,
    marginBottom: 8,
  },
  avatarContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  chatInfo: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginBottom: 4,
  },
  lastMessage: {
    fontSize: 14,
    color: "#666",
  },
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyStateTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 20,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 24,
  },
  addButton: {
    position: "absolute",
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#007AFF",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
