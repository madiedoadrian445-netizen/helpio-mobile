// src/screens/InvoicesHomeScreen.js
import React, { useState, useCallback, useMemo } from "react";
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
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { api } from "../config/api";
import InvoicesListScreen from "./InvoicesListScreen";
import { Swipeable } from "react-native-gesture-handler";
import useAuthStore from "../store/auth";






export default function InvoicesHomeScreen({ navigation }) {


const [analytics, setAnalytics] = useState({
  totalLast30Days: 0,
});
const [loadingAnalytics, setLoadingAnalytics] = useState(true);


  const { darkMode, theme } = useTheme();
  const route = useRoute();

  const refreshKey = route.params?.refreshInvoices;
  const initialTab = route.params?.returnToTab || "dashboard";
  const [tab, setTab] = useState(initialTab);
const user = useAuthStore((state) => state.user);
const providerId = user?.providerId;
  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
const [allInvoices, setAllInvoices] = useState([]);
  const isLight = !darkMode;
const canvasColor = isLight ? "#EEF1F6" : "#0B0D12";

const invoiceStats = useMemo(() => ({
  sent: allInvoices.filter(i => i.status === "SENT").length,
  paid: allInvoices.filter(i => i.status === "PAID").length,
  overdue: allInvoices.filter(i => i.status === "OVERDUE").length,
}), [allInvoices]);


useFocusEffect(
  useCallback(() => {
    let mounted = true;

    const loadData = async () => {
      try {
        setLoadingAnalytics(true);
        setLoadingRecent(true);

        const [analyticsRes, invoicesRes] = await Promise.all([
          api.get("/api/analytics"),
          api.get("/api/invoices/provider/me"),
        ]);

        // Analytics
        if (mounted && analyticsRes.data?.success) {
          setAnalytics(analyticsRes.data.analytics);
        }

        // Invoices
        if (mounted && invoicesRes.data?.success) {
          const sorted = [...(invoicesRes.data.invoices || [])].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );

          setAllInvoices(sorted);
          setRecentInvoices(sorted.slice(0, 5));
        }
      } catch (err) {
        console.log("❌ Combined fetch error:", err.response?.data || err);
      } finally {
        if (mounted) {
          setLoadingAnalytics(false);
          setLoadingRecent(false);
        }
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, [refreshKey])
);

  /* --------------------------------------------------
     FETCH RECENT INVOICES (LIVE DATA — REFRESH SAFE)
  -------------------------------------------------- */
  
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


const confirmDelete = (invoiceId) => {
  Alert.alert(
    "Delete Invoice",
    "Are you sure you want to delete this invoice?",
    [
      {
        text: "Discard",
        style: "cancel",
      },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/invoices/${invoiceId}`);

            setRecentInvoices((prev) =>
              prev.filter((inv) => inv._id !== invoiceId)
            );

            setAllInvoices((prev) =>
              prev.filter((inv) => inv._id !== invoiceId)
            );
          } catch (err) {
            console.log(
              "Delete invoice error:",
              err.response?.data || err
            );
          }
        },
      },
    ]
  );
};

const renderRightActions = (invoiceId) => (
  <View style={styles.deleteAction}>
    <TouchableOpacity
      onPress={() => confirmDelete(invoiceId)}
      activeOpacity={0.6}
    >
      <Ionicons name="trash-outline" size={22} color="#FF3B30" />
    </TouchableOpacity>
  </View>
);
  const renderDashboard = () => (
   <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 80 }}
>
  {/* THIS is the missing layer */}
  <View style={{ paddingHorizontal: 22 }}>



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

       <Text style={[styles.mainAmount, { color: theme.text }]}>
  {loadingAnalytics
    ? "..."
    : `$${Number(analytics.totalLast30Days).toLocaleString()}`}
</Text>

        <Text style={[styles.cardSubtitle, { color: theme.subtleText }]}>
          Total revenue
        </Text>

       <View style={styles.chipsRow}>
  <View style={styles.chip}>
    <Text style={styles.chipLabel}>
      {invoiceStats.sent} sent
    </Text>
  </View>

  <View style={styles.chip}>
    <Text style={styles.chipLabel}>
      {invoiceStats.paid} paid
    </Text>
  </View>

  <View style={styles.chip}>
    <Text style={styles.chipLabel}>
      {invoiceStats.overdue} overdue
    </Text>
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
  
 {/* Payouts & Balances */}
<TouchableOpacity
  activeOpacity={0.9}
 onPress={() =>
  navigation.navigate("PayoutsBalancesScreen", {
    providerId,
  })
}
  style={[
    styles.quickCard,
    styles.quickCardLarge,
    {
      backgroundColor: isLight
        ? "rgba(255,255,255,0.9)"
        : "rgba(28,28,30,0.9)",
      shadowOpacity: isLight ? 0.1 : 0,
    },
  ]}
>
  <View style={styles.quickContent}>
    <Ionicons name="wallet-outline" size={24} color="#007AFF" />
    <Text style={[styles.quickTitle, { color: theme.text }]}>
      Payouts & Balances
    </Text>
    <Text style={[styles.quickSubtitle, { color: theme.subtleText }]}>
      Transfers & earnings
    </Text>
  </View>
</TouchableOpacity>




  {/* Dashboard */}
  <TouchableOpacity
    activeOpacity={0.9}
    onPress={() => navigation.navigate("AnalyticsDashboard")}
   style={[
  styles.quickCard,
  styles.quickCardLarge, // ⭐ makes them bigger
  {
    backgroundColor: isLight
      ? "rgba(255,255,255,0.9)"
      : "rgba(28,28,30,0.9)",
    shadowOpacity: isLight ? 0.1 : 0,
  },
]}

  >
    <View style={styles.quickContent}>
      <Ionicons name="stats-chart-outline" size={24} color="#007AFF" />
      <Text style={[styles.quickTitle, { color: theme.text }]}>
        Dashboard
      </Text>
      <Text style={[styles.quickSubtitle, { color: theme.subtleText }]}>
        Performance & revenue
      </Text>
    </View>
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
      <Swipeable
        renderRightActions={() => renderRightActions(inv._id)}
        overshootRight={false}
      >
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() =>
            navigation.navigate("InvoicePreview", {
              invoiceId: inv._id,
            })
          }
        >
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
                {inv.customerSnapshot?.name || "Unknown client"}
              </Text>
            </View>

            <View style={{ alignItems: "flex-end" }}>
              <Text style={[styles.invoiceTotal, { color: theme.text }]}>
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
        </TouchableOpacity>
      </Swipeable>

      {!isLast && <View style={styles.divider} />}
    </View>
  );
})}
          </View>
        )}
      </View>
      </View>

    </ScrollView>
  );

  let content = null;
  if (tab === "dashboard") content = renderDashboard();
 else if (tab === "invoices")
  content = <InvoicesListScreen refreshKey={refreshKey} />;





  
    return (
  <SafeAreaView style={[styles.safe, { backgroundColor: canvasColor }]}>

    {/* Ambient depth (makes cards pop + removes boxed look) */}
    <View
      pointerEvents="none"
      style={[
        StyleSheet.absoluteFill,
        {
          backgroundColor: isLight
            ? "rgba(0,0,0,0.045)"
            : "rgba(0,0,0,0.32)",
        },
      ]}
    />

    <BlurView
      intensity={darkMode ? 12 : 22}
      tint={theme.blurTint}
      style={StyleSheet.absoluteFill}
    />

    <View style={styles.headerWrap}>
      <Text style={[styles.headerTitle, { color: "#00A6FF" }]}>
        BusinessPlace
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
  fontSize: 24,        // ↓ from 30
  fontWeight: "800",   // SAME
  letterSpacing: -0.4, // ↓ proportionally from -0.5
  marginBottom: 12,     // ↓ from 10
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
  content: {
  flex: 1,
  paddingTop: 8,
},

quickContent: {
  flex: 1,
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
},
quickCardLarge: {
  height: 140, // ⭐ bigger than top cards
},


deleteAction: {
  width: 70,                // controls distance from row
  justifyContent: "center",
  alignItems: "center",
},


  card: {
    borderRadius: 18,
    padding: 18,
    shadowColor: "#00bfffff",
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
    shadowColor: "#000000ff",
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

