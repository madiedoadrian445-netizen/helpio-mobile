// src/screens/ClientsScreen.js
import React, {
  useMemo,
  useState,
  useEffect,
  useCallback,
} from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  Platform,
  RefreshControl,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../ThemeContext";
import { API_BASE_URL } from "../config/api";
import { useFocusEffect } from "@react-navigation/native"; // ⭐ ADDED

const HELP_BLUE = "#00A6FF";

export default function ClientsScreen({ navigation }) {
  const { darkMode, theme } = useTheme();

  const [query, setQuery] = useState("");
  const [sortMode, setSortMode] = useState("recent");
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const getToken = async () => {
    return await AsyncStorage.getItem("token");
  };

  const loadCustomers = useCallback(async () => {
    try {
      setLoading(true);
      const token = await getToken();

      const res = await fetch(`${API_BASE_URL}/api/customers`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setCustomers(data.customers || []);
      }
    } catch (err) {
      console.log("Error loading customers:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  /* -----------------------------------------------------
     ⭐ AUTO-REFRESH WHEN RETURNING TO THIS SCREEN
  ----------------------------------------------------- */
  useFocusEffect(
    useCallback(() => {
      loadCustomers();
    }, [loadCustomers])
  );

  const filteredClients = useMemo(() => {
    let list = [...customers];
    const q = query.trim().toLowerCase();

    if (q.length) {
      list = list.filter((c) => {
        const name = c.name?.toLowerCase() || "";
        const email = c.email?.toLowerCase() || "";
        const phone = c.phone?.toLowerCase() || "";
        return (
          name.includes(q) ||
          email.includes(q) ||
          phone.includes(q)
        );
      });
    }

    if (sortMode === "az") {
      list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
    } else if (sortMode === "recent") {
      list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }

    return list;
  }, [query, sortMode, customers]);

  const renderClient = ({ item }) => {
    const initials = (item.name || "")
      .split(" ")
      .map((p) => p[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);

    return (
      <TouchableOpacity
        style={[
          styles.clientRow,
          {
            backgroundColor: theme.card,
            shadowOpacity: darkMode ? 0 : 0.06,
          },
        ]}
        activeOpacity={0.9}
        onPress={() =>
          navigation.navigate("ClientProfile", { client: item })
        }
      >
        <View
          style={[
            styles.avatar,
            {
              backgroundColor: darkMode
                ? "rgba(255,255,255,0.05)"
                : "rgba(0,0,0,0.04)",
            },
          ]}
        >
          <Text style={styles.avatarText}>{initials}</Text>
        </View>

        <View style={styles.clientInfo}>
          <View style={styles.clientTopRow}>
            <Text
              style={[styles.clientName, { color: theme.text }]}
              numberOfLines={1}
            >
              {item.name}
            </Text>
          </View>

          {item.email ? (
            <Text
              style={[styles.companyText, { color: theme.subtleText }]}
              numberOfLines={1}
            >
              {item.email}
            </Text>
          ) : null}

          <Text style={[styles.metaText, { color: theme.subtleText }]}>
            {item.phone || "No phone"}
          </Text>
        </View>

        <Ionicons
          name="chevron-forward"
          size={20}
          color={darkMode ? "#7C7C80" : "#C1C1C6"}
        />
      </TouchableOpacity>
    );
  };

  function SortChip({ label, mode }) {
    const active = sortMode === mode;
    return (
      <TouchableOpacity
        onPress={() => setSortMode(mode)}
        style={[
          styles.sortChip,
          {
            backgroundColor: active
              ? darkMode
                ? "rgba(0,166,255,0.25)"
                : "rgba(0,166,255,0.16)"
              : darkMode
              ? "rgba(255,255,255,0.04)"
              : "rgba(0,0,0,0.04)",
            borderColor: active ? HELP_BLUE : "transparent",
          },
        ]}
      >
        <Text
          style={[
            styles.sortLabel,
            { color: active ? HELP_BLUE : theme.subtleText },
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: theme.background }]}
    >
      <BlurView intensity={50} tint={theme.blurTint} style={styles.header}>
        <View style={styles.headerSide}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            Clients
          </Text>
        </View>

        <Text
          style={[styles.headerSubtitleAbsolute, { color: theme.subtleText }]}
        >
          CRM • Helpio BusinessPlace
        </Text>

        <TouchableOpacity
          style={styles.headerSideRight}
          onPress={() => navigation.navigate("AddClient")}
        >
          <View style={styles.addButton}>
            <Ionicons name="add" size={22} color="#fff" />
          </View>
        </TouchableOpacity>
      </BlurView>

      <View style={styles.content}>
        <View
          style={[
            styles.searchBar,
            {
              backgroundColor: darkMode
                ? "rgba(255,255,255,0.06)"
                : "rgba(0,0,0,0.04)",
            },
          ]}
        >
          <Ionicons
            name="search"
            size={18}
            color={darkMode ? "#8E8E93" : "#A1A1A6"}
          />
          <TextInput
            style={styles.searchInput}
            placeholder="Search clients…"
            placeholderTextColor={darkMode ? "#8E8E93" : "#A1A1A6"}
            value={query}
            onChangeText={setQuery}
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={() => setQuery("")}>
              <Ionicons
                name="close-circle"
                size={18}
                color={darkMode ? "#8E8E93" : "#A1A1A6"}
              />
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.sortRow}>
          <SortChip label="Recent" mode="recent" />
          <SortChip label="A–Z" mode="az" />
        </View>

        <FlatList
          data={filteredClients}
          keyExtractor={(item) => item._id}
          renderItem={renderClient}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
            />
          }
          contentContainerStyle={{
            paddingBottom: 40,
            paddingTop: 6,
          }}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
        />
      </View>
    </SafeAreaView>
  );
}

/* ---------- ORIGINAL STYLES (unchanged) ---------- */
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
    paddingHorizontal: 16,
    paddingBottom: 10,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },

  headerSide: {
    width: 110,
    justifyContent: "flex-end",
  },

  headerSideRight: {
    width: 60,
    alignItems: "flex-end",
    justifyContent: "flex-end",
  },

  headerCenter: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
  },

  headerTitle: {
    fontSize: 22,
    fontWeight: "800",
    marginBottom: -5,
  },

  headerSubtitleAbsolute: {
    position: "absolute",
    left: 0,
    right: 0,
    top: Platform.OS === "ios" ? 68 : 58,
    textAlign: "center",
    fontSize: 13,
    fontWeight: "600",
  },

  addButton: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: HELP_BLUE,
    shadowColor: "#00A6FF",
    shadowRadius: 10,
    shadowOpacity: 0.45,
    shadowOffset: { width: 0, height: 5 },
    marginBottom: -12,
  },

  content: {
    flex: 1,
    paddingTop: 96,
    paddingHorizontal: 14,
  },

  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 10,
    height: 38,
    marginBottom: 12,
  },

  searchInput: {
    flex: 1,
    marginHorizontal: 6,
    fontSize: 15,
    fontWeight: "500",
  },

  sortRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },

  sortChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    marginRight: 8,
    borderWidth: 1,
  },

  sortLabel: {
    fontSize: 12,
    fontWeight: "600",
  },

  clientRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000",
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 5 },
  },

  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },

  avatarText: {
    fontSize: 17,
    fontWeight: "700",
    color: HELP_BLUE,
  },

  clientInfo: {
    flex: 1,
  },

  clientTopRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },

  clientName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
  },

  revenueText: {
    fontSize: 13,
    fontWeight: "700",
    color: "#007AFF",
    marginLeft: 6,
  },

  companyText: {
    fontSize: 13,
    fontWeight: "500",
    marginBottom: 4,
  },

  metaRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  tagChip: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },

  tagText: {
    fontSize: 11,
    fontWeight: "600",
    color: HELP_BLUE,
  },

  metaSpacer: {
    flex: 1,
  },

  metaText: {
    fontSize: 11,
    fontWeight: "500",
  },
});
