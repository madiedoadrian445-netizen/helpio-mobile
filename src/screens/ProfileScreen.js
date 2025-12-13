// src/screens/ProfileScreen.js
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";

const HELP_IO_BLUE = "#00A6FF";

export default function ProfileScreen() {
  const { darkMode, theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Header */}
      <BlurView intensity={40} tint={theme.blurTint} style={styles.headerBlur}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Profile</Text>
      </BlurView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: Platform.OS === "ios" ? 70 : 60 }} />

        {/* Profile Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              shadowOpacity: darkMode ? 0 : 0.08,
            },
          ]}
        >
          <View style={styles.profileRow}>
            <View
              style={[
                styles.avatar,
                {
                  backgroundColor: darkMode
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.05)",
                },
              ]}
            >
              <Ionicons name="person-outline" size={26} color={HELP_IO_BLUE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.name, { color: theme.text }]}
                numberOfLines={1}
              >
                Your Name
              </Text>
              <Text
                style={[styles.subtitle, { color: theme.subtleText }]}
                numberOfLines={1}
              >
                you@example.com
              </Text>
            </View>
            <TouchableOpacity activeOpacity={0.7}>
              <Text style={styles.edit}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Summary */}
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
            Account Overview
          </Text>

          <View style={styles.summaryRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
                Helpio Level
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                Pro Seller
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
                Completed Orders
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                24
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
                Rating
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                ★ 4.9
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
                Member Since
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                2025
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Info */}
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
            Personal Details
          </Text>

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>
              Full Name
            </Text>
            <Text style={[styles.rowValue, { color: theme.subtleText }]}>
              Your Name
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>
              Email
            </Text>
            <Text style={[styles.rowValue, { color: theme.subtleText }]}>
              you@example.com
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>
              Phone
            </Text>
            <Text style={[styles.rowValue, { color: theme.subtleText }]}>
              +1 (555) 000-0000
            </Text>
          </View>
        </View>

        <Text style={[styles.footer, { color: theme.subtleText }]}>
          Your profile details are private and secure.
        </Text>
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
    gap: 12,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    backgroundColor: "#fff",
  },
  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 14,
  },
  name: {
    fontSize: 18,
    fontWeight: "700",
  },
  subtitle: {
    fontSize: 13,
    marginTop: 3,
  },
  edit: {
    fontSize: 14,
    fontWeight: "600",
    color: HELP_IO_BLUE,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: "600",
  },
  row: {
    paddingVertical: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  rowLabel: { fontSize: 15, fontWeight: "500" },
  rowValue: { fontSize: 14 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginLeft: 4,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
  },
});
