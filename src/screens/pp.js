// src/screens/ProviderOnboardingScreen.js
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
  ScrollView,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

import { useTheme } from "../ThemeContext";
import { api } from "../config/api";
import useAuthStore from "../store/auth";


const HELP_BLUE = "#00A6FF";

export default function ProviderOnboardingScreen({ navigation }) {
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);
const token = useAuthStore((state) => state.token);


  const [businessName, setBusinessName] = useState("");
  const [phone, setPhone] = useState("");
  const [category, setCategory] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!businessName || !phone || !category) {
      Alert.alert("Missing Info", "Please fill out all required fields.");
      return;
    }

    try {
      setLoading(true);

      // 🔥 Create provider profile
      const res = await api.post("/api/providers/create", {
        businessName,
        category,
        phone,
      });

      if (!res.data.success) {
        Alert.alert("Error", res.data.message || "Onboarding failed.");
        setLoading(false);
        return;
      }

      const providerId = res.data.provider._id;

      // 🔥 Update user with provider ID
      const updatedUser = { ...user, providerId };
      setUser(updatedUser);

      Alert.alert("Success", "Your provider account is now active!");

      navigation.replace("ProfessionalDashboardA");

    } catch (err) {
      console.log("❌ Onboarding error:", err);
      Alert.alert("Error", "Something went wrong. Try again.");
    }

    setLoading(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scroll}>
          <Text style={[styles.title, { color: theme.text }]}>
            Set Up Your Provider Account
          </Text>
          <Text style={[styles.subtitle, { color: theme.subtext }]}>
            This lets you post services, receive messages, and get paid.
          </Text>

          <BlurView intensity={50} tint={theme.isDark ? "dark" : "light"} style={styles.card}>
            
            {/* Business Name */}
            <View style={styles.inputWrap}>
              <Ionicons name="business-outline" size={22} color="#888" />
              <TextInput
                placeholder="Business Name"
                placeholderTextColor="#999"
                value={businessName}
                onChangeText={setBusinessName}
                style={[styles.input, { color: theme.text }]}
              />
            </View>

            {/* Category */}
            <View style={styles.inputWrap}>
              <Ionicons name="grid-outline" size={22} color="#888" />
              <TextInput
                placeholder="Category (e.g., Auto Repair, Marine, etc.)"
                placeholderTextColor="#999"
                value={category}
                onChangeText={setCategory}
                style={[styles.input, { color: theme.text }]}
              />
            </View>

            {/* Phone */}
            <View style={styles.inputWrap}>
              <Ionicons name="call-outline" size={22} color="#888" />
              <TextInput
                placeholder="Business Phone"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
                value={phone}
                onChangeText={setPhone}
                style={[styles.input, { color: theme.text }]}
              />
            </View>

          </BlurView>

          {/* Submit */}
          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
            <Text style={styles.submitText}>
              {loading ? "Setting Up..." : "Complete Setup"}
            </Text>
          </TouchableOpacity>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ------------------------ STYLES ------------------------ */

const styles = StyleSheet.create({
  container: { flex: 1 },
  scroll: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 40 },
  title: { fontSize: 30, fontWeight: "700", marginBottom: 8 },
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

  submitBtn: {
    backgroundColor: HELP_BLUE,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
  },

  submitText: { color: "#fff", fontSize: 17, fontWeight: "600" },
});
