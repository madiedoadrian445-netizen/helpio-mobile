import React from "react";
import { View, StyleSheet } from "react-native";
import NotificationsScreen from "./NotificationsScreen";
import { BlurView } from "expo-blur";

export default function NotificationsWrapper() {
  return (
    <View style={styles.container}>
      <NotificationsScreen />
      {/* Fake persistent dock background to match Helpio’s iOS nav */}
      <BlurView
        intensity={70}
        tint="light"
        style={styles.fakeDock}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  fakeDock: {
    position: "absolute",
    bottom: 12,
    left: 24,
    right: 24,
    height: 88,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
});
