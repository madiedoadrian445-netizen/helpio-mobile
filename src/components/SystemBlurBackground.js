// src/components/SystemBlurBackground.js
import React from "react";
import { StyleSheet, View } from "react-native";
import { LinearGradient } from "expo-linear-gradient";

export default function SystemBlurBackground() {
  return (
    <LinearGradient
      colors={[
        "#f5f5f7", // top
        "#f2f6ff", // mid
        "#eef3ff", // bottom
      ]}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={StyleSheet.absoluteFill}
    />
  );
}
