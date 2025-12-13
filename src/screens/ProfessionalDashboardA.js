// src/screens/ProfessionalDashboardA.js
import React, { useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Platform,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";

const usePulse = () => {
  const scale = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.04, duration: 1600, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 1600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);
  return scale;
};

const MetricCard = ({ icon, label, value, onPress }) => {
  const pulse = usePulse();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.cardWrap, pressed && { opacity: 0.96 }]}
    >
      <Animated.View style={[styles.card, { transform: [{ scale: pulse }] }]}>
        <View style={styles.cardIcon}>
          <Ionicons name={icon} size={18} color="#007AFF" />
        </View>
        <Text style={styles.cardLabel}>{label}</Text>
        <Text style={styles.cardValue}>{value}</Text>
      </Animated.View>
    </Pressable>
  );
};

const QuickAction = ({ icon, label, onPress }) => (
  <Pressable onPress={onPress} style={({ pressed }) => [styles.quickBtn, pressed && { opacity: 0.9 }]}>
    <View style={styles.quickIcon}>
      <Ionicons name={icon} size={18} color="#007AFF" />
    </View>
    <Text style={styles.quickText}>{label}</Text>
    <Ionicons name="chevron-forward" size={16} color="#C7C7CC" />
  </Pressable>
);

export default function ProfessionalDashboardA({ navigation }) {
  return (
    <SafeAreaView style={styles.safe}>
      {/* Frosted floating header */}
      <View style={styles.header}>
        <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />
        <Text style={styles.title}>Professional Dashboard</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Metrics grid */}
        <View style={styles.grid}>
          <MetricCard icon="cash-outline" label="Earnings (30d)" value="$4,820" onPress={() => {}} />
          <MetricCard icon="briefcase-outline" label="Active Services" value="12" onPress={() => {}} />
          <MetricCard icon="cart-outline" label="Orders" value="31" onPress={() => {}} />
          <MetricCard icon="chatbubble-ellipses-outline" label="Messages" value="9" onPress={() => navigation?.navigate?.("Messages")} />
          <MetricCard icon="star-outline" label="Rating" value="4.9" onPress={() => {}} />
          <MetricCard icon="card-outline" label="Payouts" value="Next: Fri" onPress={() => {}} />
        </View>

        {/* Quick actions */}
        <Text style={styles.sectionHeader}>Quick Actions</Text>
        <View style={styles.cardList}>
          <QuickAction
            icon="add-circle-outline"
            label="Create New Listing"
            onPress={() => navigation?.navigate?.("CreateListing")}
          />
          <View style={styles.hairline} />
          <QuickAction icon="albums-outline" label="Manage Listings" onPress={() => navigation?.navigate?.("Menu")} />
          <View style={styles.hairline} />
          <QuickAction icon="card-outline" label="Withdraw to Bank" onPress={() => {}} />
        </View>

        {/* Activity */}
        <Text style={styles.sectionHeader}>Recent Activity</Text>
        <View style={styles.activityCard}>
          {[
            { id: "a1", icon: "checkmark-circle", text: "Order #1042 completed • $180.00" },
            { id: "a2", icon: "chatbubble", text: "New message from Roberto about ‘AC Repair’" },
            { id: "a3", icon: "star", text: "You received a 5★ rating on ‘Detailing’" },
          ].map((row) => (
            <View key={row.id} style={styles.activityRow}>
              <Ionicons name={row.icon} size={16} color="#0A84FF" />
              <Text style={styles.activityText}>{row.text}</Text>
            </View>
          ))}
        </View>

        <Text style={styles.footer}>Helpio • Designed for providers</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const HEADER_H = Platform.OS === "ios" ? 94 : 80;

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2F2F7" },
  header: {
    position: "absolute",
    top: 0,
    left: 0, right: 0,
    height: HEADER_H,
    justifyContent: "flex-end",
    paddingBottom: 12,
    alignItems: "center",
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
    zIndex: 10,
  },
  title: { fontSize: 20, fontWeight: "700", color: "#000", letterSpacing: -0.2 },
  scroll: { paddingTop: HEADER_H + 10, paddingHorizontal: 16, paddingBottom: 44, gap: 12 },
  grid: {
    flexDirection: "row", flexWrap: "wrap", gap: 10, justifyContent: "space-between",
  },
  cardWrap: { width: "48%" },
  card: {
    height: 110,
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 14,
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  cardIcon: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: "#F4F4F4",
    alignItems: "center", justifyContent: "center",
  },
  cardLabel: { fontSize: 13, color: "#6E6E73", fontWeight: "600" },
  cardValue: { fontSize: 28, fontWeight: "800", color: "#111" },
  sectionHeader: {
    marginTop: 6, marginLeft: 6,
    fontSize: 13, fontWeight: "700", color: "#6E6E73", textTransform: "uppercase", letterSpacing: 0.4,
  },
  cardList: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  quickBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingVertical: 14, paddingHorizontal: 16,
  },
  quickIcon: {
    width: 28, height: 28, borderRadius: 8, backgroundColor: "#F4F4F4",
    alignItems: "center", justifyContent: "center", marginRight: 10,
  },
  quickText: { flex: 1, fontSize: 16, fontWeight: "600", color: "#1B1B1B" },
  hairline: { height: StyleSheet.hairlineWidth, backgroundColor: "#E5E5EA", marginLeft: 60 },

  activityCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    paddingVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
  },
  activityRow: { flexDirection: "row", alignItems: "center", gap: 8, paddingVertical: 10, paddingHorizontal: 14 },
  activityText: { fontSize: 15, color: "#111", fontWeight: "500" },
  footer: { textAlign: "center", color: "#8E8E93", marginTop: 10, fontSize: 12 },
});
