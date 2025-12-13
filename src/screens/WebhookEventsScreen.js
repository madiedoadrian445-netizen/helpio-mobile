import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  ScrollView,
} from "react-native";
import { api } from "../config/api";
import { Ionicons } from "@expo/vector-icons";

export default function WebhookEventsScreen() {
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [selected, setSelected] = useState(null);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/webhooks/events?limit=40");
      setEvents(res.data.events);
      setPagination(res.data.pagination);
    } catch (err) {
      console.error("Webhook fetch error:", err);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => setSelected(item)}
    >
      <View style={styles.rowLeft}>
        <Text style={styles.type}>{item.type}</Text>
        <Text style={styles.eventId}>{item.eventId}</Text>
      </View>

      <Text
        style={[
          styles.status,
          item.status === "completed"
            ? styles.ok
            : item.status === "failed"
            ? styles.fail
            : styles.progress,
        ]}
      >
        {item.status}
      </Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Stripe Webhook Events</Text>

      {loading ? (
        <ActivityIndicator color="#00A6FF" size="large" />
      ) : (
        <FlatList
          data={events}
          renderItem={renderItem}
          keyExtractor={(item) => item.eventId}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      )}

      {/* Modal */}
      <Modal visible={!!selected} animationType="slide">
        <View style={styles.modal}>
          <TouchableOpacity
            style={styles.close}
            onPress={() => setSelected(null)}
          >
            <Ionicons name="close" size={35} color="#000" />
          </TouchableOpacity>

          <ScrollView>
            <Text style={styles.modalTitle}>Event Detail</Text>

            <Text style={styles.label}>Event ID</Text>
            <Text style={styles.value}>{selected?.eventId}</Text>

            <Text style={styles.label}>Type</Text>
            <Text style={styles.value}>{selected?.type}</Text>

            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{selected?.status}</Text>

            <Text style={styles.label}>Created</Text>
            <Text style={styles.value}>{selected?.createdAt}</Text>

            <Text style={styles.label}>Payload</Text>
            <Text style={styles.code}>
              {JSON.stringify(selected?.payload, null, 2)}
            </Text>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#FFF" },
  title: {
    fontSize: 26,
    fontWeight: "700",
    marginBottom: 20,
    color: "#000",
  },

  row: {
    backgroundColor: "#F7F7F7",
    padding: 14,
    marginBottom: 10,
    borderRadius: 12,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rowLeft: {},
  type: { fontSize: 16, fontWeight: "600", color: "#000" },
  eventId: { fontSize: 12, color: "#666" },

  status: { fontWeight: "700", fontSize: 14 },
  ok: { color: "#2ECC71" },
  fail: { color: "#E74C3C" },
  progress: { color: "#F1C40F" },

  modal: { flex: 1, backgroundColor: "#FFF", padding: 20 },
  close: { alignSelf: "flex-end" },
  modalTitle: { fontSize: 22, marginBottom: 20, fontWeight: "700" },

  label: { fontWeight: "700", marginTop: 15 },
  value: { fontSize: 14, marginBottom: 10 },

  code: {
    backgroundColor: "#EEE",
    padding: 12,
    borderRadius: 10,
    marginTop: 10,
    color: "#333",
    fontFamily: "Courier",
  },
});
