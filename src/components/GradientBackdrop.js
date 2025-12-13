// src/components/GradientBackdrop.js
import React from "react";
import { View, StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function GradientBackdrop({ children, style }) {
  return (
    <View style={[styles.wrap, style]}>
      {/* Base page gradient */}
      <LinearGradient
        colors={["#F4F9FF", "#EEF5FF", "#FFFFFF"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      {/* Very soft top glow */}
      <LinearGradient
        colors={["rgba(130,180,255,0.35)", "rgba(130,180,255,0.0)"]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[styles.glow, { top: -120, height: 240 }]}
      />
      {/* Very soft lower glow */}
      <LinearGradient
        colors={["rgba(180,210,255,0.25)", "rgba(180,210,255,0.0)"]}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={[styles.glow, { top: 260, height: 320 }]}
      />

      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1 },
  glow: {
    position: "absolute",
    left: -40,
    right: -40,
    borderRadius: 200,
  },
});
