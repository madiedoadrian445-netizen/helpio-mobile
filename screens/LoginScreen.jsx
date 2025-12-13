// screens/LoginScreen.jsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "https://helpio-backend.onrender.com/api/auth/login";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.post(API_URL, { email, password });
      setLoading(false);

      console.log("✅ Login successful:", res.data);

      // Save token to AsyncStorage
      await AsyncStorage.setItem("token", res.data.token);
      await AsyncStorage.setItem("userEmail", res.data.user.email);

      Alert.alert("✅ Success", "Welcome back!");

      // Navigate to the Services screen
      navigation.replace("Services");
    } catch (err) {
      setLoading(false);
      console.log("❌ Login error:", err.response?.data || err.message);
      Alert.alert(
        "Login Failed",
        err.response?.data?.error ||
          err.response?.data?.message ||
          "Something went wrong. Try again."
      );
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.logo}>Helpio</Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        placeholderTextColor="#888"
        value={email}
        onChangeText={setEmail}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#888"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate("Register")}>
        <Text style={styles.link}>Don’t have an account? Register</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 20,
  },
  logo: {
    fontSize: 42,
    fontWeight: "900",
    color: "#1877F2",
    marginBottom: 40,
  },
  input: {
    width: "100%",
    backgroundColor: "#f2f2f2",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
  },
  button: {
    backgroundColor: "#1877F2",
    paddingVertical: 15,
    paddingHorizontal: 80,
    borderRadius: 12,
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "700",
  },
  link: {
    marginTop: 20,
    color: "#1877F2",
    fontWeight: "600",
  },
});
