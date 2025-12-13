// src/components/HeroHeader.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Platform,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";
import { useTheme } from "../ThemeContext"; // ✅ hook for global dark mode

const PADDING_H = 16;
const HELP_IO_BLUE = "#00A6FF";

const FEEDS = [
  { key: "choice", label: "Helpio's Choice", icon: "sparkles-outline" },
  { key: "verified", label: "Helpio Verified", icon: "shield-checkmark-outline" },
  { key: "trending", label: "Trending Now", icon: "flame-outline" },
  { key: "all", label: "All", icon: "apps-outline" },
];

export default function HeroHeader({
  navigation,
  search,
  setSearch,
  activeFeed,
  onFeedChange,
}) {

  const { darkMode } = useTheme();

  // 🌙 Colors adapt automatically
  const textColor = darkMode ? "#FFFFFF" : "#000000";
  const subText = darkMode ? "#B5C2D9" : "#3E4E68";
  const iconColor = darkMode ? "#A0B5D0" : "#6B7A90";
  const placeholderColor = darkMode ? "#8BA0BC" : "#8FA2BE";
  const blurTint = darkMode ? "dark" : "light";

  return (
    <View style={styles.wrap}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        translucent
        backgroundColor="transparent"
      />

      {/* ======= Frosted Background ======= */}
      <View style={styles.frostedBackground} pointerEvents="none">
        {Platform.OS === "ios" && (
          <BlurView
            intensity={darkMode ? 100 : 120}
            tint={blurTint}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        )}
        <LinearGradient
          colors={
            darkMode
              ? [
                  "rgba(10,10,15,0.9)",
                  "rgba(20,25,35,0.85)",
                  "rgba(25,30,40,0.8)",
                ]
              : [
                  "rgba(255,255,255,0.96)",
                  "rgba(245,248,255,0.92)",
                  "rgba(230,240,255,0.88)",
                ]
          }
          start={{ x: 0.2, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
      </View>

      {/* ======= Title ======= */}
      <View style={styles.titleContainer}>
        <Text style={[styles.appTitle, { color: textColor }]}>Helpio</Text>
        <Text style={[styles.appSubtitle, { color: subText }]}>
          Service Marketplace
        </Text>
      </View>

      {/* ======= Search ======= */}
      <View
        style={[
          styles.searchShell,
          {
            shadowColor: darkMode ? "#000" : "#B8D8FF",
            backgroundColor: darkMode
              ? "rgba(30,30,35,0.5)"
              : "rgba(255,255,255,0.6)",
          },
        ]}
      >
        {Platform.OS === "ios" && (
          <BlurView
            intensity={darkMode ? 30 : 40}
            tint={blurTint}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        )}
        <LinearGradient
          colors={
            darkMode
              ? ["rgba(25,25,30,0.8)", "rgba(35,35,45,0.6)"]
              : ["rgba(255,255,255,0.9)", "rgba(245,248,255,0.6)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
          pointerEvents="none"
        />
        <View style={styles.searchRow}>
          <Ionicons
            name="search"
            size={20}
            color={iconColor}
            style={{ marginRight: 8 }}
          />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search services..."
            placeholderTextColor={placeholderColor}
            style={[styles.searchInput, { color: textColor }]}
            returnKeyType="search"
          />
        </View>
      </View>

      {/* ======= Feed Chips Row (Option 2) ======= */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsRow}
      >
        {FEEDS.map((feed) => {
          const active = activeFeed === feed.key;
          return (
            <TouchableOpacity
              key={feed.key}
              activeOpacity={0.9}
              onPress={() => onFeedChange && onFeedChange(feed.key)}
              style={[
                styles.tabPill,
                active && {
                  backgroundColor: darkMode
                    ? "rgba(0,166,255,0.24)"
                    : "rgba(0,166,255,0.14)",
                  borderColor: HELP_IO_BLUE,
                },
              ]}
            >
              <Ionicons
                name={feed.icon}
                size={14}
                color={active ? HELP_IO_BLUE : iconColor}
                style={{ marginRight: 6 }}
              />
              <Text
                style={[
                  styles.tabLabel,
                  {
                    color: active ? HELP_IO_BLUE : subText,
                  },
                ]}
                numberOfLines={1}
              >
                {feed.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
}
/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: PADDING_H,
    paddingTop: Platform.OS === "ios" ? 60 : 40,
    paddingBottom: 10,
    overflow: "hidden",
  },
  frostedBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 210,
    zIndex: -1,
  },
  titleContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "900",
    letterSpacing: -0.2,
    textAlign: "center",
  },
  appSubtitle: {
    marginTop: 2,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.8,
    textAlign: "center",
  },
  searchShell: {
    marginTop: 14,
    height: 52,
    borderRadius: 18,
    overflow: "hidden",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 3,
  },
  searchRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
  },
  searchInput: {
    flex: 1,
    fontSize: 17,
    paddingVertical: 10,
  },
  tabsRow: {
    flexDirection: "row",
    marginTop: 10,
    paddingRight: 8,
  },
  tabPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
    borderColor: "transparent",
  },
  tabLabel: {
    fontSize: 12.5,
    fontWeight: "600",
  },
});
