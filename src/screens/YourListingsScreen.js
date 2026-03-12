// src/screens/YourListingsScreen.js
import React, { useCallback, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  TextInput,
  Image,
  Animated,
  Platform,
  ActivityIndicator,
  RefreshControl,
  FlatList,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import useAuthStore from "../store/auth";
import { api } from "../config/api";

const HELPIO_BLUE = "#00A6FF";

export default function YourListingsScreen() {
  const navigation = useNavigation();

  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const isHydrated = useAuthStore((s) => s.isHydrated);

  // ✅ REQUIRE providerId
  const providerId = useMemo(() => {
    const raw = user?.providerId || user?.provider?._id || user?.provider || null;
    return raw ? String(typeof raw === "object" ? raw._id : raw) : null;
  }, [user]);

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent"); // stub for future
  const scrollY = useRef(new Animated.Value(0)).current;

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const largeTitleOpacity = scrollY.interpolate({
    inputRange: [0, 40],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const titleTranslate = scrollY.interpolate({
    inputRange: [0, 60],
    outputRange: [0, -34],
    extrapolate: "clamp",
  });

  const normalizeImage = (img) => {
    if (!img) return null;
    if (typeof img === "object" && img.uri) return img.uri;
    if (typeof img === "string" && img.startsWith("http")) return img;
    if (typeof img === "string" && img.startsWith("file")) return img;
    if (typeof img === "string") return `${api.defaults.baseURL}${img}`;
    return null;
  };

  const formatMoney = (n) => {
    if (n === null || n === undefined) return "";
    try {
      return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
    } catch {
      return String(n);
    }
  };

  const formatListedDate = (d) => {
    if (!d) return "";
    try {
      const dt = new Date(d);
      const mm = String(dt.getMonth() + 1).padStart(2, "0");
      const dd = String(dt.getDate()).padStart(2, "0");
      return `${mm}/${dd}`;
    } catch {
      return "";
    }
  };

  // ✅ You can adjust this endpoint to match your backend
  // Recommended shape for each listing:
  // {
  //   _id, title, price, status, isActive, createdAt, updatedAt,
  //   images/photos, businessName, unreadCount(optional)
  // }
  const fetchMine = useCallback(async () => {
    if (!token || !providerId) return;

    try {
      setLoading(true);

      const res = await api.get("/api/listings/provider/mine", {
        headers: { Authorization: `Bearer ${token}` },
        params: { providerId }, // ✅ require providerId (even if backend can infer)
      });

      const list = res.data?.listings || res.data?.data || [];
      setItems(Array.isArray(list) ? list : []);
    } catch (err) {
      console.log("❌ fetchMine listings error:", err?.response?.data || err);
      setItems([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [token, providerId]);

  useFocusEffect(
    useCallback(() => {
      fetchMine();
    }, [fetchMine])
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchMine();
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;

    return items.filter((it) => {
      const title = (it?.title || "").toLowerCase();
      const biz = (it?.businessName || it?.companyName || "").toLowerCase();
      return title.includes(q) || biz.includes(q);
    });
  }, [items, search]);

  const needsReviewCount = useMemo(() => {
    // optional logic — tune later
    return filtered.filter((it) => it?.needsReview === true).length;
  }, [filtered]);

  const patchListing = async (listingId, patch) => {
    try {
      // Change this to match your backend route:
      // e.g. PATCH /api/listings/provider/:id
      await api.patch(
        `/api/listings/provider/${listingId}`,
        patch,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      // fast local update
      setItems((prev) =>
        prev.map((x) => (String(x._id) === String(listingId) ? { ...x, ...patch } : x))
      );
    } catch (err) {
      console.log("❌ patchListing error:", err?.response?.data || err);
      Alert.alert("Error", "Could not update listing.");
    }
  };

  const handleOpenListing = (listing) => {
    navigation.navigate("ServiceDetail", { service: listing });
  };

  const handleCreate = () => {
    navigation.navigate("CreateListing", { mode: "create" });
  };

  const handleEdit = (listing) => {
    navigation.navigate("CreateListing", { mode: "edit", listing });
  };

  const handleMenu = (listing) => {
    Alert.alert(listing?.title || "Listing", "Choose an action", [
      { text: "Edit", onPress: () => handleEdit(listing) },
      {
        text: listing?.isActive === false ? "Mark as in stock" : "Mark as out of stock",
        onPress: () =>
          patchListing(listing._id, { isActive: listing?.isActive === false }),
      },
      { text: "Cancel", style: "cancel" },
    ]);
  };

  // ----- GUARDS -----
  if (!isHydrated) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={HELPIO_BLUE} />
        </View>
      </SafeAreaView>
    );
  }

  if (!token || !providerId) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Ionicons name="lock-closed-outline" size={28} color="#111827" />
          <Text style={styles.guardTitle}>Provider access required</Text>
          <Text style={styles.guardSub}>
            Please sign in as a provider to manage listings.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  const renderRow = ({ item }) => {
    const thumb =
      normalizeImage(item?.images?.[0]) ||
      normalizeImage(item?.photos?.[0]) ||
      null;

    const title = item?.title || "Untitled listing";
    const price = item?.price ? `$${formatMoney(item.price)}` : "";
    const status = item?.status || (item?.isActive === false ? "Out of stock" : "Available");
    const listed = formatListedDate(item?.createdAt || item?.updatedAt);
    const unreadCount = item?.unreadCount || 0;

    const isSold = status.toLowerCase().includes("sold");
    const isOut = status.toLowerCase().includes("out");

    return (
      <TouchableOpacity
        activeOpacity={0.75}
        onPress={() => handleOpenListing(item)}
        style={styles.rowOuter}
      >
        <BlurView intensity={18} tint="light" style={styles.rowCard}>
          <View style={styles.rowTop}>
            <View style={styles.thumbWrap}>
              {thumb ? (
                <Image source={{ uri: thumb }} style={styles.thumb} />
              ) : (
                <View style={styles.thumbFallback}>
                  <Ionicons name="image-outline" size={18} color="rgba(15,15,20,0.55)" />
                </View>
              )}
            </View>

            <View style={{ flex: 1 }}>
              <Text numberOfLines={2} style={styles.rowTitle}>
                {title}
              </Text>

              <View style={styles.metaLine}>
                {!!price && <Text style={styles.metaText}>{price}</Text>}
                <Text style={styles.metaDot}>•</Text>
                <Text style={styles.metaText}>{status}</Text>
                {!!listed && (
                  <>
                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>Listed on {listed}</Text>
                  </>
                )}
              </View>

              {unreadCount > 0 && (
                <Text style={styles.unreadLine}>
                  {unreadCount} new message{unreadCount === 1 ? "" : "s"}
                </Text>
              )}
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => handleMenu(item)}
              style={styles.menuBtn}
            >
              <Ionicons name="ellipsis-horizontal" size={18} color="#111827" />
            </TouchableOpacity>
          </View>

          {/* Actions row (iOS pill buttons) */}
          <View style={styles.actionsRow}>
            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.pillBtn}
              onPress={() =>
                patchListing(item._id, {
                  status: isOut ? "Available" : "Out of stock",
                  isActive: isOut, // if it was out, set active true; else false
                })
              }
            >
              <Text style={styles.pillText}>
                {isOut ? "Mark as in stock" : "Mark as out"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.85}
              style={styles.pillBtn}
              onPress={() =>
                patchListing(item._id, {
                  status: isSold ? "Available" : "Sold",
                })
              }
            >
              <Text style={styles.pillText}>
                {isSold ? "Mark as available" : "Mark as sold"}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.pillBtnPrimary}
              onPress={() => {
                // stub — you can wire to renew endpoint later
                Alert.alert("Renew listing", "Coming next — we’ll hook this to your backend.");
              }}
            >
              <Text style={styles.pillPrimaryText}>Renew</Text>
            </TouchableOpacity>
          </View>
        </BlurView>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* iOS blurred nav when scrolled */}
      <Animated.View style={[styles.navBlur, { opacity: headerOpacity }]}>
        <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />
        <Text style={styles.navTitle}>Your listings</Text>
        <View style={styles.navRight}>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => Alert.alert("More", "Add options here (filters, bulk edit, etc).")}
            style={styles.navIconBtn}
          >
            <Ionicons name="ellipsis-horizontal" size={20} color="#111827" />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Background (premium soft) */}
      <LinearGradient
        colors={["#F5F6F8", "#ECEFF3", "#F1F3F6"]}
        locations={[0, 0.6, 1]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.FlatList
        data={filtered}
        keyExtractor={(it) => String(it._id)}
        renderItem={renderRow}
        ListHeaderComponent={
          <View style={{ paddingBottom: 12 }}>
            {/* Large title */}
            <Animated.View
              style={[
                styles.largeTitleBlock,
                {
                  opacity: largeTitleOpacity,
                  transform: [{ translateY: titleTranslate }],
                },
              ]}
            >
              <Text style={styles.largeTitle}>Your listings</Text>
            </Animated.View>

            {/* Create Listing CTA */}
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={handleCreate}
              style={styles.createBtn}
            >
              <Ionicons name="add" size={20} color="#fff" />
              <Text style={styles.createBtnText}>Create listing</Text>
            </TouchableOpacity>

            {/* Search */}
            <View style={styles.searchWrap}>
              <Ionicons name="search" size={18} color="rgba(15,15,20,0.50)" />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder="Search your listings"
                placeholderTextColor="rgba(15,15,20,0.35)"
                style={styles.searchInput}
              />
            </View>

            {/* Needs review (optional) */}
            {needsReviewCount > 0 && (
              <TouchableOpacity
                activeOpacity={0.85}
                onPress={() => Alert.alert("Needs review", "We’ll filter these next.")}
                style={styles.reviewRow}
              >
                <View style={styles.reviewIcon}>
                  <Ionicons name="alert" size={18} color="#fff" />
                </View>
                <Text style={styles.reviewText}>
                  Some of your listings need your review.
                </Text>
                <Ionicons name="chevron-forward" size={18} color="rgba(15,15,20,0.45)" />
              </TouchableOpacity>
            )}

            {/* Section header */}
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>All listings</Text>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => Alert.alert("Sort", "Next: recent, oldest, price, status.")}
                style={styles.sortBtn}
              >
                <Text style={styles.sortText}>
                  {sort === "recent" ? "Recent" : "Sort"}
                </Text>
                <Ionicons name="chevron-down" size={16} color="rgba(15,15,20,0.55)" />
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <View style={{ paddingTop: 80 }}>
              <ActivityIndicator size="large" color={HELPIO_BLUE} />
            </View>
          ) : (
            <View style={styles.emptyWrap}>
              <Ionicons name="albums-outline" size={26} color="rgba(15,15,20,0.55)" />
              <Text style={styles.emptyTitle}>No listings yet</Text>
              <Text style={styles.emptySub}>Create your first listing to start getting leads.</Text>
            </View>
          )
        }
        contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={HELPIO_BLUE}
          />
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F5F6F8" },
  center: { flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 22 },

  guardTitle: { marginTop: 10, fontSize: 18, fontWeight: "800", color: "#111827" },
  guardSub: { marginTop: 6, fontSize: 13.5, fontWeight: "600", color: "rgba(15,15,20,0.6)", textAlign: "center" },

  navBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 92,
    paddingTop: Platform.OS === "ios" ? 18 : 10,
    paddingHorizontal: 14,
    justifyContent: "flex-end",
    paddingBottom: 10,
    zIndex: 50,
  },
  navTitle: {
    alignSelf: "center",
    fontSize: 17,
    fontWeight: "700",
    color: "#111827",
  },
  navRight: {
    position: "absolute",
    right: 10,
    bottom: 6,
    height: 44,
    justifyContent: "center",
  },
  navIconBtn: {
    height: 36,
    width: 44,
    alignItems: "center",
    justifyContent: "center",
  },

  largeTitleBlock: { paddingTop: 10, paddingBottom: 6 },
  largeTitle: { fontSize: 38, fontWeight: "900", letterSpacing: -0.7, color: "#0B0B0F" },

  createBtn: {
    marginTop: 10,
    height: 52,
    borderRadius: 16,
    backgroundColor: HELPIO_BLUE,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: HELPIO_BLUE,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  createBtnText: { color: "#fff", fontSize: 16, fontWeight: "900", letterSpacing: 0.2 },

  searchWrap: {
    marginTop: 12,
    height: 46,
    borderRadius: 16,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.75)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  searchInput: { flex: 1, fontSize: 15.5, fontWeight: "700", color: "#111827" },

  reviewRow: {
    marginTop: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  reviewIcon: {
    height: 28,
    width: 28,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#EF4444",
  },
  reviewText: { flex: 1, fontSize: 14.5, fontWeight: "800", color: "#111827" },

  sectionHeader: {
    marginTop: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitle: { fontSize: 24, fontWeight: "900", color: "#0B0B0F" },
  sortBtn: { flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 10, paddingVertical: 8, borderRadius: 999, backgroundColor: "rgba(255,255,255,0.65)", borderWidth: 1, borderColor: "rgba(0,0,0,0.06)" },
  sortText: { fontSize: 13.5, fontWeight: "900", color: "rgba(15,15,20,0.72)" },

  rowOuter: { marginTop: 12 },
  rowCard: {
    borderRadius: 20,
    padding: 14,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.72)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    shadowColor: "#000",
    shadowOpacity: 0.10,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  rowTop: { flexDirection: "row", alignItems: "flex-start", gap: 12 },
  thumbWrap: { width: 56, height: 56, borderRadius: 14, overflow: "hidden", backgroundColor: "rgba(0,0,0,0.06)" },
  thumb: { width: "100%", height: "100%" },
  thumbFallback: { flex: 1, alignItems: "center", justifyContent: "center" },

  rowTitle: { fontSize: 15.5, fontWeight: "900", color: "#0B0B0F", lineHeight: 20 },
  metaLine: { marginTop: 6, flexDirection: "row", alignItems: "center", flexWrap: "wrap" },
  metaText: { fontSize: 13, fontWeight: "800", color: "rgba(15,15,20,0.55)" },
  metaDot: { marginHorizontal: 6, color: "rgba(15,15,20,0.35)" },

  unreadLine: { marginTop: 6, fontSize: 13, fontWeight: "900", color: HELPIO_BLUE },

  menuBtn: { height: 34, width: 34, alignItems: "center", justifyContent: "center" },

  actionsRow: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  pillBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(15,15,20,0.05)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  pillText: { fontSize: 13, fontWeight: "900", color: "#111827" },

  pillBtnPrimary: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(0,166,255,0.12)",
    borderWidth: 1,
    borderColor: "rgba(0,166,255,0.18)",
  },
  pillPrimaryText: { fontSize: 13, fontWeight: "900", color: HELPIO_BLUE },

  emptyWrap: { paddingTop: 90, alignItems: "center", paddingHorizontal: 30 },
  emptyTitle: { marginTop: 10, fontSize: 18, fontWeight: "900", color: "#111827" },
  emptySub: { marginTop: 6, fontSize: 13.5, fontWeight: "700", color: "rgba(15,15,20,0.55)", textAlign: "center" },
});