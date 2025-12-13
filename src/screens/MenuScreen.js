// src/screens/MenuScreen.js
import React, { useState } from "react";
import {
  SafeAreaView,
  ScrollView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Platform,
  StatusBar,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import { useTheme } from "../ThemeContext"; // ✅ global theme hook

const HELP_IO_BLUE = "#00A6FF";

export default function MenuScreen({ navigation }) {
  const { darkMode, toggleTheme, theme } = useTheme(); // ✅ use global theme
  const [notifications, setNotifications] = useState(true);

  const Row = ({ icon, label, onPress, isSwitch, switchValue, onToggle }) => (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={isSwitch ? undefined : onPress}
      style={[
        styles.row,
        { backgroundColor: darkMode ? theme.card : theme.card },
      ]}
    >
      <View
        style={[
          styles.rowIconWrap,
          {
            backgroundColor: darkMode
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.05)",
          },
        ]}
      >
        <Ionicons name={icon} color={HELP_IO_BLUE} size={20} />
      </View>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>

      {isSwitch ? (
        <Switch
          value={switchValue}
          onValueChange={onToggle}
          ios_backgroundColor="#D1D1D6"
          trackColor={{
            false: darkMode ? "#444" : "#D1D1D6",
            true: HELP_IO_BLUE,
          }}
          thumbColor={Platform.OS === "android" ? "#fff" : undefined}
        />
      ) : (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={darkMode ? "#666" : "#C7C7CC"}
        />
      )}
    </TouchableOpacity>
  );

  const GridButton = ({ icon, label, onPress }) => (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={styles.gridItem}>
      <View
        style={[
          styles.gridIconWrap,
          {
            backgroundColor: darkMode
              ? "rgba(255,255,255,0.08)"
              : "rgba(0,0,0,0.05)",
          },
        ]}
      >
        <Ionicons name={icon} color={HELP_IO_BLUE} size={22} />
      </View>
      <Text style={[styles.gridLabel, { color: theme.text }]} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );

  const SectionHeader = ({ title }) => (
    <Text style={[styles.sectionHeader, { color: theme.subtleText }]}>
      {title}
    </Text>
  );

  const Card = ({ children }) => (
    <View
      style={[
        styles.card,
        {
          backgroundColor: theme.card,
          shadowOpacity: darkMode ? 0 : 0.05,
        },
      ]}
    >
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        translucent
      />

      {/* Background Blur */}
      <View style={StyleSheet.absoluteFill}>
        <BlurView intensity={darkMode ? 10 : 25} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
      </View>

      {/* Header */}
      <BlurView intensity={55} tint={theme.blurTint} style={styles.headerBlur}>
        <Text style={[styles.title, { color: theme.text }]}>Menu</Text>
      </BlurView>

      {/* Scrollable Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
      >
        <View style={{ height: Platform.OS === "ios" ? 60 : 55 }} />

        {/* Profile */}
        <Card>
          <TouchableOpacity
            style={[styles.row, { paddingVertical: 12 }]}
            activeOpacity={0.7}
            onPress={() => navigation.navigate("ProfileScreen")}
          >
            <View
              style={[
                styles.profileCircle,
                {
                  backgroundColor: darkMode
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.05)",
                },
              ]}
            >
              <Ionicons name="person-outline" size={24} color={HELP_IO_BLUE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.rowLabel, { color: theme.text }]}>
                Your Profile
              </Text>
              <Text style={[styles.subtle, { color: theme.subtleText }]}>
                View and manage your account
              </Text>
            </View>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={darkMode ? "#666" : "#C7C7CC"}
            />
          </TouchableOpacity>
        </Card>

        {/* Quick Actions */}
        <SectionHeader title="Quick Actions" />
        <Card>
          <View style={styles.grid}>
            <GridButton
              icon="pricetag-outline"
              label="Sell a Service"
              onPress={() => navigation.navigate("CreateListing")}
            />
            <GridButton
              icon="albums-outline"
              label="My Listings"
              onPress={() => navigation.navigate("MyListingsScreen")}
            />
            <GridButton
              icon="chatbubble-ellipses-outline"
              label="Messages"
              onPress={() => navigation.navigate("MessagesScreen")}
            />
            <GridButton
              icon="card-outline"
              label="Payments"
              onPress={() => navigation.navigate("HelpioPayScreen")}
            />
            <GridButton
              icon="time-outline"
              label="Orders"
              onPress={() => navigation.navigate("OrdersScreen")}
            />
            <GridButton
              icon="heart-outline"
              label="Saved"
              onPress={() => navigation.navigate("SavedScreen")}
            />
          </View>
        </Card>

        {/* Activity */}
        <SectionHeader title="Activity" />
        <Card>
          <Row
            icon="notifications-outline"
            label="Notifications"
            onPress={() => navigation.navigate("Notifications")}
          />
          <View style={styles.hairline} />
          <Row
            icon="briefcase-outline"
            label="Selling Dashboard"
            onPress={() => navigation.navigate("ProfessionalDashboardA")}
          />
          <View style={styles.hairline} />
          <Row
            icon="cart-outline"
            label="Buying History"
            onPress={() => navigation.navigate("BuyingHistoryScreen")}
          />
        </Card>

        {/* Preferences */}
        <SectionHeader title="Preferences" />
        <Card>
          <Row
            icon="moon-outline"
            label="Dark Mode"
            isSwitch
            switchValue={darkMode}
            onToggle={toggleTheme}
          />
          <View style={styles.hairline} />
          <Row
            icon="notifications"
            label="Push Notifications"
            isSwitch
            switchValue={notifications}
            onToggle={setNotifications}
          />
        </Card>

        {/* Settings & Support */}
        <SectionHeader title="Settings & Support" />
        <Card>
          <Row
            icon="settings-outline"
            label="Settings"
            onPress={() => navigation.navigate("SettingsScreen")}
          />
          <View style={styles.hairline} />
          <Row
            icon="help-circle-outline"
            label="Help & Support"
            onPress={() => navigation.navigate("SupportScreen")}
          />
          <View style={styles.hairline} />
          <TouchableOpacity
            style={[styles.row, { paddingVertical: 14 }]}
            activeOpacity={0.8}
            onPress={() => navigation.navigate("LoginScreen")}
          >
            <Ionicons name="log-out-outline" size={20} color="#FF3B30" />
            <Text style={[styles.rowLabel, { color: "#FF3B30" }]}>Log Out</Text>
          </TouchableOpacity>
        </Card>

        <Text style={[styles.footerNote, { color: theme.subtleText }]}>
          Helpio • Designed with precision
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
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
    paddingBottom: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
    zIndex: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  scroll: { paddingHorizontal: 16, paddingBottom: 40, gap: 12 },
  sectionHeader: {
    fontSize: 13,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginLeft: 6,
    marginTop: 4,
    marginBottom: -2,
  },
  card: {
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  row: {
    minHeight: 50,
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  rowIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 7,
    alignItems: "center",
    justifyContent: "center",
  },
  rowLabel: { flex: 1, fontSize: 16, fontWeight: "600" },
  subtle: { fontSize: 13, marginTop: 2 },
  grid: { flexDirection: "row", flexWrap: "wrap", paddingVertical: 10 },
  gridItem: {
    width: "33.333%",
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  gridIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  gridLabel: { fontSize: 13, fontWeight: "600" },
  profileCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginLeft: 50,
  },
  footerNote: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 12,
  },
});
