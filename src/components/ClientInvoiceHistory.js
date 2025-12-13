// src/components/ClientInvoiceHistory.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../ThemeContext";
import { API_BASE_URL } from "../config/api";

const HELP_BLUE = "#00A6FF";

const currency = (n) =>
  (isNaN(Number(n)) ? 0 : Number(n)).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

function GlassCard({ children, style, tint = "light", intensity = 50 }) {
  return (
    <View style={[styles.cardWrap, style]}>
      <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={["rgba(255,255,255,0.80)", "rgba(245,245,250,0.45)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardInnerStroke} />
      <View style={styles.cardContent}>{children}</View>
    </View>
  );
}

/**
 * Props:
 * - clientId (required): Mongo _id of the client (customer)
 * - onInvoicePress?: optional callback (invoice) => void for future detail/preview
 */
export default function ClientInvoiceHistory({ clientId, onInvoicePress }) {
  const { darkMode } = useTheme();
  const tint = darkMode ? "dark" : "light";

  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorText, setErrorText] = useState("");

  useEffect(() => {
    let isActive = true;

    const fetchInvoices = async () => {
      try {
        setLoading(true);
        setErrorText("");

        const token = await AsyncStorage.getItem("token");
        if (!token || !clientId) {
          setInvoices([]);
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/api/invoices?customer=${clientId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!res.ok) {
          const text = await res.text();
          console.log("Fetch client invoices error:", text);
          throw new Error("Could not load invoices.");
        }

        const data = await res.json();
        // Expecting `data.invoices` or array directly – handle both safely.
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.invoices)
          ? data.invoices
          : [];

        if (isActive) {
          // Sort by createdAt desc if available
          const sorted = [...list].sort((a, b) => {
            const da = new Date(a.createdAt || 0).getTime();
            const db = new Date(b.createdAt || 0).getTime();
            return db - da;
          });
          setInvoices(sorted);
        }
      } catch (err) {
        console.error("ClientInvoiceHistory load error:", err);
        if (isActive) {
          setErrorText(err.message || "Failed to load invoices.");
        }
      } finally {
        if (isActive) setLoading(false);
      }
    };

    fetchInvoices();

    return () => {
      isActive = false;
    };
  }, [clientId]);

  return (
    <GlassCard
      tint={tint}
      intensity={55}
      style={{ marginHorizontal: 16, marginTop: 18, marginBottom: 6 }}
    >
      {/* HEADER ROW */}
      <View style={styles.headerRow}>
        <Text
          style={[
            styles.sectionLabel,
            { color: darkMode ? "#A9ABB5" : "#6B6B6B" },
          ]}
        >
          INVOICE HISTORY
        </Text>
        <View style={{ flex: 1 }} />
        {loading ? (
          <ActivityIndicator size="small" color={HELP_BLUE} />
        ) : invoices.length > 0 ? (
          <Text
            style={{
              fontSize: 12,
              color: darkMode ? "#D0D0D8" : "#6D6D72",
            }}
          >
            {invoices.length} {invoices.length === 1 ? "invoice" : "invoices"}
          </Text>
        ) : null}
      </View>

      {/* ERROR STATE */}
      {errorText ? (
        <Text
          style={{
            fontSize: 13,
            color: "#FF3B30",
            marginTop: 4,
          }}
        >
          {errorText}
        </Text>
      ) : null}

      {/* EMPTY STATE */}
      {!loading && !errorText && invoices.length === 0 && (
        <View style={{ marginTop: 2 }}>
          <Text
            style={{
              fontSize: 13,
              color: darkMode ? "#8E8E93" : "#8E8E93",
            }}
          >
            No invoices yet for this client.
          </Text>
        </View>
      )}

      {/* LIST */}
      {!loading && invoices.length > 0 && (
        <View style={{ marginTop: 4 }}>
          {invoices.slice(0, 6).map((inv, idx) => {
            const isLast = idx === Math.min(invoices.length, 6) - 1;
            const total = inv.total ?? inv.amount ?? 0;
            const status = (inv.status || "DUE").toUpperCase();
            const dateLabel =
              inv.issueDate ||
              inv.createdAt?.slice(0, 10) ||
              inv.updatedAt?.slice(0, 10) ||
              "";

            let statusBg = "rgba(0,0,0,0.06)";
            let statusColor = darkMode ? "#FFFFFF" : "#111111";

            if (status === "PAID") {
              statusBg = "rgba(52,199,89,0.16)";
              statusColor = "#34C759";
            } else if (status === "DUE") {
              statusBg = "rgba(255,149,0,0.16)";
              statusColor = "#FF9500";
            } else if (status === "OVERDUE") {
              statusBg = "rgba(255,59,48,0.18)";
              statusColor = "#FF3B30";
            }

            const RowComponent = onInvoicePress ? TouchableOpacity : View;

            return (
              <RowComponent
                key={inv._id || inv.invoiceNumber || idx}
                style={[
                  styles.invoiceRow,
                  {
                    borderBottomWidth: isLast ? 0 : StyleSheet.hairlineWidth,
                    borderBottomColor: darkMode
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.06)",
                  },
                ]}
                onPress={
                  onInvoicePress ? () => onInvoicePress(inv) : undefined
                }
                activeOpacity={0.7}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.invTitle,
                      { color: darkMode ? "#FFFFFF" : "#111111" },
                    ]}
                  >
                    {inv.invoiceNumber || "Invoice"}
                  </Text>
                  <Text
                    style={{
                      fontSize: 12,
                      color: darkMode ? "#A0A0AA" : "#6D6D72",
                      marginTop: 1,
                    }}
                  >
                    {dateLabel}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: darkMode ? "#FFFFFF" : "#111111",
                    }}
                  >
                    {currency(total)}
                  </Text>

                  <View
                    style={[
                      styles.statusPill,
                      { backgroundColor: statusBg, marginTop: 4 },
                    ]}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "700",
                        color: statusColor,
                      }}
                    >
                      {status}
                    </Text>
                  </View>
                </View>

                {onInvoicePress && (
                  <Ionicons
                    name="chevron-forward"
                    size={16}
                    color={darkMode ? "#8E8E93" : "#B0B0B8"}
                    style={{ marginLeft: 6 }}
                  />
                )}
              </RowComponent>
            );
          })}

          {invoices.length > 6 && (
            <View style={{ marginTop: 8 }}>
              <Text
                style={{
                  fontSize: 11,
                  color: darkMode ? "#A9ABB5" : "#6D6D72",
                }}
              >
                Showing latest {Math.min(invoices.length, 6)} of{" "}
                {invoices.length} invoices.
              </Text>
            </View>
          )}
        </View>
      )}
    </GlassCard>
  );
}

const styles = StyleSheet.create({
  cardWrap: {
    borderRadius: 22,
    overflow: "hidden",
  },
  cardInnerStroke: {
    position: "absolute",
    borderRadius: 22,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
  },
  cardContent: {
    padding: 14,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    textTransform: "uppercase",
  },
  invoiceRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
  },
  invTitle: {
    fontSize: 14,
    fontWeight: "600",
  },
  statusPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
});
