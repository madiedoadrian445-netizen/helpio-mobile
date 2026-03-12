// src/screens/ProviderProfileScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../config/api";
const { width } = Dimensions.get("window");
const HELPIO_BLUE = "#00A6FF";

export default function ProviderProfileScreen({ navigation, route }) {

  const providerId = route?.params?.providerId || null;

  const [provider, setProvider] = useState(null);
  const [loading, setLoading] = useState(true);
const [listings, setListings] = useState([]);
 useEffect(() => {
  console.log("👉 providerId passed:", providerId);

  let mounted = true;

  async function loadData() {
    if (!providerId) {
      setLoading(false);
      return;
    }

    try {
      // Fetch provider
      const providerRes = await api.get(`/api/providers/${providerId}`);
      const raw = providerRes.data?.provider || providerRes.data;

      if (mounted) {
        const formatted = {
          ...raw,
          name: raw.businessName,
          about: raw.description,
          locationLine:
            raw.city && raw.state
              ? `${raw.city}, ${raw.state}`
              : raw.city || raw.state || null,
          reviewsCount: raw.completedJobs || 0,
        };

        setProvider(formatted);
      }

      // Fetch listings
      const listingsRes = await api.get(
        `/api/listings/provider/${providerId}`
      );

console.log("👉 Listings API response:", listingsRes.data);

      if (mounted) {
        setListings(listingsRes.data?.listings || []);
      }

    } catch (err) {
      console.log("❌ Provider profile load error:", err?.response?.data || err);
    } finally {
      if (mounted) setLoading(false);
    }
  }

  loadData();

  return () => {
    mounted = false;
  };
}, [providerId]);

  const companyName = provider?.name || "Provider";





  
  // Replace with real provider data (route params or fetch)
 if (loading) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <ActivityIndicator size="large" color={HELPIO_BLUE} />
      </View>
    </SafeAreaView>
  );
}

if (!provider) {
  return (
    <SafeAreaView style={styles.safe}>
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
        <Text style={{ fontWeight: "700", color: "#0B0B0F" }}>
          Provider not found.
        </Text>
      </View>
    </SafeAreaView>
  );
}

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 28 }}
        showsVerticalScrollIndicator={false}
      >
        {/* HERO */}
        <View style={styles.heroWrap}>
         {provider?.coverUri ? (
  <Image source={{ uri: provider.coverUri }} style={styles.heroImage} />
) : (
  <View style={[styles.heroImage, { backgroundColor: "#E9ECF2" }]} />
)}
          <LinearGradient
            colors={["rgba(0,0,0,0.55)", "rgba(0,0,0,0.10)", "rgba(0,0,0,0.65)"]}
            locations={[0, 0.55, 1]}
            style={styles.heroGradient}
          />

          {/* Top nav */}
          <View style={styles.heroTopRow}>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.goBack?.()}
              style={styles.navIconBtn}
            >
              <BlurView intensity={28} tint="dark" style={styles.navIconBlur}>
                <Ionicons name="chevron-back" size={20} color="#fff" />
              </BlurView>
            </TouchableOpacity>

            <Text style={styles.heroTitle}>Provider</Text>

            <TouchableOpacity activeOpacity={0.7} style={styles.navIconBtn}>
              <BlurView intensity={28} tint="dark" style={styles.navIconBlur}>
                <Ionicons name="share-outline" size={18} color="#fff" />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Avatar + Rating pill */}
          <View style={styles.avatarRow}>
            <View style={styles.avatarRing}>
          {provider?.avatarUri ? (
  <Image source={{ uri: provider.avatarUri }} style={styles.avatar} />
) : (
  <View style={[styles.avatar, { backgroundColor: "#E9ECF2" }]} />
)}
            </View>

          {provider?.reviewsCount > 0 && typeof provider?.rating === "number" ? (
  <BlurView intensity={22} tint="light" style={styles.ratingPill}>
    <Ionicons name="star" size={14} color={HELPIO_BLUE} />
    <Text style={styles.ratingText}>
      {provider?.rating ? provider.rating.toFixed(1) : null}{" "}
      <Text style={styles.ratingSub}>({provider.reviewsCount})</Text>
    </Text>
  </BlurView>
) : (
  <BlurView intensity={22} tint="light" style={styles.ratingPill}>
    <Text style={styles.ratingText}>New</Text>
  </BlurView>
)}
          </View>
        </View>

        {/* HEADER INFO */}
        <View style={styles.headerBlock}>
          <Text style={styles.name}>{provider.name}</Text>
          <Text style={styles.subline}>{provider.joined}</Text>

          {/* Stats */}
         <View style={styles.statsRow}>
  {provider?.followers ? (
    <StatItem value={`${provider.followers}`} label="Followers" />
  ) : null}

  {provider?.followers && provider?.activeListings ? (
    <View style={styles.statDivider} />
  ) : null}

  {provider?.activeListings ? (
    <StatItem value={`${provider.activeListings}`} label="Active listings" />
  ) : null}

  {(provider?.followers || provider?.activeListings) &&
  provider?.isActiveSeller ? (
    <View style={styles.statDivider} />
  ) : null}

  {provider?.isActiveSeller ? (
    <StatItem value="Active" label="Seller" />
  ) : null}
</View>

          {/* Primary CTA row */}
          <View style={styles.ctaRow}>
          <TouchableOpacity
  activeOpacity={0.85}
  style={styles.primaryBtn}
  onPress={() => {
    if (!providerId) return;

    navigation.navigate("ChatDetail", {
      providerId,
      companyName,
    });
  }}
>
  <Ionicons name="chatbubble-ellipses-outline" size={18} color="#fff" />
  <Text style={styles.primaryBtnText}>Message</Text>
</TouchableOpacity>

            <TouchableOpacity activeOpacity={0.85} style={styles.iconBtn}>
              <BlurView intensity={18} tint="light" style={styles.iconBtnBlur}>
                <Ionicons name="call-outline" size={18} color="#0B0B0F" />
              </BlurView>
            </TouchableOpacity>

            <TouchableOpacity activeOpacity={0.85} style={styles.iconBtn}>
              <BlurView intensity={18} tint="light" style={styles.iconBtnBlur}>
                <Ionicons name="bookmark-outline" size={18} color="#0B0B0F" />
              </BlurView>
            </TouchableOpacity>
          </View>

          {/* Tagline + location */}
      {provider?.tagline ? (
  <Text style={styles.tagline}>{provider.tagline}</Text>
) : null}

{provider?.locationLine ? (
  <View style={styles.locationRow}>
    <Ionicons
      name="location-outline"
      size={16}
      color="rgba(15,15,20,0.55)"
    />
    <Text style={styles.locationText}>
      {provider.locationLine}
    </Text>
  </View>
) : null}
        </View>

        {/* ABOUT CARD */}
       <BlurCard title="About">
  {provider?.about ? (
    <Text style={styles.aboutText}>
      {provider.about}
    </Text>
  ) : (
    <Text style={styles.aboutText}>
      This provider hasn’t added a description yet.
    </Text>
  )}
</BlurCard>

        {/* CATEGORIES / CHIPS */}
     <BlurCard title="Categories">
  {provider?.categories?.length > 0 ? (
    <View style={styles.chipsWrap}>
      {provider.categories.map((c) => (
        <View key={c} style={styles.chip}>
          <Text style={styles.chipText}>{c}</Text>
        </View>
      ))}
    </View>
  ) : (
    <Text style={styles.aboutText}>No categories listed.</Text>
  )}
</BlurCard>

        {/* LISTINGS PREVIEW */}
    <BlurCard
  title="Active Listings"
  rightActionLabel={
    listings?.length > 0 ? "View all" : null
  }
  onRightAction={() =>
    navigation.navigate?.("ProviderListings", { providerId })
  }
>
  {listings?.length > 0 ? (
    <View style={styles.listingsGrid}>
    {listings.slice(0, 4).map((listing) => (
    <TouchableOpacity
  key={listing._id}
  activeOpacity={0.85}
  style={styles.listingTile}
  onPress={() =>
    navigation.navigate("ServiceDetailScreen", {
  service: listing,
  viewer: null, // or pass user if needed
  isOwnListing: false,
})
  }
>
         {listing.images?.length > 0 ? (
<Image
  source={{ uri: listing.images[0] }}
  style={styles.listingThumb}
  resizeMode="cover"
/>
) : (
  <View style={styles.listingThumb} />
)}

          <Text numberOfLines={1} style={styles.listingTitle}>
            {listing.title}
          </Text>

          {listing.price ? (
            <Text style={styles.listingMeta}>
              From ${listing.price}
            </Text>
          ) : null}
      </TouchableOpacity>
      ))}
    </View>
  ) : (
    <Text style={styles.aboutText}>No active listings.</Text>
  )}
</BlurCard>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatItem({ value, label }) {
  return (
    <View style={styles.statItem}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

function BlurCard({ title, children, rightActionLabel, onRightAction }) {
  return (
    <View style={styles.cardOuter}>
      <BlurView intensity={18} tint="light" style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{title}</Text>
          {rightActionLabel ? (
            <TouchableOpacity activeOpacity={0.7} onPress={onRightAction}>
              <Text style={styles.cardAction}>{rightActionLabel}</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      <View
  style={[
    styles.cardBody,
    title === "Active Listings" && styles.listingsCardBody,
  ]}
>
  {children}
</View>
      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F2F3F7" },
  container: { flex: 1 },

  heroWrap: { height: 290, width: "100%" },
  heroImage: { height: "100%", width: "100%" },
  heroGradient: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
  },

listingsCardBody: {
  paddingHorizontal: 0,   // remove inner constraint
  paddingBottom: 18,
},

  heroTopRow: {
    position: "absolute",
    top: Platform.OS === "ios" ? 8 : 14,
    left: 14,
    right: 14,
    height: 44,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  heroTitle: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },
  navIconBtn: { width: 42, height: 42 },
  navIconBlur: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.18)",
    overflow: "hidden",
  },

  avatarRow: {
    position: "absolute",
    left: 18,
    right: 18,
    bottom: -32,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
  },
  avatarRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: "#fff",
    padding: 4,
    shadowColor: "#000",
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  avatar: { width: "100%", height: "100%", borderRadius: 48 },

  ratingPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.65)",
    overflow: "hidden",
  },
  ratingText: { fontSize: 14, fontWeight: "800", color: "#0B0B0F" },
  ratingSub: { fontWeight: "700", color: "rgba(15,15,20,0.55)" },

  headerBlock: {
    paddingTop: 46,
    paddingHorizontal: 18,
    paddingBottom: 14,
  },
  name: { fontSize: 30, fontWeight: "800", color: "#0B0B0F", letterSpacing: -0.3 },
  subline: { marginTop: 4, fontSize: 14, fontWeight: "600", color: "rgba(15,15,20,0.55)" },

  statsRow: {
    marginTop: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 14,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  statItem: { flex: 1, alignItems: "center" },
  statValue: { fontSize: 16, fontWeight: "800", color: "#0B0B0F" },
  statLabel: { marginTop: 2, fontSize: 12, fontWeight: "700", color: "rgba(15,15,20,0.55)" },
  statDivider: {
    width: 1,
    height: 26,
    backgroundColor: "rgba(0,0,0,0.08)",
    borderRadius: 1,
  },

  ctaRow: { marginTop: 14, flexDirection: "row", alignItems: "center", gap: 10 },
  primaryBtn: {
    flex: 1,
    height: 48,
    borderRadius: 16,
    backgroundColor: HELPIO_BLUE,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 8,
    shadowColor: HELPIO_BLUE,
    shadowOpacity: 0.22,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  primaryBtnText: { color: "#fff", fontSize: 15, fontWeight: "800", letterSpacing: 0.2 },

  iconBtn: { width: 48, height: 48 },
  iconBtnBlur: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.55)",
  },

  tagline: { marginTop: 12, fontSize: 14, fontWeight: "700", color: "rgba(15,15,20,0.72)" },
  locationRow: { marginTop: 25, flexDirection: "row", alignItems: "center", gap: 6 },
  locationText: { fontSize: 13, fontWeight: "700", color: "rgba(15,15,20,0.55)" },

  cardOuter: { paddingHorizontal: 18, marginTop: 12 },
  card: {
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.07)",
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.55)",
  },
  cardHeader: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#0B0B0F" },
  cardAction: { fontSize: 13, fontWeight: "800", color: HELPIO_BLUE },
  cardBody: { paddingHorizontal: 16, paddingBottom: 16 },

  aboutRow: { flexDirection: "row", alignItems: "flex-start", gap: 10, marginTop: 10 },
  aboutIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: "rgba(0,166,255,0.10)",
    alignItems: "center",
    justifyContent: "center",
  },
  aboutText: { flex: 1, fontSize: 14, fontWeight: "700", color: "rgba(15,15,20,0.78)", lineHeight: 20 },

  chipsWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.05)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  chipText: { fontSize: 13, fontWeight: "800", color: "rgba(15,15,20,0.78)" },

 listingsGrid: {
  flexDirection: "column",
  gap: 18,
  paddingHorizontal: 15,  // controlled outer spacing
},
listingTile: {
  width: "100%",
  gap: 6,
  marginTop: 6,
},
 listingThumb: {
  width: "100%",
  height: width * 1.05,   // 🔥 EXACT same as ServiceDetail hero
  borderRadius: 18,
  backgroundColor: "rgba(0,0,0,0.06)",
},
  listingTitle: { fontSize: 13, fontWeight: "900", color: "#0B0B0F" },
  listingMeta: { fontSize: 12, fontWeight: "800", color: "rgba(15,15,20,0.55)" },
});
