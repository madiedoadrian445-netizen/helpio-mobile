// src/screens/AlertsRemindersScreen.js
import React, { useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient"; 
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { useEffect } from "react";
import useAuthStore from "../store/auth";
import { useCallback } from "react";


const HELP_BLUE = "#00A6FF";




const formatCurrency = (value) => {
  const num = Number(value);

  if (value === null || value === undefined || isNaN(num)) {
    return "$0.00";
  }

  // 🔥 Normalize cents → dollars automatically
  const normalized = num > 10000 ? num / 100 : num;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(normalized);
};




const getStyleForCategory = (category) => {
  switch (category) {
    case "payment":
      return {
        barColor: "#22c55e",
        iconBg: "rgba(34,197,94,0.12)",
        iconColor: "#16a34a",
        pillBg: "rgba(34,197,94,0.12)",
        pillColor: "#16a34a",
      };

    case "invoice":
      return {
        barColor: "#3b82f6",
        iconBg: "rgba(59,130,246,0.12)",
        iconColor: "#2563eb",
        pillBg: "rgba(59,130,246,0.12)",
        pillColor: "#2563eb",
      };

    case "payout":
      return {
        barColor: "#ef4444",
        iconBg: "rgba(239,68,68,0.12)",
        iconColor: "#dc2626",
        pillBg: "rgba(239,68,68,0.12)",
        pillColor: "#dc2626",
      };

    case "client":
      return {
        barColor: "#8b5cf6",
        iconBg: "rgba(139,92,246,0.12)",
        iconColor: "#7c3aed",
        pillBg: "rgba(139,92,246,0.12)",
        pillColor: "#7c3aed",
      };

    default:
      return {
        barColor: HELP_BLUE,
        iconBg: "rgba(0,166,255,0.12)",
        iconColor: "#0284c7",
        pillBg: "rgba(0,166,255,0.12)",
        pillColor: "#0284c7",
      };
  }
};


const API_BASE_URL = "https://helpio-backend.onrender.com";

const FILTERS = [
  { key: "all", label: "All" },
  { key: "payment", label: "Payments" },
  { key: "invoice", label: "Invoices" },
  { key: "payout", label: "Payouts" },
  { key: "client", label: "Clients" },
];

export default function AlertsRemindersScreen({ navigation }) {
  const token = useAuthStore((state) => state.token);
const isHydrated = useAuthStore((state) => state.isHydrated);
  
  const { darkMode, theme } = useTheme();


  const isLight = !darkMode;
  const insets = useSafeAreaInsets();
const [alerts, setAlerts] = useState([]);


  const [activeFilter, setActiveFilter] = useState("all");


const allowedCategories = ["payment", "invoice", "payout", "client"];

const filteredAlerts = useMemo(() => {
  let base = alerts.filter((a) =>
    allowedCategories.includes(a.category)
  );

  if (activeFilter === "all") return base;

  return base.filter((a) => a.category === activeFilter);
}, [alerts, activeFilter]);





 const fetchAlerts = useCallback(async () => {
  try {
    const res = await fetch(`${API_BASE_URL}/api/activity`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    setAlerts(Array.isArray(data.activity) ? data.activity : []);
  } catch (err) {
    console.log("Failed to fetch alerts", err);
  }
}, [token]);



useEffect(() => {
  if (!isHydrated || !token) return;

  fetchAlerts();
}, [isHydrated, token, fetchAlerts]);



useEffect(() => {
  if (!isHydrated || !token) return;

  const interval = setInterval(fetchAlerts, 15000);

  return () => clearInterval(interval);
}, [isHydrated, token, fetchAlerts]);


const paymentsCount = alerts.filter(
  (a) => a.category === "payment"
).length;

const invoicesCount = alerts.filter(
  (a) => a.category === "invoice"
).length;

const payoutsCount = alerts.filter(
  (a) => a.category === "payout"
).length;

const clientsCount = alerts.filter(
  (a) => a.category === "client"
).length;


  const handleAlertPress = (alert) => {
  if (alert.category === "invoice") {
    navigation.navigate("MainTabs", {
      screen: "Invoices",
    });
    return;
  }

  if (alert.category === "payment" || alert.category === "payout") {
    // future: Helpio Pay
    return;
  }
};



  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Frosted background */}
      <LinearGradient
        colors={
          isLight ? ["#f3f6ff", "#f9fbff"] : ["#020617", "#020617", "#020617"]
        }
        style={StyleSheet.absoluteFill}
      />
      <BlurView
        intensity={isLight ? 18 : 26}
        tint={isLight ? "light" : "dark"}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View
        style={[
          styles.headerWrap,
          { paddingTop: insets.top - 8 },
        ]}
      >
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.85}
          style={styles.headerLeft}
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

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
           BusinessPlace Activity
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: theme.subtleText }]}
            numberOfLines={1}
          >
    Payments • Invoices • Payouts • Clients
          </Text>
        </View>

        <View style={styles.headerRight}>
          <BlurView
            intensity={40}
            tint={isLight ? "light" : "dark"}
            style={styles.settingsBlur}
          >
            <Ionicons
              name="options-outline"
              size={18}
              color={isLight ? "#111827" : "#f9fafb"}
            />
          </BlurView>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 18,
          paddingBottom: insets.bottom + 24,
        }}
      >
        {/* Summary card */}
        <View
          style={[
            styles.summaryCard,
            {
              backgroundColor: isLight ? "#ffffff" : "rgba(15,23,42,0.98)",
              shadowOpacity: isLight ? 0.14 : 0,
            },
          ]}
        >
          <View style={styles.summaryTopRow}>
            <View>
              <Text style={[styles.summaryLabel, { color: theme.subtleText }]}>
               Total Activity
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {alerts.length}
              </Text>
            </View>

         <View style={styles.summaryBadges}>
  <View style={styles.summaryBadge}>
    <View style={[styles.badgeDot, { backgroundColor: "#f97316" }]} />
    <Text style={styles.summaryBadgeText}>
      Payments: {paymentsCount}
    </Text>
  </View>

  <View style={styles.summaryBadge}>
    <View style={[styles.badgeDot, { backgroundColor: "#22c55e" }]} />
    <Text style={styles.summaryBadgeText}>
      Payouts: {payoutsCount}
    </Text>
  </View>

  <View style={styles.summaryBadge}>
    <View style={[styles.badgeDot, { backgroundColor: "#6366f1" }]} />
    <Text style={styles.summaryBadgeText}>
      Clients: {clientsCount}
    </Text>
  </View>
</View>


          </View>

       






          
        </View>

        {/* Filter pills */}
        <View style={styles.filterRow}>
          {FILTERS.map((f) => {
            const active = f.key === activeFilter;
            return (
              <TouchableOpacity
                key={f.key}
                activeOpacity={0.85}
                onPress={() => setActiveFilter(f.key)}
                style={[
                  styles.filterPill,
                  active && {
                    backgroundColor: isLight ? "#ffffff" : "rgba(15,23,42,0.98)",
                    shadowOpacity: isLight ? 0.14 : 0,
                  },
                ]}
              >
                <Text
                  style={[
                    styles.filterLabel,
                    {
                      color: active
                        ? isLight
                          ? "#111827"
                          : "#f9fafb"
                        : isLight
                        ? "#6b7280"
                        : "#9ca3af",
                    },
                  ]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Alerts list */}
        <View
          style={[
            styles.listCard,
            {
              backgroundColor: isLight ? "#ffffff" : "rgba(15,23,42,0.98)",
              shadowOpacity: isLight ? 0.12 : 0,
            },
          ]}
        >
       {filteredAlerts.length === 0 ? (
  <View style={{ paddingVertical: 40, alignItems: "center" }}>
    <Ionicons
      name="notifications-off-outline"
      size={40}
      color={theme.subtleText}
    />
    <Text style={{ marginTop: 10, color: theme.subtleText }}>
      No activity yet
    </Text>
  </View>
) : (
  filteredAlerts.map((alert, idx) => {

            const isLast = idx === filteredAlerts.length - 1;
        
        const severityStyle = getStyleForCategory(alert.category);


            const categoryLabel = getCategoryLabel(alert.category);
            const iconName = getIconForAlert(alert);

            return (
              <View key={alert.id}>
                <TouchableOpacity
                  style={styles.alertRow}
                  activeOpacity={0.85}
                  onPress={() => handleAlertPress(alert)}
                >
                  {/* Left accent bar */}
                  <View
                    style={[
                      styles.severityBar,
                      { backgroundColor: severityStyle.barColor },
                    ]}
                  />

                  {/* Icon */}
                  <View
                    style={[
                      styles.alertIconWrap,
                      { backgroundColor: severityStyle.iconBg },
                    ]}
                  >
                    <Ionicons
                      name={iconName}
                      size={18}
                      color={severityStyle.iconColor}
                    />
                  </View>

                  {/* Text */}
                  <View style={styles.alertTextWrap}>
                    <Text
                      style={[
                        styles.alertTitle,
                        { color: theme.text },
                      ]}
                      numberOfLines={1}
                    >
                      {alert.title}
                    </Text>
               
               
             <Text
  style={[
    styles.alertMessage,
    { color: theme.subtleText },
  ]}
  numberOfLines={2}
>


  
{alert.category === "payment" ? (
  <>
    Transaction{" "}
    <Text style={{ fontWeight: "700", color: theme.text }}>
      • {formatCurrency(alert.amount)}
    </Text>
  </>
) : (
  alert.message
)}



</Text>


                    <View style={styles.alertMetaRow}>
                      <Text
                        style={[
                          styles.alertTime,
                          { color: theme.subtleText },
                        ]}
                      >
                        {alert.time}
                      </Text>

                      <View
                        style={[
                          styles.categoryPill,
                          { backgroundColor: severityStyle.pillBg },
                        ]}
                      >
                        <Text
                          style={[
                            styles.categoryPillText,
                            { color: severityStyle.pillColor },
                          ]}
                        >
                          {categoryLabel}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
                {!isLast && <View style={styles.rowDivider} />}
              </View>
            );
        }))
}


        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Helpers ---------- */


const getCategoryLabel = (category) => {
  switch (category) {


    case "payment":
      return "Payment";

      
    case "invoice":
      return "Invoice";


    case "payout":
      return "Payout";


    case "client":
      return "Client";


    default:
      return "Other";
  }
};

const getIconForAlert = (alert) => {
 switch (alert.category) {
  case "payment":
    return "card-outline";
  case "invoice":
    return "document-text-outline";
  case "payout":
    return "cash-outline";
  case "client":
    return "person-outline";
  default:
    return "information-circle-outline";
}

};

/* ---------- Styles ---------- */

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  headerWrap: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingBottom: 6,
  },
  headerLeft: {
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
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "800",
    letterSpacing: 0.1,
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2,
    fontWeight: "500",
  },
  headerRight: {
    width: 40,
    height: 40,
    alignItems: "flex-end",
  },
  settingsBlur: {
    flex: 1,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  summaryCard: {
    borderRadius: 18,
    padding: 16,
    marginTop: 10,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  summaryTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: "800",
    marginTop: 4,
  },
  summaryBadges: {
    alignItems: "flex-end",
    gap: 4,
  },
  summaryBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.02)",
  },
  badgeDot: {
    width: 6,
    height: 6,
    borderRadius: 999,
    marginRight: 6,
  },
  summaryBadgeText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#6b7280",
  },
  summaryGrid: {
    flexDirection: "row",
    marginTop: 12,
  },
  summaryGridItem: {
    flex: 1,
  },
  summaryGridLabel: {
    fontSize: 11,
  },
  summaryGridValue: {
    fontSize: 15,
    fontWeight: "700",
    marginTop: 4,
  },

  filterRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  filterPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    marginRight: 8,
    backgroundColor: "rgba(148,163,184,0.15)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
  },

  listCard: {
    borderRadius: 18,
    paddingHorizontal: 10,
    paddingVertical: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  alertRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 10,
  },
  severityBar: {
    width: 3,
    borderRadius: 999,
    marginRight: 8,
    marginTop: 4,
  },
  alertIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  alertTextWrap: {
    flex: 1,
  },
  alertTitle: {
    fontSize: 14,
    fontWeight: "700",
  },
  alertMessage: {
    fontSize: 12,
    marginTop: 2,
  },
  alertMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
    justifyContent: "space-between",
  },
  alertTime: {
    fontSize: 11,
  },
  categoryPill: {
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  categoryPillText: {
    fontSize: 11,
    fontWeight: "600",
  },
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(148,163,184,0.35)",
    marginLeft: 41,
  },

  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 8,
  },
  kpiTile: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    marginHorizontal: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  kpiLabel: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },

  actionsCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    marginTop: 14,
  },
  rowItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,166,255,0.12)",
    marginRight: 10,
  },
  rowLabel: {
    flex: 1,
    fontSize: 15,
    fontWeight: "500",
    color: "#111827",
  },
  rowDividerActions: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(148,163,184,0.45)",
    marginLeft: 36,
  },
});
