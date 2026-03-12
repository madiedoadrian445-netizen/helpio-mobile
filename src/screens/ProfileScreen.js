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
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../ThemeContext";
import useAuthStore from "../store/auth";
import { Image } from "react-native";
const HELP_IO_BLUE = "#00A6FF";

export default function ProfileScreen({ navigation }) {
  const { darkMode, theme } = useTheme();

  const user = useAuthStore((state) => state.user);
  const provider = useAuthStore((state) => state.provider);

  


  const isProvider =
  user?.role === "provider" ||
  !!user?.providerId ||
  !!provider;

  const displayName = isProvider
  ? provider?.businessName || "Provider"
  : user?.name || "User";

const avatar = isProvider
  ? provider?.logo
  : user?.avatar;

  const email = user?.email || "";

  const accountType = isProvider ? "Provider" : "Customer";

  const completedCount =
    provider?.completedOrders ||
    user?.completedOrders ||
    0;

  const rating = provider?.rating || 0;

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).getFullYear()
    : "—";

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      
      {/* Atmospheric Background */}
      <LinearGradient
        colors={[
          "rgba(4, 75, 168, 0.12)",
          "rgba(255,255,255,0)",
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <BlurView intensity={40} tint={theme.blurTint} style={styles.headerBlur}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Profile
        </Text>
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
            
            {/* Avatar */}
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
            {avatar ? (
  <Image
    source={{ uri: avatar }}
    style={{ width: 72, height: 72, borderRadius: 36 }}
  />
) : (
  <Ionicons
    name="person-outline"
    size={34}
    color={HELP_IO_BLUE}
  />
)}

              {isProvider && (
                <View style={styles.verifiedBadge}>
                  <Ionicons
                    name="checkmark-circle"
                    size={18}
                    color={HELP_IO_BLUE}
                  />
                </View>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text
                style={[styles.name, { color: theme.text }]}
                numberOfLines={1}
              >
                {displayName}
              </Text>

              <Text
                style={[styles.subtitle, { color: theme.subtleText }]}
                numberOfLines={1}
              >
                {email}
              </Text>

              <Text
                style={[styles.accountType, { color: HELP_IO_BLUE }]}
              >
                {accountType}
              </Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
             onPress={() => navigation.navigate("EditProfileScreen")}
            >
              <Text style={styles.edit}>Edit</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Account Overview */}
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
                Completed
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {completedCount}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
                Rating
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {isProvider ? `★ ${rating.toFixed(1)}` : "—"}
              </Text>
            </View>
          </View>

          <View style={styles.summaryRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
                Member Since
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {memberSince}
              </Text>
            </View>

            <View style={{ flex: 1 }}>
              <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
                Account ID
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {isProvider
                  ? provider?._id?.slice(-6)
                  : user?._id?.slice(-6)}
              </Text>
            </View>
          </View>
        </View>

        {/* Personal Details */}
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
              {displayName}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={[styles.rowLabel, { color: theme.text }]}>
              Email
            </Text>
            <Text style={[styles.rowValue, { color: theme.subtleText }]}>
              {email}
            </Text>
          </View>

          {user?.phone && (
            <>
              <View style={styles.divider} />
              <View style={styles.row}>
                <Text style={[styles.rowLabel, { color: theme.text }]}>
                  Phone
                </Text>
                <Text style={[styles.rowValue, { color: theme.subtleText }]}>
                  {user.phone}
                </Text>
              </View>
            </>
          )}
        </View>

        <Text style={[styles.footer, { color: theme.subtleText }]}>
          Your profile details are private and securely stored.
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
    borderRadius: 20,
    padding: 18,
    marginBottom: 12,
    shadowColor: "#000",
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
  },

  profileRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
    position: "relative",
  },

  verifiedBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    backgroundColor: "#fff",
    borderRadius: 12,
  },

  name: {
    fontSize: 20,
    fontWeight: "800",
  },

  subtitle: {
    fontSize: 13,
    marginTop: 3,
  },

  accountType: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "600",
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
    marginBottom: 12,
  },

  summaryRow: {
    flexDirection: "row",
    marginBottom: 14,
  },

  summaryLabel: {
    fontSize: 12,
    marginBottom: 4,
  },

  summaryValue: {
    fontSize: 20,
    fontWeight: "800",
  },

  row: {
    paddingVertical: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  rowLabel: {
    fontSize: 14,
    fontWeight: "500",
  },

  rowValue: {
    fontSize: 14,
  },

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