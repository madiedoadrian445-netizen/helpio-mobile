// src/screens/ServiceDetailScreen.js
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
  SafeAreaView, 
   ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import ImageViewing from "react-native-image-viewing";
import MapView, { Marker, Circle, PROVIDER_DEFAULT } from "react-native-maps";
import useAuthStore from "../store/auth";
import { api } from "../config/api";
import { Ionicons } from "@expo/vector-icons";
import ChromeStars from "../components/ChromeStars";
import ListingReviewsModal from "../components/ListingReviewsModal.js";
import { clearDraftListing } from "../utils/draftListingStorage";
import LeaveReviewModal from "../components/LeaveReviewModal";
import * as Sharing from "expo-sharing";
import * as Clipboard from "expo-clipboard";
import { Share } from "react-native";
import { useFocusEffect } from "@react-navigation/native";



const { width } = Dimensions.get("window"); 

const PADDING_H = 16;
const HELPIO_BLUE = "#00A6FF";

function MarqueeChips({ items }) {
  const scrollRef = useRef(null);
  const scrollX = useRef(0);
const contentWidth = useRef(0);
const singleRowWidth = useRef(0);


  const isInteracting = useRef(false);





  useEffect(() => {
    const SPEED = 0.35; // px per frame (slow + premium)
    const FRAME = 16;

    const timer = setInterval(() => {
      if (!scrollRef.current || isInteracting.current) return;

      scrollX.current += SPEED;

    if (scrollX.current >= singleRowWidth.current) {
  scrollX.current -= singleRowWidth.current;
}



      scrollRef.current.scrollTo({
        x: scrollX.current,
        animated: false,
      });
    }, FRAME);

    return () => clearInterval(timer);
  }, []);

  return (
    <ScrollView
      ref={scrollRef}
      horizontal
      showsHorizontalScrollIndicator={false}
      scrollEventThrottle={16}
      contentContainerStyle={styles.offerRow}
      onScroll={(e) => {
        scrollX.current = e.nativeEvent.contentOffset.x;
      }}
    
     onScrollBeginDrag={() => {
  isInteracting.current = true;
}}

onMomentumScrollEnd={() => {
  isInteracting.current = false;
}}

      onContentSizeChange={(w) => {
  contentWidth.current = w;
  singleRowWidth.current = w / 2;
}}

    >
      {[...items, ...items].map((item, i) => (
        <View key={i} style={styles.offerChip}>
          <Ionicons name={item.icon} size={18} color={HELPIO_BLUE} />
          <Text style={styles.offerChipText}>{item.label}</Text>
        </View>
      ))}
    </ScrollView>
  );
}


export default function ServiceDetailScreen({ route,
  navigation,
}) {




 const authUser = useAuthStore((state) => state.user);


const token = useAuthStore((state) => state.token);

const providerId =
  authUser?.providerId ||
  authUser?.provider?._id ||
  authUser?.provider ||
  null;


const isAuthHydrated = useAuthStore((state) => state.isHydrated);



 const initialService =
  route?.params?.service ??
  route?.params?.previewData ??
  null;

 useEffect(() => {
  console.log("🚨 initialService._id =", initialService?._id);
  console.log("🚨 FULL initialService =", initialService);
}, [initialService?._id]);




const [liveService, setLiveService] = React.useState(null);
const [leaveReviewOpen, setLeaveReviewOpen] = React.useState(false);
const [loadingService, setLoadingService] = React.useState(false);
const [sending, setSending] = React.useState(false);
const [conversationId, setConversationId] = React.useState(null);
const [reviews, setReviews] = React.useState([]);

const reviewCount = reviews.length;

const averageRating =
  reviewCount > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviewCount
    : 0;

const service = liveService || initialService;
const actionService = liveService ?? null;

console.log("🧨 SERVICE OBJECT FULL:", JSON.stringify(service, null, 2));

const latitude =
  service?.location?.coordinates?.coordinates?.[1] ??
  25.7617;

const longitude =
  service?.location?.coordinates?.coordinates?.[0] ??
  -80.1918;

const [publishing, setPublishing] = React.useState(false);


const handleShare = async () => {
  try {
    const url = heroSrc || "";
    const message = `${serviceTitle}${companyName ? ` — ${companyName}` : ""}`;

    // If you have a deep link, put it here instead:
    // const deepLink = `helpio://listing/${service?._id}`;
    const deepLink = "";

    await Share.share({
      message: deepLink ? `${message}\n${deepLink}` : message,
      url: url || undefined,
    });
  } catch (e) {
    console.log("Share error:", e);
  }
};

const handleSave = async () => {
  Alert.alert("Saved", "This listing was saved (wire this to your favorites API).");
};


const handlePublish = async () => {
  try {
    setPublishing(true);

    const data = route?.params?.previewData;

    if (!data) {
      Alert.alert("Error", "Missing listing data.");
      return;
    }

    const res = await api.post(
      "/api/listings/provider",
      {
        title: data.title,
        description: data.description,
        category: data.category,
        price: data.price,
        businessName: data.businessName,
        location: data.location,
        images: data.images?.map(img => img.uri || img) || [],
      },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (res.data?.success) {
  // ✅ Clear draft for this provider
  if (providerId) {
    await clearDraftListing(providerId);
  }

  Alert.alert("Success", "Listing published!");

  navigation.navigate("MainTabs");
}else {
      Alert.alert("Error", "Failed to publish listing.");
    }
  } catch (err) {
    console.log("========== PUBLISH ERROR ==========");
    console.log("status:", err?.response?.status);
    console.log("data:", err?.response?.data);
    console.log("===================================");

    Alert.alert(
      "Publish Failed",
      err?.response?.data?.message || "Something went wrong."
    );
  } finally {
    setPublishing(false);
  }
};


useFocusEffect(
  React.useCallback(() => {
    const checkEligibility = async () => {
      try {
        if (!service?._id || !token) return;

        const res = await api.get(`/api/reviews/eligible/${service._id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

       if (res.data?.eligible && res.data?.conversationId) {
  setConversationId(res.data.conversationId);
}

      } catch (err) {
        console.log("Eligibility check failed:", err);
      }
    };

    checkEligibility();
  }, [service?._id, token])
);

const [loadingReviews, setLoadingReviews] = React.useState(false);

useEffect(() => {
  let mounted = true;

  const fetchReviews = async () => {
  try {
    if (!service?._id) return;

    setLoadingReviews(true);

    const res = await api.get(`/api/reviews/${service._id}`);
    if (res?.data?.success) {
  const formatted = (res.data.reviews || []).map((r) => ({
    _id: r._id,
    rating: r.rating ?? 0,
    body: r.comment || "",
    date: r.createdAt
      ? new Date(r.createdAt).toLocaleDateString()
      : "",
    author: r.user?.name || "Helpio user",
    initials: (r.user?.name || "HU")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    images: r.imageUrl ? [r.imageUrl] : [],
  }));

  setReviews(formatted);
}
    } catch (err) {
      if (__DEV__) console.log("Failed to load reviews:", err);
    } finally {
      if (mounted) setLoadingReviews(false);
    }
  };

  fetchReviews();

  return () => {
    mounted = false;
  };
}, [service?._id]);

useEffect(() => {
  let mounted = true;

  const fetchLiveListing = async () => {
    try {
      if (!initialService?._id) return;

      // 🔥 CRITICAL: reset so you don't use stale liveService from previous listing
    
      setLoadingService(true);

      const res = await api.get(`/api/listings/${initialService._id}`);

      if (!mounted) return;

      if (res.data?.success && res.data?.listing) {
        setLiveService(res.data.listing);
      }
    } catch (err) {
      console.log("❌ Failed to fetch live listing:", err?.response?.data || err);
    } finally {
      if (mounted) setLoadingService(false);
    }
  };

  fetchLiveListing();

  return () => {
    mounted = false;
  };
}, [initialService?._id]); // ✅ refetch every time listing changes




const isPreview = route?.params?.isPreview === true;

const previewType = route?.params?.previewType || null;

// Draft preview = coming from CreateListing
const isDraftPreview = isPreview && previewType !== "live";

// Live provider preview = coming from MyListings
const isLiveProviderPreview = isPreview && previewType === "live";

console.log("🧪 route params:", route?.params);
console.log("🧪 isPreview:", isPreview);


if (!service) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <Text>Service not found.</Text>
    </View>
  );
}

  if (!isAuthHydrated) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator size="large" color="#00A6FF" />
    </View>
  );
}


 

useEffect(() => {
  console.log("🧨 SERVICE OBJECT FULL:", JSON.stringify(service, null, 2));
}, [service]);




  const DEV_LOGS = __DEV__ && false;

if (DEV_LOGS) console.log("🧭 ServiceDetail route params:", route?.params);


const rating = averageRating || service.rating || 0;
const ratingCount = reviewCount || service.ratingCount || 0;

// 🔹 Service name (what the user is buying)
const serviceTitle = service.title || "Service";



const companyName = useMemo(() => {
  const raw =
    service?.businessName ??
    service?.companyName ??
    service?.provider?.businessName ??
    service?.provider?.companyName ??
    null;

  if (typeof raw === "string" && raw.trim().length > 0) {
    return raw.trim();
  }

  return null;
}, [service]);




  const category = service.category;
  const verified = service.isVerified;
  const startingPrice = service.price;
 // 🔒 UNIVERSAL IMAGE NORMALIZATION (final fix)
// 🔥 Normalize + attach API base URL if needed
const rawGallery =
  Array.isArray(service?.images) && service.images.length
    ? service.images
    : Array.isArray(service?.photos) && service.photos.length
    ? service.photos
    : [];

/**
 * UNIVERSAL IMAGE NORMALIZATION
 * Supports:
 * - Live URLs (https)
 * - Relative backend paths (/uploads/...)
 * - Local preview files (file://)
 * - Object format { uri }
 */
const gallerySrc = rawGallery
  .map((img) => {
    if (!img) return null;

    // preview object → { uri }
    if (typeof img === "object" && img.uri) return img.uri;

    // already full URL
    if (typeof img === "string" && img.startsWith("http")) return img;

    // local file preview
    if (typeof img === "string" && img.startsWith("file")) return img;

    // backend relative path
    if (typeof img === "string") return `${api.defaults.baseURL}${img}`;

    return null;
  })
  .filter(Boolean);


const heroSrc = gallerySrc[0] || null;

 



  const ABOUT_CARDS = [
  { icon: "construct-outline", label: "Maintenance" },
  { icon: "settings-outline", label: "Mechanical" },
  { icon: "cube-outline", label: "OEM Parts" },
  { icon: "boat-outline", label: "Mobile" },
];


  const isValidObjectId = (id) =>
  typeof id === "string" &&
  /^[0-9a-fA-F]{24}$/.test(id);


const [initialMessage, setInitialMessage] = React.useState(
   "Hey, I would like to get a quote !"
);

// Reviews modal
const [reviewsOpen, setReviewsOpen] = React.useState(false);


// 🔒 Normalize providerId from listing (SINGLE SOURCE OF TRUTH)
const listingProviderId = useMemo(() => {
  if (!service) return null;

  if (typeof service?.provider === "string") return service.provider;
  if (service?.provider?._id) return service.provider._id;
  if (service?.providerId) return service.providerId;

  return null;
}, [service]);


// 🔒 Normalize my provider ID
const myProviderId = useMemo(() => {
  if (!authUser) return null;

  if (authUser?.providerId) return authUser.providerId;
  if (authUser?.provider?._id) return authUser.provider._id;
  if (authUser?.provider) return authUser.provider;

  return null;
}, [authUser]);

// 🔒 TRUE ownership check (source of truth)
const isOwnListing =
  authUser?.role === "provider" &&
  myProviderId &&
  listingProviderId &&
  String(myProviderId) === String(listingProviderId);

useEffect(() => {
  console.log("🔍 OWNERSHIP DEBUG");
  console.log("authUser.role:", authUser?.role);
  console.log("myProviderId:", myProviderId);
  console.log("listingProviderId:", listingProviderId);
  console.log(
    "equal:",
    String(myProviderId) === String(listingProviderId)
  );
}, [authUser, myProviderId, listingProviderId]);


  // 🔒 Normalize listing ID
const listingId = useMemo(() => {
  if (!actionService) return null;

  if (typeof actionService?._id === "string") return actionService._id;
  if (actionService?._id?.toString) return actionService._id.toString();
  if (typeof actionService?.id === "string") return actionService.id;

  return null;
}, [actionService]);



  
const canChat = useMemo(() => {
  const isLoggedIn = !!token;
  const hasProviderLoaded = !!listingProviderId;

  return (
    !isPreview &&
    isLoggedIn &&
    hasProviderLoaded &&
    !isOwnListing &&
    !loadingService
  );
}, [isPreview, token, listingProviderId, isOwnListing, loadingService]);


const startConversationFromBox = async () => {
  console.log("🚀 startConversationFromBox pressed");
  console.log("canChat:", canChat);
  console.log("listingId:", listingId);
  console.log("providerId:", listingProviderId);
  console.log("token exists:", !!token);

  if (loadingService) {
    Alert.alert("Loading", "Please wait a moment and try again.");
    return;
  }

  if (sending) return;

  if (!canChat) {
    Alert.alert("Unavailable", "You cannot message this listing.");
    return;
  }

  if (!listingId || !isValidObjectId(listingId)) {
    Alert.alert("Unavailable", "Messaging is only available for live listings.");
    return;
  }

  const trimmed = initialMessage.trim();

  if (!trimmed) {
    Alert.alert("Message required", "Please enter a message.");
    return;
  }

  const providerId = listingProviderId ? String(listingProviderId) : null;

  if (!providerId || !isValidObjectId(providerId)) {
    Alert.alert("Chat error", "This listing is missing a provider.");
    return;
  }

  try {
  console.log("🟡 STEP 1 — about to call API");

  setSending(true);

 const res = await api.post(
  `/api/conversations/with-service/${providerId}`,
  {
    serviceId: listingId,
    text: trimmed,
  }
);

  console.log("🟢 STEP 2 — API RESPONSE RECEIVED");
  console.log("FULL RESPONSE:", JSON.stringify(res?.data, null, 2));

  const data = res.data;

  if (!data?.success || !data?.conversation?._id) {
    console.log("🔴 STEP 3 — RESPONSE INVALID");
    throw new Error("Conversation start failed");
  }

  console.log("🟢 STEP 4 — VALID CONVERSATION");
  console.log("conversationId:", data.conversation._id);

  const convoId = data.conversation._id;

setConversationId(convoId);

  setInitialMessage("");

  console.log("🟢 STEP 5 — NAVIGATING TO CHAT");

  navigation.navigate("ChatDetail", {
    conversationId: convoId,
    providerId,
    serviceId: listingId,
    name: companyName,
    avatar: service.logo || heroSrc || null,
    phoneNumber: service.phone || service.provider?.phone || null,
    
  });

  console.log("🟢 STEP 6 — NAVIGATION CALLED");
} catch (err) {
  console.log("🔴 CATCH TRIGGERED");
  console.log("err.message:", err?.message);
  console.log("err.response:", JSON.stringify(err?.response?.data, null, 2));
  console.log("FULL ERROR:", err);
} finally {
  console.log("🟡 STEP FINAL — releasing sending");
  setSending(false);
}

};


  // Lightbox state
  const [visible, setVisible] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Pulse animation
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 1100, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);




  // Fading header
  const scrollY = useRef(new Animated.Value(0)).current;
  const blurOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Gallery card width
  const cardW = useMemo(() => Math.min(280, width * 0.72), []);

  return (
  <View style={styles.container}>
    {/* ===== WEBSITE MATCHING BACKGROUND ===== */}
   <LinearGradient
  colors={[
    "#000000",      // deep hero fade
    "#c5c6c7ff",      // dirty light grey
    "#ECEFF3",      // soft concrete tone
    "#F1F3F6",      // premium off-white (NOT pure white)
  ]}
  locations={[0, 0.32, 0.7, 1]}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  style={StyleSheet.absoluteFill}
/>



      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ===== HEADER BLUR ===== */}
      <Animated.View style={[styles.statusBlur, { opacity: blurOpacity }]}>
       <BlurView intensity={90} tint="light" style={StyleSheet.absoluteFill} />
      </Animated.View>

     <Animated.ScrollView
  bounces
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{ paddingBottom: 220 }}
  scrollEventThrottle={16}


  onScroll={Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  )}
>

       {/* ===== HERO ===== */}
<View style={styles.heroWrap}>
  <ImageBackground
    source={{ uri: heroSrc }}
    style={styles.heroImg}
    resizeMode="cover"
  >

    
    {/* Dark top fade */}
    <LinearGradient
      colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0)"]}
      style={StyleSheet.absoluteFill}
    />

    {/* ===== GLASS TITLE CARD ===== */}
    <View style={styles.titleBandWrap}>
      <View style={styles.titleGlassCard}>
        {/* Blur layer */}
        <BlurView
          intensity={55}
          tint="light"
          style={StyleSheet.absoluteFill}
        />

        {/* Glass milk tint */}
        <View style={styles.titleGlassTint} />

        {/* Content */}
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
            <ChromeStars size={14} rating={rating} />
              <Text style={styles.metaText}>
                {rating.toFixed(1)}
              </Text>
              <Text style={styles.muted}>
                ({ratingCount})
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Glass border */}
        <View style={styles.titleGlassBorder} />
      </View>
    </View>
  </ImageBackground>

  {/* Bottom fade */}
  <LinearGradient
    colors={["rgba(0,0,0,0.18)", "rgba(255,255,255,0)"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 0, y: 1 }}
    style={styles.fadeDivider}
  />
</View>

          

{/* ───────── Marketplace Title / Price / Location ───────── */}
<View style={styles.marketplaceMetaBlock}>
  <Text numberOfLines={1} style={styles.listingTitle}>
    {serviceTitle}
  </Text>

  {startingPrice ? (
    <Text style={styles.listingMeta}>
      From ${formatPrice(startingPrice)}
    </Text>
  ) : null}

  <Text style={styles.marketplaceSubline}>
    Listed recently · {service?.location?.city || "Local area"}
  </Text>
</View>

{/* ───────── Marketplace Action Block ───────── */}

<View style={styles.actionCardContainer}>
  {isOwnListing ? (
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
  navigation.navigate("CreateListing", {
    mode: "edit",
    listing: actionService || service,
  })
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

        <TouchableOpacity
          activeOpacity={0.9}
          style={styles.ownerBoostBtn}
        >
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
  ) : (
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
        />

        <TouchableOpacity
          activeOpacity={0.85}
          style={[
            styles.sendButton,
            (!initialMessage.trim() || sending) && { opacity: 0.5 },
          ]}
          disabled={!canChat || !initialMessage.trim() || sending}
          onPress={startConversationFromBox}
        >
          <Text style={styles.sendText}>
            {sending ? "Sending..." : "Send"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  )}
</View>
{/* Bottom Action Icons */}
<View style={styles.marketplaceActions}>
  {[
    {
      label: "Alerts",
      icon: "notifications-outline",
      onPress: () => navigation.navigate("AlertsScreen"),
    },
   
    {
      label: "Share",
      icon: "arrow-redo-outline",
      onPress: () => handleShare(),
    },
    {
      label: "Save",
      icon: "bookmark-outline",
      onPress: () => handleSave(),
    },
  ]
    .filter(Boolean)
    .map((item, i) => (
      <TouchableOpacity
        key={i}
        style={styles.marketplaceActionBtn}
        onPress={item.onPress}
        activeOpacity={0.8}
      >
        <View style={styles.marketplaceIconWrap}>
          <Ionicons name={item.icon} size={20} color="#3d3de8ff" />
        </View>
        <Text style={styles.marketplaceActionText}>
          {item.label}
        </Text>
      </TouchableOpacity>
    ))}
</View>
      {/* ===== GALLERY ===== */}
<View style={[styles.sectionWrap, { paddingTop: 40 }]}>
  <Text style={styles.sectionTitle}>Gallery</Text>

  {/* FULL-BLEED BACKGROUND STRIP */}
  <View style={styles.galleryFullBleed}>
   <ScrollView
  horizontal
  nestedScrollEnabled
  directionalLockEnabled
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{
    paddingHorizontal: PADDING_H,
    paddingBottom: 14,
  }}
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

   {/* AIRBNB SEAM — copied from HeroHeader */}
<View style={styles.galleryDividerWrapper} pointerEvents="none">

  <View style={styles.galleryDivider} />
</View>




  </View>
</View>

{/* ───────── Mini Provider Profile ───────── */}
<View style={styles.providerMiniWrap}>
  <View style={styles.providerMiniCard}>

    {/* Top row */}
    <View style={styles.providerMiniHeader}>
      <View style={styles.providerAvatar}>
        <Text style={styles.providerAvatarText}>
          {companyName
            ?.split(" ")
            .map((w) => w[0])
            .slice(0, 2)
            .join("")
            .toUpperCase()}
        </Text>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.providerName}>{companyName}</Text>

        <View style={styles.providerRatingRow}>
          <Text style={styles.providerStar}>★</Text>
          <Text style={styles.providerRating}>
            {rating.toFixed(1)}
          </Text>
          <Text style={styles.providerRatingCount}>
            ({ratingCount})
          </Text>

          {verified && (
            <View style={styles.providerVerifiedPill}>
              <View style={styles.providerVerifiedDot} />
              <Text style={styles.providerVerifiedText}>
                Helpio Verified
              </Text>
            </View>
          )}
        </View>
      </View>
    </View>

    {/* Stats */}
    <View style={styles.providerStatsRow}>
      <Text style={styles.providerStat}>
        • {service?.helpioChoiceCount || 0} Helpio Choice services
      </Text>
      <Text style={styles.providerStat}>
        • {service?.monthsOnHelpio || 0} months on Helpio
      </Text>
    </View>

    {/* Action */}
<TouchableOpacity
  activeOpacity={0.85}
  style={styles.providerViewBtn}
 onPress={() => {
  navigation.navigate("ProviderProfile", {
    providerId: listingProviderId,
    provider: service?.provider || null,
  });
}}
>
  <Text style={styles.providerViewBtnText}>
    View provider profile
  </Text>
</TouchableOpacity>


    {/* Divider */}
    <View style={styles.providerCardDivider} />

    {/* Description */}
    <View style={styles.providerDescriptionWrap}>
      <Text style={styles.providerDescriptionText}>
        {service.description || "No description provided for this service."}
      </Text>
    </View>

  </View>
</View>






        {/* ===== MAP ===== */}
        <View style={[styles.sectionWrap, { paddingTop: 50, paddingBottom: 40 }]}>
          <Text style={styles.sectionTitle}>Approximate Location</Text>

        <View style={styles.mapShadowWrap}>
  <View style={styles.mapInner}>
   <MapView
  style={StyleSheet.absoluteFill}
  provider={PROVIDER_DEFAULT}
  initialRegion={{
    latitude,
    longitude,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  }}
  showsUserLocation={false}
>

  {/* 5 mile service radius */}
  <Circle
    center={{ latitude, longitude }}
   radius={1609} // 1 miles in meters
    strokeColor="rgba(0,166,255,0.35)"
    fillColor="rgba(0,166,255,0.12)"
  />

  

</MapView>
  </View>
</View>

{/* ===== REVIEWS ===== */}
<View style={[styles.sectionWrap, { paddingTop: 36 }]}>
  <Text style={styles.sectionTitle}>
   Reviews for this service ({reviews.length})
  </Text>


{!isOwnListing && (
  <TouchableOpacity
  activeOpacity={0.85}
  style={[
    styles.leaveReviewBtn,
    !conversationId && { opacity: 0.4 }
  ]}
  disabled={!conversationId}
 onPress={() => {
  if (!conversationId) {
    Alert.alert(
      "Review unavailable",
      "You must message the provider before leaving a review."
    );
    return;
  }

  setLeaveReviewOpen(true);
}}
>
    <Text style={styles.leaveReviewText}>
      Leave a review
    </Text>
  </TouchableOpacity>
)}


  <Text style={styles.reviewsSubline}>
    Real jobs completed through Helpio only
  </Text>



  {/* Average rating */}
{reviewCount > 0 && (
  <View style={styles.reviewAvgRow}>
    <Text style={styles.reviewAvgText}>
      {averageRating.toFixed(1)} out of 5
    </Text>

    <ChromeStars size={18} rating={averageRating} />
  </View>
)}
  {/* Rating bars */}
  <View style={styles.reviewBarsWrap}>
    {[5, 4, 3, 2, 1].map((star) => {
    const count = reviews.filter((r) => r.rating === star).length;

const percent =
  reviewCount > 0
    ? Math.round((count / reviewCount) * 100)
    : 0;
      return (
        <View key={star} style={styles.reviewBarRow}>
          <Text style={styles.reviewBarLabel}>{star} star</Text>

          <View style={styles.reviewBarOuter}>
            <View
              style={[
                styles.reviewBarInner,
                { width: `${percent}%` },
              ]}
            />
          </View>

          <Text style={styles.reviewBarPercent}>{percent}%</Text>
        </View>
      );
    })}
  </View>

 {/* Attribute circles */}
<View style={styles.reviewAttributesWrap}>
  {[
    {
      value:
        service.reviewAttributes?.customerService !== undefined
          ? service.reviewAttributes.customerService.toFixed(1)
          : "0.0",
      label: "Customer\nservice",
    },
    {
      value:
        service.reviewAttributes?.recommendRate !== undefined
          ? `${service.reviewAttributes.recommendRate}%`
          : "0%",
      label: "Customers\nrecommend",
    },
    {
      value:
        service.reviewAttributes?.serviceQuality !== undefined
          ? service.reviewAttributes.serviceQuality.toFixed(1)
          : "0.0",
      label: "Service\nquality",
    },
    {
      value:
        service.reviewAttributes?.onTimeRate !== undefined
          ? service.reviewAttributes.onTimeRate.toFixed(1)
          : "0.0",
      label: "On-time\ncompletion rate",
    },
  ].map((attr, i) => (
    <View key={i} style={styles.reviewAttributeItem}>
      <View style={styles.reviewAttributeCircle}>
        <Text style={styles.reviewAttributeValue}>
          {attr.value}
        </Text>
      </View>
      <Text style={styles.reviewAttributeLabel}>
        {attr.label}
      </Text>
    </View>
  ))}
</View>

  {/* View all */}
  <View style={styles.reviewViewAllWrap}>
    <TouchableOpacity
      activeOpacity={0.85}
      style={styles.reviewViewAllBtn}
    onPress={() => setReviewsOpen(true)}
    >
      <Text style={styles.reviewViewAllText}>View all reviews</Text>
    </TouchableOpacity>
  </View>
</View>



        </View>
      </Animated.ScrollView>

{/* ===== REVIEWS MODAL ===== */}
<ListingReviewsModal
  visible={reviewsOpen}
  onClose={() => setReviewsOpen(false)}
  listingTitle={serviceTitle}
 reviews={reviews}
/>


<LeaveReviewModal
  visible={leaveReviewOpen}
  onClose={() => setLeaveReviewOpen(false)}
  serviceId={service._id}
  providerId={listingProviderId}
 conversationId={conversationId}
  onSubmit={async (data) => {
    try {
      const res = await api.post("/api/reviews", data, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (res.data?.success) {
        Alert.alert("Success", "Review submitted!");

        setLeaveReviewOpen(false);

        // reload listing so rating updates
       const refresh = await api.get(`/api/listings/${service._id}`);
if (refresh.data?.success) {
  setLiveService(refresh.data.listing);
}

const reviewsRes = await api.get(`/api/reviews/${service._id}`);

if (reviewsRes.data?.success) {
  const formatted = (reviewsRes.data.reviews || []).map((r) => ({
    _id: r._id,
    rating: r.rating,
    body: r.comment || "",
    date: new Date(r.createdAt).toLocaleDateString(),
    author: r.user?.name || "Helpio user",
    initials: (r.user?.name || "HU")
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase(),
    images: r.imageUrl ? [r.imageUrl] : [],
  }));

  setReviews(formatted);
}
      }
    } catch (err) {
      console.log("Review error:", err?.response?.data || err);
      Alert.alert(
        "Error",
        err?.response?.data?.message || "Failed to submit review"
      );
    }
  }}
/>

{/* ===== STICKY BOTTOM ACTION BAR ===== */}
{isDraftPreview && (
  <View style={styles.floatingBar} pointerEvents="box-none">

    {/* Edit */}
    <TouchableOpacity
      style={styles.editBtn}
      onPress={() => navigation.goBack()}
      activeOpacity={0.85}
    >
      <Ionicons name="arrow-back" size={18} color="#00A6FF" />
      <Text style={styles.editText}>Edit</Text>
    </TouchableOpacity>

    {/* Publish */}
    <TouchableOpacity
      style={styles.publishBtn}
      onPress={handlePublish}          // ✅ FIXED
      activeOpacity={0.9}
      disabled={publishing}            // ✅ FIXED
    >
      {publishing ? (                 // ✅ FIXED
        <ActivityIndicator color="#fff" />
      ) : (
        <Text style={styles.publishText}>Publish listing</Text>
      )}
    </TouchableOpacity>

  </View>
)}
      {/* ===== LIGHTBOX ===== */}
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

// ===== UTIL =====
function formatPrice(n) {
  try {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
  } catch {
    return String(n);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },

  statusBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 90 : 70,
    zIndex: 10,
  },


ownerActionRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 10,
  marginTop: 6,
  flexWrap: "wrap",
},

/* Primary — Manage */
ownerPrimaryBtn: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,

  paddingHorizontal: 18,   // 🔥 slightly bigger than send
  paddingVertical: 8,      // 🔥 subtle height bump
  borderRadius: 999,

  backgroundColor: "#111827",

  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },

  elevation: 8,
},

ownerPrimaryText: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "700",
},
/* Secondary — Reviews */
ownerSecondaryBtn: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,

  paddingHorizontal: 14,
  paddingVertical: 7,
  borderRadius: 999,

  backgroundColor: "#111827",

  shadowColor: "#000",
  shadowOpacity: 0.14,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },

  elevation: 6,
},

ownerSecondaryText: {
  fontSize: 13.5,
  fontWeight: "700",
  color: "#fff",
},

ownerSecondaryIcon: {
  color: "#FFD369",
},


/* Accent — Boost */
ownerBoostBtn: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,

  paddingHorizontal: 14,
  paddingVertical: 7,
  borderRadius: 999,

  backgroundColor: "#111827",

  borderWidth: 1,
  borderColor: "rgba(0, 0, 0, 0.35)",

  shadowColor: "#000000ff",
  shadowOpacity: 0.25,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },

  elevation: 8,
},

ownerBoostText: {
  fontSize: 13.5,
  fontWeight: "800",
  color: HELPIO_BLUE,
},

/* Icon-only — Dashboard */
ownerDashboardIconBtn: {
  height: 33,
  width: 33,
  borderRadius: 999,
  alignItems: "center",
  justifyContent: "center",

  backgroundColor: "#111827",

  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },

  elevation: 5,
},




 heroWrap: {
  width: "100%",
  height: width * 1.05,
  backgroundColor: "transparent",
},

  heroImg: { flex: 1, justifyContent: "flex-end" },

  titleBandWrap: { paddingHorizontal: PADDING_H, paddingBottom: 24 },

  titleGlassCard: {
  borderRadius: 22,
  overflow: "hidden",
  backgroundColor: "rgba(20,20,20,0.35)",


  shadowColor: "#000",
  shadowOpacity: 0.35,
  shadowRadius: 30,
  shadowOffset: { width: 0, height: 18 },
  elevation: 18,
},

titleGlassTint: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(255,255,255,0.06)",
},

titleGlassBorder: {
  ...StyleSheet.absoluteFillObject,
  borderRadius: 22,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.14)",
},


  titleInner: { paddingVertical: 14, paddingHorizontal: 16 },

  title: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: 0.3 },

  metaRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: HELPIO_BLUE,
    marginRight: 6,
  },

  verifiedText: { color: "#EAF2FF", fontWeight: "700" },

  metaDot: { color: "rgba(255,255,255,0.5)", marginHorizontal: 2 },

  metaText: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },

  muted: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: "600",
  },

  fadeDivider: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
    height: 2,
  },
sectionWrap: {
  paddingHorizontal: PADDING_H,
  paddingTop: 22,
  paddingBottom: 22,
  backgroundColor: "transparent",
},

descriptionWrap: {
  paddingTop: 18,
  paddingBottom: 30, // space before gallery
},



  sectionTitle: {
    color: "#020617",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.2,
    marginBottom: 8,
  },

  aboutLine: {
    color: "#4A5568",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 14,
  },

  priceCard: {
  paddingVertical: 10,
  paddingHorizontal: 2,
},


  priceHint: { color: "#6B7280", fontSize: 15, marginBottom: 6 },

  priceValue: {
    fontSize: 32,
    fontWeight: "900",
    color: HELPIO_BLUE,
  },

  galleryBg: {
    position: "absolute",
    top: 44,
    left: 0,
    right: 0,
    height: 120,
    opacity: 0.5,
  },

  card: {
  height: 180,
  marginRight: 14,
  borderRadius: 18,
  overflow: "hidden",
  backgroundColor: "transparent",

  shadowColor: "#000",
  shadowOpacity: 0.28,
  shadowRadius: 26,
  shadowOffset: { width: 0, height: 18 },
  elevation: 10,
},


  cardImg: { width: "100%", height: "100%" },

  cardShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },

  cardFooter: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: 999,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  cardFootText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.3,
  },

aboutChipsRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 14,
  paddingVertical: 12,

  // ❌ REMOVE ANY BACKGROUND / BLUR / COLOR
  backgroundColor: "transparent",
},

aboutChipsGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 14,                 // iOS 17+ spacing
  marginTop: 8,
  marginBottom: 16,

  // Prevents edge crowding
  paddingRight: 6,
},


aboutChip: {
  flexDirection: "row",
  alignItems: "center",

  paddingHorizontal: 18,
  paddingVertical: 10,

  borderRadius: 999,

  backgroundColor: "rgba(248,249,251,0.96)",

  // ❌ NO SHADOW HERE
},



aboutChipShadowWrap: {
  borderRadius: 999,

  shadowColor: "#000",
  shadowOpacity: 0.18,
  shadowRadius: 56,
  shadowOffset: { width: 0, height: 32 },

  elevation: 14,
},




aboutChipText: {
  fontSize: 13.5,
  fontWeight: "600",
  color: "#111827",
  letterSpacing: 0.15,
},


floatingBar: {
  position: "absolute",
  left: 16,
  right: 16,
  bottom: Platform.OS === "ios" ? 34 : 20,

  flexDirection: "row",
  alignItems: "center",
},







bottomSheetWrap: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,

  // this creates the “sheet height”
  paddingTop: 20,

  // adds extra “taller white area”
  paddingBottom: 10,

  // soft iOS blur vibe
  backgroundColor: "rgba(255,255,255,0.92)",

  borderTopLeftRadius: 26,
  borderTopRightRadius: 26,

  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 24,
  shadowOffset: { width: 0, height: -10 },

  elevation: 25,
},


reviewAttributeCircle: {
  width: 56,
  height: 56,
  borderRadius: 999,

  borderWidth: 3,
  borderColor: HELPIO_BLUE,

  alignItems: "center",
  justifyContent: "center",

  backgroundColor: "#FFFFFF",

  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 12,
  shadowOffset: { width: 0, height: 6 },

  elevation: 6,
},


editBtn: {
  flex: 1,
  height: 56,
  borderRadius: 999,
  borderWidth: 1.5,
  borderColor: "#00A6FF",

  alignItems: "center",
  justifyContent: "center",
  flexDirection: "row",
  gap: 6,
  marginRight: 12,

  backgroundColor: "rgba(255,255,255,0.9)",

  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 8 },
  elevation: 8,
},

editText: {
  color: "#00A6FF",
  fontWeight: "600",
  fontSize: 15,
},

publishBtn: {
  flex: 1,
  height: 56,
  borderRadius: 999,
  backgroundColor: "#00A6FF",

  alignItems: "center",
  justifyContent: "center",

  shadowColor: "#00A6FF",
  shadowOpacity: 0.45,
  shadowRadius: 22,
  shadowOffset: { width: 0, height: 12 },
  elevation: 14,
},


publishText: {
  color: "#fff",
  fontWeight: "800",
  fontSize: 16,
  letterSpacing: 0.3,
},


leaveReviewBtn: {
  alignSelf: "flex-start",
  marginTop: 10,
  marginBottom: 16,
  paddingHorizontal: 18,
  paddingVertical: 8,
  borderRadius: 999,
  backgroundColor: HELPIO_BLUE,

  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 10,
},

leaveReviewText: {
  color: "#fff",
  fontSize: 13.5,
  fontWeight: "700",
},


  ctaWrap: {
    position: "absolute",
    bottom: Platform.select({ ios: 35, android: 30 }),
    alignSelf: "center",
  },

  ctaBlur: {
    borderRadius: 30,
    overflow: "hidden",
    padding: 2,
  },

  ctaBtn: {
    height: 60,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
shadowOpacity: 0.25,
shadowRadius: 24,
shadowOffset: { width: 0, height: 18 },

  },

  ctaText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 0.3,
  },

galleryFullBleed: {
  marginLeft: -PADDING_H,
  marginRight: -PADDING_H,
},


 mapShadowWrap: {
  marginTop: 22,
  borderRadius: 24,
  

  // 🔥 HEAVY PREMIUM SHADOW
  shadowColor: "#000",
  shadowOpacity: 0.35,
  shadowRadius: 48,
  shadowOffset: { width: 0, height: 32 },

  // Android
  elevation: 18,
},

galleryShadowWrap: {
  marginRight: 16,
  borderRadius: 22,

  // 🔥 HEAVY PREMIUM FLOAT
  shadowColor: "#000",
  shadowOpacity: 0.30,
  shadowRadius: 40,
  shadowOffset: { width: 0, height: 30 },

  // Android
  elevation: 16,
},

galleryInner: {
  height: 180,
  borderRadius: 22,
  overflow: "hidden",
  backgroundColor: "transparent",
},

aboutSection: {
  marginTop: 28,
  paddingHorizontal: 16,
},


/* Grid Layout */
offerGrid: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  marginBottom: 20,
},

/* Floating Cards */
offerRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 14,          // 🔥 modern spacing (RN 0.71+)
  paddingHorizontal: PADDING_H,
},




offerChip: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,

  height: 44,              // 🔥 consistent pill height
  paddingHorizontal: 16,

  backgroundColor: "#fff",
  borderRadius: 999,

  shadowColor: "#000",
  shadowOpacity: 0.18,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 6 },

  elevation: 8,
},


offerChipText: {
  fontSize: 13.5,
  fontWeight: "600",
  color: "#1F2937",
  letterSpacing: 0.2,
},

/* Description Card */

aboutDescription: {
  fontFamily: Platform.select({
    ios: "SF Pro Display",
    android: "Inter-SemiBold", // or Inter-Medium if installed
  }),

  fontSize: 13.5,        // ⬆️ bigger = authority
  fontWeight: Platform.OS === "ios" ? "600" : "normal",
  color: "#0B0F19",

  lineHeight: 30,        // taller lines = luxury spacing
  letterSpacing: 0.45,  // 🔥 THIS is the magic
},

offerFullBleed: {
  marginLeft: -PADDING_H,
  marginRight: -PADDING_H,

  height: 72,                 // 🔥 taller than pills
  justifyContent: "center",   // vertical centering
  backgroundColor: "rgba(0, 0, 0, 0.08)",

  // subtle depth
  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 14,
  shadowOffset: { width: 0, height: 6 },
},



galleryDividerWrapper: {
  height: 7,                 // same as hero
  marginHorizontal: -PADDING_H,

   backgroundColor: "#bab8b8ff", // REQUIRED for iOS shadows

  shadowColor: "#000",
  shadowOpacity: 0.85,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 8 },

  elevation: 10,             // Android
},

galleryDivider: {
  height: StyleSheet.hairlineWidth,
  backgroundColor: "rgba(0,0,0,0.18)",
},

/* ───────── Reviews ───────── */

reviewsSubline: {
  fontSize: 12.5,
  color: "#6B7280",
  marginTop: -4,
  marginBottom: 12,
},

reviewAvgRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 14,
},

reviewAvgText: {
  fontSize: 16,
  fontWeight: "600",
  color: "#374151",
},

reviewStars: {
  fontSize: 18,
  color: HELPIO_BLUE,
  letterSpacing: 2,
},

reviewBarsWrap: {
  marginTop: 4,
  marginBottom: 18,
},

reviewBarRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  marginBottom: 6,
},

reviewBarLabel: {
  width: 52,
  fontSize: 13,
  color: "#111827",
},

reviewBarOuter: {
  flex: 1,
  height: 12,
  backgroundColor: "#E5E7EB",
  borderRadius: 999,
  overflow: "hidden",
},

reviewBarInner: {
  height: "100%",
  backgroundColor: HELPIO_BLUE,
},

reviewBarPercent: {
  width: 36,
  fontSize: 12.5,
  color: "#374151",
  textAlign: "right",
},

reviewAttributesWrap: {
  flexDirection: "row",
  flexWrap: "wrap",
  gap: 12,
  marginTop: 6,
},

reviewAttributeItem: {
  flexDirection: "row",
  alignItems: "center",
  gap: 8,
  width: "48%",
},

reviewAttributeCircle: {
  width: 46,
  height: 46,
  borderRadius: 999,
  borderWidth: 3,
  borderColor: HELPIO_BLUE,
  alignItems: "center",
  justifyContent: "center",
},

reviewAttributeValue: {
  fontSize: 14,
  fontWeight: "700",
  color: "#111827",
},

reviewAttributeLabel: {
  fontSize: 13,
  color: "#4B5563",
  lineHeight: 14,
},

reviewViewAllWrap: {
  alignItems: "center",
  marginTop: 50,   // was 26
  marginBottom: 10, // optional: adds slight breathing room before next section
},

reviewViewAllBtn: {
  paddingHorizontal: 26,
  paddingVertical: 8,
  borderRadius: 999,
  backgroundColor: HELPIO_BLUE,
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 8 },
  elevation: 10,
},

reviewViewAllText: {
  color: "#fff",
  fontSize: 14,
  fontWeight: "700",
},

/* ───────── Mini Provider Profile ───────── */

providerMiniWrap: {
  paddingHorizontal: PADDING_H,
  marginTop: 18,
  marginBottom: 8,
},

providerMiniCard: {
  borderRadius: 18,
  backgroundColor: "#e1e1e3ff",

  // 🔑 Split padding so card can grow downward
  paddingTop: 16,
  paddingHorizontal: 16,
  paddingBottom: 50,

  shadowColor: "#000",
  shadowOpacity: 0.18,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },

  elevation: 12,
},


providerMiniHeader: {
  flexDirection: "row",
  alignItems: "center",
  gap: 12,
},

providerAvatar: {
  width: 44,
  height: 44,
  borderRadius: 999,
  backgroundColor: HELPIO_BLUE,
  alignItems: "center",
  justifyContent: "center",
},

providerAvatarText: {
  color: "#fff",
  fontWeight: "800",
  fontSize: 15,
},

providerName: {
  fontSize: 16,
  fontWeight: "700",
  color: "#020617",
},

providerRatingRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  marginTop: 2,
  flexWrap: "wrap",
},

providerStar: {
  color: HELPIO_BLUE,
  fontSize: 14,
},

providerRating: {
  fontSize: 14,
  fontWeight: "600",
  color: "#111827",
},

providerRatingCount: {
  fontSize: 13,
  color: "#6B7280",
},

providerVerifiedPill: {
  flexDirection: "row",
  alignItems: "center",
  marginLeft: 8,
  backgroundColor: "rgba(0,166,255,0.1)",
  borderRadius: 999,
  paddingHorizontal: 8,
  paddingVertical: 3,
},

providerVerifiedDot: {
  width: 6,
  height: 6,
  borderRadius: 6,
  backgroundColor: HELPIO_BLUE,
  marginRight: 4,
},

providerVerifiedText: {
  fontSize: 12,
  fontWeight: "600",
  color: HELPIO_BLUE,
},

providerStatsRow: {
  marginTop: 10,
  gap: 4,
},

providerStat: {
  fontSize: 13,
  color: "#374151",
},

providerViewBtn: {
  marginTop: 14,
  alignSelf: "flex-start",
  paddingHorizontal: 18,
  paddingVertical: 8,
  borderRadius: 999,
  backgroundColor: "#111827",
},

providerViewBtnText: {
  color: "#fff",
  fontSize: 13.5,
  fontWeight: "700",
},


/* ───────── Marketplace Title / Price / Location ───────── */

marketplaceMetaBlock: {
  paddingHorizontal: 16,
  paddingTop: 10,     // ↓ was 14
  paddingBottom: 6,   // ↓ was 10
},


listingTitle: {
  fontSize: 22,          // was 13
  fontWeight: "900",
  color: "#0B0B0F",
  letterSpacing: -0.2,
},

listingMeta: {
  fontSize: 16,          // was 12
  fontWeight: "800",
  color: "rgba(15,15,20,0.65)",
  marginTop: 4,
},
marketplaceSubline: {
  fontSize: 13,        // ↓ was 14
  color: "#6B7280",
   marginTop: 8,
  fontWeight: "500",
},


/* ===== Services — Content Only ===== */

servicesInlineRow: {
  flexDirection: "row",
  alignItems: "center",
  flexWrap: "wrap",
  marginTop: 6,
  marginBottom: 14,
},

servicesInlineText: {
  fontSize: 13.5,
  fontWeight: "600",
  letterSpacing: 1.2,
  color: "#3092b9ff", // same family as section text
},

servicesInlineDot: {
  marginHorizontal: 10,
  fontSize: 16,
  color: "rgba(84, 84, 86, 1)",
},

/* ───────── Marketplace About Block ───────── */

marketplaceBlock: {
  marginTop: 18,   // ↓ was 28
  marginBottom: 6, // ↓ was 10
},

messageSellerCard: {
  marginHorizontal: 16,
  paddingHorizontal: 14,
  paddingVertical: 12,
  borderRadius: 16, // ↓ was 20
  backgroundColor: "#e9e6e6ff",

  // FB Marketplace–style subtle float
  shadowColor: "#000",
  shadowOpacity: 0.22,
  shadowRadius: 18,
  shadowOffset: { width: 0, height: 10 },

  elevation: 14,
  marginBottom: 14,
},


messageHeader: {
  flexDirection: "row",
  alignItems: "center",
  gap: 6,
  marginBottom: 8, // ↓ was 12
},


messageTitle: {
  fontSize: 14,     // ↓ was 15
  fontWeight: "700",
  color: "#111",
},


messageInputRow: {
  flexDirection: "row",
  alignItems: "center",
  backgroundColor: "#F2F3F5",
  borderRadius: 999,
  paddingHorizontal: 12,
  paddingVertical: 8, // ↓ was 10
},

messagePlaceholder: {
  flex: 1,
  fontSize: 13.5,   // ↓ was 14
  color: "#6B7280",
},


sendButton: {
  marginLeft: 8,
 backgroundColor: "#3d3de8ff",
  paddingHorizontal: 16, // ↓ was 20
  paddingVertical: 6,    // ↓ was 8
  borderRadius: 999,

  shadowColor: "#000",
  shadowOpacity: 0.18,
  shadowRadius: 8,
  shadowOffset: { width: 0, height: 4 },

  elevation: 6,
},

sendText: {
  color: "#FFF",
  fontSize: 13.5, // ↓ was 14
  fontWeight: "700",
},


marketplaceActions: {
  flexDirection: "row",
  justifyContent: "space-around",
  paddingHorizontal: 12,
},

marketplaceActionBtn: {
  alignItems: "center",
  justifyContent: "center",
  paddingVertical: 6,
  paddingHorizontal: 10,
},

marketplaceActionText: {
  marginTop: 4,
  fontSize: 10.5,
  fontWeight: "600",
  color: "#111",
  textAlign: "center",
  lineHeight: 13, // 🔥 stabilizes baseline
},

aboutServiceWrap: {
  marginTop: 6,
},


marketplaceIconWrap: {
  height: 26,            // 🔥 normalizes all icon glyphs
  alignItems: "center",
  justifyContent: "center",
},


messageInput: {
  flex: 1,
  fontSize: 13.5,
  color: "#111",
  paddingVertical: Platform.OS === "ios" ? 6 : 2,
  maxHeight: 72,              // prevents runaway growth
},


mapInner: {
  height: 220,
  borderRadius: 24,
  overflow: "hidden",
  backgroundColor: "#EDEFF3",
},

/* ───────── Provider Card — Description Extension ───────── */

providerCardDivider: {
  marginTop: 16,
  marginBottom: 12,
  height: StyleSheet.hairlineWidth,
  backgroundColor: "rgba(0,0,0,0.12)",
},

providerDescriptionWrap: {
  paddingTop: 2,
},

actionCardContainer: {
  marginTop: 15, // 🔥 pushes the message/manage box down
},

providerDescriptionText: {
  fontSize: 14.5,
  fontWeight: "500",
  color: "#0B0F19",
  lineHeight: 26,
  letterSpacing: 0.35,
},


});
