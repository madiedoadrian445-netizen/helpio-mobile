// src/components/GlassPill.js
import React from "react";
import { Pressable, View, Text, StyleSheet, Platform } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { BlurView } from "expo-blur";

export default function GlassPill({ label, onPress }) {
  return (
    <Pressable onPress={onPress} style={styles.shadow}>
      <View style={styles.clip}>
        {Platform.OS === "ios" && (
          <BlurView intensity={20} tint="light" style={StyleSheet.absoluteFill} />
        )}
        <LinearGradient
          colors={["rgba(255,255,255,0.9)", "rgba(240,247,255,0.7)"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <Text style={styles.txt}>{label}</Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  shadow: {
    borderRadius: 18, // smaller curve
    shadowColor: "#8EC0FF",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 2,
  },
  clip: {
    paddingHorizontal: 12, // narrower pill width
    height: 36, // smaller pill height (was 44)
    minWidth: 70, // smaller default width
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "rgba(255,255,255,0.65)",
  },
  txt: {
    fontSize: 15, // smaller text
    fontWeight: "700",
    color: "#1B2A44",
  },
});
