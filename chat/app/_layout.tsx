import { Ionicons } from "@expo/vector-icons";
import { Stack } from "expo-router";
import {
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  useColorScheme,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { UserProvider } from "./context/userContext";

type ChatParams = {
  username: string;
};

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  return (
    <UserProvider>
      <SafeAreaProvider>
        <StatusBar
          barStyle={colorScheme === "dark" ? "light-content" : "dark-content"}
          backgroundColor={colorScheme === "dark" ? "#000" : "#fff"}
        />
        <Stack
          screenOptions={{
            headerStyle: {
              backgroundColor: colorScheme === "dark" ? "#000" : "#fff",
            },
            headerTintColor: colorScheme === "dark" ? "#fff" : "#000",
            headerTitleStyle: {
              fontWeight: "bold",
            },
            headerShadowVisible: false,
            contentStyle: {
              backgroundColor: colorScheme === "dark" ? "#000" : "#f5f5f5",
            },
            animation: Platform.OS === "ios" ? "default" : "none",
            presentation: "card",
          }}
        >
          <Stack.Screen
            name="index"
            options={{
              title: "Login",
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="chat"
            options={({ route }) => {
              const username = (route.params as ChatParams)?.username || "User";

              return {
                title: username,
                headerBackVisible: false,
                gestureEnabled: false,
                header: () => (
                  <SafeAreaView
                    style={[
                      styles.headerContainer,
                      {
                        backgroundColor:
                          colorScheme === "dark" ? "#000" : "#fff",
                        paddingTop: insets.top - 10,
                      },
                    ]}
                  >
                    <TouchableOpacity
                      style={styles.profileButton}
                      onPress={() => console.log("Profile pressed")}
                    >
                      <View style={styles.avatarPlaceholder}>
                        <Ionicons name="person" size={24} color="#666" />
                      </View>
                      <View style={styles.userInfo}>
                        <Text
                          style={[
                            styles.username,
                            { color: colorScheme === "dark" ? "#fff" : "#000" },
                          ]}
                        >
                          {username}
                        </Text>
                        <View style={styles.statusContainer}>
                          <View style={styles.statusIndicator} />
                          <Text style={styles.status}>Online</Text>
                        </View>
                      </View>
                      <Ionicons
                        name="chevron-forward"
                        size={20}
                        color="#888"
                        style={styles.chevronIcon}
                      />
                    </TouchableOpacity>
                    <View
                      style={[
                        styles.divider,
                        {
                          backgroundColor:
                            colorScheme === "dark" ? "#333" : "#ddd",
                        },
                      ]}
                    />
                  </SafeAreaView>
                ),
                headerLeftContainerStyle: {
                  paddingLeft: 16,
                },
              };
            }}
          />
          <Stack.Screen
            name="screens/chatsScreen"
            options={{
              headerShown: false,
            }}
          />
          <Stack.Screen
            name="screens/createChatScreen"
            options={{
              headerShown: false,
            }}
          />
        </Stack>
      </SafeAreaProvider>
    </UserProvider>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    width: "100%",
    padding: 16,
  },
  profileButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  avatarPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#444",
  },
  userInfo: {
    flex: 1,
    marginLeft: 12,
  },
  username: {
    fontSize: 16,
    fontWeight: "600",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#00ff00",
    marginRight: 6,
  },
  status: {
    fontSize: 12,
    color: "#aaa",
    fontWeight: "500",
  },
  chevronIcon: {
    marginLeft: 8,
  },
  divider: {
    height: 1,
    marginTop: 8,
  },
});
