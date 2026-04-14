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
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import { API_BASE_URL } from "../config/api";
import { useFocusEffect } from "@react-navigation/native"; // ⭐ ADDED
import useAuthStore from "../store/auth";
import IosAvatar from "../components/IosAvatar";
import { LinearGradient } from "expo-linear-gradient";


const HELP_BLUE = "#00A6FF";




export default function ClientsScreen({ navigation, route }) {
const isPicker =
  route?.params?.selectMode || route?.params?.isPicker;

  
  const onSelect = route?.params?.onSelect;

const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  const cleaned = phone.replace(/\D/g, "");

  if (cleaned.length !== 10) return phone;

  const area = cleaned.slice(0, 3);
  const middle = cleaned.slice(3, 6);
  const last = cleaned.slice(6);

  return `(${area}) ${middle}-${last}`;
};


  const { darkMode, theme } = useTheme();

  const [query, setQuery] = useState("");

  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

 const token = useAuthStore((state) => state.token);

const loadCustomers = useCallback(async () => {
  try {
    setLoading(true);

    // ✅ Use Zustand token (already declared above)
    if (!token) {
      console.log("❌ No token in Zustand");
      setCustomers([]);
      return;
    }

    const res = await fetch(`${API_BASE_URL}/api/customers`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    console.log("🔥 CLIENTS RESPONSE:", data);

    if (data.success) {
      const list =
        data.customers ||
        data.customer ||
        data.customerData ||
        [];

      setCustomers(Array.isArray(list) ? list : []);
    } else {
      console.log("❌ API ERROR:", data.message);
      setCustomers([]);
    }

  } catch (err) {
    console.log("Error loading customers:", err);
  } finally {
    setLoading(false);
  }
}, [token]); // ✅ IMPORTANT

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCustomers();
    setRefreshing(false);
  };

 useEffect(() => {
  if (token) {
    loadCustomers();
  }
}, [token]);


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

    // 🍏 Apple-style: always sort by name
list.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return list;
}, [query, customers]);

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
       
       
        onPress={() => {
  if (isPicker && onSelect) {
    onSelect(item);
    navigation.goBack();
  } else {
    navigation.navigate("ClientProfile", { client: item });
  }
}}


      >
     <View style={{ marginRight: 10 }}>
  <IosAvatar name={item.name} size={44} />
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
  {item.phone ? formatPhoneNumber(item.phone) : "No phone"}
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



function EmptyClientsState({ navigation, darkMode, theme, isPicker, onSelect }) {
  return (
    <View style={styles.emptyWrap}>
    <View
  style={[
    styles.emptyAvatarWrap,
    {
      backgroundColor: darkMode
        ? "rgba(255,255,255,0.06)"
        : "rgba(0,0,0,0.04)",
    },
  ]}
>
  <Ionicons
    name="person"
    size={38}
    color={darkMode ? "#8E8E93" : "#8E8E93"}
  />
</View>

      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        No clients yet
      </Text>

      <Text style={[styles.emptySubtitle, { color: theme.subtleText }]}>
        Add your first client to start managing invoices and jobs.
      </Text>

      <TouchableOpacity
        style={styles.emptyButton}
     onPress={() =>
  navigation.navigate("AddClient", {
    fromPicker: isPicker,
    onSelect: onSelect,
  })
}
      >
        <Text style={styles.emptyButtonText}>Add Client</Text>
      </TouchableOpacity>
    </View>
  );
}




  return (
  <View style={{ flex: 1 }}>

   <LinearGradient
  colors={["#EEF0F6", "#F2F2F7", "#F7F8FC"]}
  locations={[0, 0.5, 1]}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  style={StyleSheet.absoluteFill}
/>
    <SafeAreaView style={styles.safe}>

  <View
  style={[
    styles.header,
    {
      top: route?.params?.isPicker ? 45 : 0,
    },
  ]}
>
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
 onPress={() =>
  navigation.navigate("AddClient", {
    fromPicker: isPicker,
    onSelect: onSelect,
  })
}
    style={styles.quickAddBtn}
  >
    <BlurView intensity={40} tint={darkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
  <Ionicons name="add" size={22} color="#fff" />
  </TouchableOpacity>


     </View>



    <View
  style={[
    styles.content,
    {
      paddingTop: route?.params?.isPicker ? 160 : 60,
    },
  ]}
>

  {/* 🔒 TOP CONTROLS */}
  <View style={styles.controlsWrap}>

   
    
    {/* Search */}
<View style={styles.searchRow}>

  {/* Search Pill */}
  <View style={styles.searchPill}>
    
    <BlurView intensity={35} tint={darkMode ? "dark" : "light"} style={StyleSheet.absoluteFill} />
    <View style={styles.searchInnerLight} />
    <View style={styles.searchPillTint} />

    <Ionicons
      name="search"
      size={17}
      color="#8E8E93"
      style={{ marginRight: 8 }}
    />

    <TextInput
      value={query}
      onChangeText={setQuery}
      placeholder="Search clients"
      placeholderTextColor="#9CA3AF"
      style={[
        styles.searchInputNew,
        { color: theme.text }
      ]}
    />

    {query.length > 0 && (
      <TouchableOpacity onPress={() => setQuery("")}>
        <Ionicons name="close-circle" size={18} color="#9CA3AF" />
      </TouchableOpacity>
    )}
  </View>

  {/* Optional quick add button */}
 

</View>

    {/* Sort */}
   

  </View>

  {/* 📄 CONTACTS LIST */}
 <FlatList
  data={filteredClients}
  keyExtractor={(item) => item._id}
  renderItem={renderClient}

 ListEmptyComponent={
  !loading && filteredClients.length === 0 ? (
   <EmptyClientsState
  navigation={navigation}
  darkMode={darkMode}
  theme={theme}
  isPicker={isPicker}
  onSelect={onSelect}
/>


  ) : null
}

  contentContainerStyle={{
    flexGrow: 1, // 🔥 important
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 40,
  }}

  showsVerticalScrollIndicator={false}
  keyboardShouldPersistTaps="handled"
  ItemSeparatorComponent={() => <View style={{ height: 8 }} />}
/>

</View>

      </SafeAreaView>
  </View>

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




emptyAvatarWrap: {
  width: 90,
  height: 90,
  borderRadius: 45,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 18,
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
  paddingTop: 60, // << FIX
  paddingHorizontal: 0,
},



controlsWrap: {
  paddingHorizontal: 14,
  marginBottom: 6,
},

dashboardButton: {
  alignSelf: "flex-start",
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.05)",
  paddingHorizontal: 12,
  paddingVertical: 8,
  borderRadius: 12,
  marginBottom: 10,
},

dashboardLabel: {
  fontSize: 14,
  fontWeight: "700",
},










searchRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  marginBottom: 12,
},

searchPill: {
  flex: 1,
  height: 44,
  borderRadius: 999,
  overflow: "hidden",
  paddingHorizontal: 14,
  flexDirection: "row",
  alignItems: "center",

 borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 1)",

  shadowColor: "#fff",
  shadowOpacity: 0.25,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: -1 },

  elevation: 2,
},

searchPillTint: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(255,255,255,0.58)",
},


searchInputNew: {
  flex: 1,
  fontSize: 16,
  fontWeight: "500",
},

quickAddBtn: {
  position: "absolute",
  right: 16,
  top: Platform.OS === "ios" ? 58 : 50,

  width: 42,
  height: 42,
  borderRadius: 21,

  overflow: "hidden", // 🔥 THIS FIXES IT

  alignItems: "center",
  justifyContent: "center",

  backgroundColor: HELP_BLUE,

  shadowColor: "#00A6FF",
  shadowRadius: 10,
  shadowOpacity: 0.45,
  shadowOffset: { width: 0, height: 5 },

  elevation: 6,
},











 


searchInnerLight: {
  position: "absolute",
  top: 0,
  left: 0,
  right: 0,
  height: "50%",
  backgroundColor: "rgba(255,255,255,0.30)",
  borderTopLeftRadius: 999,
  borderTopRightRadius: 999,
},



emptyWrap: {
  flex: 1,
  alignItems: "center",
  justifyContent: "flex-start",
  paddingHorizontal: 32,
  marginTop: 100,
},

emptyIcon: {
  width: 90,
  height: 90,
  borderRadius: 45,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 18,
},

emptyTitle: {
  fontSize: 20,
  fontWeight: "700",
  marginBottom: 6,
},

emptySubtitle: {
  fontSize: 14,
  textAlign: "center",
  marginBottom: 20,
},

emptyButton: {
  backgroundColor: "#00A6FF",
  paddingHorizontal: 18,
  paddingVertical: 10,
  borderRadius: 20,
},

emptyButtonText: {
  color: "#fff",
  fontWeight: "700",
  fontSize: 14,
},






glassAddBtn: {
  height: 36,
  width: 36,
  borderRadius: 18,
  overflow: "hidden",

  alignItems: "center",
  justifyContent: "center",

  borderWidth: StyleSheet.hairlineWidth,
  borderColor: "rgba(0,0,0,0.06)",

  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 5 },
  elevation: 2,
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
