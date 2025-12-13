// src/screens/EditClientScreen.js
import React, { useState, useEffect, memo } from "react";
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
const Field = memo(function Field({ label, value, onChange, placeholder, theme, darkMode }) {
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

export default function EditClientScreen({ route, navigation }) {
  const { darkMode, theme } = useTheme();
  const client = route?.params?.client;

  const [fullName, setFullName] = useState(client?.name || "");
  const [phone, setPhone] = useState(client?.phone || client?.clientPhone || "");
  const [email, setEmail] = useState(client?.email || "");
  const [company, setCompany] = useState(client?.company || "");
  const [address, setAddress] = useState(client?.address || "");
  const [notes, setNotes] = useState(client?.notes || "");

  const getToken = async () => await AsyncStorage.getItem("token");

  /* ------------------------------------------
     SAVE CHANGES → PUT /api/customers/:id 
  ------------------------------------------ */
  const handleSave = async () => {
    try {
      const token = await getToken();

      const res = await fetch(`${API_BASE_URL}/api/customers/${client._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: fullName,
          phone,
          email,
          company,
          address,
          notes,
        }),
      });

      const data = await res.json();

      if (!data.success) {
        Alert.alert("Error", "Could not update client.");
        return;
      }

      // Slow-fade success
      Alert.alert("Saved", "Client updated successfully.", [
        {
          text: "OK",
          onPress: () => {
            navigation.goBack();
          },
        },
      ]);
    } catch (err) {
      console.log("Edit error:", err);
      Alert.alert("Error", "Something went wrong.");
    }
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>

      {/* HEADER */}
      <BlurView intensity={50} tint={theme.blurTint} style={styles.header}>
        <TouchableOpacity
          style={styles.headerSide}
          onPress={() => navigation.goBack()}
        >
          <Text style={[styles.headerText, { color: "#007AFF" }]}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Edit Client
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerSide}
          onPress={handleSave}
          disabled={!fullName.trim().length}
        >
          <Text
            style={[
              styles.headerText,
              {
                color: fullName.trim().length ? "#007AFF" : "rgba(0,0,0,0)",
              },
            ]}
          >
            Save
          </Text>
        </TouchableOpacity>
      </BlurView>

      {/* BACKGROUND SCROLLER */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
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
              <Ionicons
                name="person-circle-outline"
                size={72}
                color="#007AFF"
              />
            </View>
          </View>

          {/* MAIN CARD */}
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

          {/* EXTRA INFO */}
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
              placeholder="Notes about this client"
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
          disabled={!fullName.trim().length}
          style={[
            styles.saveButton,
            {
              backgroundColor:
                !fullName.trim().length ? "#B9B9BC" : "#007AFF",
            },
          ]}
        >
          <Text style={styles.saveText}>Save Changes</Text>
        </TouchableOpacity>
      </BlurView>
    </SafeAreaView>
  );
}

/* ---------- STYLES (Matches AddClientScreen perfectly) ---------- */
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

  headerSide: {
    width: 70,
    justifyContent: "center",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },

  headerText: {
    fontSize: 17,
    fontWeight: "600",
  },

  avatarWrap: {
    alignItems: "center",
    marginBottom: 20,
  },

  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
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

  fieldRow: {
    paddingVertical: 12,
  },

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
