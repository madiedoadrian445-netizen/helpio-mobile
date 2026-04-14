import React from "react";
import { StyleSheet } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function ContactAvatar({ size = 110 }) {
  return (
    <LinearGradient
      colors={["#A7B8D9", "#6F86C9", "#6B5ED6"]}
      start={{ x: 0.2, y: 0 }}
      end={{ x: 0.8, y: 1 }}
      style={[
        styles.avatar,
        { width: size, height: size, borderRadius: size / 2 },
      ]}
    >
      <Ionicons
        name="person"
        size={size * 0.52}
        color="#FFFFFF"
        style={{ opacity: 0.95 }}
      />
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  avatar: {
    alignItems: "center",
    justifyContent: "center",
  },
});