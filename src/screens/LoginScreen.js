import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

import { useTheme } from "../ThemeContext";
import useAuthStore from "../store/auth";
import { login as loginApi } from "../api/auth";
import { api } from "../config/api"; // ✅ REQUIRED

const HELP_BLUE = "#00A6FF";

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [secure, setSecure] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Missing Fields", "Please enter your email and password.");
      return;
    }

    setLoading(true);

    try {
      // 1️⃣ Login
      const data = await loginApi(email, password);
      // expected: { token, user }

      if (!data?.token || !data?.user) {
        throw new Error("Invalid login response");
      }

      // 2️⃣ Fetch provider profile
      let provider = null;
      try {
        const res = await api.get("/api/providers/me");
        provider = res.data?.provider || null;
      } catch {
        provider = null;
      }

      // 3️⃣ Store everything in Zustand
      await useAuthStore.getState().setAuth({
        token: data.token,
        user: data.user,
        provider,
      });

      setLoading(false);

     
    } catch (err) {
      setLoading(false);
      Alert.alert(
        "Login Failed",
        err?.response?.data?.message ||
          err.message ||
          "Invalid login credentials"
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.innerWrap}>
          <Text style={[styles.title, { color: theme.text }]}>Welcome Back</Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            Login to your Helpio BusinessPlace account
          </Text>

          <BlurView
            intensity={50}
            tint={theme.isDark ? "dark" : "light"}
            style={styles.card}
          >
            {/* Email */}
            <View style={styles.inputWrap}>
              <Ionicons name="mail-outline" size={22} color="#888" />
              <TextInput
                placeholder="Email"
                placeholderTextColor="#999"
                autoCapitalize="none"
                keyboardType="email-address"
                value={email}
                onChangeText={setEmail}
                style={[styles.input, { color: theme.text }]}
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrap}>
              <Ionicons name="lock-closed-outline" size={22} color="#888" />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#999"
                secureTextEntry={secure}
                value={password}
                onChangeText={setPassword}
                style={[styles.input, { color: theme.text }]}
              />
              <TouchableOpacity onPress={() => setSecure(!secure)}>
                <Ionicons
                  name={secure ? "eye-off-outline" : "eye-outline"}
                  size={22}
                  color="#888"
                />
              </TouchableOpacity>
            </View>
          </BlurView>

          {/* Login Button */}
          <TouchableOpacity
            style={styles.loginBtn}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.loginText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Register link */}
          <TouchableOpacity onPress={() => navigation.navigate("RegisterScreen")}>
            <Text style={[styles.registerText, { color: theme.subtext }]}>
              Don’t have an account?{" "}
              <Text style={{ color: HELP_BLUE }}>Sign up</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  innerWrap: { paddingHorizontal: 24, paddingTop: 20 },
  title: { fontSize: 32, fontWeight: "700", marginBottom: 4 },
  subtitle: { fontSize: 15, marginBottom: 20, opacity: 0.7 },
  card: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 30,
    overflow: "hidden",
  },
  inputWrap: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
    marginBottom: 15,
  },
  input: { flex: 1, fontSize: 16, marginLeft: 10 },
  loginBtn: {
    backgroundColor: HELP_BLUE,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    marginBottom: 14,
  },
  loginText: { color: "#fff", fontSize: 17, fontWeight: "600" },
  registerText: { fontSize: 14, textAlign: "center", marginTop: 6 },
});
