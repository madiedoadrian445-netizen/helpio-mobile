import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function IosAvatar({ name = "R", size = 54 }) {
  const letter = name?.charAt(0)?.toUpperCase() || "R";

  return (
    <LinearGradient
      colors={["#A7B8D9", "#6F86C9", "#6B5ED6"]} // iOS-like blue → purple
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Text style={[styles.letter, { fontSize: size * 0.42 }]}>
        {letter}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
  letter: {
    color: "#FFFFFF",
    fontWeight: "600", // closer to SF Semibold
    includeFontPadding: false,
  },
});
