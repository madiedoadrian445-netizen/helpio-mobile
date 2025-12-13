// src/screens/SettingsScreen.js
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";

const HELP_IO_BLUE = "#00A6FF";

export default function SettingsScreen() {
  const { darkMode, toggleTheme, theme } = useTheme();
  const [push, setPush] = useState(true);
  const [emailUpdates, setEmailUpdates] = useState(false);

  const Row = ({ icon, label, value, onToggle }) => (
    <View style={styles.row}>
      <View style={styles.rowLeft}>
        <View
          style={[
            styles.iconWrap,
            {
              backgroundColor: darkMode
                ? "rgba(255,255,255,0.08)"
                : "rgba(0,0,0,0.05)",
            },
          ]}
        >
          <Ionicons name={icon} size={18} color={HELP_IO_BLUE} />
        </View>
        <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onToggle}
        ios_backgroundColor="#D1D1D6"
        trackColor={{
          false: darkMode ? "#444" : "#D1D1D6",
          true: HELP_IO_BLUE,
        }}
        thumbColor={Platform.OS === "android" ? "#fff" : undefined}
      />
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <BlurView intensity={40} tint={theme.blurTint} style={styles.headerBlur}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Settings
        </Text>
      </BlurView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: Platform.OS === "ios" ? 70 : 60 }} />

        {/* Preferences */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              shadowOpacity: darkMode ? 0 : 0.06,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.subtleText }]}>
            Preferences
          </Text>

          <Row
            icon="moon-outline"
            label="Dark Mode"
            value={darkMode}
            onToggle={toggleTheme}
          />

          <View style={styles.divider} />

          <Row
            icon="notifications-outline"
            label="Push Notifications"
            value={push}
            onToggle={setPush}
          />

          <View style={styles.divider} />

          <Row
            icon="mail-outline"
            label="Email Updates"
            value={emailUpdates}
            onToggle={setEmailUpdates}
          />
        </View>

        {/* About & Legal */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              shadowOpacity: darkMode ? 0 : 0.06,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.subtleText }]}>
            About
          </Text>

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              Version
            </Text>
            <Text style={[styles.infoValue, { color: theme.subtleText }]}>
              1.0.0
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              Terms of Service
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.subtleText}
            />
          </View>

          <View style={styles.divider} />

          <View style={styles.infoRow}>
            <Text style={[styles.infoLabel, { color: theme.text }]}>
              Privacy Policy
            </Text>
            <Ionicons
              name="chevron-forward"
              size={16}
              color={theme.subtleText}
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerBlur: {
    position: "absolute",
    top: Platform.OS === "ios" ? 10 : 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 85 : 80,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    justifyContent: "space-between",
  },
  rowLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 30,
    height: 30,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  rowLabel: {
    fontSize: 15,
    fontWeight: "500",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 6,
  },
  infoRow: {
    flexDirection: "row",
    paddingVertical: 8,
    alignItems: "center",
    justifyContent: "space-between",
  },
  infoLabel: {
    fontSize: 15,
  },
  infoValue: {
    fontSize: 14,
  },
});
