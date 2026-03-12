// src/components/HeroHeader.js
import React, { useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  StatusBar,
  TouchableOpacity,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";

const PADDING_H = 16;
const HELP_IO_BLUE = "#00A6FF";
const TABS_PADDING = 6;

const FEEDS = [
  { key: "verified", label: "Helpio Verified", icon: "shield-checkmark-outline" },
  { key: "trending", label: "Trending Now", icon: "flame-outline" },
];

export default function HeroHeader({ activeFeed, onFeedChange }) {
  const navigation = useNavigation();
  const { darkMode } = useTheme();

  const indicatorX = useRef(new Animated.Value(0)).current;
  const indicatorW = useRef(new Animated.Value(0)).current;
  const tabLayouts = useRef({});

  useEffect(() => {
    const layout = tabLayouts.current[activeFeed];
    if (!layout) return;

    Animated.parallel([
      Animated.spring(indicatorX, {
        toValue: layout.x + TABS_PADDING,
        useNativeDriver: false,
        damping: 20,
        stiffness: 220,
      }),
      Animated.spring(indicatorW, {
        toValue: layout.width,
        useNativeDriver: false,
        damping: 20,
        stiffness: 220,
      }),
    ]).start();
  }, [activeFeed]);

  const subText = darkMode ? "#AFC2D8" : "#4A5B73";
  const iconColor = darkMode ? "#8FA6C4" : "#7B8CA5";

  return (
    <View style={styles.wrap}>
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        translucent
        backgroundColor="transparent"
      />

      {/* ===== Infinite atmospheric glow ===== */}
      <LinearGradient
        colors={
         darkMode
  ? ["rgba(123,97,255,0.20)", "rgba(0,0,0,0)"]
  : ["rgba(123,97,255,0.12)", "rgba(255,255,255,0)"]

        }
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={styles.topGlow}
        pointerEvents="none"
      />




      {/* ===== Feed Tabs ===== */}
      <View style={styles.tabsSurface}>
        <View style={styles.tabsContent}>
          {/* Sliding indicator */}
          <Animated.View
            pointerEvents="none"
            style={[
              styles.indicator,
              {
                left: indicatorX,
                width: indicatorW,
                backgroundColor: "#fbf8f8ff",
              },
            ]}
          />

          <View style={styles.tabsRow}>
            {FEEDS.map((feed) => {
              const active = activeFeed === feed.key;

              return (
                <TouchableOpacity
                  key={feed.key}
                  activeOpacity={0.9}
                  onPress={() => onFeedChange(feed.key)}
                  onLayout={(e) => {
                    tabLayouts.current[feed.key] = {
                      x: e.nativeEvent.layout.x,
                      width: e.nativeEvent.layout.width,
                    };
                  }}
                  style={styles.tabPill}
                >
                  <Ionicons
                    name={feed.icon}
                    size={15}
                    color={active ? HELP_IO_BLUE :  "#171717ff" }
                    style={{ marginRight: 6 }}
                  />
                  <Text
                    style={[
                      styles.tabLabel,
                     { color: active ? HELP_IO_BLUE : "#4b4b4bff" }

                     // other otion in subtle grey { color: active ? HELP_IO_BLUE : "#000" }


                    ]}
                  >
                    {feed.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </View>

      {/* ===== Soft Apple divider seam ===== */}
      <View style={styles.dividerWrap}>
        <LinearGradient
          colors={
            darkMode
              ? ["rgba(255,255,255,0.12)", "rgba(255,255,255,0)"]
              : ["rgba(0,0,0,0.12)", "rgba(0,0,0,0)"]
          }
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.divider,
            { backgroundColor: darkMode ? "#1C1C1E" : "#E5E5EA" },
          ]}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: PADDING_H,
    paddingTop: Platform.OS === "ios" ? 26 : 12,
    paddingBottom: 6,
    overflow: "visible",
  },

  /* ===== Massive off-screen glow so no edge is ever revealed ===== */
  topGlow: {
    position: "absolute",
    top: -1000,
    left: -300,
    right: -300,
    height: 2000,
  },

  /* ===== Tabs ===== */
  tabsSurface: {
    marginTop: 6,
  },

  tabsContent: {
    paddingVertical: 10,
    paddingHorizontal: 4,
  },

  tabsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  tabPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    borderRadius: 999,
  },

  tabLabel: {
  fontSize: 13,
  fontWeight: "600",
  letterSpacing: -0.1,
},


  indicator: {
    position: "absolute",
    bottom: 0,
    height: 3,
    borderRadius: 2,
  },

  /* ===== Divider ===== */
  dividerWrap: {
    height: 10,
    marginHorizontal: -16,
    justifyContent: "flex-end",
  },

  divider: {
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
});