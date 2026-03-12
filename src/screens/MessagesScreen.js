// src/screens/MessagesScreen.js
import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRoute, useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import { BlurView } from "expo-blur";
import { useTheme } from "../ThemeContext";
import { api } from "../config/api";
import IosAvatar from "../components/IosAvatar";
import useAuthStore from "../store/auth";
import { io } from "socket.io-client";



const HELP_IO_BLUE = "#00A6FF";

export default function MessagesScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const socketRef = useRef(null);
  const { darkMode, theme } = useTheme();

  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  /* ---------------- Large Title Animation ---------------- */
  const scrollY = useRef(new Animated.Value(0)).current;

const user = useAuthStore((s) => s.user);

  
  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const titleTranslate = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, -34],
    extrapolate: "clamp",
  });

  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  /* ---------------- Fetch Messages ---------------- */
  const fetchMessages = React.useCallback(async () => {
  try {
    setLoading(true);

    const res = await api.get("/api/conversations");
    const conversations = res.data?.conversations || [];

   const mapped = conversations.map((c) => {
  const isServiceChat = !!c.serviceId;

// 🔥 TRUE logged-in identity (provider OR customer)
const myId =
  (user?.providerId || user?.customerId || "").toString();

const providerId = c.providerId?.toString();
const customerId = c.customerId?.toString();

const isUnread = c.unread;

let displayName = "Conversation";
let avatar = null;
let phone = null;

// 🧠 Always show the OTHER participant
if (myId === providerId) {
  // I am the provider in THIS conversation → show customer
  displayName =
    c.customer?.name ||
    c.customer?.phone ||
    "New Customer";

  avatar = c.customer?.avatar || null;
  phone = c.customer?.phone || null;

} else if (myId === customerId) {
  // I am the customer in THIS conversation → show provider
  displayName =
    c.provider?.businessName ||
    c.provider?.name ||
    "Business";

  avatar = c.provider?.avatar || null;
  phone = c.provider?.phone || null;

} else {
  // Fallback safety
  displayName =
    c.provider?.businessName ||
    c.customer?.name ||
    "Conversation";
}
  return {
    _id: c._id,
    customerId: c.customerId,
    serviceId: c.serviceId,
    providerId: c.providerId || null,

    name: displayName, // ✅ correct placement

   avatar,
phone,


    lastMsg: c.lastMessageText || "Start of conversation",

    unread: isUnread,

    time: new Date(c.updatedAt).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    }),
  };
});


    setMessages(mapped);
  } catch (err) {
    console.log("❌ Fetch conversations error:", err);
  } finally {
    setLoading(false);
    setRefreshing(false);
  }
}, [user?._id, user?.providerId]);

useEffect(() => {
  socketRef.current = io("https://helpio-backend.onrender.com", {
    transports: ["websocket"],
  });

  // 🔥 JOIN ONLY THE REAL ID USED BY BACKEND
  if (user?.providerId) {
    socketRef.current.emit("joinUserRoom", user.providerId.toString());
  }

  if (user?.customerId) {
    socketRef.current.emit("joinUserRoom", user.customerId.toString());
  }

  // ❌ REMOVE _id JOIN — THIS IS CAUSING THE ISSUE
  // socketRef.current.emit("joinUserRoom", user._id);

  return () => {
    socketRef.current?.disconnect();
  };
}, [user]);


useEffect(() => {
  if (!socketRef.current) return;

  socketRef.current.on("newMessage", (msg) => {
  console.log("📩 New message received in MessagesScreen");

  setMessages((prev) => {
    const updated = [...prev];

    const index = updated.findIndex(
      (c) => c._id === msg.conversationId
    );

    if (index !== -1) {
      // Update existing conversation
      updated[index] = {
        ...updated[index],
        lastMsg: msg.text || "📷 Photo",
        unread: true,
        time: new Date().toLocaleTimeString([], {
          hour: "numeric",
          minute: "2-digit",
        }),
      };

      // Move it to the top
      const convo = updated.splice(index, 1)[0];
      updated.unshift(convo);
    } else {
      // If conversation isn't in list yet, fetch once
      fetchMessages();
      return prev;
    }

    return updated;
  });
});

  return () => {
    socketRef.current.off("newMessage");
  };
}, [fetchMessages]);

useEffect(() => {
  console.log("👤 CUSTOMER USER OBJECT:", user);
}, [user]);


 useFocusEffect(
  React.useCallback(() => {
    fetchMessages();
  }, [fetchMessages])
);



  const onRefresh = () => {
    setRefreshing(true);
    fetchMessages();
  };

  const filteredMessages = messages.filter(m =>
  (m.name || "")
    .toLowerCase()
    .includes(search.toLowerCase())
);




  /* ---------------- UI ---------------- */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
      {/* Blurred NAVBAR when scrolled */}
      <Animated.View
        style={[
          styles.navBlurContainer,
          { opacity: headerOpacity },
        ]}
      >
        <BlurView
          intensity={60}
          tint={darkMode ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <Text
          style={[
            styles.navTitle,
            { color: theme.text },
          ]}
        >
          Messages
        </Text>
      </Animated.View>

      {/* MAIN CONTENT */}
      <Animated.ScrollView
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={HELP_IO_BLUE}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* LARGE TITLE */}
        <Animated.View
          style={[
            styles.largeTitleBlock,
            {
              opacity: largeTitleOpacity,
              transform: [{ translateY: titleTranslate }],
            },
          ]}
        >
          <Text style={[styles.largeTitle, { color: theme.text }]}>
            Messages
          </Text>

          {/* FLOATING SEARCH BAR */}
          <View
            style={[
              styles.searchContainer,
              {
                backgroundColor: theme.card,
                shadowOpacity: darkMode ? 0 : 0.08,
              },
            ]}
          >
            <Ionicons name="search" size={18} color={theme.subtleText} />
            <TextInput
              placeholder="Search"
              placeholderTextColor={theme.subtleText}
              style={[styles.searchInput, { color: theme.text }]}
              value={search}
              onChangeText={setSearch}
            />
          </View>
        </Animated.View>

        {/* LIST */}
        {loading ? (
          <ActivityIndicator
            size="large"
            color={HELP_IO_BLUE}
            style={{ marginTop: 80 }}
          />
        ) : filteredMessages.length === 0 ? (
          <Text style={[styles.empty, { color: theme.subtleText }]}>
            No messages found.
          </Text>
        ) : (
          <View style={{ marginTop: 20 }}>
            {filteredMessages.map((msg) => (
           <TouchableOpacity
  key={msg._id}
  activeOpacity={0.65}
  style={[styles.messageRow, { backgroundColor: theme.card }]}
  onPress={() =>
    navigation.navigate("ChatDetail", {
      conversationId: msg._id,
      providerId: msg.providerId || null,
      serviceId: msg.serviceId || null,
      name: msg.name || "Customer",
      avatar: msg.avatar || null,
      phoneNumber: msg.phone || null,
    })
  }
>
  {/* ✅ Fixed avatar column */}
  <View style={styles.avatarWrapper}>
    {msg.avatar ? (
      <Image source={{ uri: msg.avatar }} style={styles.avatar} />
    ) : (
      <IosAvatar name={msg.name} size={54} />
    )}
  </View>



                <View style={{ flex: 1 }}>
                  <Text
                    style={[
                      styles.name,
                      {
                        color: theme.text,
                        fontWeight: msg.unread ? "800" : "600",
                      },
                    ]}
                  >
                    {msg.name || "Customer"}
                  </Text>

                  <Text
                    numberOfLines={1}
                    style={[
                      styles.lastMsg,
                      {
                        color: msg.unread
                          ? theme.text
                          : theme.subtleText,
                        fontWeight: msg.unread ? "600" : "400",
                      },
                    ]}
                  >
                    {msg.lastMsg}
                  </Text>
                </View>

                <View style={{ alignItems: "flex-end" }}>
                  <Text
                    style={[
                      styles.time,
                      { color: theme.subtleText },
                    ]}
                  >
                    {msg.time}
                  </Text>

                  {msg.unread && (
                    <View style={styles.unreadDot} />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  /* Nav Blur */
  navBlurContainer: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 90,
    justifyContent: "flex-end",
    paddingBottom: 10,
    alignItems: "center",
    zIndex: 50,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "600",
    marginBottom: 4,
  },

  /* Large Title */
  largeTitleBlock: {
    paddingHorizontal: 18,
    paddingTop: 18,
    marginBottom: 10,
  },
  largeTitle: {
    fontSize: 38,
    fontWeight: "800",
    letterSpacing: -0.6,
    marginBottom: 18,
  },

  /* Search */
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 14,
    paddingHorizontal: 14,
    height: 46,
    shadowColor: "#000",
    elevation: 3,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    marginLeft: 8,
  },

  /* Row */
  messageRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },


avatarWrapper: {
  width: 60,        // 👈 creates the invisible iOS grid column
  alignItems: "center",
  marginRight: 6,
},

avatar: {
  width: 54,
  height: 54,
  borderRadius: 27,
},



  
  name: {
    fontSize: 16,
  },
  lastMsg: {
    marginTop: 2,
    fontSize: 14,
  },
  time: {
    fontSize: 12,
    marginBottom: 6,
  },
  unreadDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: HELP_IO_BLUE,
    marginTop: 4,
  },

  empty: {
    textAlign: "center",
    marginTop: 80,
    fontSize: 16,
    fontWeight: "600",
  },
});


