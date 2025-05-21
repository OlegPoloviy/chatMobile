import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { useUser } from "../context/userContext";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");
  const [showFullName, setShowFullName] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const router = useRouter();
  const { signIn, signUp, error } = useUser();

  const handleAuth = async () => {
    try {
      if (isSignUp) {
        if (!username.trim()) {
          Alert.alert("Error", "Username is required");
          return;
        }
        await signUp(
          email.trim(),
          password.trim(),
          username.trim(),
          fullName.trim()
        );
        Alert.alert("Success");
      } else {
        await signIn(email.trim(), password.trim());
        router.push({
          pathname: "/screens/chatsScreen",
          params: {
            username: username.trim() || email.split("@")[0],
            email: email.trim(),
          },
        });
      }
    } catch (err) {
      Alert.alert("Error", error || "Authentication failed");
      console.log(error);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient colors={["#000000", "#1a1a1a"]} style={styles.gradient}>
          <View style={styles.form}>
            <Text style={styles.title}>Quantum Chat</Text>
            <Text style={styles.subtitle}>Enter the digital realm</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Username"
                placeholderTextColor="#666"
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Email"
                placeholderTextColor="#666"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                style={styles.input}
                placeholder="Password"
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
              />
            </View>

            {isSignUp && (
              <>
                {showFullName ? (
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Full Name (Optional)"
                      placeholderTextColor="#666"
                      value={fullName}
                      onChangeText={setFullName}
                    />
                  </View>
                ) : (
                  <TouchableOpacity
                    onPress={() => setShowFullName(true)}
                    style={styles.optionalButton}
                  >
                    <Text style={styles.optionalButtonText}>
                      + Add Full Name
                    </Text>
                  </TouchableOpacity>
                )}
              </>
            )}

            <TouchableOpacity
              style={[
                styles.authButton,
                (!email.trim() ||
                  !password.trim() ||
                  (isSignUp && !username.trim())) &&
                  styles.authButtonDisabled,
              ]}
              onPress={handleAuth}
              disabled={
                !email.trim() ||
                !password.trim() ||
                (isSignUp && !username.trim())
              }
            >
              <Text style={styles.authButtonText}>
                {isSignUp ? "Sign Up" : "Sign In"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setIsSignUp(!isSignUp)}
              style={styles.switchButton}
            >
              <Text style={styles.switchButtonText}>
                {isSignUp
                  ? "Already have an account? Sign In"
                  : "Don't have an account? Sign Up"}
              </Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  gradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    width: "90%",
    maxWidth: 400,
    padding: 20,
  },
  title: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#fff",
    textAlign: "center",
    marginBottom: 10,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 16,
    color: "#888",
    textAlign: "center",
    marginBottom: 40,
    letterSpacing: 1,
  },
  inputWrapper: {
    marginBottom: 20,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.2)",
  },
  input: {
    padding: 15,
    color: "#fff",
    fontSize: 16,
  },
  optionalButton: {
    marginBottom: 20,
  },
  optionalButtonText: {
    color: "#666",
    textAlign: "center",
    fontSize: 14,
  },
  authButton: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  authButtonDisabled: {
    backgroundColor: "rgba(255, 255, 255, 0.3)",
  },
  authButtonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
    letterSpacing: 1,
  },
  switchButton: {
    marginTop: 20,
  },
  switchButtonText: {
    color: "#666",
    textAlign: "center",
    fontSize: 14,
  },
});
