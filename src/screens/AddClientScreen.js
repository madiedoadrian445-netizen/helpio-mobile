// src/screens/AddClientScreen.js
import React, { useState, memo, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../ThemeContext";
import { API_BASE_URL } from "../config/api";

/* ----------------------------------------------------
   MEMOIZED FIELD COMPONENT
---------------------------------------------------- */
const Field = memo(function Field({
  label,
  value,
  onChange,
  placeholder,
  theme,
  darkMode,
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={[styles.label, { color: theme.subtleText }]}>{label}</Text>
      <TextInput
        style={[styles.input, { color: theme.text }]}
        placeholder={placeholder}
        placeholderTextColor={darkMode ? "#888" : "#A8A8AD"}
        value={value}
        onChangeText={onChange}
      />
    </View>
  );
});

export default function AddClientScreen({ navigation }) {
  const { darkMode, theme } = useTheme();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  /* -------------------------
       DEBUG TOKEN ON MOUNT
  ------------------------- */
  useEffect(() => {
    AsyncStorage.getItem("token").then((t) =>
      console.log("🔑 CURRENT STORED TOKEN:", t)
    );
    console.log("🔗 API BASE URL:", API_BASE_URL);
  }, []);

  /* -------------------------
       SAVE TO BACKEND
  ------------------------- */
  const handleSave = async () => {
    if (!fullName.trim().length) return;

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      console.log("➡️ TOKEN USED FOR SAVE:", token);
      console.log("➡️ FULL REQUEST URL:", `${API_BASE_URL}/api/customers`);
      console.log("➡️ SENDING HEADERS:", {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      });

      const res = await fetch(`${API_BASE_URL}/api/customers`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: fullName.trim(),
          phone,
          email,
          company,
          address,
          notes,
        }),
      });

      /* -------------------------
          RAW RESPONSE LOGGING
      ------------------------- */
      console.log("➡️ RAW RESPONSE STATUS:", res.status);
      console.log("➡️ RAW RESPONSE HEADERS:", res.headers);

      const text = await res.text();
      console.log("➡️ RAW RESPONSE BODY:", text);

      // ⛔ STOP HERE so we analyze raw response before parsing JSON
      return;

      // (Will re-enable this once debugging is done)
      // const data = await res.json();
      // if (!data.success) {
      //   Alert.alert("Error", data.message || "Could not save client.");
      //   return;
      // }
      // navigation.navigate("ClientsScreen", { refreshNow: true });

    } catch (err) {
      console.log("❌ ERROR SENDING REQUEST:", err);
      Alert.alert("Error", "Something went wrong saving this client.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------
       UI (unchanged)
  ------------------------- */
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* HEADER */}
      <BlurView intensity={50} tint={theme.blurTint} style={styles.header}>
        <TouchableOpacity style={styles.headerSide} onPress={() => navigation.goBack()}>
          <Text style={[styles.headerText, { color: "#007AFF" }]}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>New Client</Text>
        </View>

        <TouchableOpacity
          style={styles.headerSide}
          onPress={handleSave}
          disabled={!fullName.trim().length || loading}
        >
          <Text
            style={[
              styles.headerText,
              {
                color:
                  fullName.trim().length && !loading
                    ? "#007AFF"
                    : "rgba(0,0,0,0)",
              },
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </BlurView>

      {/* FORM */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120,
            paddingTop: 110,
          }}
        >
          {/* AVATAR */}
          <View style={styles.avatarWrap}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: darkMode
                    ? "rgba(255,255,255,0.07)"
                    : "rgba(0,0,0,0.07)",
                },
              ]}
            >
              <Ionicons name="person-add-outline" size={42} color="#007AFF" />
            </View>
          </View>

          {/* MAIN FORM CARD */}
          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, shadowOpacity: darkMode ? 0 : 0.06 },
            ]}
          >
            <Field
              label="Full Name"
              placeholder="Client's full name"
              value={fullName}
              onChange={setFullName}
              theme={theme}
              darkMode={darkMode}
            />
            <View style={styles.hairline} />

            <Field
              label="Phone"
              placeholder="(305) 555-0123"
              value={phone}
              onChange={setPhone}
              theme={theme}
              darkMode={darkMode}
            />
            <View style={styles.hairline} />

            <Field
              label="Email"
              placeholder="john@example.com"
              value={email}
              onChange={setEmail}
              theme={theme}
              darkMode={darkMode}
            />
          </View>

          {/* ADDITIONAL INFO */}
          <Text style={[styles.sectionHeader, { color: theme.subtleText }]}>
            ADDITIONAL INFO
          </Text>

          <View
            style={[
              styles.card,
              { backgroundColor: theme.card, shadowOpacity: darkMode ? 0 : 0.06 },
            ]}
          >
            <Field
              label="Company"
              placeholder="Optional"
              value={company}
              onChange={setCompany}
              theme={theme}
              darkMode={darkMode}
            />
            <View style={styles.hairline} />

            <Field
              label="Address"
              placeholder="Street, city, state"
              value={address}
              onChange={setAddress}
              theme={theme}
              darkMode={darkMode}
            />
            <View style={styles.hairline} />

            <Field
              label="Notes"
              placeholder="Special instructions…"
              value={notes}
              onChange={setNotes}
              theme={theme}
              darkMode={darkMode}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* BOTTOM SAVE BUTTON */}
      <BlurView intensity={50} tint={theme.blurTint} style={styles.bottomBar}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!fullName.trim().length || loading}
          style={[
            styles.saveButton,
            {
              backgroundColor:
                !fullName.trim().length || loading ? "#B9B9BC" : "#007AFF",
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveText}>Save Client</Text>
          )}
        </TouchableOpacity>
      </BlurView>
    </SafeAreaView>
  );
}

/* ---------- Styles (unchanged) ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    height: 92,
    paddingTop: Platform.OS === "ios" ? 12 : 8,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 8,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },

  headerSide: { width: 70, justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center" },

  headerTitle: { fontSize: 17, fontWeight: "700" },
  headerText: { fontSize: 17, fontWeight: "600" },

  avatarWrap: { alignItems: "center", marginBottom: 20 },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
  },

  card: {
    borderRadius: 14,
    marginHorizontal: 16,
    marginBottom: 22,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  fieldRow: { paddingVertical: 12 },

  label: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: "600",
  },

  input: {
    fontSize: 17,
    fontWeight: "500",
    paddingVertical: 4,
  },

  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.12)",
  },

  sectionHeader: {
    marginLeft: 22,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  bottomBar: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    height: 85,
    paddingHorizontal: 16,
    justifyContent: "center",
  },

  saveButton: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },

  saveText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
