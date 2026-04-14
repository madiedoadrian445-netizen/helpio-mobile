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
  ActivityIndicator,
  Alert,
 RefreshControl,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import { useRoute, useFocusEffect } from "@react-navigation/native";
import { api } from "../config/api";
import InvoicesListScreen from "./InvoicesListScreen";
import { Swipeable } from "react-native-gesture-handler";
import useAuthStore from "../store/auth";
import { Animated } from "react-native";
import { useRef } from "react";





export default function InvoicesHomeScreen({ navigation }) {


const [analyticsError, setAnalyticsError] = useState(false);
const [recentInvoicesError, setRecentInvoicesError] = useState(false);
const [refreshing, setRefreshing] = useState(false);
const [deletingInvoiceId, setDeletingInvoiceId] = useState(null);




const [analytics, setAnalytics] = useState({
  totalLast30Days: 0,
  totalInvoices: 0,
  totalTransactions: 0,
  totalClients: 0,
  totalRevenueAllTime: 0,
});


const [loadingAnalytics, setLoadingAnalytics] = useState(true);


  const { darkMode, theme } = useTheme();
  const route = useRoute();

  const refreshKey = route.params?.refreshInvoices;
  const initialTab = route.params?.returnToTab || "dashboard";
  const [tab, setTab] = useState(initialTab);
const user = useAuthStore((state) => state.user);
const isHydrated = useAuthStore((state) => state.isHydrated);
const token = useAuthStore((state) => state.token);
const providerId = user?.providerId;
const analyticsCache = useAuthStore((state) => state.analyticsCache);
const setAnalyticsCache = useAuthStore((state) => state.setAnalyticsCache);

const safeStat = (value, fallback) => {
  return value > 0 ? value : fallback || 0;
};

  const [previewUnlocked, setPreviewUnlocked] = useState(false);

const isRealProvider = !!user?.providerId;


  const [recentInvoices, setRecentInvoices] = useState([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
const [lastUpdated, setLastUpdated] = useState(Date.now());



  const isLight = !darkMode;
const canvasColor = isLight ? "#EEF1F6" : "#0B0D12";


const payoutAnim = useRef(new Animated.Value(1)).current;
const dashboardAnim = useRef(new Animated.Value(1)).current;
const invoiceAnim = useRef(new Animated.Value(1)).current;
const clientAnim = useRef(new Animated.Value(1)).current;





const loadDashboardData = useCallback(async () => {
  if (!isHydrated || !token || !isRealProvider) {
    setLoadingAnalytics(false);
    setLoadingRecent(false);
    return;
  }

  try {
    setLoadingAnalytics(true);
    setLoadingRecent(true);
    setAnalyticsError(false);
    setRecentInvoicesError(false);

    const [analyticsRes, invoicesRes] = await Promise.all([
      api.get("/api/analytics").catch(() => null),
      api
        .get("/api/invoices/provider/me?limit=5&sort=-createdAt")
        .catch(() => null),
    ]);

    // ✅ Analytics
    if (analyticsRes?.data?.success) {
      const data = analyticsRes.data.analytics || {};

      setAnalytics({
        totalLast30Days: Number(data.totalLast30Days) || 0,
        totalInvoices: Number(data.totalInvoices) || 0,
        totalTransactions: Number(data.totalTransactions) || 0,
        totalClients: Number(data.totalClients) || 0,
        totalRevenueAllTime: Number(data.totalRevenueAllTime) || 0,
      });

      setAnalyticsCache((prev) => ({
        ...prev,
        revenueAllTime:
          Number(data.totalRevenueAllTime) > 0
            ? Number(data.totalRevenueAllTime)
            : prev.revenueAllTime,
        revenue30Days:
          Number(data.totalLast30Days) > 0
            ? Number(data.totalLast30Days)
            : prev.revenue30Days,
        totalInvoices:
          Number(data.totalInvoices) > 0
            ? Number(data.totalInvoices)
            : prev.totalInvoices,
        totalTransactions:
          Number(data.totalTransactions) > 0
            ? Number(data.totalTransactions)
            : prev.totalTransactions,
        totalClients:
          Number(data.totalClients) > 0
            ? Number(data.totalClients)
            : prev.totalClients,
        updatedAt: Date.now(),
      }));
    } else {
      setAnalyticsError(true);
    }

    // ✅ Recent invoices
    if (invoicesRes?.data?.success) {
      setRecentInvoices(invoicesRes.data.invoices || []);
    } else {
      setRecentInvoicesError(true);
    }

    setLastUpdated(Date.now());
  } catch (err) {
    console.log("Dashboard load error:", err);
    setAnalyticsError(true);
    setRecentInvoicesError(true);
  } finally {
    setLoadingAnalytics(false);
    setLoadingRecent(false);
    setRefreshing(false);
  }
}, [isHydrated, token, isRealProvider, setAnalyticsCache]);


useEffect(() => {
  if (!isHydrated || !token || !isRealProvider) return;
  loadDashboardData();
}, [isHydrated, token, isRealProvider, loadDashboardData]);



useFocusEffect(
  useCallback(() => {
    if (!isHydrated || !token || !isRealProvider) return;
    loadDashboardData();
  }, [isHydrated, token, isRealProvider, loadDashboardData])
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


const deleteInvoice = async (invoiceId) => {
  if (deletingInvoiceId) return;

  if (!isRealProvider) {
    navigation.navigate("BusinessPlaceProducts");
    return;
  }

  const previousInvoices = recentInvoices;

  try {
    setDeletingInvoiceId(invoiceId);

    // optimistic UI
    setRecentInvoices((prev) =>
      prev.filter((inv) => inv._id !== invoiceId)
    );

    await api.delete(`/api/invoices/${invoiceId}`);

    Alert.alert("Deleted", "Invoice deleted successfully.");
  } catch (err) {
    // rollback if failed
    setRecentInvoices(previousInvoices);

    console.log("Delete invoice error:", err.response?.data || err);

    Alert.alert(
      "Delete failed",
      "We could not delete this invoice. Please try again."
    );
  } finally {
    setDeletingInvoiceId(null);
  }
};

const confirmDelete = (invoiceId) => {
  Alert.alert(
    "Delete Invoice",
    "Are you sure you want to delete this invoice?",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: () => deleteInvoice(invoiceId),
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
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={loadDashboardData} />
  }
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
          All-Time Revenue
        </Text>

       <Text style={[styles.mainAmount, { color: theme.text }]}>

{`$${Number(
analytics.totalRevenueAllTime > 0
  ? analytics.totalRevenueAllTime
  : analyticsCache.revenueAllTime || 0
).toLocaleString("en-US")}`}
</Text>

        <Text style={[styles.cardSubtitle, { color: theme.subtleText }]}>
          Total revenue
        </Text>

<View style={styles.chipsRow}>
  <View style={styles.chip}>
    <Text style={styles.chipLabel}>
      {(
safeStat(analytics.totalInvoices, analyticsCache.totalInvoices)
      ).toLocaleString()} Invoices
    </Text>
  </View>

  <View style={styles.chip}>
    <Text style={styles.chipLabel}>
      {(
safeStat(analytics.totalTransactions, analyticsCache.totalTransactions)
      ).toLocaleString()} Transactions
    </Text>
  </View>

  <View style={styles.chip}>
    <Text style={styles.chipLabel}>
      {(
safeStat(analytics.totalClients, analyticsCache.totalClients)
      ).toLocaleString()} Clients
    </Text>
  </View>
</View>

      </View>

      {/* Quick Actions */}
      <View style={styles.quickRow}>
      <Animated.View
  style={[
    styles.quickCard,
    {
      transform: [{ scale: invoiceAnim }],
      backgroundColor: isLight
        ? "rgba(255,255,255,0.9)"
        : "rgba(28,28,30,0.9)",
      shadowOpacity: isLight ? 0.1 : 0,
    },
  ]}
>
  <TouchableOpacity
    activeOpacity={1}
    style={{ flex: 1 }}
    onPressIn={() => {
      Animated.timing(invoiceAnim, {
        toValue: 0.97,
        duration: 60,
        useNativeDriver: true,
      }).start();
    }}
    onPressOut={() => {
      Animated.spring(invoiceAnim, {
        toValue: 1,
        tension: 220,
        friction: 18,
        useNativeDriver: true,
      }).start();
    }}
    onPress={() => {
    if (!isRealProvider) {
  navigation.navigate("BusinessPlaceProducts");
  return;
}


      navigation.push("InvoiceBuilderScreen");
    }}
  >
    <Animated.View
      style={[
        styles.quickContent,
        {
          opacity: invoiceAnim.interpolate({
            inputRange: [0.985, 1],
            outputRange: [0.96, 1],
          }),
        },
      ]}
    >
      <Ionicons name="document-text-outline" size={26} color="#007AFF" />
      <Text style={[styles.quickTitle, { color: theme.text }]}>
        New Invoice
      </Text>
      <Text style={[styles.quickSubtitle, { color: theme.subtleText }]}>
        Create and send
      </Text>
    </Animated.View>
  </TouchableOpacity>
</Animated.View>

       <Animated.View
  style={[
    styles.quickCard,
    {
      transform: [{ scale: clientAnim }],
      backgroundColor: isLight
        ? "rgba(255,255,255,0.9)"
        : "rgba(28,28,30,0.9)",
      shadowOpacity: isLight ? 0.1 : 0,
    },
  ]}
>
  <TouchableOpacity
    activeOpacity={1}
    style={{ flex: 1 }}
    onPressIn={() => {
      Animated.timing(clientAnim, {
        toValue: 0.97,
        duration: 60,
        useNativeDriver: true,
      }).start();
    }}
    onPressOut={() => {
      Animated.spring(clientAnim, {
        toValue: 1,
        tension: 220,
        friction: 18,
        useNativeDriver: true,
      }).start();
    }}
    onPress={() => {
    if (!isRealProvider) {
        navigation.navigate("BusinessPlaceProducts");
        return;
      }

      navigation.navigate("ClientsScreen", { returnToTab: "clients" });
    }}
  >
    <Animated.View
      style={[
        styles.quickContent,
        {
          opacity: clientAnim.interpolate({
            inputRange: [0.985, 1],
            outputRange: [0.96, 1],
          }),
        },
      ]}
    >
      <Ionicons name="person-add-outline" size={26} color="#34C759" />
      <Text style={[styles.quickTitle, { color: theme.text }]}>
        CRM / Add Client
      </Text>
      <Text style={[styles.quickSubtitle, { color: theme.subtleText }]}>
        Save details
      </Text>
    </Animated.View>
  </TouchableOpacity>
</Animated.View>


      </View>

     {/* Subscriptions + Dashboard Row */}
<View style={[styles.quickRow, { marginTop: 16 }]}>
  
 {/* Payouts & Balances */}




<Animated.View
  style={[
    styles.quickCard,
    styles.quickCardLarge,
    {
      transform: [{ scale: payoutAnim }],
      backgroundColor: isLight
        ? "rgba(255,255,255,0.9)"
        : "rgba(28,28,30,0.9)",
      shadowOpacity: isLight ? 0.1 : 0,
    },
  ]}
>
<TouchableOpacity
  activeOpacity={1}
  style={{ flex: 1 }}
 onPressIn={() => {
  Animated.timing(payoutAnim, {
    toValue: 0.96,
    duration: 60, // ⚡ instant but smooth
    useNativeDriver: true,
  }).start();
}}

  onPressOut={() => {
    Animated.spring(payoutAnim, {
      toValue: 1,
      tension: 220,
      friction: 18,
      useNativeDriver: true,
    }).start();
  }}
onPress={() => {
  if (!isRealProvider) {
  navigation.navigate("BusinessPlaceProducts");
  return;
}


  navigation.navigate("PayoutsBalancesScreen", {
    providerId,
  });
}}
>

  
    <Animated.View
      style={[
        styles.quickContent, // ✅ KEEP YOUR ORIGINAL LAYOUT
        {
          opacity: payoutAnim.interpolate({
            inputRange: [0.985, 1],
            outputRange: [0.96, 1],
          }),
        },
      ]}
    >
      <Ionicons name="wallet-outline" size={24} color="#007AFF" />
      <Text style={[styles.quickTitle, { color: theme.text }]}>
        Payouts & Balances
      </Text>
      <Text style={[styles.quickSubtitle, { color: theme.subtleText }]}>
        Transfers & earnings
      </Text>
    </Animated.View>
  </TouchableOpacity>
</Animated.View>


  {/* Dashboard */}
<Animated.View
  style={[
    styles.quickCard,
    styles.quickCardLarge,
    {
      transform: [{ scale: dashboardAnim }],
      backgroundColor: isLight
        ? "rgba(255,255,255,0.9)"
        : "rgba(28,28,30,0.9)",
      shadowOpacity: isLight ? 0.1 : 0,
    },
  ]}
>
  <TouchableOpacity
    activeOpacity={1}
    style={{ flex: 1 }}
    onPressIn={() => {
      Animated.timing(dashboardAnim, {
        toValue: 0.97, // 👈 same premium feel
        duration: 60,
        useNativeDriver: true,
      }).start();
    }}
    onPressOut={() => {
      Animated.spring(dashboardAnim, {
        toValue: 1,
        tension: 220,
        friction: 18,
        useNativeDriver: true,
      }).start();
    }}
    onPress={() => navigation.navigate("AnalyticsDashboard")}
  >
    <Animated.View
      style={[
        styles.quickContent,
        {
          opacity: dashboardAnim.interpolate({
            inputRange: [0.985, 1],
            outputRange: [0.96, 1],
          }),
        },
      ]}
    >
      <Ionicons name="stats-chart-outline" size={24} color="#007AFF" />
      <Text style={[styles.quickTitle, { color: theme.text }]}>
        Dashboard
      </Text>
      <Text style={[styles.quickSubtitle, { color: theme.subtleText }]}>
        Performance & revenue
      </Text>
    </Animated.View>
  </TouchableOpacity>
</Animated.View>

</View>

      {/* Recent Invoices */}
      <View style={{ marginTop: 15 }}>
      
      
      <View style={styles.dividerWrap}>
  <View style={styles.line} />
  <Text style={[styles.dividerText, { color: theme.subtleText }]}>
    RECENT INVOICES
  </Text>
  <View style={styles.line} />
</View>



    {loadingRecent ? (
  <ActivityIndicator style={{ marginTop: 16 }} />

) : recentInvoicesError ? (
  <View style={styles.emptyWrap}>
    <Ionicons name="alert-circle-outline" size={26} color="rgba(60,60,67,0.5)" />

    <Text style={[styles.emptyTitle, { color: theme.text }]}>
      Couldn’t load invoices
    </Text>

    <Text style={[styles.emptySubtitle, { color: theme.subtleText }]}>
      Please try again
    </Text>

    <TouchableOpacity
      onPress={loadDashboardData}
      style={{ marginTop: 12 }}
    >
      <Text style={{ color: "#007AFF", fontWeight: "600" }}>
        Retry
      </Text>
    </TouchableOpacity>
  </View>

) : !recentInvoices.length ? (
  <View style={styles.emptyWrap}>
    <Ionicons name="document-text-outline" size={26} color="rgba(60,60,67,0.35)" />

    <Text style={[styles.emptyTitle, { color: theme.text }]}>
      No invoices yet
    </Text>

    <Text style={[styles.emptySubtitle, { color: theme.subtleText }]}>
      Invoices you create will appear here
    </Text>
  </View>



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


<View style={{ flex: 1 }}>

  {/* ACTUAL CONTENT */}
 <View style={!isRealProvider && !previewUnlocked ? styles.blurredContent : null}>
    {content}
  </View>

  {/* 🔒 BLUR OVERLAY FOR CUSTOMERS */}
{!isRealProvider && !previewUnlocked && (
  <View style={styles.lockOverlay}>
    <BlurView intensity={15} tint="light" style={StyleSheet.absoluteFill} />
    <View style={styles.frostLayer} />

    {/* CENTERED LABEL */}
    <View style={styles.centerWrap}>
      <TouchableOpacity
        activeOpacity={0.85}
      
      
        onPress={() => {
  setPreviewUnlocked(true);
}}



        style={styles.providerHint}
      >
        <BlurView intensity={30} tint="light" style={styles.hintBlur}>
          <Ionicons name="eye-outline" size={18} color="#007AFF" />
          <Text style={styles.hintText}>
            Tap to view as a Provider
          </Text>
        </BlurView>
      </TouchableOpacity>
    </View>
  </View>
)}

</View>


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







emptyWrap: {
  alignItems: "center",
  marginTop: 20,
},

emptyTitle: {
  marginTop: 10,
  fontSize: 15,
  fontWeight: "600",
},

emptySubtitle: {
  marginTop: 4,
  fontSize: 13,
  textAlign: "center",
},




dividerWrap: {
  flexDirection: "row",
  alignItems: "center",
  marginBottom: 12,
  marginTop: 32,
  gap: 10,
},

line: {
  flex: 1,
  height: 1,
  backgroundColor: "rgba(120,120,128,0.25)",
},

dividerText: {
  fontSize: 12,
  fontWeight: "600",
  letterSpacing: 1,
},







blurredContent: {
  opacity: 0.7,
  transform: [{ scale: 0.98 }],
},

lockOverlay: {
  ...StyleSheet.absoluteFillObject,
},

frostLayer: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: 'rgba(255,255,255,0.25)',
},









centerWrap: {
  ...StyleSheet.absoluteFillObject,
  justifyContent: "center",
  alignItems: "center",
  paddingBottom: 120, // 👈 THIS moves it UP
},


providerHint: {
  borderRadius: 24,
  overflow: "hidden",
},

hintBlur: {
  flexDirection: "row",
  alignItems: "center",
  paddingVertical: 12,
  paddingHorizontal: 18,
  borderRadius: 24,
  gap: 8,

  // subtle iOS glass edge
  borderWidth: 0.5,
  borderColor: "rgba(255,255,255,0.5)",
},

hintText: {
  fontSize: 14,
  fontWeight: "600",
  color: "#007AFF",
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

