// src/screens/TrendingNowScreen.js
import React from "react";
import { View, Text, StyleSheet, SafeAreaView } from "react-native";
import { useTheme } from "../ThemeContext";

export default function TrendingNowScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <View style={styles.center}>
        <Text style={[styles.title, { color: theme.text }]}>Trending Now</Text>
        <Text style={[styles.subtitle, { color: theme.subtleText }]}>
          Most-clicked, most-messaged, most-saved providers.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 28, fontWeight: "800" },
  subtitle: { fontSize: 14, marginTop: 8 },
});
