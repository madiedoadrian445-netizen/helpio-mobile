// src/components/ServiceDetailRenderer.js
import React, { useMemo, useRef, useEffect } from "react";
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
import useAuthStore from "../store/auth";
import { api } from "../config/api";
import { Ionicons } from "@expo/vector-icons";
import ChromeStars from "../components/ChromeStars";
import ListingReviewsModal from "../components/ListingReviewsModal.js";

const { width } = Dimensions.get("window");
const PADDING_H = 16;
const HELPIO_BLUE = "#00A6FF";

export default function ServiceDetailRenderer({ service, navigation, mode = "live" }) {
  // Hard guard (prevents crashes if route params are missing)
  if (!service) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F1F3F6", alignItems: "center", justifyContent: "center" }}>
        <Text style={{ color: "#111", fontWeight: "700" }}>Loading…</Text>
      </View>
    );
  }

  const isPreview = mode === "preview";

  useEffect(() => {
    // Keep your debug log
    console.log("🧨 SERVICE OBJECT FULL:", JSON.stringify(service, null, 2));
  }, [service]);

  const authUser = useAuthStore((state) => state.user);

  const rating = service.rating ?? 5;
  const ratingCount = service.ratingCount ?? 0;
  const serviceTitle = service.title || "Service";

  const companyName = useMemo(() => {
    const raw =
      service?.businessName ??
      service?.companyName ??
      service?.provider?.businessName ??
      service?.provider?.companyName ??
      null;

    if (typeof raw === "string" && raw.trim().length > 0) return raw.trim();
    return null;
  }, [service]);

  const category = service.category;
  const verified = service.isVerified;
  const startingPrice = service.price;

  // ✅ Preview-safe gallery normalization:
  // - supports strings (live)
  // - supports { uri } objects (draft images from picker)
  const rawGallery =
    Array.isArray(service?.images) && service.images.length
      ? service.images
      : Array.isArray(service?.photos) && service.photos.length
      ? service.photos
      : [];

  const gallerySrc = rawGallery
    .map((img) => (typeof img === "string" ? img : img?.uri))
    .filter(Boolean)
    .map((uri) => (uri.startsWith("http") || uri.startsWith("file:") ? uri : `${api.defaults.baseURL}${uri}`));

  const heroSrc = gallerySrc[0] || null;

  const isValidObjectId = (id) => typeof id === "string" && /^[0-9a-fA-F]{24}$/.test(id);

  const [initialMessage, setInitialMessage] = React.useState("Hey, I would like to get a quote !");
  const [reviewsOpen, setReviewsOpen] = React.useState(false);

  const listingProviderId = useMemo(() => {
    if (typeof service?.provider === "string") return service.provider;
    if (service?.provider?._id) return service.provider._id;
    if (service?.providerId) return service.providerId;
    return null;
  }, [service]);

  const myProviderId = authUser?.providerId ? String(authUser.providerId) : null;

  const isOwnListing =
    !!myProviderId && !!listingProviderId && String(listingProviderId) === myProviderId;

  // ✅ In preview we allow the UI to render 1:1, but disable real chat creation.
  const canChat =
    !isPreview &&
    !!authUser &&
    !!listingProviderId &&
    !isOwnListing &&
    isValidObjectId(service?._id);

  const startConversationFromBox = async () => {
    if (!canChat) {
      Alert.alert(
        isPreview ? "Preview mode" : "Unavailable",
        isPreview ? "Messaging is disabled in preview." : "You cannot message this listing."
      );
      return;
    }

    if (!service?._id || !isValidObjectId(service._id)) {
      Alert.alert("Unavailable", "Messaging is only available for live listings.");
      return;
    }

    if (!initialMessage.trim()) {
      Alert.alert("Message required", "Please enter a message.");
      return;
    }

    const providerId =
      typeof service?.provider === "string" ? service.provider : service?.provider?._id;

    if (!providerId || !isValidObjectId(providerId)) {
      Alert.alert("Chat error", "This listing is missing a provider.");
      return;
    }

    try {
      const res = await api.post(`/api/conversations/with-service/${providerId}`, {
        serviceId: service._id,
      });

      if (!res.data?.success || !res.data?.conversation?._id) {
        throw new Error("Conversation creation failed");
      }

      const conversation = res.data.conversation;

      await api.post(`/api/messages/${conversation._id}`, {
        text: initialMessage.trim(),
      });

      navigation.navigate("ChatDetail", {
        conversationId: conversation._id,
        providerId,
        serviceId: service._id,
        name: companyName,
        avatar: service.logo || heroSrc || null,
        phoneNumber: service.phone || service.provider?.phone || null,
      });

      setInitialMessage("");
    } catch (err) {
      console.log("❌ Chat error:", err.response?.data || err);
      Alert.alert("Chat error", err.response?.data?.message || "Unable to start conversation.");
    }
  };

  const [visible, setVisible] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 1100, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const scrollY = useRef(new Animated.Value(0)).current;
  const blurOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const cardW = useMemo(() => Math.min(280, width * 0.72), []);

  // ✅ Approx location fallback (keeps your current Miami default)
  const lat = Number(service?.location?.lat ?? service?.location?.latitude ?? 25.7617);
  const lng = Number(service?.location?.lng ?? service?.location?.longitude ?? -80.1918);

  return (
    <View style={styles.container}>
      <LinearGradient
        colors={["#000000", "#c5c6c7ff", "#ECEFF3", "#F1F3F6"]}
        locations={[0, 0.32, 0.7, 1]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />

      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      <Animated.View style={[styles.statusBlur, { opacity: blurOpacity }]}>
        <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
      </Animated.View>

      <Animated.ScrollView
        bounces
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
      >
        {/* ===== HERO ===== */}
        <View style={styles.heroWrap}>
          <ImageBackground source={{ uri: heroSrc }} style={styles.heroImg} resizeMode="cover">
            <LinearGradient
              colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0)"]}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.titleBandWrap}>
              <View style={styles.titleGlassCard}>
                <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />
                <View style={styles.titleGlassTint} />

                <View style={styles.titleInner}>
                  <Text numberOfLines={1} style={styles.title}>
                    {serviceTitle}
                  </Text>

                  <View style={styles.metaRow}>
                    {verified && (
                      <View style={styles.verifiedPill}>
                        <View style={styles.badgeDot} />
                        <Text style={styles.verifiedText}>Helpio Verified</Text>
                      </View>
                    )}

                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>{category}</Text>
                    <Text style={styles.metaDot}>•</Text>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => setReviewsOpen(true)}
                      style={{ flexDirection: "row", alignItems: "center", gap: 6 }}
                    >
                      <ChromeStars size={14} count={rating} />
                      <Text style={styles.metaText}>{rating.toFixed(1)}</Text>
                      <Text style={styles.muted}>({ratingCount})</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.titleGlassBorder} />
              </View>
            </View>
          </ImageBackground>

          <LinearGradient
            colors={["rgba(0,0,0,0.18)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.fadeDivider}
          />
        </View>

        {/* ───────── Marketplace Title / Price / Location ───────── */}
        <View style={styles.marketplaceMetaBlock}>
          {companyName && <Text style={styles.marketplaceTitle}>{companyName}</Text>}

          {startingPrice ? (
            <Text style={styles.marketplacePrice}>${formatPrice(startingPrice)}</Text>
          ) : null}

          <Text style={styles.marketplaceSubline}>
            Listed recently · {service?.location?.city || "Local area"}
          </Text>
        </View>

        {/* ───────── Marketplace Action Block ───────── */}
        <View style={styles.marketplaceBlock}>
          {/* OWNER — Manage Listing (keep identical UI, but disable in preview if you want) */}
          {isOwnListing && !isPreview && (
            <View style={styles.messageSellerCard}>
              <View style={styles.messageHeader}>
                <Ionicons name="settings-outline" size={18} color="#111827" />
                <Text style={styles.messageTitle}>Manage listing</Text>
              </View>

              <View style={styles.ownerActionRow}>
                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.ownerPrimaryBtn}
                  onPress={() =>
                    navigation.navigate("CreateListing", { mode: "edit", listing: service })
                  }
                >
                  <Ionicons name="settings-outline" size={16} color="#fff" />
                  <Text style={styles.ownerPrimaryText}>Manage</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.ownerSecondaryBtn}
                  onPress={() => setReviewsOpen(true)}
                >
                  <Ionicons name="star" size={16} style={styles.ownerSecondaryIcon} />
                  <Text style={styles.ownerSecondaryText}>Reviews</Text>
                </TouchableOpacity>

                <TouchableOpacity activeOpacity={0.9} style={styles.ownerBoostBtn}>
                  <Ionicons name="trending-up-outline" size={16} color={HELPIO_BLUE} />
                  <Text style={styles.ownerBoostText}>Boost</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={styles.ownerDashboardIconBtn}
                  onPress={() => navigation.navigate("ProfessionalDashboardA")}
                >
                  <Ionicons name="bar-chart-outline" size={17} color={HELPIO_BLUE} />
                </TouchableOpacity>
              </View>
            </View>
          )}

          {/* BUYER — Message Provider */}
          {(!isOwnListing) && (
            <View style={styles.messageSellerCard}>
              <View style={styles.messageHeader}>
                <Ionicons name="chatbubble-outline" size={18} color="#3d3de8ff" />
                <Text style={styles.messageTitle}>Message provider</Text>
              </View>

              <View style={styles.messageInputRow}>
                <TextInput
                  value={initialMessage}
                  onChangeText={setInitialMessage}
                  placeholder="Hey i would like to get a quote?"
                  placeholderTextColor="#6B7280"
                  style={styles.messageInput}
                  multiline
                  blurOnSubmit={false}
                  editable={!isPreview}
                />

                <TouchableOpacity
                  activeOpacity={0.85}
                  style={[styles.sendButton, (!initialMessage.trim() || isPreview) && { opacity: 0.5 }]}
                  disabled={!initialMessage.trim() || isPreview}
                  onPress={startConversationFromBox}
                >
                  <Text style={styles.sendText}>{isPreview ? "Preview" : "Send"}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        {/* ===== GALLERY (unchanged) ===== */}
        <View style={[styles.sectionWrap, { paddingTop: 40 }]}>
          <Text style={styles.sectionTitle}>Gallery</Text>

          <View style={styles.galleryFullBleed}>
            <ScrollView
              horizontal
              nestedScrollEnabled
              directionalLockEnabled
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: PADDING_H, paddingBottom: 14 }}
            >
              {gallerySrc.map((uri, i) => (
                <View key={i} style={[styles.galleryShadowWrap, { width: cardW }]}>
                  <View style={styles.galleryInner}>
                    <TouchableOpacity
                      activeOpacity={0.9}
                      onPress={() => {
                        setCurrentIndex(i);
                        setVisible(true);
                      }}
                      style={{ flex: 1 }}
                    >
                      <Image source={{ uri }} style={styles.cardImg} />
                      <View style={styles.cardShade} />
                      <View style={styles.cardFooter}>
                        <Text style={styles.cardFootText}>Tap to expand</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>

            <View style={styles.galleryDividerWrapper} pointerEvents="none">
              <View style={styles.galleryDivider} />
            </View>
          </View>
        </View>

        {/* ===== MAP (unchanged UI, but uses listing coords if present) ===== */}
        <View style={[styles.sectionWrap, { paddingTop: 50, paddingBottom: 40 }]}>
          <Text style={styles.sectionTitle}>Approximate Location</Text>

          <View style={styles.mapShadowWrap}>
            <View style={styles.mapInner}>
              <MapView
                style={StyleSheet.absoluteFill}
                provider={PROVIDER_DEFAULT}
                initialRegion={{
                  latitude: lat,
                  longitude: lng,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                showsUserLocation={false}
              >
                <Marker
                  coordinate={{ latitude: lat, longitude: lng }}
                  title={companyName || "Service"}
                  description="Approximate Service Area"
                  pinColor={HELPIO_BLUE}
                />
              </MapView>
            </View>
          </View>
        </View>
      </Animated.ScrollView>

      <ListingReviewsModal
        visible={reviewsOpen}
        onClose={() => setReviewsOpen(false)}
        listingTitle={serviceTitle}
        reviews={service.reviews || []}
      />

      <ImageViewing
        images={gallerySrc.map((uri) => ({ uri }))}
        imageIndex={currentIndex}
        visible={visible}
        onRequestClose={() => setVisible(false)}
        backgroundColor="rgba(0,0,0,0.95)"
        swipeToCloseEnabled
        doubleTapToZoomEnabled
        animationType="fade"
      />
    </View>
  );
}

function formatPrice(n) {
  try {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
  } catch {
    return String(n);
  }
}

/**
 * ✅ IMPORTANT:
 * Keep your exact styles.
 * You can paste your entire styles object here unchanged.
 * I’m not re-pasting all 1000 lines to avoid mistakes in chat.
 */
const styles = StyleSheet.create({
  container: { flex: 1 },
  statusBlur: { position: "absolute", top: 0, left: 0, right: 0, height: Platform.OS === "ios" ? 90 : 70, zIndex: 10 },

  // --- paste ALL your styles below (unchanged) ---
  // ... YOUR EXISTING STYLES OBJECT ...
});
