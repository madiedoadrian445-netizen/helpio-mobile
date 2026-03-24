//src/screens/AllServicesScreen.js
import React, { useEffect, useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Platform,
  Alert,
 Animated as RNAnimated,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import HeroHeader from "../components/HeroHeader";
import { useTheme } from "../ThemeContext";
import { api } from "../config/api";
import useAuthStore from "../store/auth";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import { FlatList } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import ServiceCardSkeleton from "../components/ServiceCardSkeleton";
import { DeviceEventEmitter } from "react-native";
import { useIsFocused } from "@react-navigation/native";
import FeedStars from "../components/FeedStars";
import Animated from "react-native-reanimated";


const HELP_IO_BLUE = "#00A6FF";

const SIZE = 72;
const RADIUS = SIZE / 2;

// Featured placeholders

export default function AllServicesScreen({ navigation, route }) {

  const { darkMode, theme } = useTheme();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState("");
  const [localActive, setLocalActive] = useState(false);
  const [priceVisible, setPriceVisible] = useState(false);
  const [sortVisible, setSortVisible] = useState(false);
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortOrder, setSortOrder] = useState(null);
  const user = useAuthStore((state) => state.user);
  const provider = useAuthStore((state) => state.provider);
const [activeFeed, setActiveFeed] = useState("trending");
const [page, setPage] = useState(1);
const [hasMore, setHasMore] = useState(true);
const [latitude, setLatitude] = useState(null);
const [longitude, setLongitude] = useState(null);




const isFetchingRef = useRef(false);
const pullY = useRef(new RNAnimated.Value(0)).current;
const isRefreshingRef = useRef(false);
const armedRef = useRef(false);
const cachedCoordsRef = useRef(null);
const resHasMoreRef = useRef(true);
const flatListRef = useRef(null);
const lastHapticYRef = useRef(0);
const lastHapticTimeRef = useRef(0);
const endReachedDuringMomentum = useRef(false);
const isMomentumScrollingRef = useRef(false);
const isFocused = useIsFocused();
const [zip, setZip] = useState("33101");

const [radius, setRadius] = useState(15);


const scrollToTop = () => {
  flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
};

useEffect(() => {
  const sub = DeviceEventEmitter.addListener("HELPIO_HOME_TAP", (payload) => {
    if (!isFocused) return; // ✅ only when Home screen is active

    if (payload?.type === "double") {
      scrollToTop();
      triggerHandshakeRefresh();
      return;
    }

    scrollToTop();
  });

  return () => sub.remove();
}, [isFocused]);

// load saved ZIP
useEffect(() => {
  (async () => {
    const savedZip = await AsyncStorage.getItem("user_zip");
    if (savedZip) setZip(savedZip);
  })();
}, []);

// save ZIP


const scale = useRef(new RNAnimated.Value(1)).current;

const handlePressIn = () => {
  RNAnimated.spring(scale, {
    toValue: 0.92,
    useNativeDriver: true,
  }).start();

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
};

const handlePressOut = () => {
  RNAnimated.spring(scale, {
    toValue: 1,
    friction: 4,
    useNativeDriver: true,
  }).start();
};

const resolveUserCoordinates = async () => {
  if (latitude !== null && longitude !== null) {
    return { lat: latitude, lng: longitude };
  }

  return { lat: 25.7617, lng: -80.1918 };
};
const handleFeedLocationChange = async (location) => {
  const { lat, lng, zip: selectedZip, radius: selectedRadius } = location;

  setLatitude(lat);
  setLongitude(lng);
  setZip(selectedZip || zip);
  setRadius(selectedRadius || radius);

  await AsyncStorage.setItem("user_zip", selectedZip || "");
  await AsyncStorage.setItem("user_lat", String(lat));
  await AsyncStorage.setItem("user_lng", String(lng));

  Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

  cachedCoordsRef.current = null;
  setHasMore(true);
  setPage(1);
 setLoading(true);
setServices([]);

 fetchServices(1, true, true, lat, lng);
};
  /* ============================================================
      FETCH LISTINGS FROM BACKEND
  ============================================================ */
 const PAGE_SIZE = 20;

const fetchServices = async (
  pageToLoad = 1,
  replace = false,
  forceRefresh = false,
  overrideLat = null,
  overrideLng = null,
  overrideSearch = null   // 👈 ADD THIS
) => {

 

  if (isFetchingRef.current) return;
 if (!replace && !resHasMoreRef.current) return;
  isFetchingRef.current = true;

  try {
    // 🔥 Resolve real user GPS location
const coords =
  overrideLat !== null && overrideLng !== null
    ? { lat: overrideLat, lng: overrideLng }
    : await resolveUserCoordinates();

const { lat, lng } = coords;

   const params = new URLSearchParams({
  lat,
  lng,
  radius, // 🔥 ADD THIS
  page: pageToLoad,
  pageSize: PAGE_SIZE,
});

if (forceRefresh) {
  params.append("refresh", "true");
}

const effectiveSearch =
  overrideSearch !== null ? overrideSearch : search;

if (effectiveSearch.trim()) {
  params.append("search", effectiveSearch.trim());
}

const res = await api.get(`/api/listings/feed?${params.toString()}`);



    const incoming = res.data?.items || [];
    const total = res.data?.total ?? 0;

  
    setPage(pageToLoad);

    // determine if more pages exist
  setServices((prev) => (replace ? incoming : [...prev, ...incoming]));

const backendHasMore = res.data?.hasMore ?? false;

setHasMore(backendHasMore);
resHasMoreRef.current = backendHasMore;
  } catch (e) {
    console.log("❌ Fetch V1 feed error:", e);
  } finally {
    isFetchingRef.current = false;
    setLoading(false);
    setRefreshing(false);
  }
};

useEffect(() => {
  const init = async () => {
    let lat = 25.7617;
    let lng = -80.1918;

    try {
      const savedLat = await AsyncStorage.getItem("user_lat");
      const savedLng = await AsyncStorage.getItem("user_lng");

      if (savedLat && savedLng) {
        lat = parseFloat(savedLat);
        lng = parseFloat(savedLng);

        setLatitude(lat);
        setLongitude(lng);
      }
    } catch (e) {}

    // pass directly instead of waiting for state
    fetchServices(1, true, true, lat, lng);
  };

  init();
}, []);
useEffect(() => {
  if (!isFocused) return;

  const q = route?.params?.searchQuery;

  if (typeof q === "string") {
    setSearch(q);

    setHasMore(true);
    setPage(1);
    setLoading(true);
    setServices([]);

    fetchServices(1, true, false, null, null, q);

    // 🔥 CLEAR PARAM AFTER USING IT
    navigation.setParams({ searchQuery: undefined });
  }
}, [isFocused, route?.params?.searchQuery]);



 const isSearching = search.trim().length > 0;

useEffect(() => {
  if (isSearching) {
    setPage(1);
    endReachedDuringMomentum.current = false;
  }
}, [search]);

 const onRefresh = () => {
  if (isFetchingRef.current) return;
  setRefreshing(true);
  setHasMore(true);
  setPage(1);
  fetchServices(1, true);
};



const triggerHandshakeRefresh = () => {
  if (isRefreshingRef.current) return;

  isRefreshingRef.current = true;
  armedRef.current = false;



RNAnimated.sequence([
  RNAnimated.timing(pullY, {
    toValue: -120,
    duration: 180,
    useNativeDriver: true,
  }),
  RNAnimated.sequence([
    RNAnimated.timing(pullY, { toValue: -135, duration: 90, useNativeDriver: true }),
    RNAnimated.timing(pullY, { toValue: -120, duration: 90, useNativeDriver: true }),
    RNAnimated.timing(pullY, { toValue: -135, duration: 90, useNativeDriver: true }),
    RNAnimated.timing(pullY, { toValue: -120, duration: 90, useNativeDriver: true }),
  ]),
]).start(async () => {
  setRefreshing(true);

  await fetchServices(1, true, true);

  RNAnimated.timing(pullY, {
    toValue: 0,
    duration: 220,
    useNativeDriver: true,
  }).start(() => {
    isRefreshingRef.current = false;
  });
});
};


  /* ============================================================
      NORMALIZE BACKEND LISTINGS — WITH FIX
  ============================================================ */
 const normalizedServices = React.useMemo(() => {
  return services.map((s) => ({
    _id: s._id,
    title: s.title || "",
    description: s.description || "",
    category: s.category || "",
    price: Number(s.price) || 0,
    distanceMiles: Number(s.distanceMiles ?? 9999),

    location:
      typeof s.location === "object" && s.location !== null
        ? s.location
        : { city: "Miami", state: "FL" },

    businessName:
      typeof s.businessName === "string" && s.businessName.trim()
        ? s.businessName.trim()
        : undefined,

    photos: (() => {
      if (Array.isArray(s.photos) && s.photos.length > 0) {
        return s.photos;
      }

      if (typeof s.photos === "string") {
        return [s.photos];
      }

      if (Array.isArray(s.images) && s.images.length > 0) {
        return s.images;
      }

      if (typeof s.images === "string") {
        return [s.images];
      }

      if (Array.isArray(s.media) && s.media.length > 0) {
        return s.media.map((m) => m?.url || m?.uri || m);
      }

      return [];
    })(),

    provider: s.provider || null,
   rating: Number(s.rating) || 0,
reviewCount: Number(s.ratingCount) || 0,
  }));
}, [services]);

  /* ============================================================
      LOCATION FORMATTER (unchanged)
  ============================================================ */
const formatLocation = (loc) => {
  if (!loc) return "Location";

  // New structured object
  if (typeof loc === "object") {
    if (loc.city && loc.state) return `${loc.city}, ${loc.state}`;
    if (loc.zip) return `ZIP ${loc.zip}`;
    return "Location";
  }

  // Legacy string fallback
  if (typeof loc === "string") return loc.trim();

  return "Location";
};

  /* ============================================================
      FILTERS
  ============================================================ */
  const applyFilters = () => {
    let filtered = [...normalizedServices];

   


    if (minPrice && maxPrice) {
      filtered = filtered.filter(
        (s) =>
          s.price >= parseFloat(minPrice) &&
          s.price <= parseFloat(maxPrice)
      );
    }

    if (sortOrder === "asc") filtered.sort((a, b) => a.price - b.price);
    if (sortOrder === "desc") filtered.sort((a, b) => b.price - a.price);
return filtered;
  };

 const filtered = React.useMemo(
  () => applyFilters(),
  [normalizedServices, minPrice, maxPrice, sortOrder]
);


  
const feedAlgorithms = {
  choice: () => filtered.filter((s) => s.provider?.isChoice),
  verified: () => filtered.filter((s) => s.provider?.verified),
  trending: () => filtered, // no sorting here
};


const activeServices =
  feedAlgorithms[activeFeed]?.() ?? feedAlgorithms.trending();


// ⭐ FIRST LOAD SKELETON (Apple-style)
if (loading) {
  return (
    <View style={{ flex: 1, paddingTop: 120, paddingHorizontal: 8 }}>
      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          justifyContent: "space-between",
        }}
      >
        {Array.from({ length: 6 }).map((_, i) => (
          <ServiceCardSkeleton key={i} />
        ))}
      </View>
    </View>
  );
}



 /* ============================================================
   RENDER
============================================================ */
return (
  <View style={styles.safe}>
{/* GLOBAL ATMOSPHERIC BACKGROUND (SOURCE OF TRUTH) */}
<LinearGradient
  colors={[
   "rgba(4, 75, 168, 1)",
    "rgba(232,236,241,0.95)",
    "rgba(240,242,245,0.6)",
    "rgba(246,247,248,0.0)",
  ]}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  style={styles.tabsGradient}
/>

<LinearGradient
  colors={[
    "rgba(230,235,242,0.95)", // top atmospheric gray (this is the key)
    "rgba(235,239,245,0.70)",
    "rgba(240,243,247,0.35)",
    "rgba(246,247,248,0.00)",
  ]}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  style={styles.tabsGradient}
/>



    {/* TOP BAR */}
    <BlurView intensity={40} tint={theme.blurTint} style={styles.topBlur}>
     
     
     <View style={styles.headerContainer}>
  <Text
    style={[
      styles.headerTitleBlue,
      { color: HELP_IO_BLUE, fontSize: 20.5 },
    ]}
  >
    BusinessPlace
  </Text>

  {/* RIGHT SIDE */}
  <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
    
    {/* ZIP CHIP */}
    <TouchableOpacity
      activeOpacity={0.8}
     onPress={() =>
  navigation.navigate("LocationPicker", {
    onSelect: handleFeedLocationChange,
  })
}
      style={styles.zipChipWrap}
    >
      <BlurView intensity={40} tint={theme.blurTint} style={styles.zipChip}>
        <Ionicons name="location-sharp" size={14} color="#000" />
     <Text style={styles.zipText}>
  {zip || "Miami"}
</Text>
        <Ionicons name="chevron-down" size={12} color="#000" />
      </BlurView>
    </TouchableOpacity>



{/* HAMBURGER MENU */}
<TouchableOpacity
  activeOpacity={0.7}
  onPress={() => navigation.openDrawer?.() || navigation.navigate("MenuScreen")}
  style={styles.iconWrap}
>
  <BlurView intensity={40} tint={theme.blurTint} style={styles.blurCircle}>
   <Ionicons name="menu" size={20} color="#000" />
  </BlurView>
</TouchableOpacity>



    {/* NOTIFICATIONS */}
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={() => navigation.navigate("Notifications")}
      style={styles.iconWrap}
    >
      <BlurView intensity={40} tint={theme.blurTint} style={styles.blurCircle}>
        <Ionicons name="notifications-outline" size={20} color="#000" />
        <View style={styles.badgeDot} />
      </BlurView>
    </TouchableOpacity>

  </View>
</View>
       
    
    </BlurView>

{/* HANDSHAKE REFRESH OVERLAY */}
<RNAnimated.View
  pointerEvents="none"
  style={{
    position: "absolute",
    top: Platform.OS === "ios" ? 90 : 75,
    left: 0,
    right: 0,
    height: 80,
    zIndex: 30,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    opacity: pullY.interpolate({
      inputRange: [-120, -60, 0],
      outputRange: [1, 0.5, 0],
      extrapolate: "clamp",
    }),
  }}
>
<RNAnimated.Image
    source={require("../assets/refresh/hand_left.png")}
    style={{
      width: 42,
      height: 42,
      transform: [
        {
          translateX: pullY.interpolate({
            inputRange: [-120, 0],
            outputRange: [0, -34],
            extrapolate: "clamp",
          }),
        },
        { translateY: 2 },
      ],
    }}
  />

 <RNAnimated.Image
    source={require("../assets/refresh/hand_right.png")}
    style={{
      width: 42,
      height: 42,
      marginLeft: -8,
      transform: [
        {
          translateX: pullY.interpolate({
            inputRange: [-120, 0],
            outputRange: [0, 34],
            extrapolate: "clamp",
          }),
        },
        { translateY: -1 },
      ],
    }}
  />
</RNAnimated.View>




 <FlatList
  ref={flatListRef}
  data={activeServices}
 keyExtractor={(item) => String(item._id)}
  numColumns={2}
  

ListEmptyComponent={
  !loading ? (
    <View style={{ alignItems: "center", marginTop: 120, paddingHorizontal: 40 }}>
      
      <Ionicons name="search-outline" size={48} color="#C7C7CC" />

      <Text
        style={{
          marginTop: 14,
          fontSize: 18,
          fontWeight: "700",
          color: theme.text,
          textAlign: "center",
        }}
      >
        No services nearby yet
      </Text>

      <Text
        style={{
          marginTop: 6,
          fontSize: 14,
          color: theme.subtleText,
          textAlign: "center",
          lineHeight: 20,
        }}
      >
        We’re carefully curating top providers in your area.
        {"\n"}
        Try another ZIP or check back soon.
      </Text>
    </View>
  ) : null
}



ListHeaderComponent={
  
  <>
  
  <HeroHeader
    search={search}
    setSearch={setSearch}
    activeFeed={activeFeed}
    onFeedChange={(key) => setActiveFeed(key)}
    onLocalPress={() => setLocalActive(!localActive)}
    onPricePress={() => setPriceVisible(true)}
    onSortPress={() => setSortVisible(true)}
  />




   <View style={styles.trendingHeaderRow}>
  <Text style={[styles.sectionTitle, { color: theme.text }]}>
    {activeFeed === "choice"
      ? "Helpio’s Choice"
      : activeFeed === "verified"
      ? "Helpio Verified"
      : "Trending Now"}
  </Text>






{/* Inline compact search */}
<View style={{ flex: 1, marginLeft: 80 }}>
 <Animated.View style={styles.searchPill}>
    
    <BlurView intensity={35} tint="light" style={StyleSheet.absoluteFill} />
    <View style={styles.searchPillTint} />

    <Ionicons
  name="search-outline"
  size={16}                 // ⬅️ was 18
  color="#6B7280"
  style={{ marginRight: 6 }} // ⬅️ tighter
/>
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={() => navigation.navigate("SearchMarketplace")}
      style={{ flex: 1 }}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.searchInput,
          { color: search.trim() ? "#111827" : "#9CA3AF" },
        ]}
      >
        {search.trim() ? search : "Search"}
      </Text>
    </TouchableOpacity>

    {search.trim().length > 0 ? (
      <TouchableOpacity
        onPress={() => {
          setSearch("");
          setHasMore(true);
          setPage(1);
          setLoading(true);
          setServices([]);
          fetchServices(1, true, true, null, null, "");
        }}
        style={styles.micBtn}
      >
        <Ionicons name="close" size={18} color="#6B7280" />
      </TouchableOpacity>
    ) : (
      <View style={styles.micBtn}>
        <Ionicons name="mic-outline" size={18} color="#6B7280" />
      </View>
    )}
  </Animated.View>
</View>

</View>


  </>
}



contentContainerStyle={{
  paddingTop: Platform.OS === "ios" ? 70 : 76,   // 👈 pulls everything up
  paddingBottom: 140,
}}





columnWrapperStyle={{
  justifyContent: "space-between",
  paddingHorizontal: 0, // ❌ remove completely
}}


  scrollEventThrottle={16}
  showsVerticalScrollIndicator={false}
  bounces

  onScroll={(e) => {
  const y = e.nativeEvent.contentOffset.y;

  // 🔒 Passive mirror only — does NOT control scroll
  pullY.setValue(Math.min(0, y));


  const now = Date.now();

  if (isRefreshingRef.current) return;
  if (now - lastHapticTimeRef.current < 80) return;

  if (y < -20 && y > -60 && y < lastHapticYRef.current - 8) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    lastHapticTimeRef.current = now;
    lastHapticYRef.current = y;
  }

  if (y <= -60 && y > -110 && y < lastHapticYRef.current - 10) {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    lastHapticTimeRef.current = now;
    lastHapticYRef.current = y;
  }

  if (y <= -110 && !armedRef.current) {
    armedRef.current = true;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
  }

  if (y > -40) {
    armedRef.current = false;
    lastHapticYRef.current = 0;
  }
}}

  onScrollEndDrag={() => {
  if (
    armedRef.current &&
    !isRefreshingRef.current &&
    !isMomentumScrollingRef.current
  ) {
    triggerHandshakeRefresh();
  }
}}


  onMomentumScrollBegin={() => {
  isMomentumScrollingRef.current = true;
  endReachedDuringMomentum.current = false;
}}

onMomentumScrollEnd={() => {
  isMomentumScrollingRef.current = false;
}}



onEndReached={() => {
  if (
    !endReachedDuringMomentum.current &&
    resHasMoreRef.current &&
    !isFetchingRef.current
  ) {
    endReachedDuringMomentum.current = true;
    fetchServices(page + 1);
  }
}}

onEndReachedThreshold={0.7}

ListFooterComponent={
  resHasMoreRef.current ? (
    <ActivityIndicator
      size="small"
      color={HELP_IO_BLUE}
      style={{ paddingVertical: 24 }}
    />
  ) : null
}





  renderItem={({ item: service }) => {
 

  return (
    <TouchableOpacity
      style={[
        styles.card,
        {
          backgroundColor: darkMode
            ? "rgba(28,28,32,0.65)"
            : "rgba(255,255,255,0.65)",
          shadowOpacity: darkMode ? 0 : 0.08,
        },
      ]}
      onPress={() => {
  const myProviderId = user?.providerId;

  const listingProviderId =
    typeof service.provider === "string"
      ? service.provider
      : service.provider?._id;

  const isOwnListing =
    !!myProviderId &&
    !!listingProviderId &&
    String(myProviderId) === String(listingProviderId);

  navigation.navigate("ServiceDetailScreen", {
    service,
    viewer: { _id: user?._id },
    isOwnListing,
  });
}}
    >
    {(() => {
  
  if (!service.photos || service.photos.length === 0) {

}
  const firstPhoto = service.photos?.[0];
  let imageUrl = null;

const buildUrl = (path) => {
  if (!path || typeof path !== "string") return null;

  const trimmed = path.trim();

  // Already full URL
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }

  // Already file path
  if (trimmed.startsWith("file://")) {
    return trimmed;
  }

  const base = api.defaults.baseURL?.replace(/\/$/, "") || "";
  const cleanPath = trimmed.replace(/^\//, "");

  return `${base}/${cleanPath}`;
};
  if (typeof firstPhoto === "string") {
    imageUrl = buildUrl(firstPhoto);
  } else if (typeof firstPhoto?.url === "string") {
    imageUrl = buildUrl(firstPhoto.url);
  } else if (typeof firstPhoto?.uri === "string") {
    imageUrl = buildUrl(firstPhoto.uri);
  }

  if (!imageUrl) {
    return (
      <View style={styles.noImage}>
        <Ionicons name="image-outline" size={30} color="#ccc" />
      </View>
    );
  }




return (
  <Animated.Image
    sharedTransitionTag={`service-${service._id}`}
    source={{ uri: imageUrl }}
    style={styles.image}
    resizeMode="cover"
  />
);
})()}
  
  


      <View style={styles.cardContent}>
        <Text numberOfLines={1} style={[styles.title, { color: theme.text }]}>
          {service.businessName || service.title}
        </Text>

        <Text
          numberOfLines={1}
          style={[styles.desc, { color: theme.subtleText }]}
        >
          {service.title}
        </Text>

        <View style={styles.metaRow}>
  {/* 📍 Location LEFT */}
  <View style={styles.locationWrapper}>
    <Ionicons name="location-sharp" size={12} color={HELP_IO_BLUE} />
    <Text numberOfLines={1} style={styles.locationText}>
    {formatLocation(service.location) || "Miami"}

    </Text>
  </View>

  {/* ⭐ Reviews RIGHT */}
  <View style={styles.reviewRow}>
  <FeedStars size={11} rating={service.rating} />

  
  {/* ⭐ Rating Number */}
  <Text style={styles.chromeRating}>
    {Number(service.rating).toFixed(1)}
  </Text>

  
  
</View>
</View>


      </View>
        </TouchableOpacity>
    );
  }}
/>

      {/* ADD LISTING BUTTON */}
   <RNAnimated.View
  style={[
    styles.addButtonContainer,
    { transform: [{ scale }] },
  ]}
>
  <BlurView intensity={65} tint="light" style={styles.addButtonBlur}>
  
  {/* VERY LIGHT glass tint */}
  <View style={styles.addButtonTint} />

  {/* TOP highlight (THIS is what makes it pop) */}
  <LinearGradient
    colors={[
      "rgba(255,255,255,0.35)",
      "rgba(255,255,255,0.05)",
      "transparent",
    ]}
    start={{ x: 0.5, y: 0 }}
    end={{ x: 0.5, y: 1 }}
    style={StyleSheet.absoluteFill}
  />

  <TouchableOpacity
    activeOpacity={0.9}
    onPressIn={handlePressIn}
    onPressOut={handlePressOut}
    onPress={() => navigation.navigate("MyListingsScreen")}
    style={styles.addButtonInner}
  >
    <Ionicons name="add" size={28} color="#1F2937" />
  </TouchableOpacity>

</BlurView>
</RNAnimated.View>

      

{/* PRICE MODAL */}
      <Modal
        visible={priceVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setPriceVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setPriceVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <KeyboardAvoidingView behavior="padding">
          <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
            <Text style={[styles.modalTitle, { color: theme.text }]}>
              Price range
            </Text>

            <View style={styles.priceRow}>
              <TextInput
                style={[
                  styles.priceBox,
                  { backgroundColor: theme.input, color: theme.text },
                ]}
                keyboardType="numeric"
                placeholder="Min"
                placeholderTextColor={theme.subtleText}
                value={minPrice}
                onChangeText={setMinPrice}
              />
              <Text style={[styles.priceTo, { color: theme.text }]}>to</Text>
              <TextInput
                style={[
                  styles.priceBox,
                  { backgroundColor: theme.input, color: theme.text },
                ]}
                keyboardType="numeric"
                placeholder="Max"
                placeholderTextColor={theme.subtleText}
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity
                style={[styles.clearButton, { backgroundColor: theme.input }]}
                onPress={() => {
                  setMinPrice("");
                  setMaxPrice("");
                  setPriceVisible(false);
                }}
              >
                <Text style={[styles.clearText, { color: theme.text }]}>
                  Clear
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.applyButtonDark,
                  { backgroundColor: HELP_IO_BLUE },
                ]}
                onPress={() => setPriceVisible(false)}
              >
                <Text style={styles.applyTextDark}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* SORT MODAL */}
      <Modal
        visible={sortVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSortVisible(false)}
      >
        <TouchableWithoutFeedback onPress={() => setSortVisible(false)}>
          <View style={styles.modalOverlay} />
        </TouchableWithoutFeedback>

        <View style={[styles.modalContainer, { backgroundColor: theme.card }]}>
          <Text style={[styles.modalTitle, { color: theme.text }]}>
            Sort by Price
          </Text>

          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => {
              setSortOrder("asc");
              setSortVisible(false);
            }}
          >
            <Text style={[styles.sortText, { color: HELP_IO_BLUE }]}>
              Lowest → Highest
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.sortOption}
            onPress={() => {
              setSortOrder("desc");
              setSortVisible(false);
            }}
          >
            <Text style={[styles.sortText, { color: HELP_IO_BLUE }]}>
              Highest → Lowest
            </Text>
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  safe: {
  flex: 1,
  position: "relative",
  backgroundColor: "transparent", // 👈 CRITICAL
  overflow: "visible"
},

  container: { flex: 1 },
  topBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 100 : 85,
    zIndex: 20,
    borderBottomColor: "rgba(0,0,0,0.05)",
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerContainer: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingTop: 60,   // 👈 lowers everything
  paddingBottom: 6,
},






  headerTitleBlue: {
    fontSize: 23,
    fontWeight: "700",
    letterSpacing: -0.25,
  },
  iconWrap: { position: "relative" },
  blurCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  badgeDot: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 7,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: "#FF3B30",
  },
 sectionTitle: {
  fontSize: 20,
  fontWeight: "700",     // ⬅️ THIS is the big fix
  letterSpacing: -0.2,
  marginTop: 8,          // ⬅️ more breathing room above
  marginBottom: 6,
},

zipChipWrap: {
  borderRadius: 16,
  overflow: "hidden",
},

zipChip: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 10,
  paddingVertical: 6,
  borderRadius: 16,
  gap: 4,

  backgroundColor: "rgba(255,255,255,0.35)",

  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
},

zipText: {
  fontSize: 13,
  fontWeight: "700",
    color: "#000",
},



  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    columnGap: 4,
    rowGap: 12,
  },
  
tabsGradient: {
  position: "absolute",
  top: -120,        // pushes atmosphere higher like HeroHeader
  left: -40,
  right: -40,
  height: 220,      // more vertical fade = visible depth
  zIndex: 0,        // behind content, above background
},

clearInlineBtn: {
  position: "absolute",
  right: 8,
  height: 22,
  width: 22,
  borderRadius: 11,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.08)",
},











searchPill: {
  height: 32,
  borderRadius: 20,
  overflow: "hidden",
  paddingHorizontal: 8,
  flexDirection: "row",
  alignItems: "center",

  borderWidth: 1,
  borderColor: "rgba(255, 255, 255, 1)",

  shadowColor: "#000",
  shadowOpacity: 0.04,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },
  elevation: 1,
},




searchPillTint: {
  ...StyleSheet.absoluteFillObject,
  backgroundColor: "rgba(255, 255, 255, 0.76)",
},

searchInput: {
  flex: 1,
  fontSize: 13,
  fontWeight: "500",
  color: "#111827",
  paddingVertical: 10,
  paddingLeft: 4,
  lineHeight: 13,
},













inlineSearchWrap: {
  height: 36,
  width: 150,
  borderRadius: 18,

  backgroundColor: "rgba(241, 239, 239, 1)",

  justifyContent: "center",
  overflow: "visible",

  // subtle base shadow
  shadowColor: "#000",
  shadowOpacity: 0.12,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 4,
  marginTop: 2,


  // ✨ crisp blue focus ring
  borderWidth: 1.2,
  borderColor: "rgba(253, 254, 255, 1)",

  // ✨ tight Apple glow (not cloudy)
  shadowColor: "#fbfeffff",
  shadowOpacity: 0.85,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 0 },
},



inlineBlur: {
  ...StyleSheet.absoluteFillObject,
  borderRadius: 18,
  overflow: "hidden",
},



inlineSearchText: {
  fontSize: 15,
  fontWeight: "500",
  flexShrink: 1,
},


 card: {
    width: "49.5%",
    borderRadius: 10,
    overflow: "hidden",
    shadowColor: "#000",
    shadowRadius: 5,
    elevation: 2,
  },
  image: { width: "100%", height: 240 },
  noImage: {
    width: "100%",
    height: 240,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  cardContent: { paddingHorizontal: 8, paddingVertical: 6 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: { fontSize: 14, fontWeight: "700" },
  desc: { fontSize: 11, marginVertical: 1 },
  price: { fontSize: 13, fontWeight: "700", marginTop: 3 },
  empty: { textAlign: "center", marginTop: 50 },
  addButtonContainer: {
  position: "absolute",
  bottom: 110,
  right: 22,
  borderRadius: 34,
  overflow: "hidden",
  zIndex: 999,
},






addButtonContainer: {
  position: "absolute",
  bottom: 115,
  right: 22,
  width: SIZE,
  height: SIZE,
  borderRadius: RADIUS,

  overflow: "visible", // keep shadow outside
  zIndex: 999,

  // shadow
  shadowColor: "#000",
  shadowOpacity: 0.35,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 20,
},

addButtonBlur: {
  width: "100%",
  height: "100%",
  borderRadius: RADIUS,
  overflow: "hidden", // 🔥 CRITICAL
},

addButtonTint: {
  ...StyleSheet.absoluteFillObject,
  borderRadius: RADIUS, // 🔥 MUST MATCH
  backgroundColor: "rgba(255,255,255,0.18)",
},

addButtonInner: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",

  borderRadius: RADIUS, // 🔥 MUST MATCH

  backgroundColor: "rgba(255,255,255,0.05)",

  borderWidth: 1.2,
  borderColor: "rgba(230, 230, 230, 0.85)",
},

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.4)" },
  modalContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
  },
  modalTitle: { fontSize: 20, fontWeight: "800", marginBottom: 16 },
  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  priceBox: {
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 18,
    width: 110,
    textAlign: "center",
    fontSize: 16,
  },


trendingHeaderRow: {
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
  paddingHorizontal: 14,

  marginTop: 2,     // ⬅️ pull it UP
  marginBottom: 4,  // ⬅️ bring it CLOSER to cards
},



reviewRow: {
  flexDirection: "row",
  alignItems: "center",
  gap: 4,
  marginTop: 5,      // 🔥 reduced spacing
  transform: [{ translateY: -2.5 }], // 🔥 raises stars
},

chromeStarWrap: {
  borderRadius: 50,
  padding: 3,
  marginRight: 6,

  backgroundColor: "rgba(255,255,255,0.25)",

  shadowColor: "#FFFFFF",
  shadowOpacity: 1,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 0 },

  borderWidth: 0.5,
  borderColor: "rgba(193, 191, 191, 0.7)",
},


chromeRating: {
  fontSize: 13,
  fontWeight: "900",
  letterSpacing: 0.4,

  // metallic silver tone
  color: "#c0c0c1ff",

  // highlight edge
  textShadowColor: "rgba(255,255,255,0.9)",
  textShadowOffset: { width: 0, height: 0 },
  textShadowRadius: 3,
},

chromeCount: {
  marginLeft: 5,
  fontSize: 12,
  color: "#8E8E93",
  fontWeight: "600",
},

inlineContent: {
  flexDirection: "row",
  alignItems: "center",
  height: "100%",
  paddingHorizontal: 16,
  flex: 1,
},


metaRow: {
  flexDirection: "row",
  alignItems: "center",   // 🔥 vertical alignment
  justifyContent: "space-between",
  marginTop: 6,           // 🔥 more breathing room
},

locationWrapper: {
  flexDirection: "row",
  alignItems: "center",
  maxWidth: "55%",
},
locationText: {
  fontSize: 12,
  fontWeight: "600",
  color: HELP_IO_BLUE,
  marginLeft: 3,
  flexShrink: 1,
},



  priceTo: { marginHorizontal: 10, fontSize: 17 },
  buttonRow: { flexDirection: "row", justifyContent: "space-between" },
  clearButton: {
    flex: 1,
    marginRight: 8,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  clearText: { fontWeight: "600", fontSize: 16 },
  applyButtonDark: {
    flex: 1,
    marginLeft: 8,
    paddingVertical: 14,
    borderRadius: 12,                                                                                                                                                                                                                                                                  
    alignItems: "center",
  },
  applyTextDark: { color: "white", fontWeight: "700", fontSize: 16 },
  sortOption: { paddingVertical: 12 },
  sortText: { fontSize: 18, fontWeight: "700" },
});


