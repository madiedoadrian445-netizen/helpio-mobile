import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../ThemeContext";
import { registerProvider } from "../api/auth";
import useAuthStore from "../store/auth";

const HELP_BLUE = "#00A6FF";

export default function ProviderOnboardingScreen() {
  const { theme } = useTheme();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [businessName, setBusinessName] = useState("");

  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleRegisterProvider = async () => {
    if (!name || !email || !password || !businessName) {
      Alert.alert("Missing Fields", "Please fill out all fields.");
      return;
    }

    setLoading(true);

    try {
      const data = await registerProvider({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        companyName: businessName.trim(),
      });

      if (!data?.token || !data?.user) {
        throw new Error("Invalid provider register response");
      }

      await useAuthStore.getState().setAuth({
        token: data.token,
        user: data.user,
        provider: { _id: data.user.providerId },
      });

      setLoading(false);
    } catch (err) {
      setLoading(false);

      if (err?.response?.status === 409) {
        Alert.alert("Email already in use", "Try logging in instead.");
        return;
      }

      Alert.alert(
        "Provider Registration Failed",
        err?.response?.data?.message || err.message || "Unable to create provider account"
      );
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}> 
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.center}>
          {/* ICON */}
          <View style={styles.logoWrap}>
            <Ionicons name="briefcase" size={36} color="#fff" />
          </View>

          {/* TITLE */}
          <Text style={[styles.title, { color: theme.text }]}> 
            Become a{`\n`}Helpio Provider
          </Text>

          {/* NAME */}
          <TextInput
            placeholder="Full Name"
            placeholderTextColor="#8E8E93"
            value={name}
            onChangeText={setName}
            style={styles.input}
          />

          {/* EMAIL */}
          <TextInput
            placeholder="Business Email"
            placeholderTextColor="#8E8E93"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* BUSINESS NAME */}
          <TextInput
            placeholder="Business Name"
            placeholderTextColor="#8E8E93"
            value={businessName}
            onChangeText={setBusinessName}
            style={styles.input}
          />

          {/* PASSWORD */}
          <View style={styles.passwordWrap}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#8E8E93"
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setSecure(!secure)}>
              <Ionicons
                name={secure ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#8E8E93"
              />
            </TouchableOpacity>
          </View>

          {/* CREATE PROVIDER BUTTON */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleRegisterProvider}
            disabled={loading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueText}>Create Provider Account</Text>
            )}
          </TouchableOpacity>

          {/* NOTE */}
          <Text style={styles.note}>
            Verification & payouts will be completed later.
          </Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },

  center: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 28,
    justifyContent: "center",
  },

  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: HELP_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,

    shadowColor: HELP_BLUE,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 24,
  },

  input: {
    width: "100%",
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D1D6",
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },

  passwordWrap: {
    width: "100%",
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D1D6",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },

  passwordInput: { flex: 1, fontSize: 16 },

  continueBtn: {
    width: "100%",
    height: 56,
    borderRadius: 18,
    backgroundColor: HELP_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,

    shadowColor: HELP_BLUE,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },

  continueText: { color: "#fff", fontSize: 17, fontWeight: "600" },

  note: {
    marginTop: 8,
    fontSize: 13,
    color: "#8E8E93",
    textAlign: "center",
  },
});
