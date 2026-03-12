// src/screens/MyListingsScreen.js
import React, { useCallback, useMemo, useRef, useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Animated,
  Platform,
  TouchableOpacity,
  TextInput,
  Image,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import useAuthStore from "../store/auth";
import { api } from "../config/api";

const HELPIO_BLUE = "#00A6FF";
const PADDING = 16;

const formatMoney = (n) => {
  if (n === null || n === undefined || n === "") return null;
  try {
    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: 0,
    }).format(Number(n));
  } catch {
    return String(n);
  }
};

const timeAgo = (dateLike) => {
  if (!dateLike) return "";
  const t = new Date(dateLike).getTime();
  if (!t) return "";
  const diff = Date.now() - t;

  const min = Math.floor(diff / 60000);
  if (min < 1) return "Just now";
  if (min < 60) return `${min}m ago`;

  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;

  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;

  const wk = Math.floor(day / 7);
  return `${wk}w ago`;
};

const SEGMENTS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];

export default function ProviderListingsScreen() {
  const navigation = useNavigation();
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  const providerId =
    user?.providerId && typeof user.providerId === "object"
      ? user.providerId._id
      : user?.providerId || null;

  const [segment, setSegment] = useState("all");
  const [search, setSearch] = useState("");

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Large title / blur navbar animation
  const scrollY = useRef(new Animated.Value(0)).current;

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

  const guardProvider = useCallback(() => {
    if (!isHydrated) return false;
    if (!token) return false;
    if (!providerId) return false;
    return true;
  }, [isHydrated, token, providerId]);

  const fetchMine = useCallback(async () => {
    try {
      if (!guardProvider()) return;

      setLoading(true);
      const res = await api.get("/api/listings/provider/mine");
      const listings = res.data?.listings || [];
      setItems(Array.isArray(listings) ? listings : []);
    } catch (e) {
      console.log("❌ ProviderListings fetch error:", e?.response?.data || e);
      Alert.alert("Error", "Unable to load your listings.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [guardProvider]);

  useFocusEffect(
    useCallback(() => {
      fetchMine();
    }, [fetchMine])
  );

useEffect(() => {
  if (!isHydrated) return;
  if (!token) return;

  if (!providerId) {
    navigation.replace("BusinessPlaceProducts");
  }
}, [isHydrated, token, providerId, navigation]);


  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchMine();
  }, [fetchMine]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();

    const base = items.filter((l) => {
      if (segment === "active") return l?.isActive !== false;
      if (segment === "inactive") return l?.isActive === false;
      return true;
    });

    if (!q) return base;

    return base.filter((l) => {
      const t = (l?.title || "").toLowerCase();
      const b = (l?.businessName || "").toLowerCase();
      const c = (l?.category || "").toLowerCase();
      return t.includes(q) || b.includes(q) || c.includes(q);
    });
  }, [items, segment, search]);

  const openCreate = () => {
    navigation.navigate("CreateListing", { mode: "create" });
  };

  const openEdit = (listing) => {
    navigation.navigate("CreateListing", { mode: "edit", listing });
  };

const openView = (listing) => {
  navigation.navigate("ServiceDetailScreen", {
    service: {
      ...listing,
      photos:
        Array.isArray(listing?.images) && listing.images.length
          ? listing.images
          : Array.isArray(listing?.photos)
          ? listing.photos
          : [],
    },
    isPreview: true,
    previewType: "live",   // 👈 ADD THIS
  });
};

  const openMore = (listing) => {
    Alert.alert(
      "Listing actions",
      listing?.title || "Listing",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Edit",
          onPress: () => openEdit(listing),
        },
        {
          text: "View",
          onPress: () => openView(listing),
        },
        // Future: toggle active, delete, boost, etc.
      ],
      { cancelable: true }
    );
  };

  // Hard guard UI (provider-only)
  if (!isHydrated) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={HELPIO_BLUE} />
      </View>
    );
  }

  if (!token) {
    return (
      <View style={styles.center}>
        <Text style={styles.guardTitle}>Sign in required</Text>
        <Text style={styles.guardSub}>
          Please sign in to manage your listings.
        </Text>
      </View>
    );
  }

 if (!providerId) {
  return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color={HELPIO_BLUE} />
    </View>
  );
}

  return (
    <SafeAreaView style={styles.safe}>
      {/* Premium soft background */}
      <LinearGradient
        colors={["#F6F7FA", "#EEF1F6", "#F7F8FB"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Blurred NAV when scrolled */}
      <Animated.View style={[styles.navBlur, { opacity: headerOpacity }]}>
        <BlurView
          intensity={60}
          tint="light"
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.navRow}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.goBack?.()}
            style={styles.navIconBtn}
          >
            <Ionicons name="chevron-back" size={22} color="#0B0B0F" />
          </TouchableOpacity>

          <Text style={styles.navTitle}>Your listings</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert("Menu", "More actions coming soon.")}
            style={styles.navIconBtn}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#0B0B0F" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={HELPIO_BLUE}
          />
        }
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        contentContainerStyle={{ paddingBottom: 120 }}
      >
        {/* Large title block */}
        <Animated.View
          style={[
            styles.largeTitleBlock,
            {
              opacity: largeTitleOpacity,
              transform: [{ translateY: titleTranslate }],
            },
          ]}
        >
          <View style={styles.largeTitleTopRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack?.()}
              style={styles.largeBackBtn}
            >
              <Ionicons name="chevron-back" size={24} color="#0B0B0F" />
            </TouchableOpacity>

            <Text style={styles.largeTitle}>Your listings</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => Alert.alert("Menu", "More actions coming soon.")}
              style={styles.largeMoreBtn}
            >
              <Ionicons name="ellipsis-horizontal" size={20} color="#0B0B0F" />
            </TouchableOpacity>
          </View>

          {/* Create listing CTA */}
          <TouchableOpacity activeOpacity={0.86} style={styles.createBtn} onPress={openCreate}>
            <Ionicons name="add" size={20} color="#fff" />
            <Text style={styles.createBtnText}>Create listing</Text>
          </TouchableOpacity>

          {/* Search */}
          <View style={styles.searchWrap}>
            <Ionicons name="search" size={18} color="rgba(15,15,20,0.55)" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search your listings"
              placeholderTextColor="rgba(15,15,20,0.45)"
              style={styles.searchInput}
              returnKeyType="search"
            />
          </View>

          {/* Segmented control */}
          <View style={styles.segmentOuter}>
            {SEGMENTS.map((s) => {
              const active = s.key === segment;
              return (
                <TouchableOpacity
                  key={s.key}
                  activeOpacity={0.85}
                  onPress={() => setSegment(s.key)}
                  style={[styles.segmentBtn, active && styles.segmentBtnActive]}
                >
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {s.label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>

        {/* Content */}
        <View style={{ paddingHorizontal: PADDING }}>
          {loading ? (
            <View style={{ paddingTop: 26 }}>
              <ActivityIndicator size="large" color={HELPIO_BLUE} />
            </View>
          ) : filtered.length === 0 ? (
            <View style={styles.emptyWrap}>
              <Ionicons name="cube-outline" size={26} color="rgba(15,15,20,0.35)" />
              <Text style={styles.emptyTitle}>No listings</Text>
              <Text style={styles.emptySub}>
                Create your first listing to start getting customers.
              </Text>

              <TouchableOpacity activeOpacity={0.86} style={styles.emptyCta} onPress={openCreate}>
                <Text style={styles.emptyCtaText}>Create listing</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={{ paddingTop: 10 }}>
              {filtered.map((l) => (
                <ListingCard
                  key={String(l._id)}
                  listing={l}
                  onEdit={() => openEdit(l)}
                  onView={() => openView(l)}
                  onMore={() => openMore(l)}
                />
              ))}
            </View>
          )}
        </View>
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

function ListingCard({ listing, onEdit, onView, onMore }) {
  const press = useRef(new Animated.Value(0)).current;

  const lift = press.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -2],
  });

  const shadow = press.interpolate({
    inputRange: [0, 1],
    outputRange: [0.14, 0.22],
  });

  const isActive = listing?.isActive !== false;

  const title = listing?.title || "Untitled listing";
  const price = listing?.price !== undefined ? formatMoney(listing.price) : null;

  // support images array or photos array
  const raw = Array.isArray(listing?.images) && listing.images.length
    ? listing.images
    : Array.isArray(listing?.photos) && listing.photos.length
    ? listing.photos
    : [];

  const thumb = raw?.[0]?.uri
    ? raw[0].uri
    : typeof raw?.[0] === "string"
    ? raw[0]
    : null;

  const updatedLabel = timeAgo(listing?.updatedAt || listing?.createdAt);

  return (
    <Animated.View
      style={[
        styles.cardOuter,
        {
          transform: [{ translateY: lift }],
          shadowOpacity: shadow,
        },
      ]}
    >
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onView}
        onPressIn={() => Animated.timing(press, { toValue: 1, duration: 120, useNativeDriver: false }).start()}
        onPressOut={() => Animated.timing(press, { toValue: 0, duration: 140, useNativeDriver: false }).start()}
        style={styles.cardTouchable}
      >
        <BlurView intensity={18} tint="light" style={styles.card}>
          {/* Thumbnail */}
          <View style={styles.thumbWrap}>
            {thumb ? (
              <Image source={{ uri: thumb }} style={styles.thumb} />
            ) : (
              <View style={styles.thumbPlaceholder}>
                <Ionicons name="image-outline" size={18} color="rgba(15,15,20,0.35)" />
              </View>
            )}

            {/* Status pill */}
            <View style={[styles.statusPill, !isActive && styles.statusPillInactive]}>
              <View
                style={[
                  styles.statusDot,
                  { backgroundColor: isActive ? "#22C55E" : "rgba(15,15,20,0.35)" },
                ]}
              />
              <Text style={[styles.statusText, !isActive && { color: "rgba(15,15,20,0.65)" }]}>
                {isActive ? "Active" : "Inactive"}
              </Text>
            </View>
          </View>

          {/* Info */}
          <View style={{ flex: 1 }}>
            <Text numberOfLines={2} style={styles.cardTitle}>
              {title}
            </Text>

            <Text style={styles.cardMeta}>
              {price ? `$${price}` : "—"}
              {updatedLabel ? `  •  Updated ${updatedLabel}` : ""}
            </Text>

            {/* Action row */}
            <View style={styles.actionRow}>
              <TouchableOpacity activeOpacity={0.85} style={styles.actionBtn} onPress={onEdit}>
                <Ionicons name="create-outline" size={16} color="#0B0B0F" />
                <Text style={styles.actionText}>Edit</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.85} style={styles.actionBtn} onPress={onView}>
                <Ionicons name="eye-outline" size={16} color="#0B0B0F" />
                <Text style={styles.actionText}>View</Text>
              </TouchableOpacity>

              <TouchableOpacity activeOpacity={0.85} style={styles.moreBtn} onPress={onMore}>
                <Ionicons name="ellipsis-horizontal" size={16} color="#0B0B0F" />
              </TouchableOpacity>
            </View>
          </View>
        </BlurView>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7FA" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  guardTitle: { fontSize: 18, fontWeight: "900", color: "#0B0B0F" },
  guardSub: { marginTop: 8, fontSize: 13.5, fontWeight: "700", color: "rgba(15,15,20,0.55)" },

  // Nav blur
  navBlur: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 92,
    zIndex: 50,
    justifyContent: "flex-end",
    paddingBottom: 10,
  },
  navRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 12,
  },
  navIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  navTitle: { fontSize: 17, fontWeight: "700", color: "#0B0B0F" },

  // Large title block
  largeTitleBlock: {
    paddingHorizontal: PADDING,
    paddingTop: 14,
    paddingBottom: 12,
  },
  largeTitleTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  largeBackBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  largeMoreBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  largeTitle: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0B0B0F",
    letterSpacing: -0.6,
  },

  // Create button (Apple bold primary)
  createBtn: {
    marginTop: 14,
    height: 52,
    borderRadius: 18,
    backgroundColor: HELPIO_BLUE,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,

    shadowColor: HELPIO_BLUE,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },
  createBtnText: { color: "#fff", fontSize: 16, fontWeight: "900", letterSpacing: 0.2 },

  // Search
  searchWrap: {
    marginTop: 12,
    height: 48,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.70)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  searchInput: {
    flex: 1,
    fontSize: 15.5,
    fontWeight: "700",
    color: "#0B0B0F",
  },

  // Segmented
  segmentOuter: {
    marginTop: 12,
    flexDirection: "row",
    padding: 4,
    borderRadius: 16,
    backgroundColor: "rgba(255,255,255,0.55)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  segmentBtn: {
    flex: 1,
    height: 38,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  segmentBtnActive: {
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 6,
  },
  segmentText: { fontSize: 13.5, fontWeight: "900", color: "rgba(15,15,20,0.55)" },
  segmentTextActive: { color: "#0B0B0F" },

  // Empty
  emptyWrap: {
    marginTop: 26,
    padding: 18,
    borderRadius: 22,
    backgroundColor: "rgba(255,255,255,0.70)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
  },
  emptyTitle: { marginTop: 10, fontSize: 16, fontWeight: "900", color: "#0B0B0F" },
  emptySub: {
    marginTop: 6,
    textAlign: "center",
    fontSize: 13.5,
    fontWeight: "700",
    color: "rgba(15,15,20,0.55)",
    lineHeight: 18,
  },
  emptyCta: {
    marginTop: 14,
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 999,
    backgroundColor: "rgba(0,166,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,166,255,0.18)",
  },
  emptyCtaText: { fontSize: 13.5, fontWeight: "900", color: HELPIO_BLUE },

  // Card
  cardOuter: {
    marginBottom: 12,
    borderRadius: 22,
    shadowColor: "#000",
    shadowOpacity: 0.14,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 10,
  },
  cardTouchable: { borderRadius: 22, overflow: "hidden" },
  card: {
    borderRadius: 22,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.58)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    flexDirection: "row",
    padding: 12,
    gap: 12,
  },

  thumbWrap: {
    width: 92,
    height: 92,
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "rgba(0,0,0,0.06)",
  },
  thumb: { width: "100%", height: "100%" },
  thumbPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },

  statusPill: {
    position: "absolute",
    bottom: 8,
    left: 8,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.80)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  statusPillInactive: {
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  statusDot: { width: 7, height: 7, borderRadius: 7 },
  statusText: { fontSize: 12, fontWeight: "900", color: "#0B0B0F" },

  cardTitle: {
    fontSize: 15.5,
    fontWeight: "900",
    color: "#0B0B0F",
    letterSpacing: -0.1,
  },
  cardMeta: {
    marginTop: 4,
    fontSize: 12.5,
    fontWeight: "800",
    color: "rgba(15,15,20,0.55)",
  },

  actionRow: {
    marginTop: 21,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  actionBtn: {
    height: 34,
    paddingHorizontal: 12,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  actionText: { fontSize: 12.5, fontWeight: "900", color: "#0B0B0F" },

  moreBtn: {
    marginLeft: "auto",
    height: 34,
    width: 44,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    alignItems: "center",
    justifyContent: "center",
  },
});