// src/screens/OrdersScreen.js
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";

const MOCK_ORDERS = [
  {
    id: "1",
    title: "Jetski Engine Rebuild",
    date: "Oct 12, 2025",
    customer: "Miami Jetski Shop",
    amount: "$4,200.00",
    status: "Completed",
  },
  {
    id: "2",
    title: "Full Detail & Ceramic Coat",
    date: "Sep 28, 2025",
    customer: "AFM Showroom",
    amount: "$450.00",
    status: "Paid",
  },
  {
    id: "3",
    title: "Bathroom Remodel Deposit",
    date: "Sep 02, 2025",
    customer: "Veloz Contractors",
    amount: "$1,200.00",
    status: "Pending",
  },
];

export default function OrdersScreen() {
  const { darkMode, theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <BlurView intensity={40} tint={theme.blurTint} style={styles.headerBlur}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Orders</Text>
      </BlurView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: Platform.OS === "ios" ? 70 : 60 }} />

        {/* Summary */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              shadowOpacity: darkMode ? 0 : 0.06,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.subtleText }]}>
            Recent Activity
          </Text>

          <View style={styles.summaryRow}>
            <View style={styles.summaryCol}>
              <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
                This Month
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                $5,850.00
              </Text>
            </View>
            <View style={styles.summaryCol}>
              <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
                Orders
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>7</Text>
            </View>
          </View>
        </View>

        {/* Orders List */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              shadowOpacity: darkMode ? 0 : 0.06,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.subtleText }]}>
            History
          </Text>

          {MOCK_ORDERS.map((order, index) => (
            <View key={order.id}>
              {index > 0 && <View style={styles.divider} />}

              <View style={styles.orderRow}>
                <View style={styles.iconWrap}>
                  <Ionicons
                    name="time-outline"
                    size={20}
                    color={theme.text}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.orderTitle, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {order.title}
                  </Text>
                  <Text
                    style={[styles.orderSub, { color: theme.subtleText }]}
                    numberOfLines={1}
                  >
                    {order.customer} • {order.date}
                  </Text>
                </View>
                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.amount, { color: theme.text }]}>
                    {order.amount}
                  </Text>
                  <Text
                    style={[
                      styles.status,
                      {
                        color:
                          order.status === "Pending"
                            ? "#FF9500"
                            : order.status === "Paid"
                            ? "#34C759"
                            : theme.subtleText,
                      },
                    ]}
                  >
                    {order.status}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerBlur: {
    position: "absolute",
    top: Platform.OS === "ios" ? 10 : 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 85 : 80,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  summaryRow: {
    flexDirection: "row",
  },
  summaryCol: {
    flex: 1,
  },
  summaryLabel: {
    fontSize: 12,
    marginBottom: 3,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: "700",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 10,
  },
  orderRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  orderTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  orderSub: {
    fontSize: 12,
    marginTop: 2,
  },
  amount: {
    fontSize: 14,
    fontWeight: "600",
  },
  status: {
    fontSize: 11,
    marginTop: 2,
  },
});
