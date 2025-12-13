import React from "react";
import { View, Text, StyleSheet } from "react-native";

export const OrdersScreen = () => (
  <View style={styles.center}>
    <Text style={styles.text}>Orders Screen</Text>
  </View>
);

export const SavedScreen = () => (
  <View style={styles.center}>
    <Text style={styles.text}>Saved Items</Text>
  </View>
);

export const MyListingsScreen = () => (
  <View style={styles.center}>
    <Text style={styles.text}>My Listings</Text>
  </View>
);

export const BuyingHistoryScreen = () => (
  <View style={styles.center}>
    <Text style={styles.text}>Buying History</Text>
  </View>
);

export const ProfileScreen = () => (
  <View style={styles.center}>
    <Text style={styles.text}>Your Profile</Text>
  </View>
);

export const SettingsScreen = () => (
  <View style={styles.center}>
    <Text style={styles.text}>Settings</Text>
  </View>
);

export const SupportScreen = () => (
  <View style={styles.center}>
    <Text style={styles.text}>Help & Support</Text>
  </View>
);

export const LoginScreen = () => (
  <View style={styles.center}>
    <Text style={styles.text}>Login Screen</Text>
  </View>
);

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  text: { fontSize: 22, fontWeight: "700" },
});
