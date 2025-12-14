// src/screens/InvoicesHomeScreen.js
import React, { useState, useCallback, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Image,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { api } from "../config/api";
import SubscriptionsIcon from "../../assets/images/subscriptions.png";
import InvoicesListScreen from "./InvoicesListScreen";




export default function InvoicesHomeScreen({ navigation }) {
  const { darkMode, theme } = useTheme();
  const route = useRoute();

  const refreshKey = route.params?.refreshInvoices;
  const initialTab = route.params?.returnToTab || "dashboard";
  const [tab, setTab] = useState(initialTab);

  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);

  const isLight = !darkMode;

  /* --------------------------------------------------
     FETCH RECENT INVOICES (LIVE DATA — REFRESH SAFE)
  -------------------------------------------------- */
  useFocusEffect(
    useCallback(() => {
      let mounted = true;

      const fetchRecentInvoices = async () => {
        try {
          setLoadingRecent(true);
          const res = await api.get("/api/invoices/provider/me");

          if (mounted && res.data?.success) {
            const sorted = [...(res.data.invoices || [])].sort(
              (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );
            setRecentInvoices(sorted.slice(0, 5));
          }
        } catch (err) {
          console.log(
            "❌ Fetch recent invoices error:",
            err.response?.data || err
          );
        } finally {
          mounted && setLoadingRecent(false);
        }
      };

      fetchRecentInvoices();

      return () => {
        mounted = false;
      };
    }, [refreshKey])
  );

  const renderSegmentButton = (key, label) => {
    const active = tab === key;

    const handlePress = () => {
      if (key === "clients") {
        navigation.navigate("ClientsScreen", { returnToTab: "clients" });
        return;
      }

      if (key === "builder") {
        navigation.push("InvoiceBuilderScreen");
        return;
      }

      setTab(key);
    };

    return (
      <TouchableOpacity
        key={key}
        activeOpacity={0.85}
        onPress={handlePress}
        style={[
          styles.segmentItem,
          active && key !== "builder" && {
            backgroundColor: isLight ? "#fff" : "rgba(255,255,255,0.18)",
            shadowColor: "#000",
            shadowOpacity: isLight ? 0.08 : 0,
            shadowRadius: 6,
            shadowOffset: { width: 0, height: 2 },
          },
        ]}
      >
        <Text
          style={[
            styles.segmentLabel,
            {
              color:
                active && key !== "builder"
                  ? isLight
                    ? "#111"
                    : "#fff"
                  : isLight
                  ? "#6E6E73"
                  : "#9FA3AE",
            },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderDashboard = () => (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 80 }}
    >
      {/* Top Stats Card */}
      <View
        style={[
          styles.card,
          {
            backgroundColor: isLight
              ? "rgba(255,255,255,0.9)"
              : "rgba(28,28,30,0.9)",
            shadowOpacity: isLight ? 0.12 : 0,
          },
        ]}
      >
        <Text style={[styles.cardSubtitle, { color: theme.subtleText }]}>
          This Month
        </Text>

        <Text style={[styles.mainAmount, { color: theme.text }]}>$0.00</Text>

        <Text style={[styles.cardSubtitle, { color: theme.subtleText }]}>
          Total revenue
        </Text>

        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>0 sent</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>0 paid</Text>
          </View>
          <View style={styles.chip}>
            <Text style={styles.chipLabel}>0 overdue</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.quickRow}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.quickCard,
            {
              backgroundColor: isLight
                ? "rgba(255,255,255,0.9)"
                : "rgba(28,28,30,0.9)",
              shadowOpacity: isLight ? 0.1 : 0,
            },
          ]}
          onPress={() => navigation.push("InvoiceBuilderScreen")}
        >
          <Ionicons name="document-text-outline" size={26} color="#007AFF" />
          <Text style={[styles.quickTitle, { color: theme.text }]}>
            New Invoice
          </Text>
          <Text style={[styles.quickSubtitle, { color: theme.subtleText }]}>
            Create and send
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.quickCard,
            {
              backgroundColor: isLight
                ? "rgba(255,255,255,0.9)"
                : "rgba(28,28,30,0.9)",
              shadowOpacity: isLight ? 0.1 : 0,
            },
          ]}
          onPress={() =>
            navigation.navigate("ClientsScreen", { returnToTab: "clients" })
          }
        >
          <Ionicons name="person-add-outline" size={26} color="#34C759" />
          <Text style={[styles.quickTitle, { color: theme.text }]}>
            CRM / Add Client
          </Text>
          <Text style={[styles.quickSubtitle, { color: theme.subtleText }]}>
            Save details
          </Text>
        </TouchableOpacity>
      </View>

      {/* Subscriptions + Dashboard Row */}
      <View style={[styles.quickRow, { marginTop: 16 }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          style={[
            styles.quickCard,
            {
              backgroundColor: isLight
                ? "rgba(255,255,255,0.9)"
                : "rgba(28,28,30,0.9)",
              shadowOpacity: isLight ? 0.1 : 0,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 18,
            },
          ]}
          onPress={() => navigation.navigate("SubscriptionPlans")}
        >
          <Ionicons
            name="repeat-outline"
            size={22}
            color="#5856D6"
            style={{ marginBottom: 10 }}
          />
          <Text style={[styles.quickTitle, { color: theme.text, marginTop: 4 }]}>
            Create Subscriptions
          </Text>
          <Text style={[styles.quickSubtitle, { color: theme.subtleText }]}>
            Plans & billing
          </Text>
          <Image
            source={SubscriptionsIcon}
            style={{ width: 28, height: 28, marginTop: 10 }}
            resizeMode="contain"
          />
        </TouchableOpacity>

        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate("AnalyticsDashboard")}
          style={[
            styles.quickCard,
            {
              backgroundColor: isLight
                ? "rgba(255,255,255,0.9)"
                : "rgba(28,28,30,0.9)",
              shadowOpacity: isLight ? 0.1 : 0,
              alignItems: "center",
              justifyContent: "center",
            },
          ]}
        >
          <Ionicons
            name="stats-chart-outline"
            size={28}
            color="#007AFF"
            style={{ marginBottom: 6 }}
          />
          <Text style={[styles.quickTitle, { color: theme.text }]}>
            Dashboard
          </Text>
          <Text style={[styles.quickSubtitle, { color: theme.subtleText }]}>
            Performance & revenue
          </Text>
        </TouchableOpacity>
      </View>

      {/* Recent Invoices */}
      <View style={{ marginTop: 32 }}>
        <Text style={[styles.sectionTitle, { color: theme.text }]}>
          Recent invoices
        </Text>

        {loadingRecent ? (
          <ActivityIndicator style={{ marginTop: 16 }} />
        ) : !recentInvoices.length ? (
          <Text style={[styles.emptyText, { color: theme.subtleText }]}>
            No invoices yet.
          </Text>
        ) : (
          <View
            style={[
              styles.listCard,
              {
                backgroundColor: isLight
                  ? "rgba(255,255,255,0.9)"
                  : "rgba(28,28,30,0.9)",
                shadowOpacity: isLight ? 0.08 : 0,
              },
            ]}
          >
            {recentInvoices.map((inv, idx) => {
              const isLast = idx === recentInvoices.length - 1;
              const statusColor =
                inv.status === "PAID"
                  ? "#34C759"
                  : inv.status === "OVERDUE"
                  ? "#FF3B30"
                  : "#FFCC00";

              return (
                <View key={inv._id}>
                  <View style={styles.invoiceRow}>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.invoiceId, { color: theme.text }]}>
                        {inv.invoiceNumber || `INV-${inv._id.slice(-4)}`}
                      </Text>
                      <Text
                        style={[
                          styles.invoiceClient,
                          { color: theme.subtleText },
                        ]}
                      >
                        {inv.customer?.name || "Unknown client"}
                      </Text>
                    </View>

                    <View style={{ alignItems: "flex-end" }}>
                      <Text
                        style={[
                          styles.invoiceTotal,
                          { color: theme.text },
                        ]}
                      >
                        ${Number(inv.total).toFixed(2)}
                      </Text>
                      <Text
                        style={[
                          styles.invoiceStatus,
                          { color: statusColor },
                        ]}
                      >
                        {inv.status}
                      </Text>
                    </View>
                  </View>
                  {!isLast && <View style={styles.divider} />}
                </View>
              );
            })}
          </View>
        )}
      </View>
    </ScrollView>
  );

  let content = null;
  if (tab === "dashboard") content = renderDashboard();
 else if (tab === "invoices")
  content = <InvoicesListScreen refreshKey={refreshKey} />;


  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <BlurView
        intensity={darkMode ? 15 : 30}
        tint={theme.blurTint}
        style={StyleSheet.absoluteFill}
      />

      <View style={styles.headerWrap}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Invoices
        </Text>
      </View>

      <View style={styles.segmentWrap}>
        <View
          style={[
            styles.segmentBackground,
            {
              backgroundColor: isLight
                ? "rgba(118,118,128,0.12)"
                : "rgba(99,99,102,0.5)",
            },
          ]}
        >
          {renderSegmentButton("dashboard", "Dashboard")}
          {renderSegmentButton("clients", "Clients")}
          {renderSegmentButton("invoices", "Invoices")}
          {renderSegmentButton("builder", "Builder")}
        </View>
      </View>

      <View style={styles.content}>{content}</View>
    </SafeAreaView>
  );
}

/* ---------- STYLES (UNCHANGED) ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerWrap: {
    paddingTop: Platform.OS === "ios" ? 8 : 20,
    paddingHorizontal: 22,
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "800",
    letterSpacing: -0.5,
    marginBottom: 10,
  },
  segmentWrap: { paddingHorizontal: 22, marginBottom: 8 },
  segmentBackground: { flexDirection: "row", borderRadius: 12, padding: 3 },
  segmentItem: {
    flex: 1,
    borderRadius: 10,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentLabel: { fontSize: 13, fontWeight: "600" },
  content: { flex: 1, paddingHorizontal: 22, paddingTop: 8 },
  card: {
    borderRadius: 18,
    padding: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    marginBottom: 22,
  },
  cardSubtitle: { fontSize: 14, marginBottom: 4 },
  mainAmount: { fontSize: 34, fontWeight: "800" },
  chipsRow: { flexDirection: "row", marginTop: 14, gap: 8 },
  chip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: "rgba(142,142,147,0.12)",
  },
  chipLabel: { fontSize: 12, color: "#6E6E73", fontWeight: "500" },
  quickRow: { flexDirection: "row", justifyContent: "space-between" },
  quickCard: {
    width: "48%",
    borderRadius: 18,
    paddingVertical: 16,
    paddingHorizontal: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 10,
  },
  quickTitle: { marginTop: 12, fontSize: 15, fontWeight: "700" },
  quickSubtitle: { marginTop: 2, fontSize: 13 },
  sectionTitle: { fontSize: 18, fontWeight: "700", marginBottom: 10 },
  emptyText: { fontSize: 15 },
  listCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  invoiceRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  invoiceId: { fontSize: 15, fontWeight: "600" },
  invoiceClient: { fontSize: 13, marginTop: 2 },
  invoiceTotal: { fontSize: 15, fontWeight: "700" },
  invoiceStatus: { fontSize: 13, marginTop: 2 },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(120,120,128,0.25)",
    marginLeft: 4,
  },
});
