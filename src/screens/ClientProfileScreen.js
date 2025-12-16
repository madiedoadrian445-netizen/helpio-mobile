// src/screens/ClientProfileScreen.js
import React, { useEffect, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Linking,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../ThemeContext";
import { API_BASE_URL } from "../config/api";
import { api } from "../config/api";

const HELP_BLUE = "#00A6FF";

export default function ClientProfileScreen({ route, navigation }) {
  const { darkMode, theme } = useTheme();
  const client = route?.params?.client || {};

  const initials = (client.name || "?")
    .split(" ")
    .map((p) => p[0])
    .join("")
    .toUpperCase()
    .slice(0, 3);

  const phone = client.phone || client.clientPhone || "";
  const email = client.email || "";
  const address = client.address || client.company || "";
  const notes = client.notes || "";

  const jobsCount = client.jobsCount || 0;
  const totalRevenue = client.totalRevenue || 0;
  const lastActivity = client.lastActivity || "No recent activity";

  const cleaned = phone.replace(/\D/g, "");

  const formatPhoneDisplay = (num) => {
    if (num.length === 10) {
      return `(${num.slice(0, 3)}) ${num.slice(3, 6)}-${num.slice(6)}`;
    }
    return phone || "Not set";
  };

  const handleCall = () => {
    if (!cleaned || cleaned.length !== 10) return;

    const finalNumber = cleaned.startsWith("1")
      ? `+${cleaned}`
      : `+1${cleaned}`;

    Linking.openURL(`tel:${finalNumber}`).catch(() => {});
  };

const customerId = (() => {
  if (typeof client?._id === "string") return client._id;
  if (typeof client?.customerId === "string") return client.customerId;
  if (typeof client?.id === "string") return client.id;

  if (client?._id && typeof client._id === "object" && client._id.toString)
    return client._id.toString();

  if (
    client?.customerId &&
    typeof client.customerId === "object" &&
    client.customerId.toString
  )
    return client.customerId.toString();

  if (client?.customer?._id)
    return client.customer._id.toString();

  return null;
})();

console.log(
  "🧾 customerId used for timeline:",
  customerId,
  typeof customerId
);


  const handleText = () => {
  if (!customerId) {
    Alert.alert("Chat error", "Missing customer information.");
    return;
  }

  navigation.navigate("ChatDetail", {
    customerId,              // 🔥 REQUIRED
    name: client.name,       // for header
    phoneNumber: phone,      // for call button
    avatar: null,            // optional
    fromClientProfile: true,
  });
};

  const handleEmail = () => {
    if (!email) return;
    Linking.openURL(`mailto:${email}`).catch(() => {});
  };

  const handleInvoice = () => {
    navigation.navigate("InvoiceBuilderScreen", {
      client,
      fromClientProfile: true,
    });
  };


  const callDisabled = !cleaned || cleaned.length !== 10;

  /* ---------------- TIMELINE STATE + FETCH ---------------- */

const [timeline, setTimeline] = useState([]);
const [timelineLoading, setTimelineLoading] = useState(false);

const loadTimeline = useCallback(async () => {
  if (!customerId) return;

  try {
    setTimelineLoading(true);

    const res = await api.get(`/api/customers/${customerId}/timeline`);

    if (Array.isArray(res.data)) {
      setTimeline(res.data);
    } else if (Array.isArray(res.data?.timeline)) {
      setTimeline(res.data.timeline);
    } else {
      setTimeline([]);
    }
  } catch (err) {
    console.log(
      "❌ Error loading timeline:",
      err.response?.data || err.message
    );
    setTimeline([]);
  } finally {
    setTimelineLoading(false);
  }
}, [customerId]);


useEffect(() => {
  loadTimeline();
}, [loadTimeline]);


  const iconForType = (type) => {
    switch (type) {
      case "invoice":
        return "document-text-outline";
      case "payment":
        return "card-outline";
      case "message":
        return "chatbubbles-outline";
      case "job":
        return "construct-outline";
      case "note":
        return "create-outline";
      default:
        return "time-outline";
    }
  };

  const formatRelativeTime = (iso) => {
    if (!iso) return "";
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now - d;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffSec < 60) return "Just now";
    if (diffMin < 60) return `${diffMin} min ago`;
    if (diffHr < 24) return `${diffHr} hr${diffHr === 1 ? "" : "s"} ago`;
    if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;

    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      {/* ---------- HEADER ---------- */}
      <BlurView intensity={50} tint={theme.blurTint} style={styles.header}>
        <TouchableOpacity
          style={styles.headerSide}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#007AFF" />
          <Text style={styles.headerBackText}>Back</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text
            style={[styles.headerTitle, { color: theme.text }]}
            numberOfLines={1}
          >
            Client Profile
          </Text>
        </View>

        <View style={styles.headerSideRight} />
      </BlurView>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: 100,
          paddingBottom: 40,
        }}
      >
        {/* TOP GRADIENT CARD */}
        <View style={styles.topContainer}>
          <LinearGradient
            colors={
              darkMode ? ["#001827", "#002E4A"] : ["#00A6FF", "#00C2FF"]
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientCard}
          >
            <View style={styles.topRow}>
              <View
                style={[
                  styles.avatarBig,
                  {
                    backgroundColor: darkMode
                      ? "rgba(0,0,0,0.4)"
                      : "rgba(255,255,255,0.18)",
                  },
                ]}
              >
                <Text style={styles.avatarBigText}>{initials}</Text>
              </View>

              <View style={styles.topTextBlock}>
                <Text style={styles.clientNameBig} numberOfLines={1}>
                  {client.name || "Unnamed Client"}
                </Text>

                {!!client.company && (
                  <Text style={styles.clientCompanyBig} numberOfLines={1}>
                    {client.company}
                  </Text>
                )}

                <Text style={styles.clientTagLine}>
                  Helpio BusinessPlace • CRM
                </Text>
              </View>
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Jobs</Text>
                <Text style={styles.statValue}>{jobsCount}</Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Revenue</Text>
                <Text style={styles.statValue}>
                  ${totalRevenue.toLocaleString("en-US")}
                </Text>
              </View>

              <View style={styles.statItem}>
                <Text style={styles.statLabel}>Last Activity</Text>
                <Text style={styles.statValueSmall} numberOfLines={1}>
                  {lastActivity}
                </Text>
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* QUICK ACTIONS */}
        <View style={styles.actionsRowOuter}>
          <View
            style={[
              styles.actionsRow,
              {
                backgroundColor: darkMode
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.03)",
              },
            ]}
          >
            <QuickAction
              icon="call-outline"
              label="Call"
              disabled={callDisabled}
              onPress={handleCall}
            />

            <QuickAction
              icon="chatbubble-ellipses-outline"
              label="Text"
              disabled={false}
              onPress={handleText}
            />

            <QuickAction
              icon="mail-outline"
              label="Email"
              disabled={!email}
              onPress={handleEmail}
            />

            <QuickAction
              icon="document-text-outline"
              label="Invoice"
              disabled={false}
              onPress={handleInvoice}
            />
          </View>
        </View>

        {/* SECTIONS */}
        <View style={styles.sectionContainer}>
          {/* Contact Info */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.card,
                shadowOpacity: darkMode ? 0 : 0.06,
              },
            ]}
          >
            <SectionHeader title="Contact Info" />

            <InfoRow label="Phone" value={formatPhoneDisplay(cleaned)} />

            <InfoRow label="Email" value={email || "Not set"} />
          </View>

          {/* Address / Company */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.card,
                shadowOpacity: darkMode ? 0 : 0.06,
              },
            ]}
          >
            <SectionHeader title="Business Details" />

            {!!client.company && (
              <InfoRow label="Company" value={client.company} />
            )}

            <InfoRow label="Address" value={address || "Not set"} />
          </View>

          {/* Notes */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.card,
                shadowOpacity: darkMode ? 0 : 0.06,
              },
            ]}
          >
            <SectionHeader title="Notes" />
            <Text style={[styles.notesText, { color: theme.subtleText }]}>
              {notes ||
                "No notes yet. Add special instructions, preferences, or history here."}
            </Text>
          </View>

          {/* Timeline */}
          <View
            style={[
              styles.sectionCard,
              {
                backgroundColor: theme.card,
                shadowOpacity: darkMode ? 0 : 0.06,
              },
            ]}
          >
            <SectionHeader title="Timeline" />

            {timelineLoading && (
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: theme.subtleText,
                  marginBottom: 4,
                }}
              >
                Loading activity…
              </Text>
            )}

            {!timelineLoading && timeline.length === 0 && (
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "500",
                  color: theme.subtleText,
                }}
              >
                No activity yet. New invoices, payments, notes, and messages
                will appear here.
              </Text>
            )}

            {!timelineLoading &&
              timeline.map((entry) => (
                <TimelineItem
  key={entry._id}
  icon={iconForType(entry.type)}
  title={entry.title}
  subtitle={
    entry.description ||
    (entry.amount
      ? `$${entry.amount.toLocaleString("en-US")}`
      : "")
  }
  time={formatRelativeTime(entry.createdAt)}
  type={entry.type}
  invoiceId={entry.invoice}
  navigation={navigation}
/>

              ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

/* ---------- SMALL COMPONENTS ---------- */

function SectionHeader({ title }) {
  return (
    <View style={sectionHeaderStyles.wrap}>
      <Text style={sectionHeaderStyles.text}>{title}</Text>
    </View>
  );
}

function InfoRow({ label, value }) {
  return (
    <View style={infoRowStyles.row}>
      <Text style={infoRowStyles.label}>{label}</Text>
      <Text style={infoRowStyles.value} numberOfLines={2}>
        {value}
      </Text>
    </View>
  );
}

function QuickAction({ icon, label, onPress, disabled }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[quickActionStyles.wrap, disabled && { opacity: 0.35 }]}
    >
      <View style={quickActionStyles.iconCircle}>
        <Ionicons name={icon} size={20} color="#fff" />
      </View>
      <Text style={quickActionStyles.label}>{label}</Text>
    </TouchableOpacity>
  );
}

function TimelineItem({
  icon,
  title,
  subtitle,
  time,
  type,
  invoiceId,
  navigation,
}) {
  const isInvoice = type === "invoice" && invoiceId;

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      disabled={!isInvoice}
      onPress={() => {
        if (isInvoice) {
          navigation.navigate("InvoicePreview", {
            invoiceId,
          });
        }
      }}
    >
      <View style={timelineStyles.row}>
        <View style={timelineStyles.iconColumn}>
          <View style={timelineStyles.iconCircle}>
            <Ionicons name={icon} size={16} color="#fff" />
          </View>
          <View style={timelineStyles.verticalLine} />
        </View>

        <View style={timelineStyles.textColumn}>
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Text style={timelineStyles.title}>{title}</Text>

            {isInvoice && (
              <Ionicons
                name="chevron-forward"
                size={13}
                color="#C7C7CC"
                style={{ marginLeft: 6 }}
              />
            )}
          </View>

          {!!subtitle && (
            <Text style={timelineStyles.subtitle} numberOfLines={2}>
              {subtitle}
            </Text>
          )}
          <Text style={timelineStyles.time}>{time}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}


/* ---------- STYLES (unchanged visuals) ---------- */

const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    height: 92,
    paddingTop: Platform.OS === "ios" ? 12 : 8,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 8,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },

  headerSide: {
    flexDirection: "row",
    alignItems: "center",
    width: 90,
  },

  headerSideRight: {
    width: 60,
    alignItems: "flex-end",
  },

  headerBackText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#007AFF",
    marginLeft: 2,
  },

  headerCenter: { flex: 1, alignItems: "center" },

  headerTitle: { fontSize: 17, fontWeight: "700" },

  topContainer: { paddingHorizontal: 16, marginBottom: 8 },

  gradientCard: {
    borderRadius: 22,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    shadowColor: "#00A6FF",
    shadowRadius: 18,
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 10 },
  },

  topRow: { flexDirection: "row", alignItems: "center" },

  avatarBig: {
    width: 66,
    height: 66,
    borderRadius: 33,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
  },

  avatarBigText: { fontSize: 24, fontWeight: "800", color: "#FFFFFF" },

  topTextBlock: { flex: 1 },

  clientNameBig: {
    fontSize: 20,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  clientCompanyBig: {
    marginTop: 2,
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(255,255,255,0.86)",
  },

  clientTagLine: {
    marginTop: 4,
    fontSize: 12,
    fontWeight: "500",
    color: "rgba(255,255,255,0.78)",
  },

  statsRow: { flexDirection: "row", marginTop: 14 },

  statItem: { flex: 1 },

  statLabel: {
    fontSize: 11,
    fontWeight: "600",
    color: "rgba(255,255,255,0.78)",
    textTransform: "uppercase",
    letterSpacing: 0.3,
    marginBottom: 2,
  },

  statValue: { fontSize: 16, fontWeight: "800", color: "#FFFFFF" },

  statValueSmall: { fontSize: 13, fontWeight: "600", color: "#FFFFFF" },

  actionsRowOuter: { paddingHorizontal: 16, marginTop: 10 },

  actionsRow: {
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
    flexDirection: "row",
    justifyContent: "space-between",
  },

  sectionContainer: { paddingHorizontal: 16, marginTop: 16 },

  sectionCard: {
    borderRadius: 18,
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },

  notesText: { fontSize: 13, lineHeight: 18, marginTop: 4 },
});

const sectionHeaderStyles = StyleSheet.create({
  wrap: { paddingVertical: 4, marginBottom: 4 },
  text: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
    color: "#8E8E93",
  },
});

const infoRowStyles = StyleSheet.create({
  row: { flexDirection: "row", paddingVertical: 6 },
  label: { width: 90, fontSize: 13, fontWeight: "600", color: "#8E8E93" },
  value: { flex: 1, fontSize: 14, fontWeight: "500" },
});

const quickActionStyles = StyleSheet.create({
  wrap: { alignItems: "center", flex: 1 },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: HELP_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
    color: "#007AFF",
  },
});

const timelineStyles = StyleSheet.create({
  row: { flexDirection: "row", paddingVertical: 8 },
  iconColumn: { width: 26, alignItems: "center" },
  iconCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: HELP_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 2,
  },
  verticalLine: {
    flex: 1,
    width: 1,
    backgroundColor: "rgba(0,0,0,0.1)",
    marginTop: 4,
  },
  textColumn: { flex: 1, paddingLeft: 6 },
  title: { fontSize: 13, fontWeight: "700" },
  subtitle: { fontSize: 12, fontWeight: "500", color: "#8E8E93", marginTop: 2 },
  time: { fontSize: 11, fontWeight: "500", color: "#8E8E93", marginTop: 2 },
});