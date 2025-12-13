// src/screens/SubscriptionPlansScreen.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { api } from "../config/api";

export default function SubscriptionPlansScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  // Calculated values
  const totalRevenue = plans.reduce((sum, p) => sum + (p.mrr || 0), 0);
  const totalActiveSubs = plans.reduce(
    (sum, p) => sum + (p.activeSubscribers || 0),
    0
  );

  /* ---------------------------------------------------------
     FETCH PLANS (production-ready endpoint)
  ---------------------------------------------------------*/
  const fetchPlans = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/subscription-plans/my");

      setPlans(res.data.plans || []);
    } catch (err) {
      console.log(
        "❌ Error fetching subscription plans",
        err.response?.data || err.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener("focus", fetchPlans);
    return unsub;
  }, [navigation]);

  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={["#e7f4ff", "#f4f9ff"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 5 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <BlurView tint="light" intensity={40} style={styles.backBlur}>
            <Ionicons name="chevron-back" size={22} color="#0a0a0a" />
          </BlurView>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Subscription Plans</Text>

        <View style={{ width: 40 }} />
      </View>

      {/* Loading */}
      {loading ? (
        <View style={{ marginTop: 50 }}>
          <ActivityIndicator size="large" color="#00A6FF" />
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120,
            paddingHorizontal: 20,
          }}
        >
          {/* Summary Card */}
          <BlurView intensity={60} tint="light" style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <View style={styles.hCircle}>
                <Text style={styles.hText}>H</Text>
              </View>
              <View>
                <Text style={styles.summaryLabel}>HELPIO PAY</Text>
                <Text style={styles.summarySub}>Recurring Revenue</Text>
              </View>
            </View>

            <Text style={styles.summaryAmount}>
              ${totalRevenue.toFixed(2)}
            </Text>

            <View style={styles.summaryFooter}>
              <View style={styles.tag}>
                <View style={styles.tagDot} />
                <Text style={styles.tagText}>
                  {totalActiveSubs} active subscriptions
                </Text>
              </View>
              <Text style={styles.updated}>Updated in real-time</Text>
            </View>
          </BlurView>

          {/* Section */}
          <Text style={styles.sectionTitle}>Active Plans</Text>

          {/* Empty */}
          {plans.length === 0 && (
            <View style={{ marginTop: 20, alignItems: "center" }}>
              <Text style={{ color: "#555", fontSize: 14 }}>
                No subscription plans created yet.
              </Text>
            </View>
          )}

          {/* Plans List */}
          {plans.map((p) => (
            <TouchableOpacity
              key={p._id}
              style={styles.planCard}
              onPress={() =>
                navigation.navigate("CreateSubscriptionPlan", { plan: p })
              }
              activeOpacity={0.9}
            >
              <BlurView intensity={55} tint="light" style={styles.planBlur}>
                <View style={styles.planHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.planName}>{p.planName}</Text>

                    <Text style={styles.planFreq}>
                      {p.billingFrequency === "custom"
                        ? `Every ${p.customInterval?.every} ${p.customInterval?.unit}`
                        : p.billingFrequency}
                    </Text>
                  </View>

                  <View style={styles.planRight}>
                    <Text style={styles.planPrice}>${p.price}</Text>
                    <Text style={styles.planActive}>
                      {p.activeSubscribers || 0} active
                    </Text>
                  </View>
                </View>

                <View style={styles.planFooter}>
                  <View style={styles.pill}>
                    <Ionicons
                      name="repeat-outline"
                      size={14}
                      color="rgba(33,33,33,0.7)"
                    />
                    <Text style={styles.pillText}>
                      {p.autoBilling ? "Auto-billing" : "Manual billing"}
                    </Text>
                  </View>

                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color="rgba(0,0,0,0.35)"
                  />
                </View>
              </BlurView>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Create Plan Button */}
      <View style={[styles.floatingBtnWrap, { bottom: insets.bottom + 20 }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.floatingBtn}
          onPress={() => navigation.navigate("CreateSubscriptionPlan")}
        >
          <LinearGradient
            colors={["#00A6FF", "#007AFF"]}
            style={styles.floatingGradient}
          >
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.floatingText}>Create New Plan</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

/* ---------------------------------------------------------
   iOS Design Styles
---------------------------------------------------------*/
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backButton: { width: 40, height: 40 },
  backBlur: {
    flex: 1,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0a0a0a",
  },

  summaryCard: {
    borderRadius: 24,
    padding: 20,
    marginTop: 10,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
  },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  hCircle: {
    width: 36,
    height: 36,
    borderRadius: 50,
    backgroundColor: "#00A6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  hText: { color: "#fff", fontSize: 18, fontWeight: "800" },
  summaryLabel: { fontSize: 12, fontWeight: "600", color: "rgba(0,0,0,0.5)" },
  summarySub: { fontSize: 13, color: "rgba(0,0,0,0.65)" },
  summaryAmount: {
    fontSize: 34,
    fontWeight: "700",
    marginTop: 10,
    color: "#000",
  },
  summaryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  tag: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 50,
    alignItems: "center",
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: "#00A6FF",
    marginRight: 5,
  },
  tagText: { fontSize: 11, color: "rgba(0,0,0,0.65)" },
  updated: { fontSize: 11, color: "rgba(0,0,0,0.45)" },

  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 25,
    marginBottom: 8,
    color: "#000",
  },

  planCard: { marginBottom: 14 },
  planBlur: {
    padding: 16,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 0.4,
    borderColor: "rgba(0,0,0,0.08)",
  },

  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  planName: { fontSize: 16, fontWeight: "600", color: "#000" },
  planFreq: {
    fontSize: 13,
    marginTop: 3,
    color: "rgba(0,0,0,0.5)",
  },
  planRight: { alignItems: "flex-end" },
  planPrice: { fontSize: 16, fontWeight: "600", color: "#000" },
  planActive: {
    fontSize: 12,
    color: "rgba(0,0,0,0.5)",
    marginTop: 2,
  },

  planFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },

  pill: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.07)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 100,
    alignItems: "center",
  },
  pillText: { fontSize: 11, marginLeft: 5, color: "rgba(0,0,0,0.7)" },

  floatingBtnWrap: {
    position: "absolute",
    left: 20,
    right: 20,
  },
  floatingBtn: { borderRadius: 50, overflow: "hidden" },
  floatingGradient: {
    paddingVertical: 14,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  floatingText: { color: "#fff", marginLeft: 8, fontSize: 16, fontWeight: "600" },
});
