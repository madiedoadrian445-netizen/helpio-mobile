// src/screens/MyListingsScreen.js
import React from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import { BlurView } from "expo-blur";

export default function MyListingsScreen() {
  return (
    <SafeAreaView style={styles.safe}>
      <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />

      <View style={styles.container}>
        <Text style={styles.title}>My Listings</Text>
        <Text style={styles.subtitle}>Your posted services will appear here.</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 26,
  },
  title: {
    fontSize: 32,
    fontWeight: "800",
    color: "#111",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#555",
  },
});
