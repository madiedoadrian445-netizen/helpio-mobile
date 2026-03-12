// src/components/ServiceDetailView.js
import React, { useMemo, useRef, useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ImageBackground,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import ImageViewing from "react-native-image-viewing";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";
import { Ionicons } from "@expo/vector-icons";
import ChromeStars from "../components/ChromeStars";
import ListingReviewsModal from "../components/ListingReviewsModal";
import useAuthStore from "../store/auth";
import { api } from "../config/api";

const { width } = Dimensions.get("window");
const PADDING_H = 16;
const HELPIO_BLUE = "#00A6FF";

export default function ServiceDetailView({ service, navigation }) {
  const authUser = useAuthStore((s) => s.user);

  const rating = service?.rating ?? 5;
  const ratingCount = service?.ratingCount ?? 0;
  const serviceTitle = service?.title || "Service";

  const companyName = useMemo(() => {
    const raw =
      service?.businessName ??
      service?.companyName ??
      service?.provider?.businessName ??
      service?.provider?.companyName ??
      null;

    return typeof raw === "string" && raw.trim() ? raw.trim() : null;
  }, [service]);

  /** ---------- IMAGES ---------- */
  const rawGallery =
    Array.isArray(service?.images) && service.images.length
      ? service.images
      : [];

  const gallerySrc = rawGallery.map((uri) =>
    uri.startsWith("http") ? uri : `${api.defaults.baseURL}${uri}`
  );

  const heroSrc = gallerySrc[0] || null;

  /** ---------- CHAT STATE ---------- */
  const [initialMessage, setInitialMessage] = useState(
    "Hey, I would like to get a quote!"
  );
  const [reviewsOpen, setReviewsOpen] = useState(false);

  const listingProviderId =
    typeof service?.provider === "string"
      ? service.provider
      : service?.provider?._id || null;

  const myProviderId = authUser?.providerId
    ? String(authUser.providerId)
    : null;

  const isOwnListing =
    !!myProviderId &&
    !!listingProviderId &&
    String(listingProviderId) === myProviderId;

  const canChat = !!authUser && !!listingProviderId && !isOwnListing;

  const startConversationFromBox = async () => {
    if (!canChat) return Alert.alert("Unavailable", "Cannot message listing.");

    try {
      const res = await api.post(
        `/api/conversations/with-service/${listingProviderId}`,
        { serviceId: service._id }
      );

      const conversation = res?.data?.conversation;
      if (!conversation?._id) throw new Error("Conversation failed");

      await api.post(`/api/messages/${conversation._id}`, {
        text: initialMessage.trim(),
      });

      navigation.navigate("ChatDetail", {
        conversationId: conversation._id,
        providerId: listingProviderId,
        serviceId: service._id,
        name: companyName,
        avatar: heroSrc,
      });
    } catch {
      Alert.alert("Chat error", "Unable to start conversation.");
    }
  };

  /** ---------- LIGHTBOX ---------- */
  const [visible, setVisible] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  /** ---------- SCROLL BLUR ---------- */
  const scrollY = useRef(new Animated.Value(0)).current;
  const blurOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
  });

  const cardW = useMemo(() => Math.min(280, width * 0.72), []);

  return (
    <View style={styles.container}>
      {/* BACKGROUND */}
      <LinearGradient
        colors={["#000", "#c5c6c7", "#ECEFF3", "#F1F3F6"]}
        locations={[0, 0.32, 0.7, 1]}
        style={StyleSheet.absoluteFill}
      />

      <StatusBar barStyle="light-content" translucent />

      {/* HEADER BLUR */}
      <Animated.View style={[styles.statusBlur, { opacity: blurOpacity }]}>
        <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
      >
        {/* HERO */}
        <View style={styles.heroWrap}>
          <ImageBackground source={{ uri: heroSrc }} style={styles.heroImg}>
            <LinearGradient
              colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0)"]}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.titleBandWrap}>
              <View style={styles.titleGlassCard}>
                <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />
                <View style={styles.titleInner}>
                  <Text numberOfLines={1} style={styles.title}>
                    {serviceTitle}
                  </Text>

                  <View style={styles.metaRow}>
                    <ChromeStars size={14} count={rating} />
                    <Text style={styles.metaText}>{rating.toFixed(1)}</Text>
                    <Text style={styles.muted}>({ratingCount})</Text>
                  </View>
                </View>
              </View>
            </View>
          </ImageBackground>
        </View>

        {/* MESSAGE BOX */}
        {canChat && (
          <View style={styles.messageSellerCard}>
            <View style={styles.messageInputRow}>
              <TextInput
                value={initialMessage}
                onChangeText={setInitialMessage}
                style={styles.messageInput}
                multiline
              />
              <TouchableOpacity style={styles.sendButton} onPress={startConversationFromBox}>
                <Text style={styles.sendText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* GALLERY */}
        <View style={[styles.sectionWrap, { paddingTop: 40 }]}>
          <Text style={styles.sectionTitle}>Gallery</Text>

          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {gallerySrc.map((uri, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => {
                  setCurrentIndex(i);
                  setVisible(true);
                }}
                style={[styles.galleryShadowWrap, { width: cardW }]}
              >
                <Image source={{ uri }} style={styles.cardImg} />
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </Animated.ScrollView>

      {/* LIGHTBOX */}
      <ImageViewing
        images={gallerySrc.map((uri) => ({ uri }))}
        imageIndex={currentIndex}
        visible={visible}
        onRequestClose={() => setVisible(false)}
      />

      {/* REVIEWS MODAL */}
      <ListingReviewsModal
        visible={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        listingTitle={serviceTitle}
        reviews={service?.reviews || []}
      />
    </View>
  );
}

/** ---------- STYLES (trimmed but production ready) ---------- */
const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBlur: { position: "absolute", top: 0, left: 0, right: 0, height: 90, zIndex: 10 },

  heroWrap: { width: "100%", height: width * 1.05 },
  heroImg: { flex: 1, justifyContent: "flex-end" },

  titleBandWrap: { paddingHorizontal: PADDING_H, paddingBottom: 24 },
  titleGlassCard: { borderRadius: 22, overflow: "hidden", backgroundColor: "rgba(20,20,20,0.35)" },
  titleInner: { padding: 16 },
  title: { color: "#fff", fontSize: 28, fontWeight: "800" },

  metaRow: { flexDirection: "row", alignItems: "center", gap: 6, marginTop: 6 },
  metaText: { color: "#fff", fontWeight: "600" },
  muted: { color: "rgba(255,255,255,0.6)" },

  messageSellerCard: { margin: 16, backgroundColor: "#e9e6e6", borderRadius: 16, padding: 12 },
  messageInputRow: { flexDirection: "row", alignItems: "center" },
  messageInput: { flex: 1, fontSize: 14 },
  sendButton: { backgroundColor: "#3d3de8", paddingHorizontal: 16, paddingVertical: 6, borderRadius: 999 },
  sendText: { color: "#fff", fontWeight: "700" },

  sectionWrap: { paddingHorizontal: PADDING_H, paddingBottom: 22 },
  sectionTitle: { fontSize: 22, fontWeight: "800", marginBottom: 8 },

  galleryShadowWrap: { marginRight: 16, borderRadius: 22, overflow: "hidden" },
  cardImg: { width: "100%", height: 180 },
});
