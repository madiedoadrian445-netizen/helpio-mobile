// src/screens/ClientDetailScreen.js
import React, { useEffect, useState, useMemo } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
  Linking,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";

const API_BASE_URL = "https://helpio-backend.onrender.com";
const CLIENTS_ENDPOINT = "/api/clients";

const formatPhonePretty = (phoneRaw = "") => {
  const digits = phoneRaw.replace(/\D/g, "").slice(0, 10);
  const len = digits.length;
  if (len === 0) return "";
  if (len < 4) return `(${digits}`;
  if (len < 7) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
};

const formatDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString();
};

export default function ClientDetailScreen({ route, navigation }) {
  const { darkMode, theme } = useTheme();
  const { clientId } = route.params || {};

  const [client, setClient] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let isMounted = true;

    const fetchClient = async () => {
      if (!clientId) {
        setErr("Missing client id");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setErr("");

        const res = await fetch(`${API_BASE_URL}${CLIENTS_ENDPOINT}/${clientId}`);
        if (!res.ok) {
          throw new Error(`Failed to load client (${res.status})`);
        }
        const data = await res.json();
        if (isMounted) {
          setClient(data);
        }
      } catch (e) {
        console.log("Error fetching client:", e);
        if (isMounted) setErr("Couldn’t load client details.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchClient();

    return () => {
      isMounted = false;
    };
  }, [clientId]);

  const initials = useMemo(() => {
    const name = client?.name || "";
    if (!name.trim()) return "?";
    return name
      .split(" ")
      .map((p) => p.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 3);
  }, [client?.name]);

  const prettyPhone =
    client?.phoneFormatted || formatPhonePretty(client?.phone || "");

  const totalBilled = client?.stats?.totalBilled ?? 0;
  const totalInvoices = client?.stats?.totalInvoices ?? 0;
  const lastInvoiceAt = client?.stats?.lastInvoiceAt
    ? formatDate(client.stats.lastInvoiceAt)
    : null;

  const timeline = client?.timeline || [];

  const handleCall = () => {
    if (!client?.phone) return;
    Linking.openURL(`tel:${client.phone}`).catch(() => {});
  };

  const handleEmail = () => {
    if (!client?.email) return;
    Linking.openURL(`mailto:${client.email}`).catch(() => {});
  };

  const handleMessage = () => {
    if (!client?.phone) return;
    Linking.openURL(`sms:${client.phone}`).catch(() => {});
  };

  const bgCard = darkMode
    ? "rgba(28,28,30,0.92)"
    : "rgba(255,255,255,0.94)";

  const subtleBorder = darkMode
    ? "rgba(255,255,255,0.08)"
    : "rgba(0,0,0,0.06)";

  const labelColor = theme.subtleText;

  const renderActionButton = (icon, label, onPress, disabled = false) => (
    <TouchableOpacity
      style={[
        styles.actionButton,
        {
          backgroundColor: darkMode
            ? "rgba(255,255,255,0.06)"
            : "rgba(0,0,0,0.04)",
          opacity: disabled ? 0.35 : 1,
        },
      ]}
      activeOpacity={0.8}
      onPress={disabled ? undefined : onPress}
    >
      <View
        style={[
          styles.actionIconWrap,
          {
            backgroundColor: darkMode
              ? "rgba(0,122,255,0.18)"
              : "rgba(0,122,255,0.12)",
          },
        ]}
      >
        <Ionicons
          name={icon}
          size={18}
          color={disabled ? "#A0A0A0" : "#007AFF"}
        />
      </View>
      <Text
        style={[
          styles.actionLabel,
          { color: disabled ? "#A0A0A0" : theme.text },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  // ---------- Loading / Error States ----------
  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <BlurView
          intensity={darkMode ? 15 : 30}
          tint={theme.blurTint}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={[styles.loadingText, { color: theme.subtleText }]}>
            Loading client…
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!client || err) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
        <BlurView
          intensity={darkMode ? 15 : 30}
          tint={theme.blurTint}
          style={StyleSheet.absoluteFill}
        />
        {/* Header */}
        <BlurView intensity={50} tint={theme.blurTint} style={styles.header}>
          <TouchableOpacity
            style={styles.headerSide}
            onPress={() => navigation.goBack()}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color="#007AFF"
            />
          </TouchableOpacity>

          <View style={styles.headerCenter}>
            <Text style={[styles.headerTitle, { color: theme.text }]}>
              Client
            </Text>
          </View>

          <View style={styles.headerSide} />
        </BlurView>

        <View style={styles.centered}>
          <Text style={{ color: theme.subtleText, fontSize: 16 }}>
            {err || "Client not found."}
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // ---------- Main Render ----------
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      {/* Background blur */}
      <BlurView
        intensity={darkMode ? 15 : 30}
        tint={theme.blurTint}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <BlurView intensity={50} tint={theme.blurTint} style={styles.header}>
        <TouchableOpacity
          style={styles.headerSide}
          onPress={() => navigation.goBack()}
        >
          <Ionicons
            name="chevron-back"
            size={22}
            color="#007AFF"
          />
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {client.name || "Client"}
          </Text>
        </View>

        {/* Right: Edit (stub for now) */}
        <TouchableOpacity
          style={styles.headerSide}
          activeOpacity={0.7}
          onPress={() => {
            // Later: navigation.navigate("EditClientScreen", { clientId });
          }}
        >
          <Text style={[styles.headerText, { color: "#007AFF" }]}>Edit</Text>
        </TouchableOpacity>
      </BlurView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {/* Top spacing under header */}
        <View style={{ height: 96 }} />

        {/* Avatar + Name */}
        <View style={styles.topCenter}>
          <View
            style={[
              styles.avatar,
              {
                backgroundColor: darkMode
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
              },
            ]}
          >
            <Text style={[styles.avatarInitials, { color: theme.text }]}>
              {initials}
            </Text>
          </View>

          <Text style={[styles.name, { color: theme.text }]}>
            {client.name || "Unnamed Client"}
          </Text>

          <Text style={[styles.subTitle, { color: labelColor }]}>
            {client.company || "Client"}
          </Text>
        </View>

        {/* Action Row: Message / Call / Email */}
        <View style={styles.actionsRow}>
          {renderActionButton(
            "chatbubble-ellipses-outline",
            "Message",
            handleMessage,
            !client.phone
          )}
          {renderActionButton(
            "call-outline",
            "Call",
            handleCall,
            !client.phone
          )}
          {renderActionButton(
            "mail-outline",
            "Email",
            handleEmail,
            !client.email
          )}
        </View>

        {/* Stats Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: bgCard,
              shadowOpacity: darkMode ? 0 : 0.08,
            },
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              { color: theme.text },
            ]}
          >
            Overview
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: labelColor }]}>
                Total Billed
              </Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                ${Number(totalBilled).toFixed(2)}
              </Text>
            </View>
            <View style={styles.statItem}>
              <Text style={[styles.statLabel, { color: labelColor }]}>
                Invoices
              </Text>
              <Text style={[styles.statValue, { color: theme.text }]}>
                {totalInvoices}
              </Text>
            </View>
          </View>

          {lastInvoiceAt && (
            <Text
              style={[
                styles.lastInvoice,
                { color: labelColor },
              ]}
            >
              Last invoice: {lastInvoiceAt}
            </Text>
          )}
        </View>

        {/* Contact Info Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: bgCard,
              shadowOpacity: darkMode ? 0 : 0.08,
            },
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              { color: theme.text },
            ]}
          >
            Contact Info
          </Text>

          <View style={[styles.infoRow, { borderBottomColor: subtleBorder }]}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="person-outline" size={18} color={labelColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: labelColor }]}>
                Name
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {client.name || "—"}
              </Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: subtleBorder }]}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="call-outline" size={18} color={labelColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: labelColor }]}>
                Phone
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {prettyPhone || client.phone || "—"}
              </Text>
            </View>
          </View>

          <View style={[styles.infoRow, { borderBottomColor: subtleBorder }]}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="mail-outline" size={18} color={labelColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: labelColor }]}>
                Email
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {client.email || "—"}
              </Text>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconWrap}>
              <Ionicons name="location-outline" size={18} color={labelColor} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.infoLabel, { color: labelColor }]}>
                Address
              </Text>
              <Text style={[styles.infoValue, { color: theme.text }]}>
                {client.address || "—"}
              </Text>
            </View>
          </View>
        </View>

        {/* Notes Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: bgCard,
              shadowOpacity: darkMode ? 0 : 0.08,
            },
          ]}
        >
          <Text
            style={[
              styles.cardTitle,
              { color: theme.text },
            ]}
          >
            Notes
          </Text>

          <Text
            style={[
              styles.notesText,
              { color: client.notes ? theme.text : labelColor },
            ]}
          >
            {client.notes || "No notes saved yet."}
          </Text>
        </View>

        {/* Timeline Card */}
        <View
          style={[
            styles.card,
            {
              backgroundColor: bgCard,
              shadowOpacity: darkMode ? 0 : 0.08,
              marginBottom: 20,
            },
          ]}
        >
          <View style={styles.timelineHeaderRow}>
            <Text
              style={[
                styles.cardTitle,
                { color: theme.text },
              ]}
            >
              Timeline
            </Text>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => {
                // Later: open "AddTimelineEntryScreen"
              }}
            >
              <Text style={{ color: "#007AFF", fontWeight: "600", fontSize: 14 }}>
                Add Note
              </Text>
            </TouchableOpacity>
          </View>

          {timeline.length === 0 ? (
            <Text style={[styles.emptyTimeline, { color: labelColor }]}>
              No activity yet.
            </Text>
          ) : (
            timeline.map((item, index) => {
              const isLast = index === timeline.length - 1;

              let iconName = "document-text-outline";
              if (item.type === "note") iconName = "create-outline";
              if (item.type === "call") iconName = "call-outline";
              if (item.type === "email") iconName = "mail-outline";
              if (item.type === "invoice") iconName = "receipt-outline";

              return (
                <View key={item._id || item.id || index}>
                  <View style={styles.timelineRow}>
                    <View style={styles.timelineIconWrap}>
                      <Ionicons name={iconName} size={16} color="#007AFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text
                        style={[
                          styles.timelineText,
                          { color: theme.text },
                        ]}
                      >
                        {item.message || item.title || "Activity"}
                      </Text>
                      <Text
                        style={[
                          styles.timelineMeta,
                          { color: labelColor },
                        ]}
                      >
                        {formatDate(item.createdAt) ||
                          item.meta ||
                          "Just now"}
                      </Text>
                    </View>
                  </View>
                  {!isLast && <View style={styles.timelineDivider} />}
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },

  header: {
    height: 92,
    paddingTop: Platform.OS === "ios" ? 12 : 8,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 12,
    paddingBottom: 8,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  headerSide: {
    width: 70,
    justifyContent: "center",
  },
  headerCenter: {
    flex: 1,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
  },
  headerText: {
    fontSize: 17,
    fontWeight: "600",
  },

  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 10,
    fontSize: 15,
  },

  topCenter: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  avatarInitials: {
    fontSize: 32,
    fontWeight: "700",
  },
  name: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.3,
  },
  subTitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "500",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 24,
    marginBottom: 14,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  actionIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 5,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: "600",
  },

  card: {
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: "700",
    marginBottom: 10,
  },

  statsRow: {
    flexDirection: "row",
    marginTop: 6,
  },
  statItem: {
    flex: 1,
  },
  statLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "800",
  },
  lastInvoice: {
    fontSize: 12,
    marginTop: 10,
  },

  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  infoIconWrap: {
    width: 28,
    alignItems: "center",
    marginRight: 10,
  },
  infoLabel: {
    fontSize: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: "500",
  },

  notesText: {
    fontSize: 14,
    lineHeight: 20,
  },

  timelineHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  emptyTimeline: {
    fontSize: 13,
    marginTop: 6,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 8,
  },
  timelineIconWrap: {
    width: 26,
    alignItems: "center",
    marginRight: 8,
    paddingTop: 2,
  },
  timelineText: {
    fontSize: 14,
    fontWeight: "500",
  },
  timelineMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  timelineDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(120,120,128,0.25)",
    marginLeft: 34,
  },
});