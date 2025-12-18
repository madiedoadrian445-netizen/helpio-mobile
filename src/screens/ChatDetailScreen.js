// src/screens/ChatDetailScreen.js
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Animated,
  Keyboard,
  Platform,
  Easing,
  KeyboardAvoidingView,
  Dimensions,
  Modal,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import PhoneBlurIcon from "../../assets/images/phone_blur.png";
import SaveBlurIcon from "../../assets/images/save_blur.png";
import { useFocusEffect } from "@react-navigation/native";
import { api } from "../config/api";
import useAuthStore from "../store/auth";






const { width, height } = Dimensions.get("window");
const HELP_BLUE = "#00A6FF";
const IOS_GRAY_BUBBLE = "#E9E9EB";
const IOS_BACKGROUND = "#FFFFFF";
const IOS_LABEL = "#333333ff";

/* ----------------- Avatar Helper Function ----------------- */
const getAvatarContent = (name, photoUri) => {
  if (photoUri) return { type: "image", value: photoUri };
  const letter = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  return { type: "letter", value: letter };
};
/* ----------------------------------------------------------- */

const isSameDay = (a, b) => {
  const da = new Date(a),
    db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear() &&
    da.getMonth() === db.getMonth() &&
    da.getDate() === db.getDate()
  );
};

const formatDayHeader = (ts) => {
  const d = new Date(ts);
  const now = new Date();
  const isThisYear = d.getFullYear() === now.getFullYear();
  return d.toLocaleDateString(
    "en-US",
    isThisYear
      ? { month: "long", day: "numeric" }
      : { month: "long", day: "numeric", year: "numeric" }
  );
};

// iOS-style time (3:01 PM)
const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
};

export default function ChatDetailScreen({ route, navigation }) {
const providerId = route?.params?.providerId || null;
const serviceId = route?.params?.serviceId || null;


useEffect(() => {
    const token = useAuthStore.getState().token;
    console.log("🔑 AUTH TOKEN:", token);
  }, []);

  const { name } = route.params || {};
  const displayName = name || "Chat";
  const company = route?.params?.companyName || route?.params?.name || "";
  const phoneNumber = route?.params?.phoneNumber || route?.params?.phone || "";



const initialConversationId = route?.params?.conversationId || null;



const [conversationId, setConversationId] = useState(initialConversationId);
const [nextCursor, setNextCursor] = useState(null);
const [loadingHistory, setLoadingHistory] = useState(true);
const [sending, setSending] = useState(false);



  const [message, setMessage] = useState("");
 
  const [userScrolled, setUserScrolled] = useState(false);
  const [viewerVisible, setViewerVisible] = useState(false);
  const [viewerImages, setViewerImages] = useState([]);
  const [viewerIndex, setViewerIndex] = useState(0);
  const [inputBarHeight, setInputBarHeight] = useState(0);

  // call / hint state
  const [hasSentMessage, setHasSentMessage] = useState(false);
  const [showCallHint, setShowCallHint] = useState(false);
  const listRef = useRef(null);
  const keyboardAnim = useRef(new Animated.Value(0)).current;
  const callOpacity = useRef(new Animated.Value(0.4)).current;
  const callHintTimeout = useRef(null);

  const [data, setData] = useState([]);

const mapMessageFromApi = useCallback((m) => {
  const auth = useAuthStore.getState();
  const isProvider = !!auth.user?.providerId;

  return {
    id: m._id,
    sender:
      (isProvider && m.senderRole === "provider") ||
      (!isProvider && m.senderRole === "customer")
        ? "me"
        : "them",
    text: m.text || null,
    images: m.imageUrls?.length ? m.imageUrls : null,
    at: new Date(m.createdAt).getTime(),
    deliveredAt: m.deliveredAt,
    readAt: m.readAt,
  };
}, []);


  /* ----------------- Keyboard Animation ----------------- */
  useEffect(() => {
    const show = Keyboard.addListener("keyboardWillShow", (e) => {
      Animated.timing(keyboardAnim, {
        toValue: e.endCoordinates.height,
        duration: e.duration || 180,
        easing: Easing.out(Easing.poly(4)),
        useNativeDriver: false,
      }).start();
    });

    const hide = Keyboard.addListener("keyboardWillHide", (e) => {
      Animated.timing(keyboardAnim, {
        toValue: 0,
        duration: e.duration || 180,
        easing: Easing.out(Easing.poly(4)),
        useNativeDriver: false,
      }).start();
    });
    return () => {
      show.remove();
      hide.remove();
    };
  }, [keyboardAnim]);



  
  /* ----------------- Call Icon Lock ----------------- */
  useEffect(() => {
    if (hasSentMessage) {
      Animated.timing(callOpacity, {
        toValue: 1,
        duration: 260,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }).start();
    } else {
      callOpacity.setValue(0.4);
    }
  }, [hasSentMessage, callOpacity]);

  useEffect(() => {
    return () => {
      if (callHintTimeout.current) clearTimeout(callHintTimeout.current);
    };
  }, []);



  /* ----------------- Row Builder ----------------- */
  const rows = useMemo(() => {
    const out = [];
    data.forEach((m, i) => {
      const prev = data[i - 1];
      if (!prev || !isSameDay(prev.at, m.at))
        out.push({ type: "day", id: `d-${m.id}`, at: m.at });

      out.push({ type: "msg", ...m });
    });

    return out;
  }, [data]);

  /* ----------------- Scroll To Bottom ----------------- */
  const scrollToBottom = useCallback(() => {
    requestAnimationFrame(() => {
      listRef.current?.scrollToEnd({ animated: true });
    });
  }, []);

const openConversation = useCallback(async () => {
  if (conversationId) return conversationId;

  if (!providerId || !serviceId) {
    Alert.alert("Chat error", "Missing service information.");
    return null;
  }

  const res = await api.post(
    `/api/conversations/with-service/${providerId}`,
    { serviceId }
  );

  const cid = res.data?.conversation?._id;

  if (cid) {
    setConversationId(cid);
    return cid;
  }

  Alert.alert("Chat error", "Unable to start conversation.");
  return null;
}, [conversationId, providerId, serviceId]);




const loadLatestMessages = useCallback(async (cid) => {
  try {
    setLoadingHistory(true);
   const res = await api.get(`/api/messages/${cid}?limit=40`);
    const msgs = res.data?.messages || [];

    setData(msgs.map(mapMessageFromApi));
    setNextCursor(res.data?.nextCursor || null);

    if (msgs.length > 0) setHasSentMessage(true);
  } finally {
    setLoadingHistory(false);
  }
}, [mapMessageFromApi]);


const markRead = useCallback(async (cid) => {
  try {
    await api.post(`/api/messages/${cid}/read`);
  } catch (e) {
    // silent
  }
}, []);



useEffect(() => {
  let alive = true;

  (async () => {
    try {
      // ✅ CASE 1: We already have a conversation
      if (conversationId) {
        await loadLatestMessages(conversationId);
        await markRead(conversationId);
        return;
      }

      // ✅ CASE 2: We need to create one (requires providerId + serviceId)
      const cid = await openConversation();
      if (!cid || !alive) return;

      await loadLatestMessages(cid);
      await markRead(cid);
    } catch (err) {
      console.log("❌ Chat open/load error:", err);
    }
  })();


  return () => {
    alive = false;
  };
}, [openConversation, loadLatestMessages, markRead]);


useFocusEffect(
  useCallback(() => {
    if (conversationId) {
      markRead(conversationId);
    }
  }, [conversationId, markRead])
);



/* ----------------- Send Message ----------------- */
const send = useCallback(async () => {
  const txt = message.trim();
  if (!txt) return;

  if (sending) return;

  let cid = conversationId;

  // ✅ Create/open conversation on demand
  if (!cid) {
    cid = await openConversation();
    if (!cid) {
      Alert.alert("Chat loading", "Please try again in a moment.");
      return;
    }
  }

  const tempId = `tmp_${Date.now()}`;

  const optimistic = {
    id: tempId,
    sender: "me",
    text: txt,
    at: Date.now(),
  };

  setData((p) => [...p, optimistic]);
  setMessage("");
  setSending(true);

  if (!hasSentMessage) {
    setHasSentMessage(true);
    setShowCallHint(false);
  }

  scrollToBottom();

  try {
   const res = await api.post(`/api/messages/${cid}`, { text: txt });

    const real = res.data?.message;
    if (real?._id) {
      setData((p) => p.map((m) => (m.id === tempId ? mapMessageFromApi(real) : m)));
    }
  } catch (err) {
    console.log("❌ Send message error:", err?.response?.data || err);
    setData((p) => p.filter((m) => m.id !== tempId));
    Alert.alert("Message failed", "Could not send. Try again.");
  } finally {
    setSending(false);
  }
}, [
  message,
  conversationId,
  sending,
  hasSentMessage,
  scrollToBottom,
  mapMessageFromApi,
  openConversation, // ✅ IMPORTANT
]);


  /* ----------------- Camera & Library ----------------- */
  const openCamera = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchCameraAsync({ quality: 0.9, allowsEditing: true });
    if (!res.canceled) {
      const id = String(Date.now());
      const imgUri = res.assets[0].uri;
      setData((p) => [...p, { id, sender: "me", images: [imgUri], at: Date.now() }]);
      if (!hasSentMessage) setHasSentMessage(true);
      scrollToBottom();
    }
  };

  const openLibrary = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      allowsMultipleSelection: true,
      selectionLimit: 6,
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.9,
    });
    if (!res.canceled) {
      const uris = res.assets.map((a) => a.uri);
      const id = String(Date.now());
      setData((p) => [...p, { id, sender: "me", images: uris, at: Date.now() }]);
      if (!hasSentMessage) setHasSentMessage(true);
      scrollToBottom();
    }
  };

  /* ----------------- Row Renderer ----------------- */
  const lastMine = [...data].reverse().find((m) => m.sender === "me")?.id;

  const renderRow = ({ item }) => {
    if (item.type === "day") {
      return (
        <View style={styles.dayWrap}>
          <Text style={styles.dayText}>{formatDayHeader(item.at)}</Text>
        </View>
      );
    }

    const mine = item.sender === "me";

    return (
      <View style={[styles.msgWrap, { alignItems: mine ? "flex-end" : "flex-start" }]}>
        {item.text && (
          <View
            style={[
              styles.bubble,
              mine ? styles.bubbleBlue : styles.bubbleGray,
              { alignSelf: mine ? "flex-end" : "flex-start" },
            ]}
          >
            <Text style={[styles.msgText, { color: mine ? "#fff" : "#000" }]}>
              {item.text}
            </Text>
          </View>
        )}

        {item.images && <>{renderImageCollage(item.images, mine)}</>}

{mine && item.id === lastMine && (
  <Text style={styles.statusText}>
    {item.readAt ? `Read ${formatTime(item.readAt)}` : "Delivered"}
  </Text>
)}

      </View>
    );
  };

  /* ----------------- Image Collage Renderer ----------------- */
  const openImageViewer = (images, index) => {
    setViewerImages(images);
    setViewerIndex(index);
    setViewerVisible(true);
  };

  const renderImageCollage = (images = [], mine) => {
    if (images.length === 1) {
      return (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => openImageViewer(images, 0)}
          style={[styles.imageBubble, mine ? styles.imageRight : styles.imageLeft]}
        >
          <Image source={{ uri: images[0] }} style={styles.imageSingle} resizeMode="cover" />
        </TouchableOpacity>
      );
    }

    const pairs = [];
    for (let i = 0; i < images.length; i += 2) pairs.push(images.slice(i, i + 2));

    return (
      <View style={[styles.imageCollageWrap, mine ? styles.imageRight : styles.imageLeft]}>
        {pairs.map((pair, rowIdx) => (
          <View key={rowIdx} style={styles.imageRow}>
            {pair.map((img, i) => (
              <TouchableOpacity
                key={img}
                activeOpacity={0.9}
                onPress={() => openImageViewer(images, i + rowIdx * 2)}
              >
                <Image
                  source={{ uri: img }}
                  style={[
                    styles.imageCollageItem,
                    {
                      transform: [
                        { rotate: i % 2 === 0 ? "-3deg" : "3deg" },
                        { scale: 0.99 },
                      ],
                    },
                  ]}
                  resizeMode="cover"
                />
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>
    );
  };

  /* ----------------- Call Handler ----------------- */
  const handleCallPress = () => {
    if (!hasSentMessage) {
      setShowCallHint(true);
      if (callHintTimeout.current) clearTimeout(callHintTimeout.current);
      callHintTimeout.current = setTimeout(() => setShowCallHint(false), 2500);
      return;
    }

    if (!phoneNumber) {
      Alert.alert("Call", "No phone number is available for this business yet.");
      return;
    }

    Alert.alert("Call", `Call ${phoneNumber}?`, [
      { text: "Cancel", style: "cancel" },
      { text: "Call", onPress: () => Linking.openURL(`tel:${phoneNumber}`) },
    ]);
  };

  const handleFlagPress = () => {
    Alert.alert("Flag conversation", "This will notify Helpio about this chat so we can review it.");
  };

  /* ----------------- Avatar ----------------- */
  const avatar = getAvatarContent(displayName, route?.params?.avatar);

  /* ----------------- UI ----------------- */
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: IOS_BACKGROUND }}>
      {/* HEADER */}
      <View style={styles.igHeader}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.igBackBtn}>
          <Ionicons name="chevron-back" size={26} color="#111" />
        </TouchableOpacity>

        <View style={styles.igCenter}>
          <View style={styles.igAvatarWrap}>
            {avatar.type === "image" ? (
              <Image source={{ uri: avatar.value }} style={styles.igAvatar} />
            ) : (
              <View style={styles.igLetterCircle}>
                <Text style={styles.igLetterText}>{avatar.value}</Text>
              </View>
            )}
          </View>

          <View style={{ flexDirection: "column", flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Text style={styles.igName}>{displayName}</Text>
              <Image
                source={require("../../assets/images/helpio_verified.png")}
                style={styles.verifiedBadge}
              />
            </View>
            <Text style={styles.igSubText}>Business chat</Text>
          </View>

          <View style={styles.igIcons}>
            <TouchableOpacity onPress={handleCallPress} activeOpacity={0.7}>
              <Animated.View style={{ opacity: callOpacity }}>
                <Image
                  source={PhoneBlurIcon}
                  style={{
                    width: 45,
                    height: 45,
                    opacity: hasSentMessage ? 1 : 0.4,
                    marginHorizontal: 10,
                  }}
                />
              </Animated.View>
            </TouchableOpacity>

            <TouchableOpacity onPress={handleFlagPress} activeOpacity={0.7}>
              <Image
                source={SaveBlurIcon}
                style={{
                  width: 45,
                  height: 45,
                  marginHorizontal: 10,
                }}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* CHAT AREA */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={0}
      >
        <FlatList
          ref={listRef}
          data={rows}
          keyExtractor={(it) => it.id}
          renderItem={renderRow}
          showsVerticalScrollIndicator={false}
          contentInset={{ bottom: 4 }}
          contentContainerStyle={{ paddingTop: 8, paddingBottom: 4 }}
          onScrollBeginDrag={() => setUserScrolled(true)}
          onContentSizeChange={() => {
            if (!userScrolled) scrollToBottom();
          }}
          bounces
        />

        {/* Call hint */}
        {showCallHint && (
          <View style={styles.callHintWrap}>
            <Text style={styles.callHintText}>You must send a message before calling.</Text>
          </View>
        )}

        {/* INPUT BAR */}
        <View
          style={styles.iosInputBar}
          onLayout={(e) => setInputBarHeight(e.nativeEvent.layout.height)}
        >
          <TouchableOpacity style={styles.iosPlusBtn} onPress={openLibrary}>
            <View style={styles.iosPlusCircle}>
              <Ionicons name="add" size={22} color="#555" />
            </View>
          </TouchableOpacity>

          <View style={styles.iosInputPill}>
            <TextInput
              value={message}
              onChangeText={setMessage}
              onFocus={scrollToBottom}
              placeholder={company ? `Message ${company}` : "iMessage"}
              placeholderTextColor="#AFAFAF"
              style={styles.iosTextField}
              multiline
              maxLength={2000}
            />

            <TouchableOpacity onPress={send} style={styles.sendBtn}>
              <Ionicons name="arrow-up" size={17} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>

        {/* IMAGE VIEWER */}
        <Modal visible={viewerVisible} transparent animationType="fade">
          <View style={styles.viewerContainer}>
            <ScrollView
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              contentOffset={{ x: viewerIndex * width, y: 0 }}
            >
              {viewerImages.map((uri, i) => (
                <View
                  key={i}
                  style={{
                    width,
                    height,
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <Image
                    source={{ uri }}
                    style={styles.viewerImage}
                    resizeMode="contain"
                  />
                </View>
              ))}
            </ScrollView>

            <TouchableOpacity
              style={styles.closeButton}
              onPress={() => setViewerVisible(false)}
            >
              <Ionicons name="close" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  dayWrap: { alignItems: "center", marginVertical: 12 },
  dayText: { fontSize: 12, color: IOS_LABEL },
  msgWrap: { paddingHorizontal: 12, marginBottom: 10 },

  bubble: {
    maxWidth: width * 0.8,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 18,
  },
  bubbleBlue: { backgroundColor: HELP_BLUE, borderBottomLeftRadius: 18 },
  bubbleGray: { backgroundColor: IOS_GRAY_BUBBLE, borderBottomRightRadius: 18 },

  /* Images */
  imageBubble: { marginVertical: 4 },
  imageSingle: {
    width: width * 0.85,
    height: width * 0.85,
    borderRadius: 16,
  },
  imageCollageWrap: { flexDirection: "column", gap: 8 },
  imageRow: { flexDirection: "row", justifyContent: "center", gap: 8 },
  imageCollageItem: {
    width: width * 0.42,
    height: width * 0.42,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  imageRight: { alignSelf: "flex-end" },
  imageLeft: { alignSelf: "flex-start" },

  msgText: { fontSize: 17, lineHeight: 22 },

  // iMessage-style "Read 3:01 PM"
  statusText: {
    fontSize: 11,
    color: IOS_LABEL,
    marginTop: 3,
    marginRight: 10,
  },

  /* Call hint */
  callHintWrap: { alignItems: "center", paddingVertical: 4 },
  callHintText: { fontSize: 13, color: "#8E8E93" },

  /* Input bar */
  iosInputBar: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#fff",
    backgroundColor: "#fff",
  },
  iosPlusBtn: { marginRight: 8 },
  iosPlusCircle: {
    width: 36,
    height: 36,
    borderRadius: 36,
    backgroundColor: "#EFEFF4",
    justifyContent: "center",
    alignItems: "center",
  },
  iosInputPill: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "#D6D6D6",
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  iosTextField: {
    flex: 1,
    fontSize: 17,
    color: "#000",
    paddingRight: 10,
    paddingVertical: 4,
    minHeight: 20,
    maxHeight: 120,
  },
  sendBtn: {
    width: 30,
    height: 30,
    borderRadius: 30,
    backgroundColor: HELP_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 6,
    marginBottom: 1,
  },

  /* Header */
  igHeader: {
    height: 70,
    backgroundColor: "#FFFFFF",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E5E5E5",
  },
  igBackBtn: { padding: 6, paddingRight: 12 },
  igCenter: { flexDirection: "row", alignItems: "center", flex: 1 },
  igAvatar: { width: 38, height: 38, borderRadius: 19, marginRight: 10 },
  igName: { fontSize: 15, fontWeight: "700", color: "#111" },
  igSubText: { fontSize: 12, color: "#8E8E93", marginTop: 1 },
  igIcons: { flexDirection: "row", alignItems: "center" },
  verifiedBadge: { width: 16, height: 16, marginLeft: 4, resizeMode: "contain" },

  igAvatarWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    marginRight: 10,
  },
  igLetterCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#D9D9D9",
    justifyContent: "center",
    alignItems: "center",
  },
  igLetterText: { fontSize: 18, fontWeight: "700", color: "#4A4A4A" },

  /* Image viewer */
  viewerContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.96)",
    justifyContent: "center",
    alignItems: "center",
  },
  viewerImage: { width: "100%", height: "100%" },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 30,
    padding: 6,
  },
});
