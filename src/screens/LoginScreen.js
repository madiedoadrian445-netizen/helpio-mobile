// src/screens/LoginScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  StyleSheet,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "../api"; // ✅ Make sure this points to src/api/index.js (or client.js)

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing fields", "Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      console.log("➡️ POST", `${api.defaults.baseURL}/api/auth/login`);
      const res = await api.post("/api/auth/login", {
        email: email.trim(),
        password: password.trim(),
      });

      setLoading(false);

      if (res.data?.token) {
        await AsyncStorage.setItem("token", res.data.token);
        Alert.alert("Login Successful", "Welcome back!", [
          { text: "OK", onPress: () => navigation.replace("Home") },
        ]);
      } else {
        Alert.alert("Login Failed", res.data?.message || "Unexpected error");
      }
    } catch (err) {
      setLoading(false);
      console.log("❌ Login failed:", err.message);
      Alert.alert("Error", err.message || "Something went wrong");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Login to Helpio</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#777"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#777"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Don't have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F9FBFF",
    justifyContent: "center",
    padding: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "900",
    color: "#1B64F2",
    marginBottom: 32,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 10,
    padding: 14,
    marginBottom: 18,
    backgroundColor: "#fff",
    fontSize: 16,
  },
  button: {
    backgroundColor: "#1B64F2",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 18,
  },
  link: {
    marginTop: 16,
    color: "#1B64F2",
    fontSize: 16,
    textAlign: "center",
  },
});
