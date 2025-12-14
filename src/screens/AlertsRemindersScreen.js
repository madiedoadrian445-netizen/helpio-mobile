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

const HELP_BLUE = "#00A6FF";

const MOCK_ALERTS = [
  // 🔴 CRITICAL / URGENT
  {
    id: "a1",
    title: "Payment failed",
    message: "Invoice #1024 for Miami Jetski Shop could not be charged.",
    time: "Just now",
    category: "payment",
    severity: "critical",
    type: "invoice_payment_failed",
  },
  {
    id: "a2",
    title: "Subscription payment failed",
    message: "Bi-Weekly Wash & Wax for John Martinez is past due.",
    time: "12 min ago",
    category: "subscription",
    severity: "critical",
    type: "subscription_failed",
  },
  {
    id: "a3",
    title: "Chargeback opened",
    message: "Client disputed a $380 payment. Respond by Dec 12.",
    time: "1h ago",
    category: "chargeback",
    severity: "critical",
    type: "chargeback_opened",
  },

  // 🟡 WARNING / ACTION NEEDED
  {
    id: "a4",
    title: "Invoice overdue",
    message: "Invoice #1017 for AFM Showroom is 7 days overdue.",
    time: "3h ago",
    category: "invoice",
    severity: "warning",
    type: "invoice_overdue",
  },
  {
    id: "a5",
    title: "Card expiring soon",
    message: "Saved card for Redline Underground Cars expires this month.",
    time: "Today",
    category: "payment",
    severity: "warning",
    type: "card_expiring",
  },
  {
    id: "a6",
    title: "Upcoming subscription renewal",
    message: "3 subscriptions renew tomorrow. Review upcoming charges.",
    time: "Today",
    category: "subscription",
    severity: "warning",
    type: "upcoming_subscription",
  },

  // 🟢 POSITIVE / SUCCESS
  {
    id: "a7",
    title: "Payout sent",
    message: "Helpio Pay deposited $4,320.45 to your bank account.",
    time: "Yesterday",
    category: "payout",
    severity: "success",
    type: "payout_sent",
  },
  {
    id: "a8",
    title: "Invoice paid",
    message: "Invoice #1031 for Veloz Contractors was paid in full.",
    time: "Yesterday",
    category: "invoice",
    severity: "success",
    type: "invoice_paid",
  },
  {
    id: "a9",
    title: "New subscription started",
    message: "Monthly Detailing for AFM Showroom is now active.",
    time: "Yesterday",
    category: "subscription",
    severity: "success",
    type: "subscription_new",
  },

  // 🔵 INFO / SYSTEM
  {
    id: "a10",
    title: "Reminder sent to client",
    message: "Invoice #1030 reminder was emailed to Donna Jones.",
    time: "2 days ago",
    category: "invoice",
    severity: "info",
    type: "invoice_reminder_sent",
  },
  {
    id: "a11",
    title: "New client added",
    message: "You added Miami Jetski Shop to your client list.",
    time: "2 days ago",
    category: "client",
    severity: "info",
    type: "client_added",
  },
  {
    id: "a12",
    title: "Tax estimate updated",
    message: "Your estimated tax summary has been updated.",
    time: "3 days ago",
    category: "system",
    severity: "info",
    type: "tax_update",
  },
];

const FILTERS = [
  { key: "all", label: "All" },
  { key: "payment", label: "Payments" },
  { key: "subscription", label: "Subscriptions" },
  { key: "invoice", label: "Invoices" },
  { key: "payout", label: "Payouts" },
];

export default function AlertsRemindersScreen({ navigation }) {
  const { darkMode, theme } = useTheme();
  const isLight = !darkMode;
  const insets = useSafeAreaInsets();

  const [activeFilter, setActiveFilter] = useState("all");

  const filteredAlerts = useMemo(() => {
    if (activeFilter === "all") return MOCK_ALERTS;
    return MOCK_ALERTS.filter((a) => a.category === activeFilter);
  }, [activeFilter]);

  const pendingCount = useMemo(
    () =>
      MOCK_ALERTS.filter((a) =>
        ["critical", "warning"].includes(a.severity)
      ).length,
    []
  );
  const successCount = useMemo(
    () => MOCK_ALERTS.filter((a) => a.severity === "success").length,
    []
  );

  const handleAlertPress = (alert) => {
    // 🔗 You can customize these later to deep-link into detail screens
    if (alert.category === "subscription") {
      navigation.navigate("SubscriptionPlans");
      return;
    }
    if (alert.category === "invoice") {
      // Example: open your invoices dashboard
    navigation.navigate("MainTabs", {
  screen: "Invoices",
});

 // change if your route name is different
      return;
    }
    if (alert.category === "payment" || alert.category === "payout") {
      // Example: open Helpio Pay / payments area later
      // navigation.navigate("HelpioPayScreen");
      return;
    }
    // For now, no-op for others
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
          { paddingTop: insets.top + (Platform.OS === "ios" ? 2 : 10) },
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
            Alerts & Reminders
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: theme.subtleText }]}
            numberOfLines={1}
          >
            Payments • Subscriptions • Invoices • Payouts
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
                Pending actions
              </Text>
              <Text style={[styles.summaryValue, { color: theme.text }]}>
                {pendingCount}
              </Text>
            </View>

            <View style={styles.summaryBadges}>
              <View style={styles.summaryBadge}>
                <View style={[styles.badgeDot, { backgroundColor: "#f97316" }]} />
                <Text style={styles.summaryBadgeText}>Due soon</Text>
              </View>
              <View style={styles.summaryBadge}>
                <View style={[styles.badgeDot, { backgroundColor: "#22c55e" }]} />
                <Text style={styles.summaryBadgeText}>
                  {successCount} successful
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.summaryGrid}>
            <View style={styles.summaryGridItem}>
              <Text
                style={[styles.summaryGridLabel, { color: theme.subtleText }]}
              >
                Overdue invoices
              </Text>
              <Text
                style={[styles.summaryGridValue, { color: "#f97316" }]}
              >
                2
              </Text>
            </View>
            <View style={styles.summaryGridItem}>
              <Text
                style={[styles.summaryGridLabel, { color: theme.subtleText }]}
              >
                Failed payments
              </Text>
              <Text style={[styles.summaryGridValue, { color: "#ef4444" }]}>
                1
              </Text>
            </View>
            <View style={styles.summaryGridItem}>
              <Text
                style={[styles.summaryGridLabel, { color: theme.subtleText }]}
              >
                Renewals tomorrow
              </Text>
              <Text style={[styles.summaryGridValue, { color: HELP_BLUE }]}>
                3
              </Text>
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
          {filteredAlerts.map((alert, idx) => {
            const isLast = idx === filteredAlerts.length - 1;
            const severityStyle = getSeverityStyle(alert.severity);
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
                      {alert.message}
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
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Helpers ---------- */

const getSeverityStyle = (severity) => {
  switch (severity) {
    case "critical":
      return {
        barColor: "#ef4444",
        iconBg: "rgba(248,113,113,0.12)",
        iconColor: "#dc2626",
        pillBg: "rgba(248,113,113,0.12)",
        pillColor: "#b91c1c",
      };
    case "warning":
      return {
        barColor: "#f97316",
        iconBg: "rgba(251,146,60,0.12)",
        iconColor: "#ea580c",
        pillBg: "rgba(251,146,60,0.12)",
        pillColor: "#c2410c",
      };
    case "success":
      return {
        barColor: "#22c55e",
        iconBg: "rgba(34,197,94,0.12)",
        iconColor: "#15803d",
        pillBg: "rgba(34,197,94,0.12)",
        pillColor: "#15803d",
      };
    case "info":
    default:
      return {
        barColor: HELP_BLUE,
        iconBg: "rgba(59,130,246,0.12)",
        iconColor: "#1d4ed8",
        pillBg: "rgba(59,130,246,0.12)",
        pillColor: "#1d4ed8",
      };
  }
};

const getCategoryLabel = (category) => {
  switch (category) {
    case "payment":
      return "Payment";
    case "subscription":
      return "Subscription";
    case "invoice":
      return "Invoice";
    case "payout":
      return "Payout";
    case "chargeback":
      return "Chargeback";
    case "client":
      return "Client";
    case "system":
      return "System";
    default:
      return "Other";
  }
};

const getIconForAlert = (alert) => {
  switch (alert.category) {
    case "payment":
      return "card-outline";
    case "subscription":
      return "repeat-outline";
    case "invoice":
      return "document-text-outline";
    case "payout":
      return "cash-outline";
    case "chargeback":
      return "alert-circle-outline";
    case "client":
      return "person-outline";
    case "system":
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
