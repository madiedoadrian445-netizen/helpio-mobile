// src/screens/AnalyticsDashboardScreen.js
import React, { useEffect, useState, useCallback } from "react";
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
import { useFocusEffect } from "@react-navigation/native";
import { RefreshControl } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { api } from "../config/api";


import useAuthStore from "../store/auth";
import Animated, {
  useSharedValue,
  withTiming,
  Easing,
  useAnimatedStyle,
} from "react-native-reanimated";
import { useTheme } from "../ThemeContext";
const HELP_BLUE = "#00A6FF";

// Mock revenue data – last 12 days

export default function AnalyticsDashboardScreen({ navigation }) {
  const { darkMode, theme } = useTheme();
  const isLight = !darkMode;
  const insets = useSafeAreaInsets();
const token = useAuthStore((state) => state.token);
const user = useAuthStore((state) => state.user);
const isHydrated = useAuthStore((state) => state.isHydrated);
const [refreshing, setRefreshing] = useState(false);
const providerId = user?.providerId;

const [analytics, setAnalytics] = useState({
  
  salesToday: 0,
  invoicesToday: 0,
  subscriptions: 0,
  totalLast30Days: 0,
  previous30DaysGrowth: 0,
  lastYearGrowth: 0,
  revenueData: [],
});

const [lastUpdated, setLastUpdated] = useState(Date.now());


 const loadAnalytics = async () => {
  try {

    const res = await api.get("/api/analytics");

console.log("Analytics API response:", res.data);


if (res.data.success) {
  setAnalytics(res.data.analytics);
  setLastUpdated(Date.now());
}

  } catch (err) {
    console.log("Analytics load error:", err);
  }
};

const getRelativeTime = () => {
  const seconds = Math.floor((Date.now() - lastUpdated) / 1000);

  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  return `${hours}h ago`;
};



  // Shared animation value for the bars (0 → 1)
  const progress = useSharedValue(0);

 useEffect(() => {
  progress.value = 0;

  progress.value = withTiming(1, {
    duration: 900,
    easing: Easing.out(Easing.cubic),
  });
}, [analytics.revenueData]);

 



useEffect(() => {

  if (!isHydrated || !token) return;

  loadAnalytics();

}, [isHydrated, token]);


useFocusEffect(
  useCallback(() => {
    if (isHydrated && token) {
      loadAnalytics();
    }
  }, [isHydrated, token])
);


useEffect(() => {

  if (!isHydrated || !token) return;

  const interval = setInterval(() => {
    loadAnalytics();
  }, 15000); // refresh every 15 seconds

  return () => clearInterval(interval);

}, [isHydrated, token]);




const maxRevenue =
  analytics.revenueData.length > 0
    ? Math.max(...analytics.revenueData.map((d) => d.value))
    : 1;

const magnitude =
  maxRevenue > 0
    ? Math.pow(10, Math.floor(Math.log10(maxRevenue)))
    : 1;

    
const niceMax = Math.ceil(maxRevenue / magnitude) * magnitude;

/* Dynamic goal scaling */
const goalStep = niceMax * 0.5;

const axisLevels = [
  niceMax + goalStep * 4,
  niceMax + goalStep * 3,
  niceMax + goalStep * 2,
  niceMax + goalStep,
  niceMax,
];


  const onRefresh = async () => {
  setRefreshing(true);
  await loadAnalytics();
  setRefreshing(false);
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
        intensity={isLight ? 18 : 25}
        tint={isLight ? "light" : "dark"}
        style={StyleSheet.absoluteFill}
      />

     {/* Header */}
<View
  style={[
    styles.headerWrap,
    {
      paddingTop: insets.top - 32,   // ← must be inside an object
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

      <TouchableOpacity
  style={styles.headerRight}
  activeOpacity={0.85}
  onPress={() => navigation.navigate("LegalPoliciesScreen")}
>
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
</TouchableOpacity>
      </View>

      <ScrollView
  refreshControl={
    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
  }
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
  value={`$${analytics.salesToday.toLocaleString()}`}
  accent={HELP_BLUE}
  isLight={isLight}
/>

<MiniKpiTile
  label="Transactions today"
  value={analytics.invoicesToday}
  accent="#34C759"
  isLight={isLight}
/>

<MiniKpiTile
  label="Invoices Today"
  value={analytics.subscriptions}
  accent="#22C55E"
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
               ${analytics.totalLast30Days.toLocaleString()}
              </Text>
              <Text
                style={[styles.salesSubLabel, { color: theme.subtleText }]}
              >
                Last 30 days
              </Text>
            </View>

           <View style={styles.salesKpiCol}>
  <Text style={[styles.salesKpiValue, { color: "#22C55E" }]}>
    {analytics.previous30DaysGrowth}%
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
              {analytics.lastYearGrowth}%
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
  {axisLevels.map((value, i) => (
    <Text
      key={i}
      style={[styles.axisLabel, { color: theme.subtleText }]}
    >
      ${Math.round(value).toLocaleString()}
    </Text>
  ))}
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
  {analytics.revenueData.length === 0 ? (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <Text style={{ color: theme.subtleText, fontSize: 12 }}>
        No analytics data yet
      </Text>
    </View>
  ) : (
 analytics.revenueData.slice(-12).map((d, index) => {
 const normalized = d.value / axisLevels[0];
  const MAX_BAR_HEIGHT = 120;
  const targetHeight = MAX_BAR_HEIGHT * normalized;

  return (
    <View key={index} style={styles.barWrapper}>
      <AnimatedBar
        targetHeight={targetHeight}
        progress={progress}
        isLight={isLight}
      />
    </View>
  );
})
     
    
  )}
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
  Updated {getRelativeTime()}
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
  onPress={() => {
    navigation.navigate("PayoutsBalancesScreen", {
      providerId: user?.providerId
    });
  }}
/>




         <DashboardRow
  icon="albums-outline"
  label="My listings"
  showDivider={false}
  onPress={() => navigation.navigate("MyListingsScreen")}
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



const AnimatedBar = ({ targetHeight, progress, isLight }) => {
  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: targetHeight * progress.value,
      opacity: 0.2 + 0.8 * progress.value,
    };
  });

  return (
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
  height: 150,
  paddingLeft: 4,
  justifyContent: "flex-end",
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
  flexDirection: "row",
  alignItems: "flex-end",
  justifyContent: "space-between",
  paddingHorizontal: 10,
  height: 120,
},
barWrapper: {
  width: 18,
},

bar: {
  width: 18,
  borderTopLeftRadius: 8,
  borderTopRightRadius: 8,
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
