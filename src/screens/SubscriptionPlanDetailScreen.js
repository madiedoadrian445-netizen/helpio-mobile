// src/screens/SubscriptionPlanDetailScreen.js
import React, { useMemo, useEffect, useState } from "react";
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
import { useTheme } from "../ThemeContext";
import { api } from "../config/api";

const HELP_BLUE = "#00A6FF";

export default function SubscriptionPlanDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { darkMode, theme } = useTheme();
  const isLight = !darkMode;

  const planId = route?.params?.plan?._id;

  /* ----------------------------------------------------------
     LOCAL STATE
  ---------------------------------------------------------- */
  const [plan, setPlan] = useState(null);
  const [subscribers, setSubscribers] = useState([]);
  const [upcomingCharges, setUpcomingCharges] = useState([]);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  /* ----------------------------------------------------------
     FORMATTERS
  ---------------------------------------------------------- */
  const formatCurrency = (n, currency = "USD") =>
    (isNaN(Number(n)) ? 0 : Number(n)).toLocaleString("en-US", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    });

  const formatDate = (d) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      });
    } catch {
      return d;
    }
  };

  /* ----------------------------------------------------------
     FETCH PLAN DETAILS FROM BACKEND
  ---------------------------------------------------------- */
  const fetchDetails = async () => {
    try {
      setLoading(true);

      const res = await api.get(`/api/subscription-plans/${planId}/details`);

      const data = res.data;

      setPlan(data.plan);
      setSubscribers(data.subscribers || []);
      setUpcomingCharges(data.upcomingCharges || []);
      setActivity(data.activity || []);
    } catch (err) {
      console.log("❌ Error fetching plan details:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [planId]);

  /* ----------------------------------------------------------
     STATS DERIVED ON FRONTEND
  ---------------------------------------------------------- */
  const stats = useMemo(() => {
    if (!plan) return { active: 0, paused: 0, pastDue: 0, canceled: 0, total: 0 };

    const active = plan.activeCount || 0;
    const paused = plan.pausedCount || 0;
    const pastDue = plan.pastDueCount || 0;
    const canceled = plan.canceledCount || 0;

    return {
      active,
      paused,
      pastDue,
      canceled,
      total: active + paused + pastDue + canceled,
    };
  }, [plan]);

  /* ----------------------------------------------------------
     LOADING STATE
  ---------------------------------------------------------- */
  if (loading || !plan) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={HELP_BLUE} />
      </View>
    );
  }

  /* ----------------------------------------------------------
     UI BELOW (KEPT 100% EXACTLY AS YOUR VERSION)
  ---------------------------------------------------------- */
  return (
    <View style={styles.container}>
      {/* Background */}
      <LinearGradient
        colors={isLight ? ["#e7f4ff", "#f7fbff"] : ["#050608", "#050814"]}
        style={StyleSheet.absoluteFill}
      />
      <BlurView
        intensity={isLight ? 15 : 25}
        tint={isLight ? "light" : "dark"}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 5 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <BlurView tint={isLight ? "light" : "dark"} intensity={40} style={styles.backBlur}>
            <Ionicons name="chevron-back" size={22} color={isLight ? "#0a0a0a" : "#f5f5f5"} />
          </BlurView>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]} numberOfLines={1}>
            {plan.name}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.subtleText }]}>
            Helpio Pay • Subscription Plan
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerAction}
          onPress={() => navigation.navigate("CreateSubscriptionPlan", { plan })}
        >
          <BlurView intensity={40} tint={isLight ? "light" : "dark"} style={styles.headerActionBlur}>
            <Ionicons name="create-outline" size={18} color={isLight ? "#111827" : "#f9fafb"} />
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* CONTENT */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 120,
        }}
      >
        {/* OVERVIEW CARD */}
        <BlurView intensity={55} tint={isLight ? "light" : "dark"} style={styles.overviewCard}>
          <View style={styles.overviewLeft}>
            <Text style={[styles.overviewLabel, { color: theme.subtleText }]}>HELPIO PAY</Text>
            <Text style={[styles.overviewTitle, { color: theme.text }]}>Recurring Revenue</Text>

            <Text style={[styles.overviewAmount, { color: isLight ? "#020617" : "#f9fafb" }]}>
              {formatCurrency(plan.mrr)}
            </Text>

            <View style={styles.overviewPillRow}>
              <View style={styles.overviewPill}>
                <View style={styles.pillDot} />
                <Text style={[styles.overviewPillText, { color: theme.subtleText }]}>
                  {stats.active} active subscriptions
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.overviewRight}>
            <Text style={[styles.overviewSub, { color: theme.subtleText }]}>Updated in real-time</Text>

            <View style={styles.intervalPill}>
              <Ionicons name="repeat-outline" size={14} color={isLight ? "#0f172a" : "#e5e7eb"} />
              <Text style={[styles.intervalText, { color: theme.text }]}>
                {plan.interval || "Monthly"}
              </Text>
            </View>
          </View>
        </BlurView>

        {/* METRICS */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 8, marginBottom: 8 }]}>
          Plan performance
        </Text>

        <View style={styles.metricsRow}>
          <MetricChip label="Active" value={stats.active} accent={HELP_BLUE} isLight={isLight} />
          <MetricChip label="Paused" value={stats.paused} accent="#a855f7" isLight={isLight} />
          <MetricChip label="Past due" value={stats.pastDue} accent="#f97316" isLight={isLight} />
          <MetricChip label="Canceled" value={stats.canceled} accent="#ef4444" isLight={isLight} />
        </View>

        {/* TREND CARD (unchanged) */}
        <BlurView intensity={55} tint={isLight ? "light" : "dark"} style={styles.trendCard}>
          <View style={styles.trendHeader}>
            <View>
              <Text style={[styles.trendLabel, { color: theme.subtleText }]}>
                Monthly recurring revenue
              </Text>
              <Text style={[styles.trendValue, { color: theme.text }]}>
                {formatCurrency(plan.mrr)}
              </Text>
            </View>

            <View style={styles.trendChangePill}>
              <Ionicons name="trending-up-outline" size={14} color={HELP_BLUE} />
              <Text style={[styles.trendChangeText, { color: HELP_BLUE }]}>+12.4%</Text>
            </View>
          </View>

          <View style={styles.sparklineRow}>
            {[22, 40, 32, 55, 48, 70, 64, 90].map((h, idx) => (
              <View
                key={`bar-${idx}`}
                style={[styles.sparkBar, { height: 12 + h * 0.7, opacity: idx === 7 ? 1 : 0.7 }]}
              />
            ))}
          </View>

          <Text style={[styles.trendFootnote, { color: theme.subtleText }]}>Last 8 billing cycles</Text>
        </BlurView>

        {/* UPCOMING RENEWALS */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 18 }]}>
          Upcoming renewals
        </Text>

        <BlurView intensity={55} tint={isLight ? "light" : "dark"} style={styles.cardBlock}>
          {upcomingCharges.map((item, index) => (
            <View
              key={item.id}
              style={[styles.rowBetween, index !== upcomingCharges.length - 1 && styles.rowDivider]}
            >
              <View>
                <Text style={[styles.rowTitle, { color: theme.text }]}>{item.date}</Text>
                <Text style={[styles.rowSubtitle, { color: theme.subtleText }]}>
                  {item.count} subscriptions
                </Text>
              </View>

              <Text style={[styles.rowAmount, { color: theme.text }]}>
                {formatCurrency(item.total)}
              </Text>
            </View>
          ))}
        </BlurView>

        {/* SUBSCRIBERS */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 18 }]}>
          Subscribers
        </Text>

        <BlurView intensity={55} tint={isLight ? "light" : "dark"} style={styles.cardBlock}>
          {subscribers.map((s, index) => {
            const initials = (s.name || "?")
              .split(" ")
              .map((n) => n[0])
              .join("")
              .slice(0, 2)
              .toUpperCase();

            return (
              <TouchableOpacity
                key={s.id}
                activeOpacity={0.9}
                style={[styles.subRow, index !== subscribers.length - 1 && styles.rowDivider]}
              >
                <View style={styles.subLeft}>
                  <View
                    style={[
                      styles.avatar,
                      { backgroundColor: isLight ? "rgba(0,166,255,0.12)" : "rgba(37,99,235,0.25)" },
                    ]}
                  >
                    <Text style={[styles.avatarText, { color: theme.text }]}>{initials}</Text>
                  </View>

                  <View>
                    <Text style={[styles.rowTitle, { color: theme.text }]}>{s.name}</Text>
                    <View style={styles.subMetaRow}>
                      <StatusPill status={s.status} />
                      <Text style={[styles.subMetaText, { color: theme.subtleText }]}>
                        Next: {formatDate(s.nextBilling)}
                      </Text>
                    </View>
                  </View>
                </View>

                <Text style={[styles.rowAmount, { color: theme.text }]}>
                  {formatCurrency(s.amount)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </BlurView>

        {/* SETTINGS */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 18 }]}>
          Plan settings
        </Text>

        <BlurView intensity={55} tint={isLight ? "light" : "dark"} style={styles.cardBlock}>
          <SettingRow label="Billing frequency" value={plan.interval} icon="calendar-outline" theme={theme} />
          <SettingRow
            label="Auto-billing"
            value={plan.autoBilling ? "Enabled" : "Disabled"}
            icon="repeat-outline"
            theme={theme}
          />
          <SettingRow
            label="Free trial"
            value={plan.trial ? `${plan.trial.length} ${plan.trial.unit}` : "None"}
            icon="gift-outline"
            theme={theme}
          />
          <SettingRow
            label="Minimum commitment"
            value={plan.minCycles ? `${plan.minCycles} billing cycles` : "None"}
            icon="lock-closed-outline"
            theme={theme}
          />
          <SettingRow
            label="Charge reminder"
            value={plan.reminderDays ? `${plan.reminderDays} days before` : "Off"}
            icon="notifications-outline"
            theme={theme}
          />
        </BlurView>

        {/* ACTIVITY */}
        <Text style={[styles.sectionTitle, { color: theme.text, marginTop: 18 }]}>
          Recent activity
        </Text>

        <BlurView intensity={55} tint={isLight ? "light" : "dark"} style={styles.cardBlock}>
          {activity.map((item, index) => (
            <View key={item.id} style={[styles.activityRow, index !== activity.length - 1 && styles.rowDivider]}>
              <View style={styles.activityIconWrap}>
                <Ionicons
                  name={
                    item.type === "new"
                      ? "add-circle-outline"
                      : item.type === "canceled"
                      ? "close-circle-outline"
                      : "information-circle-outline"
                  }
                  size={18}
                  color={HELP_BLUE}
                />
              </View>

              <View style={{ flex: 1 }}>
                <Text style={[styles.rowTitle, { color: theme.text }]}>{item.label}</Text>
                <Text style={[styles.rowSubtitle, { color: theme.subtleText }]} numberOfLines={2}>
                  {item.detail}
                </Text>
              </View>

              <Text style={[styles.activityTime, { color: theme.subtleText }]}>
                {formatDate(item.time)}
              </Text>
            </View>
          ))}
        </BlurView>
      </ScrollView>

      {/* BOTTOM ACTION BAR */}
      <View style={[styles.bottomBarWrap, { paddingBottom: 0 }]}>
        <BlurView
          intensity={40}
          tint={isLight ? "light" : "dark"}
          style={[styles.bottomBarBlur, { paddingBottom: insets.bottom + 8 }]}
        >
          <TouchableOpacity style={styles.secondaryButton}>
            <Text style={[styles.secondaryText, { color: theme.subtleText }]}>View all invoices</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.primaryButton}>
            <LinearGradient colors={["#00A6FF", "#007AFF"]} style={styles.primaryGradient}>
              <Ionicons name="add" size={18} color="#fff" />
              <Text style={styles.primaryText}>New Subscription</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

/* ----------------------------------------------
   UI COMPONENTS (UNMODIFIED)
---------------------------------------------- */
const MetricChip = ({ label, value, accent, isLight }) => (
  <View
    style={[
      styles.metricChip,
      { backgroundColor: isLight ? "rgba(255,255,255,0.9)" : "rgba(15,23,42,0.95)" },
    ]}
  >
    <Text style={styles.metricValue}>{value}</Text>
    <View style={styles.metricLabelRow}>
      <View style={[styles.metricDot, { backgroundColor: accent || HELP_BLUE }]} />
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  </View>
);

const StatusPill = ({ status }) => {
  let label = "Active";
  let bg = "rgba(22,163,74,0.12)";
  let color = "#16a34a";

  if (status === "paused") {
    label = "Paused";
    bg = "rgba(234,179,8,0.12)";
    color = "#ca8a04";
  } else if (status === "past_due") {
    label = "Past due";
    bg = "rgba(249,115,22,0.12)";
    color = "#ea580c";
  } else if (status === "canceled") {
    label = "Canceled";
    bg = "rgba(239,68,68,0.12)";
    color = "#ef4444";
  }

  return (
    <View style={[styles.statusPill, { backgroundColor: bg }]}>
      <Text style={[styles.statusText, { color }]}>{label}</Text>
    </View>
  );
};

const SettingRow = ({ label, value, icon, theme }) => (
  <View style={[styles.rowBetween, styles.rowDivider]}>
    <View style={styles.settingLeft}>
      <View style={styles.settingIconWrap}>
        <Ionicons name={icon} size={16} color={HELP_BLUE} />
      </View>
      <Text style={[styles.rowTitle, { color: theme.text }]}>{label}</Text>
    </View>
    <Text style={[styles.settingValue, { color: theme.subtleText }]} numberOfLines={1}>
      {value}
    </Text>
  </View>
);

/* ----------------------------------------------
   STYLES (UNCHANGED)
---------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 8,
  },
  backButton: { width: 40, height: 40 },
  backBlur: {
    flex: 1,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 19, fontWeight: "700" },
  headerSubtitle: { fontSize: 12, fontWeight: "500", marginTop: 2 },
  headerAction: { width: 40, height: 40 },
  headerActionBlur: {
    flex: 1,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  overviewCard: {
    borderRadius: 26,
    padding: 18,
    borderWidth: 0.4,
    borderColor: "rgba(0,0,0,0.06)",
    flexDirection: "row",
    alignItems: "center",
    marginTop: 0,
  },
  overviewLeft: { flex: 1.2 },
  overviewRight: { flex: 1, alignItems: "flex-end" },
  overviewLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.5 },
  overviewTitle: { fontSize: 14, fontWeight: "600" },
  overviewAmount: { fontSize: 30, fontWeight: "800", marginTop: 8 },
  overviewPillRow: { flexDirection: "row", marginTop: 10 },
  overviewPill: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  pillDot: { width: 6, height: 6, borderRadius: 3, backgroundColor: HELP_BLUE, marginRight: 6 },
  overviewPillText: { fontSize: 12, fontWeight: "500" },

  overviewSub: { fontSize: 11, fontWeight: "500" },
  intervalPill: {
    marginTop: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(15,23,42,0.06)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  intervalText: { fontSize: 12, fontWeight: "600" },

  sectionTitle: { fontSize: 15, fontWeight: "700" },

  metricsRow: { flexDirection: "row", justifyContent: "space-between", gap: 8 },
  metricChip: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 18,
    borderWidth: 0.4,
    borderColor: "rgba(148,163,184,0.35)",
  },
  metricValue: { fontSize: 16, fontWeight: "700", marginBottom: 4, color: "#0f172a" },
  metricLabelRow: { flexDirection: "row", alignItems: "center" },
  metricDot: { width: 6, height: 6, borderRadius: 3, marginRight: 4 },
  metricLabel: { fontSize: 11, fontWeight: "600", color: "#6b7280" },

  trendCard: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 0.4,
    borderColor: "rgba(0,0,0,0.06)",
    marginTop: 10,
  },
  trendHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  trendLabel: { fontSize: 13, fontWeight: "500" },
  trendValue: { fontSize: 22, fontWeight: "800", marginTop: 4 },
  trendChangePill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
    backgroundColor: "rgba(34,197,94,0.08)",
  },
  trendChangeText: { fontSize: 12, fontWeight: "700", marginLeft: 4 },
  sparklineRow: { flexDirection: "row", alignItems: "flex-end", marginTop: 12, gap: 4 },
  sparkBar: { flex: 1, borderRadius: 999, backgroundColor: "rgba(37,99,235,0.7)" },
  trendFootnote: { marginTop: 8, fontSize: 11, fontWeight: "500" },

  cardBlock: {
    borderRadius: 22,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 0.4,
    borderColor: "rgba(0,0,0,0.06)",
  },
  rowBetween: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  rowDivider: { borderBottomWidth: 0.4, borderBottomColor: "rgba(148,163,184,0.35)" },
  rowTitle: { fontSize: 14, fontWeight: "600" },
  rowSubtitle: { fontSize: 12, marginTop: 2 },
  rowAmount: { fontSize: 15, fontWeight: "700" },

  subRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  subLeft: { flexDirection: "row", alignItems: "center", flex: 1, gap: 10 },
  avatar: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 14, fontWeight: "700" },
  subMetaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 2 },
  subMetaText: { fontSize: 11 },

  statusPill: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 999 },
  statusText: { fontSize: 10, fontWeight: "700" },

  settingLeft: { flexDirection: "row", alignItems: "center", gap: 8 },
  settingIconWrap: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,166,255,0.12)",
  },
  settingValue: { fontSize: 12, fontWeight: "500", maxWidth: 160, textAlign: "right" },

  activityRow: { flexDirection: "row", alignItems: "center", paddingVertical: 10 },
  activityIconWrap: { width: 30, alignItems: "center" },
  activityTime: { fontSize: 11, marginLeft: 8 },

  bottomBarWrap: { position: "absolute", left: 0, right: 0, bottom: 0 },
  bottomBarBlur: {
    borderRadius: 26,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  secondaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  secondaryText: { fontSize: 14, fontWeight: "600" },

  primaryButton: { flex: 1.6, height: 44, borderRadius: 20, overflow: "hidden" },
  primaryGradient: {
    flex: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "700", marginLeft: 6 },
});
