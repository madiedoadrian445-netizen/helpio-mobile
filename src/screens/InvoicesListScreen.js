import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useTheme } from "../ThemeContext";
import { api } from "../config/api";

export default function InvoicesListScreen({ refreshKey }) {
  const { darkMode, theme } = useTheme();
  const isLight = !darkMode;

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/invoices/provider/me");
      if (res.data?.success) {
        setInvoices(res.data.invoices || []);
      }
    } catch (err) {
      console.log("❌ Fetch invoices error:", err.response?.data || err);
    } finally {
      setLoading(false);
    }
  };

  
  useEffect(() => {
    fetchInvoices();
  }, [refreshKey]);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator />
      </View>
    );
  }

  if (!invoices.length) {
    return (
      <Text style={[styles.emptyText, { color: theme.subtleText }]}>
        No invoices yet.
      </Text>
    );
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false}>
      <View
        style={[
          styles.listCard,
          {
            backgroundColor: isLight
              ? "rgba(255,255,255,0.9)"
              : "rgba(28,28,30,0.9)",
          },
        ]}
      >
        {invoices.map((inv, idx) => {
          const isLast = idx === invoices.length - 1;

          const statusColor =
            inv.status === "PAID"
              ? "#34C759"
              : inv.status === "OVERDUE"
              ? "#FF3B30"
              : "#FFCC00";

          return (
            <View key={inv._id}>
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.id, { color: theme.text }]}>
                    {inv.invoiceNumber || `INV-${inv._id.slice(-4)}`}
                  </Text>
                  <Text style={{ color: theme.subtleText }}>
                    {inv.customer?.name || "Unknown client"}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.total, { color: theme.text }]}>
                    ${Number(inv.total).toFixed(2)}
                  </Text>
                  <Text style={{ color: statusColor }}>{inv.status}</Text>
                </View>
              </View>

              {!isLast && <View style={styles.divider} />}
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loadingWrap: {
    marginTop: 40,
    alignItems: "center",
  },
  emptyText: {
    marginTop: 20,
    fontSize: 15,
  },
  listCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 4,
  },
  row: {
    flexDirection: "row",
    paddingVertical: 12,
  },
  id: {
    fontSize: 15,
    fontWeight: "600",
  },
  total: {
    fontSize: 15,
    fontWeight: "700",
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(120,120,128,0.25)",
  },
});
