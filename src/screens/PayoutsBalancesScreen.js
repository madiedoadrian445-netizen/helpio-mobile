// src/screens/PayoutsBalancesScreen.js
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";

const HELP_BLUE = "#00A6FF";

export default function PayoutsBalancesScreen({ navigation }) {
  const { darkMode, theme } = useTheme();
  const isLight = !darkMode;
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      <LinearGradient
        colors={
          isLight ? ["#f3f6ff", "#f9fbff"] : ["#020617", "#020617", "#020617"]
        }
        style={StyleSheet.absoluteFill}
      />
      <BlurView
        tint={isLight ? "light" : "dark"}
        intensity={25}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View
        style={[
          styles.header,
          { paddingTop: insets.top + (Platform.OS === "ios" ? 2 : 10) },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <BlurView
            intensity={40}
            tint={isLight ? "light" : "dark"}
            style={styles.backBlur}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={isLight ? "#111827" : "#f9fafb"}
            />
          </BlurView>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Payouts & Balances
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 18,
          paddingBottom: insets.bottom + 40,
        }}
      >
        {/* Available Balance */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isLight ? "#ffffff" : "rgba(15,23,42,0.95)",
            },
          ]}
        >
          <Text style={[styles.cardLabel, { color: theme.subtleText }]}>
            Available Balance
          </Text>
          <Text style={[styles.cardAmount, { color: theme.text }]}>
            $2,840.52
          </Text>

          <Text style={[styles.cardSub, { color: theme.subtleText }]}>
            Next payout: Feb 14 — $1,120.45
          </Text>
        </View>

        {/* Recent Payouts */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: isLight ? "#ffffff" : "rgba(15,23,42,0.95)",
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Recent Payouts
          </Text>

          {[
            { date: "Feb 11", amount: "$945.00" },
            { date: "Feb 6", amount: "$1,270.12" },
            { date: "Jan 30", amount: "$1,034.77" },
          ].map((p, i) => (
            <View key={i} style={styles.payoutRow}>
              <Text style={[styles.payoutDate, { color: theme.text }]}>
                {p.date}
              </Text>
              <Text style={[styles.payoutAmount, { color: theme.text }]}>
                {p.amount}
              </Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8,
  },
  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700",
  },
  backButton: {
    width: 40,
    height: 40,
  },
  backBlur: {
    flex: 1,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 20,
  },
  cardLabel: {
    fontSize: 13,
    fontWeight: "600",
  },
  cardAmount: {
    fontSize: 32,
    fontWeight: "800",
    marginTop: 4,
  },
  cardSub: {
    fontSize: 12,
    marginTop: 8,
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12,
  },
  payoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
  },
  payoutDate: {
    fontSize: 14,
  },
  payoutAmount: {
    fontSize: 14,
    fontWeight: "600",
  },
});
