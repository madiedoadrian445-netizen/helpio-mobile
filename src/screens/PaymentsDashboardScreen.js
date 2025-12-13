// src/screens/PaymentsDashboardScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../config/api";
import { useTheme } from "../ThemeContext";

const HELP_BLUE = "#00A6FF";
const LIMIT = 20;

export default function PaymentsDashboardScreen({ navigation }) {
  const { theme } = useTheme();

  const [records, setRecords] = useState([]);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Filters & Sorting
  const [sortBy, setSortBy] = useState("createdAt");
  const [direction, setDirection] = useState("desc");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchPayments = async (reset = false) => {
    try {
      if (reset) setLoading(true);

      const currentPage = reset ? 1 : page;

      const params = new URLSearchParams({
        page: currentPage,
        limit: LIMIT,
        sortBy,
        direction,
      });

      if (typeFilter) params.append("type", typeFilter);
      if (statusFilter) params.append("status", statusFilter);

      const res = await api.get(`/idempotency/provider/me?${params.toString()}`);

      if (!res.data.success) return;

      const incoming = res.data.records || [];

      setTotal(res.data.total);

      if (reset) {
        setRecords(incoming);
        setPage(1);
      } else {
        setRecords((prev) => [...prev, ...incoming]);
      }
    } catch (err) {
      console.log("Payments fetch error:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments(true);
  }, [sortBy, direction, typeFilter, statusFilter]);

  const loadMore = () => {
    if (records.length >= total) return;
    setPage((prev) => prev + 1);
    fetchPayments();
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments(true);
  };

  const renderStatusBadge = (status) => {
    const color =
      status === "completed"
        ? "#2ECC71"
        : status === "failed"
        ? "#E74C3C"
        : "#F1C40F";

    return (
      <View style={[styles.statusBadge, { backgroundColor: color }]}>
        <Text style={styles.statusBadgeText}>{status.toUpperCase()}</Text>
      </View>
    );
  };

  const renderTypeIcon = (type) => {
    switch (type) {
      case "subscription_charge":
        return <Ionicons name="repeat" size={24} color={HELP_BLUE} />;
      case "invoice_payment":
        return <Ionicons name="document-text" size={24} color={HELP_BLUE} />;
      case "tap_to_pay":
        return <Ionicons name="phone-portrait" size={24} color={HELP_BLUE} />;
      default:
        return <Ionicons name="grid-outline" size={24} color={HELP_BLUE} />;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <ScrollView
        contentContainerStyle={{ paddingBottom: 120 }}
        onScroll={({ nativeEvent }) => {
          const paddingToBottom = 200;
          if (
            nativeEvent.layoutMeasurement.height + nativeEvent.contentOffset.y >=
            nativeEvent.contentSize.height - paddingToBottom
          ) {
            loadMore();
          }
        }}
        scrollEventThrottle={200}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* HEADER */}
        <View style={styles.headerWrap}>
          <Text style={[styles.header, { color: theme.text }]}>
            Payments Dashboard
          </Text>
        </View>

        {/* FILTERS */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterRow}
        >
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() =>
              setSortBy((prev) =>
                prev === "createdAt" ? "amount" : "createdAt"
              )
            }
          >
            <Text style={styles.filterLabel}>
              Sort: {sortBy === "createdAt" ? "Date" : "Amount"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() =>
              setDirection((prev) => (prev === "desc" ? "asc" : "desc"))
            }
          >
            <Text style={styles.filterLabel}>
              {direction === "desc" ? "Newest → Oldest" : "Oldest → Newest"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() =>
              setTypeFilter((prev) =>
                prev === "" ? "subscription_charge" : ""
              )
            }
          >
            <Text style={styles.filterLabel}>
              {typeFilter === "" ? "All Types" : "Subscriptions Only"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.filterButton}
            onPress={() =>
              setStatusFilter((prev) =>
                prev === "" ? "completed" : ""
              )
            }
          >
            <Text style={styles.filterLabel}>
              {statusFilter === "" ? "All Statuses" : "Completed Only"}
            </Text>
          </TouchableOpacity>
        </ScrollView>

        {/* PAYMENT LIST */}
        {records.map((rec) => (
          <BlurView
            key={rec.id}
            intensity={50}
            tint="light"
            style={styles.card}
          >
            <View style={styles.cardLeft}>{renderTypeIcon(rec.type)}</View>

            <View style={styles.cardCenter}>
              <Text style={[styles.amount, { color: theme.text }]}>
                ${rec.amount}
              </Text>

              <Text style={[styles.subText, { color: theme.subtext }]}>
                {rec.typeLabel} • {rec.statusLabel}
              </Text>

              <Text style={[styles.subText, { color: theme.subtext }]}>
                Created: {rec.created}
              </Text>

              {rec.subscriptionId ? (
                <Text style={styles.link}>Subscription • {rec.subscriptionId}</Text>
              ) : null}

              {rec.invoiceId ? (
                <Text style={styles.link}>Invoice • {rec.invoiceId}</Text>
              ) : null}
            </View>

            <View style={styles.cardRight}>{renderStatusBadge(rec.statusRaw)}</View>
          </BlurView>
        ))}

        {loading && (
          <View style={{ padding: 30 }}>
            <ActivityIndicator size="large" color={HELP_BLUE} />
          </View>
        )}
      </ScrollView>
    </View>
  );
}

/* -------------------------------------------------------
   STYLES
------------------------------------------------------- */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  headerWrap: {
    paddingHorizontal: 22,
    paddingTop: 60,
    paddingBottom: 10,
  },
  header: {
    fontSize: 30,
    fontWeight: "700",
  },
  filterRow: {
    paddingLeft: 12,
    paddingVertical: 5,
    marginBottom: 10,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.6)",
    borderRadius: 14,
    marginRight: 10,
  },
  filterLabel: {
    fontWeight: "600",
    color: "#333",
  },
  card: {
    flexDirection: "row",
    marginHorizontal: 20,
    marginBottom: 15,
    padding: 18,
    borderRadius: 22,
    overflow: "hidden",
    alignItems: "center",
  },
  cardLeft: {
    width: 40,
    alignItems: "center",
  },
  cardCenter: {
    flex: 1,
    paddingLeft: 10,
  },
  amount: {
    fontSize: 22,
    fontWeight: "700",
  },
  subText: {
    fontSize: 12,
    marginTop: 2,
  },
  link: {
    fontSize: 12,
    color: HELP_BLUE,
    marginTop: 4,
  },
  cardRight: {
    marginLeft: 10,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusBadgeText: {
    color: "white",
    fontSize: 10,
    fontWeight: "700",
  },
});
