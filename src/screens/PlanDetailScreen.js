// src/screens/PlanDetailScreen.js
import React, { memo, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";

const HELP_BLUE = "#00A6FF";

/* ----------------- Small Helpers ----------------- */

const currency = (n = 0) =>
  (isNaN(Number(n)) ? 0 : Number(n)).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

const titleCase = (str = "") =>
  str.charAt(0).toUpperCase() + str.slice(1);

/* ----------------- Memoized UI Atoms ----------------- */

const CardBase = ({ children, style, isLight }) => (
  <BlurView
    intensity={55}
    tint={isLight ? "light" : "dark"}
    style={[styles.card, style]}
  >
    {children}
  </BlurView>
);
const Card = memo(CardBase);

const PillBase = ({ icon, label, theme, isLight }) => (
  <View
    style={[
      styles.pill,
      {
        backgroundColor: isLight
          ? "rgba(0,0,0,0.04)"
          : "rgba(255,255,255,0.08)",
      },
    ]}
  >
    {icon}
    <Text style={[styles.pillText, { color: theme.subtleText }]}>{label}</Text>
  </View>
);
const Pill = memo(PillBase);

const SectionLabelBase = ({ title, subtitle, theme }) => (
  <View style={styles.sectionLabelWrap}>
    <Text style={[styles.sectionLabelText, { color: theme.subtleText }]}>
      {title}
    </Text>
    {subtitle ? (
      <Text style={[styles.sectionSubtitleText, { color: theme.subtleText }]}>
        {subtitle}
      </Text>
    ) : null}
  </View>
);
const SectionLabel = memo(SectionLabelBase);

const SettingRowBase = ({ label, value, theme }) => (
  <View style={styles.settingRow}>
    <Text style={[styles.settingLabel, { color: theme.subtleText }]}>
      {label}
    </Text>
    <Text style={[styles.settingValue, { color: theme.text }]}>{value}</Text>
  </View>
);
const SettingRow = memo(SettingRowBase);

/* ----------------- Main Screen ----------------- */

export default function PlanDetailScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { darkMode, theme } = useTheme();
  const isLight = !darkMode;

  // Fallback example plan if none passed
  const plan = route?.params?.plan || {
    id: "demo",
    name: "Bi-Weekly Wash & Wax",
    billingFrequency: "bi-weekly",
    price: 80,
    currency: "USD",
    autoBilling: true,
    activeSubscribers: 12,
    mrr: 2300,
    arr: 27600,
    trial: { length: 7, unit: "days" },
    minCycles: 3,
    maxCycles: null,
    reminders: { daysBefore: 3 },
    allowPause: true,
    prorateChanges: true,
    updatedAt: "Updated in real-time",
  };

  // Example subscribers (in real app you’d pass from backend / route)
  const subscribers = route?.params?.subscribers || [
    {
      id: "1",
      name: "John Martinez",
      status: "active",
      nextCharge: "Jun 21",
      cyclesCompleted: 2,
      totalBilled: 160,
    },
    {
      id: "2",
      name: "Redline Underground Cars",
      status: "active",
      nextCharge: "Jun 19",
      cyclesCompleted: 5,
      totalBilled: 400,
    },
    {
      id: "3",
      name: "Veloz Contractors",
      status: "paused",
      nextCharge: "Paused",
      cyclesCompleted: 3,
      totalBilled: 240,
    },
    {
      id: "4",
      name: "Miami Jetski Shop",
      status: "canceled",
      nextCharge: "Canceled",
      cyclesCompleted: 1,
      totalBilled: 80,
    },
  ];

  const activeCount = useMemo(
    () => subscribers.filter((s) => s.status === "active").length,
    [subscribers]
  );

  const onEditPlan = () => {
    navigation.navigate("CreateSubscriptionPlan", { plan });
  };

  const onPausePlan = () => {
    // For now just console.log; you’ll wire actual logic later
    console.log("Pause plan:", plan.id);
  };

  const onMoreActions = () => {
    console.log("Open more actions (duplicate / archive) for:", plan.id);
  };

  const renderSubscriber = ({ item }) => {
    const badgeColor =
      item.status === "active"
        ? "#34C759"
        : item.status === "paused"
        ? "#FFCC00"
        : "#FF3B30";

    const badgeText =
      item.status === "active"
        ? "Active"
        : item.status === "paused"
        ? "Paused"
        : "Canceled";

    return (
      <TouchableOpacity
        activeOpacity={0.85}
        style={styles.subscriberRow}
        onPress={() =>
          navigation.navigate("SubscriptionDetail", {
            subscription: item,
            plan,
          })
        }
      >
        <View style={{ flex: 1 }}>
          <Text style={[styles.subscriberName, { color: theme.text }]}>
            {item.name}
          </Text>
          <View style={styles.subMetaRow}>
            <View style={[styles.statusBadge, { backgroundColor: badgeColor }]}>
              <Text style={styles.statusBadgeText}>{badgeText}</Text>
            </View>
            <Text style={[styles.subMetaText, { color: theme.subtleText }]}>
              Next charge: {item.nextCharge}
            </Text>
          </View>
        </View>

        <View style={{ alignItems: "flex-end" }}>
          <Text style={[styles.subAmount, { color: theme.text }]}>
            {currency(item.totalBilled)}
          </Text>
          <Text style={[styles.subMetaText, { color: theme.subtleText }]}>
            {item.cyclesCompleted} cycles
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={18}
          color={theme.subtleText}
          style={{ marginLeft: 6 }}
        />
      </TouchableOpacity>
    );
  };

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
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <BlurView
            tint={isLight ? "light" : "dark"}
            intensity={40}
            style={styles.backBlur}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={isLight ? "#0a0a0a" : "#f5f5f5"}
            />
          </BlurView>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text
            style={[styles.headerTitle, { color: theme.text }]}
            numberOfLines={1}
          >
            Subscription Plan
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: theme.subtleText }]}
            numberOfLines={1}
          >
            Helpio Pay • {titleCase(plan.billingFrequency || "Recurring")}
          </Text>
        </View>

        <TouchableOpacity
          onPress={onMoreActions}
          style={{ width: 40, alignItems: "flex-end" }}
        >
          <BlurView
            tint={isLight ? "light" : "dark"}
            intensity={40}
            style={styles.moreBlur}
          >
            <Ionicons
              name="ellipsis-horizontal"
              size={18}
              color={isLight ? "#0a0a0a" : "#f5f5f5"}
            />
          </BlurView>
        </TouchableOpacity>
      </View>

      {/* Content */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 120,
        }}
      >
        {/* Summary / Revenue card */}
        <Card isLight={isLight} style={{ marginTop: 4, padding: 18 }}>
          <View style={styles.summaryTopRow}>
            <View
              style={[
                styles.planAvatar,
                {
                  backgroundColor: isLight
                    ? "rgba(0,166,255,0.12)"
                    : "rgba(0,166,255,0.35)",
                },
              ]}
            >
              <Text style={styles.planAvatarText}>
                {plan.name?.charAt(0) || "P"}
              </Text>
            </View>

            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text
                style={[styles.planName, { color: theme.text }]}
                numberOfLines={1}
              >
                {plan.name}
              </Text>
              <Text
                style={[styles.planSubLabel, { color: theme.subtleText }]}
                numberOfLines={1}
              >
                {titleCase(plan.billingFrequency || "Recurring")} •{" "}
                {currency(plan.price)} per cycle
              </Text>
            </View>

            {plan.autoBilling && (
              <Pill
                theme={theme}
                isLight={isLight}
                label="Auto-billing"
                icon={
                  <Ionicons
                    name="repeat-outline"
                    size={14}
                    color={theme.subtleText}
                    style={{ marginRight: 4 }}
                  />
                }
              />
            )}
          </View>

          <View style={styles.summaryMetricRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.metricLabel, { color: theme.subtleText }]}
              >
                MRR from this plan
              </Text>
              <Text
                style={[styles.metricValue, { color: theme.text }]}
              >
                {currency(plan.mrr || activeCount * plan.price)}
              </Text>
              <Text
                style={[
                  styles.metricCaption,
                  { color: theme.subtleText },
                ]}
              >
                {activeCount} active subscriptions
              </Text>
            </View>

            <View style={styles.metricRight}>
              <Text
                style={[styles.metricLabel, { color: theme.subtleText }]}
              >
                ARR (estimate)
              </Text>
              <Text
                style={[styles.metricValueSmall, { color: theme.text }]}
              >
                {currency(plan.arr || (plan.mrr || 0) * 12)}
              </Text>
              <Text
                style={[
                  styles.updatedText,
                  { color: theme.subtleText },
                ]}
              >
                {plan.updatedAt || "Updated in real-time"}
              </Text>
            </View>
          </View>

          {/* Simple tiny line graph placeholder */}
          <View style={styles.chartContainer}>
            <View
              style={[
                styles.chartGradient,
                {
                  backgroundColor: isLight
                    ? "rgba(0,166,255,0.12)"
                    : "rgba(0,166,255,0.35)",
                },
              ]}
            />
            <View style={styles.chartLine} />
            <View style={styles.chartDot} />
          </View>

          <View style={styles.chartRangeRow}>
            <Text
              style={[
                styles.chartRangeLabelActive,
                { color: HELP_BLUE },
              ]}
            >
              Last 30 days
            </Text>
            <Text
              style={[
                styles.chartRangeLabel,
                { color: theme.subtleText },
              ]}
            >
              •
            </Text>
            <Text
              style={[
                styles.chartRangeLabel,
                { color: theme.subtleText },
              ]}
            >
              12 months
            </Text>
          </View>
        </Card>

        {/* Revenue Insights (quick stats) */}
        <SectionLabel
          title="Revenue insights"
          subtitle="Understand how this plan is performing."
          theme={theme}
        />
        <Card isLight={isLight}>
          <View style={styles.insightRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.insightLabel, { color: theme.subtleText }]}
              >
                Avg. revenue per subscriber
              </Text>
              <Text
                style={[styles.insightValue, { color: theme.text }]}
              >
                {currency(plan.price)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.insightLabel, { color: theme.subtleText }]}
              >
                Upcoming charges (7 days)
              </Text>
              <Text
                style={[styles.insightValue, { color: theme.text }]}
              >
                {currency(activeCount * plan.price)}
              </Text>
            </View>
          </View>

          <View style={styles.insightRow}>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.insightLabel, { color: theme.subtleText }]}
              >
                Est. churn (dummy)
              </Text>
              <Text
                style={[styles.insightValue, { color: theme.text }]}
              >
                2.3%
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={[styles.insightLabel, { color: theme.subtleText }]}
              >
                Failed payments (30 days)
              </Text>
              <Text
                style={[styles.insightValue, { color: theme.text }]}
              >
                1
              </Text>
            </View>
          </View>
        </Card>

        {/* Subscribers */}
        <SectionLabel
          title="Subscribers"
          subtitle="Manage all subscriptions on this plan."
          theme={theme}
        />
        <Card isLight={isLight} style={{ paddingHorizontal: 0, paddingVertical: 0 }}>
          {subscribers.length === 0 ? (
            <View style={{ padding: 16 }}>
              <Text
                style={[styles.emptyText, { color: theme.subtleText }]}
              >
                No subscribers yet. Once clients enroll, they will appear
                here.
              </Text>
            </View>
          ) : (
            <FlatList
              data={subscribers}
              keyExtractor={(item) => item.id}
              renderItem={renderSubscriber}
              ItemSeparatorComponent={() => (
                <View style={styles.subscriberDivider} />
              )}
              scrollEnabled={false}
              contentContainerStyle={{ paddingVertical: 4, paddingHorizontal: 16 }}
            />
          )}
        </Card>

        {/* Plan Settings Summary */}
        <SectionLabel
          title="Plan settings"
          subtitle="A snapshot of how this plan is configured."
          theme={theme}
        />
        <Card isLight={isLight}>
          <SettingRow
            label="Billing frequency"
            value={titleCase(plan.billingFrequency || "Recurring")}
            theme={theme}
          />
          <SettingRow
            label="Price per cycle"
            value={currency(plan.price)}
            theme={theme}
          />
          <SettingRow
            label="Automatic billing"
            value={plan.autoBilling ? "Enabled" : "Disabled"}
            theme={theme}
          />
          <SettingRow
            label="Free trial"
            value={
              plan.trial?.length
                ? `${plan.trial.length} ${plan.trial.unit}`
                : "None"
            }
            theme={theme}
          />
          <SettingRow
            label="Minimum commitment"
            value={
              plan.minCycles ? `${plan.minCycles} cycles` : "No minimum"
            }
            theme={theme}
          />
          <SettingRow
            label="Maximum cycles"
            value={plan.maxCycles ? plan.maxCycles : "No max"}
            theme={theme}
          />
          <SettingRow
            label="Prorate changes"
            value={plan.prorateChanges ? "On" : "Off"}
            theme={theme}
          />
          <SettingRow
            label="Client reminders"
            value={
              plan.reminders?.daysBefore
                ? `${plan.reminders.daysBefore} days before`
                : "Disabled"
            }
            theme={theme}
          />
          <SettingRow
            label="Clients can pause"
            value={plan.allowPause ? "Yes" : "No"}
            theme={theme}
          />
        </Card>
      </ScrollView>

      {/* Bottom action bar */}
      <View style={[styles.bottomBarWrap]}>
        <BlurView
          intensity={40}
          tint={isLight ? "light" : "dark"}
          style={[styles.bottomBarBlur, { paddingBottom: insets.bottom + 10 }]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onPausePlan}
            style={styles.secondaryButton}
          >
            <Text style={[styles.secondaryText, { color: theme.text }]}>
              Pause plan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onEditPlan}
            style={styles.primaryButton}
          >
            <LinearGradient
              colors={["#00A6FF", "#007AFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryGradient}
            >
              <Ionicons name="pencil" size={18} color="#fff" />
              <Text style={styles.primaryText}>Edit Plan</Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

/* ----------------- Styles ----------------- */

const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 6,
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

  moreBlur: {
    width: 32,
    height: 32,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },

  sectionLabelWrap: { marginTop: 18, marginBottom: 6 },
  sectionLabelText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  sectionSubtitleText: { fontSize: 12, marginTop: 2 },

  card: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 0.4,
    borderColor: "rgba(0,0,0,0.06)",
    marginBottom: 12,
    overflow: "hidden",
  },

  pill: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  pillText: { fontSize: 11, fontWeight: "600" },

  summaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 14,
  },
  planAvatar: {
    width: 42,
    height: 42,
    borderRadius: 999,
    alignItems: "center",
    justifyContent: "center",
  },
  planAvatarText: { color: "#fff", fontSize: 20, fontWeight: "700" },
  planName: { fontSize: 17, fontWeight: "700" },
  planSubLabel: { fontSize: 13, marginTop: 2 },

  summaryMetricRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  metricLabel: { fontSize: 11, fontWeight: "600" },
  metricValue: { fontSize: 24, fontWeight: "800", marginTop: 2 },
  metricCaption: { fontSize: 12, marginTop: 2 },
  metricRight: { alignItems: "flex-end" },
  metricValueSmall: { fontSize: 16, fontWeight: "700", marginTop: 2 },
  updatedText: { fontSize: 11, marginTop: 4 },

  chartContainer: {
    marginTop: 6,
    height: 60,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.02)",
    position: "relative",
  },
  chartGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    top: 15,
    opacity: 0.8,
  },
  chartLine: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 22,
    height: 2,
    borderRadius: 999,
    backgroundColor: HELP_BLUE,
    transform: [{ skewX: "-10deg" }],
  },
  chartDot: {
    position: "absolute",
    right: 16,
    bottom: 20,
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#fff",
    borderWidth: 2,
    borderColor: HELP_BLUE,
  },
  chartRangeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  chartRangeLabel: {
    fontSize: 11,
    marginRight: 8,
  },
  chartRangeLabelActive: {
    fontSize: 11,
    fontWeight: "600",
    marginRight: 8,
  },

  insightRow: {
    flexDirection: "row",
    marginBottom: 8,
    gap: 12,
  },
  insightLabel: { fontSize: 12, fontWeight: "600" },
  insightValue: { fontSize: 16, fontWeight: "700", marginTop: 2 },

  emptyText: { fontSize: 13, textAlign: "center" },

  subscriberRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  subscriberDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  subscriberName: { fontSize: 15, fontWeight: "600" },
  subMetaRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  subMetaText: { fontSize: 12, marginLeft: 6 },
  subAmount: { fontSize: 14, fontWeight: "700" },

  statusBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 999,
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#fff",
  },

  settingRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
  settingLabel: { fontSize: 12 },
  settingValue: { fontSize: 13, fontWeight: "600" },

  bottomBarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomBarBlur: {
    borderRadius: 26,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  secondaryButton: {
    flex: 1,
    height: 44,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Platform.OS === "ios" ? "rgba(255,255,255,0.8)" : "#f2f2f7",
  },
  secondaryText: { fontSize: 14, fontWeight: "600" },

  primaryButton: {
    flex: 1.4,
    height: 44,
    borderRadius: 20,
    overflow: "hidden",
  },
  primaryGradient: {
    flex: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primaryText: { color: "#fff", fontSize: 15, fontWeight: "700", marginLeft: 6 },
});
