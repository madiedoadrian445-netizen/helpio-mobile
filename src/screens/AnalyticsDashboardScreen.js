// src/screens/AnalyticsDashboardScreen.js
import React, { useEffect, useMemo } from "react";
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
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from "react-native-reanimated";
import { useTheme } from "../ThemeContext";

const HELP_BLUE = "#00A6FF";

// Mock revenue data – last 12 days
const REVENUE_DATA = [
  { label: "Jan 14", value: 5000 },
  { label: "Jan 15", value: 8200 },
  { label: "Jan 16", value: 7400 },
  { label: "Jan 17", value: 9300 },
  { label: "Jan 18", value: 6600 },
  { label: "Jan 19", value: 12000 },
  { label: "Jan 20", value: 10800 },
  { label: "Jan 21", value: 14500 },
  { label: "Jan 22", value: 9800 },
  { label: "Jan 23", value: 13800 },
  { label: "Feb 4", value: 16200 },
  { label: "Feb 11", value: 17500 },
];

export default function AnalyticsDashboardScreen({ navigation }) {
  const { darkMode, theme } = useTheme();
  const isLight = !darkMode;
  const insets = useSafeAreaInsets();

  // Shared animation value for the bars (0 → 1)
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(1, {
      duration: 900,
      easing: Easing.out(Easing.cubic),
    });
  }, [progress]);

  const maxRevenue = useMemo(
    () => Math.max(...REVENUE_DATA.map((d) => d.value)),
    []
  );

  const totalLast30 = useMemo(
    () => REVENUE_DATA.reduce((sum, d) => sum + d.value, 0),
    []
  );

  // Fake growth numbers (for the KPIs on the card)
  const growthVs7 = "+22%";
  const growthVsLastYear = "+92%";

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
        intensity={isLight ? 18 : 25}
        tint={isLight ? "light" : "dark"}
        style={StyleSheet.absoluteFill}
      />

     {/* Header */}
<View
  style={[
    styles.headerWrap,
    {
      paddingTop: insets.top - 15,   // ← must be inside an object
    },
  ]}
>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.headerLeft}
          activeOpacity={0.85}
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
          <Text
            style={[styles.appTitle, { color: HELP_BLUE }]}
            numberOfLines={1}
          >
            Helpio
          </Text>
          <Text
            style={[styles.headerSubtitle, { color: theme.subtleText }]}
            numberOfLines={1}
          >
            BusinessPlace Dashboard
          </Text>
        </View>

        <View style={styles.headerRight}>
          <BlurView
            intensity={40}
            tint={isLight ? "light" : "dark"}
            style={styles.settingsBlur}
          >
            <Ionicons
              name="settings-outline"
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
        {/* KPI tiles */}
        <View style={styles.kpiRow}>
          <MiniKpiTile
            label="Sales so far today"
            value="$110,771"
            accent={HELP_BLUE}
            isLight={isLight}
          />
          <MiniKpiTile
            label="Invoices today"
            value="12"
            accent="#34C759"
            isLight={isLight}
          />
          <MiniKpiTile
            label="Subscriptions"
            value="18"
            accent="#22C55Eff"
            isLight={isLight}
          />
        </View>

        {/* Service Sales card with bar chart */}
        <View
          style={[
            styles.salesCard,
            {
              backgroundColor: isLight ? "#ffffff" : "rgba(15,23,42,0.98)",
              shadowOpacity: isLight ? 0.12 : 0,
            },
          ]}
        >
          {/* Title row */}
          <View style={styles.salesHeaderRow}>
            <Text style={[styles.salesTitle, { color: theme.text }]}>
              Total Sales
            </Text>
          </View>

          {/* KPI row inside card */}
          <View style={styles.salesKpiRow}>
            <View style={{ flex: 1.1 }}>
              <Text style={[styles.salesAmount, { color: theme.text }]}>
                $703.3K
              </Text>
              <Text
                style={[styles.salesSubLabel, { color: theme.subtleText }]}
              >
                Last 30 days
              </Text>
            </View>

            <View style={styles.salesKpiCol}>
              <Text style={[styles.salesKpiValue, { color: "#22C55E" }]}>
                {growthVs7}
              </Text>
              <Text
                style={[
                  styles.salesSubLabel,
                  { color: theme.subtleText, textAlign: "right" },
                ]}
              >
                Previous 30 days
              </Text>
            </View>

            <View style={styles.salesKpiCol}>
              <Text style={[styles.salesKpiValue, { color: "#22C55E" }]}>
                {growthVsLastYear}
              </Text>
              <Text
                style={[
                  styles.salesSubLabel,
                  { color: theme.subtleText, textAlign: "right" },
                ]}
              >
                Last year
              </Text>
            </View>
          </View>

          {/* Animated bar chart (unchanged) */}
          <View style={styles.chartContainer}>
            <View style={styles.yAxisLabels}>
              <Text style={[styles.axisLabel, { color: theme.subtleText }]}>
                $20k
              </Text>
              <Text style={[styles.axisLabel, { color: theme.subtleText }]}>
                $15k
              </Text>
              <Text style={[styles.axisLabel, { color: theme.subtleText }]}>
                $10k
              </Text>
              <Text style={[styles.axisLabel, { color: theme.subtleText }]}>
                $5k
              </Text>
              <Text style={[styles.axisLabel, { color: theme.subtleText }]}>
                0
              </Text>
            </View>

            <View style={styles.chartArea}>
              <View style={styles.chartGuides}>
                {[0, 0.25, 0.5, 0.75, 1].map((g) => (
                  <View
                    key={g}
                    style={[
                      styles.chartGuideLine,
                      {
                        top: `${g * 100}%`,
                        opacity: g === 1 ? 1 : 0.35,
                      },
                    ]}
                  />
                ))}
              </View>

              <View style={styles.barsRow}>
                {REVENUE_DATA.map((d, index) => {
                  const normalized = d.value / maxRevenue;
                  const targetHeight = 140 * normalized;

                  const animatedStyle = useAnimatedStyle(
                    () => ({
                      height: targetHeight * progress.value,
                      opacity: 0.2 + 0.8 * progress.value,
                    }),
                    [targetHeight]
                  );

                  return (
                    <View key={d.label + index} style={styles.barWrapper}>
                      <Animated.View
                        style={[
                          styles.bar,
                          animatedStyle,
                          {
                            backgroundColor: isLight
                              ? HELP_BLUE
                              : "rgba(56,189,248,0.95)",
                          },
                        ]}
                      />
                    </View>
                  );
                })}
              </View>

              <View style={styles.xAxisLabelsRow}>
                <Text
                  style={[styles.xAxisLabel, { color: theme.subtleText }]}
                >
                  Jan 14
                </Text>
                <Text
                  style={[styles.xAxisLabel, { color: theme.subtleText }]}
                >
                  Jan 21
                </Text>
                <Text
                  style={[styles.xAxisLabel, { color: theme.subtleText }]}
                >
                  Feb 4
                </Text>
                <Text
                  style={[styles.xAxisLabel, { color: theme.subtleText }]}
                >
                  Feb 11
                </Text>
              </View>
            </View>
          </View>

          <Text style={[styles.updatedText, { color: theme.subtleText }]}>
            Updated 10 minutes ago
          </Text>
        </View>

        {/* Actions list similar to Amazon */}
        <View
          style={[
            styles.actionsCard,
            {
              backgroundColor: isLight ? "#ffffff" : "rgba(15,23,42,0.98)",
              shadowOpacity: isLight ? 0.12 : 0,
            },
          ]}
        >
          <DashboardRow
            icon="add-circle-outline"
            label="Create invoice"
            onPress={() => navigation.navigate("InvoiceBuilderScreen")}
          />
          <DashboardRow
            icon="people-outline"
            label="Manage clients"
            onPress={() => navigation.navigate("ClientsScreen")}
          />
          <DashboardRow
            icon="repeat-outline"
            label="Subscriptions & plans"
            onPress={() => navigation.navigate("SubscriptionPlans")}
          />
          <DashboardRow
            icon="chatbubbles-outline"
            label="Communications"
            onPress={() => navigation.navigate("MessagesScreen")}
          />
          <DashboardRow
  icon="notifications-outline"
  label="Alerts & reminders"
  onPress={() => navigation.navigate("AlertsRemindersScreen")}
/>

        <DashboardRow
  icon="card-outline"
  label="Payouts & balances"
  onPress={() => navigation.navigate("PayoutsBalancesScreen")}
/>

          <DashboardRow
            icon="trending-up-outline"
            label="Boost visibility"
            showDivider={false}
            onPress={() => {}}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Small components ---------- */

const MiniKpiTile = ({ label, value, accent, isLight }) => {
  return (
    <View
      style={[
        styles.kpiTile,
        {
          backgroundColor: isLight ? "#ffffff" : "rgba(15,23,42,0.98)",
          shadowOpacity: isLight ? 0.12 : 0,
        },
      ]}
    >
      <Text style={[styles.kpiValue, { color: accent || HELP_BLUE }]}>
        {value}
      </Text>
      <Text style={styles.kpiLabel}>{label}</Text>
    </View>
  );
};

const DashboardRow = ({ icon, label, onPress, showDivider = true }) => {
  return (
    <>
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        style={styles.rowItem}
      >
        <View style={styles.rowIconWrap}>
          <Ionicons name={icon} size={19} color={HELP_BLUE} />
        </View>
        <Text style={styles.rowLabel}>{label}</Text>
        <Ionicons name="chevron-forward" size={18} color="#C7C7CC" />
      </TouchableOpacity>
      {showDivider && <View style={styles.rowDivider} />}
    </>
  );
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
  appTitle: {
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.4,
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

  kpiRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
    marginBottom: 14,
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

  salesCard: {
    borderRadius: 18,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    marginBottom: 20,
  },
  salesHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  salesTitle: {
    fontSize: 16,
    fontWeight: "700",
  },
  salesKpiRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginTop: 6,
  },
  salesAmount: {
    fontSize: 26,
    fontWeight: "800",
  },
  salesSubLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  salesKpiCol: {
    flex: 1,
    alignItems: "flex-end",
  },
  salesKpiValue: {
    fontSize: 16,
    fontWeight: "700",
  },

  chartContainer: {
    flexDirection: "row",
    marginTop: 12,
  },
  yAxisLabels: {
    width: 46,
    justifyContent: "space-between",
    paddingVertical: 4,
    paddingRight: 4,
  },
  axisLabel: {
    fontSize: 10,
  },
  chartArea: {
    flex: 1,
    height: 160,
    position: "relative",
    paddingLeft: 4,
  },
  chartGuides: {
    ...StyleSheet.absoluteFillObject,
  },
  chartGuideLine: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 1,
    backgroundColor: "rgba(148,163,184,0.35)",
  },
  barsRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: 4,
  },
  barWrapper: {
    flex: 1,
    paddingHorizontal: 2,
    justifyContent: "flex-end",
  },
  bar: {
  borderTopLeftRadius: 999,
  borderTopRightRadius: 999,
  borderBottomLeftRadius: 0,
  borderBottomRightRadius: 0,
},

  xAxisLabelsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
    paddingRight: 8,
  },
  xAxisLabel: {
    fontSize: 10,
  },
  updatedText: {
    fontSize: 11,
    marginTop: 10,
  },

  actionsCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
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
  rowDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(148,163,184,0.45)",
    marginLeft: 36,
  },
});
