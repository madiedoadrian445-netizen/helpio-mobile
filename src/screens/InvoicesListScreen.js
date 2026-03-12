import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useTheme } from "../ThemeContext";
import { api } from "../config/api";
import { TouchableOpacity, Alert } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Swipeable } from "react-native-gesture-handler";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback } from "react";
export default function InvoicesListScreen({ refreshKey }) {
 const navigation = useNavigation();
  const { darkMode, theme } = useTheme();
  const isLight = !darkMode;

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
const [refreshing, setRefreshing] = useState(false);


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

  const onRefresh = async () => {
  setRefreshing(true);
  await fetchInvoices();
  setRefreshing(false);
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

            setInvoices((prev) =>
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


 useFocusEffect(
  useCallback(() => {
    fetchInvoices();
  }, [])
);

  if (loading) {
    return (
      <View style={styles.loadingWrap}>
        <ActivityIndicator />
      </View>
    );
  }
if (!invoices.length) {
  return (
    <View style={styles.emptyWrap}>
      <View
        style={[
          styles.emptyCard,
          {
            backgroundColor: isLight
              ? "rgba(255,255,255,0.9)"
              : "rgba(28,28,30,0.9)",
          },
        ]}
      >
        <Ionicons
          name="document-text-outline"
          size={42}
          color={theme.subtleText}
          style={{ marginBottom: 14 }}
        />

        <Text style={[styles.emptyTitle, { color: theme.text }]}>
          No invoices yet
        </Text>

        <Text
          style={[styles.emptySubtitle, { color: theme.subtleText }]}
        >
          Create your first invoice and start getting paid.
        </Text>

      <TouchableOpacity
  activeOpacity={0.9}
  style={styles.emptyButton}
  onPress={() => navigation.navigate("InvoiceBuilderScreen")}
>
          <Text style={styles.emptyButtonText}>
            Create invoice
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

 return (
 <ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{
    paddingHorizontal: 22,
    paddingTop: 12,
    paddingBottom: 100,
  }}
  refreshControl={
    <RefreshControl
      refreshing={refreshing}
      onRefresh={onRefresh}
      tintColor="#00A6FF"
    />
  }
>
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
          <View key={inv._id} style={styles.rowWrap}>
            <Swipeable
              renderRightActions={() => renderRightActions(inv._id)}
              overshootRight={false}
            >
              <View style={styles.row}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.id, { color: theme.text }]}>
                    {inv.invoiceNumber || `INV-${inv._id.slice(-4)}`}
                  </Text>

                  <Text style={{ color: theme.subtleText }}>
                    {inv.customerSnapshot?.name || "Unknown client"}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text style={[styles.total, { color: theme.text }]}>
                    ${Number(inv.total).toFixed(2)}
                  </Text>
                  <Text style={{ color: statusColor }}>
                    {inv.status}
                  </Text>
                </View>
              </View>
              
            </Swipeable>

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

rowWrap: {
  overflow: "hidden",
  borderRadius: 18, // match listCard rounding
},

deleteAction: {
  width: 70,              // keeps spacing consistent
  justifyContent: "center",
  alignItems: "center",
},



emptyWrap: {
  flex: 1,
  paddingHorizontal: 22,
  paddingTop: 40,
},

emptyCard: {
  borderRadius: 22,
  paddingVertical: 40,
  paddingHorizontal: 28,
  alignItems: "center",
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 8 },
  shadowRadius: 20,
  shadowOpacity: 0.08,
},

emptyTitle: {
  fontSize: 20,
  fontWeight: "700",
  marginBottom: 6,
},

emptySubtitle: {
  fontSize: 15,
  textAlign: "center",
  marginBottom: 24,
},

emptyButton: {
  backgroundColor: "#00A6FF",
  paddingVertical: 14,
  paddingHorizontal: 32,
  borderRadius: 999,
},

emptyButtonText: {
  color: "#fff",
  fontSize: 15,
  fontWeight: "700",
},



 listCard: {
  borderRadius: 18,
  paddingHorizontal: 14,
  paddingVertical: 4,
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 4 },
  shadowRadius: 8,
  shadowOpacity: 0.08,
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
