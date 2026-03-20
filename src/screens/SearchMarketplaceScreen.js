// src/screens/SearchMarketplaceScreen.js
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  Keyboard,
  TouchableWithoutFeedback,
  StatusBar,
  Image,
  Dimensions,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import { Animated } from "react-native";
import { API_BASE_URL } from "../config/api";

import AsyncStorage from "@react-native-async-storage/async-storage";


const HELPIO_BLUE = "#00A6FF";
const { width } = Dimensions.get("window");

const DEFAULT_NEARBY = [
  {
    key: "detailing",
    label: "Mobile Detailing",
    icon: "water-outline",          // clean, Apple-like symbol
    color: "#0EA5E9",               // iOS blue tone
  },
  {
    key: "barbers",
    label: "Barbershops",
    icon: "cut-outline",            // minimal + premium feel
    color: "#6366F1",               // subtle indigo (Apple palette vibe)
  },
  {
    key: "mechanic",
    label: "Mechanic Shops",
    icon: "build-outline",          // clean tool glyph
    color: "#F59E0B",               // warm Apple-style amber
  },
  {
    key: "renovation",
    label: "Home Renovation",
    icon: "home-outline",           // very iOS-native feeling
    color: "#22C55E",               // Apple green tone
  },
];

const DEFAULT_GUIDES = [
  { key: "date", title: "Plumbing", subtitle: "in Miami", image: null, badge: "Guide" },
  { key: "locals", title: "Pool Cleaning ", subtitle: "Trusted Locally", image: null, badge: "Guide" },
];

export default function SearchMarketplaceScreen({ navigation, route }) {
  const { theme } = useTheme();
  const inputRef = useRef(null);

  const [query, setQuery] = useState(route?.params?.initialQuery || "");
  const [focused, setFocused] = useState(false);



const [services, setServices] = useState([]);
const [loadingServices, setLoadingServices] = useState(false);


 const [recents, setRecents] = useState([]);
const [suggestions, setSuggestions] = useState([]);
const [loadingSug, setLoadingSug] = useState(false);
const [sugError, setSugError] = useState(null);
  const nearby = useMemo(() => DEFAULT_NEARBY, []);
  const guides = useMemo(() => DEFAULT_GUIDES, []);
const debounceRef = useRef(null);
const abortRef = useRef(null);
  // ✅ Apple-like focus animations
  const liftAnim = useRef(new Animated.Value(0)).current;     // whole content lift
  
  const expandAnim = useRef(new Animated.Value(0)).current;   // bar width

const fetchServices = async () => {
  setLoadingServices(true);

  try {
    const res = await fetch(`${API_BASE_URL}/api/listings`);
    const data = await res.json();

    if (!res.ok) throw new Error(data?.message || "Failed to load services");

    const list = Array.isArray(data) ? data : data?.listings || [];

    // randomize + take 2
    const shuffled = [...list].sort(() => 0.5 - Math.random());
    setServices(shuffled.slice(0, 2));
  } catch (e) {
    console.log("Service fetch error:", e.message);
    setServices([]);
  } finally {
    setLoadingServices(false);
  }
};

useEffect(() => {
  fetchServices();
}, []);


useEffect(() => {
  loadRecents();
}, []);

 const onSubmit = (value) => {
  const q = (value ?? query).trim();
    if (!q) return;

   const newRecents = [
  { key: `r_${Date.now()}`, text: q, meta: "Search" },
  ...recents.filter((x) => x.text.toLowerCase() !== q.toLowerCase()),
].slice(0, 4);

setRecents(newRecents);
saveRecents(newRecents);

   navigation.navigate("MainTabs", {
  screen: "Home",
  params: {
    searchQuery: q,
    ts: Date.now(),
  },
});

  };


const loadRecents = async () => {
  try {
    const stored = await AsyncStorage.getItem("RECENT_SEARCHES");
    if (stored) {
      setRecents(JSON.parse(stored));
    }
  } catch (e) {
    console.log("Load recents error:", e.message);
  }
};



const saveRecents = async (newRecents) => {
  try {
    await AsyncStorage.setItem("RECENT_SEARCHES", JSON.stringify(newRecents));
  } catch (e) {
    console.log("Save recents error:", e.message);
  }
};


  const onTapRecent = (text) => {
  setQuery(text);
  onSubmit(text);
};

  const animateFocusIn = () => {
    setFocused(true);
    if (query.trim().length > 0) fetchSuggestions(query);
    Animated.parallel([
      Animated.spring(liftAnim, {
        toValue: -18,
        useNativeDriver: true,
        speed: 22,
        bounciness: 6,
      }),
     
      Animated.timing(expandAnim, {
        toValue: 1,
        duration: 220,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const animateFocusOut = () => {
    Animated.parallel([
      Animated.spring(liftAnim, {
        toValue: 0,
        useNativeDriver: true,
        speed: 22,
        bounciness: 6,
      }),
    
      Animated.timing(expandAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }),
    ]).start(() => setFocused(false));
  };

const fetchSuggestions = async (text) => {
  const q = text.trim();
  if (!q) {
    setSuggestions([]);
    setLoadingSug(false);
    setSugError(null);
    return;
  }

  // cancel previous request
  try {
    if (abortRef.current) abortRef.current.abort();
  } catch {}

  const controller = new AbortController();
  abortRef.current = controller;

  setLoadingSug(true);
  setSugError(null);

  try {
    // TODO: replace with your api helper if you already use one here
    // Example endpoint: /api/search/suggest?q=detail
    const res = await fetch(`${API_BASE_URL}/api/search/suggest?q=${encodeURIComponent(q)}`, {
      signal: controller.signal,
      headers: { "Content-Type": "application/json" },
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data?.message || "Suggestion fetch failed");

    // expected shape: { success:true, suggestions:[{type,label,subtitle,value,icon}] }
    setSuggestions(Array.isArray(data?.suggestions) ? data.suggestions : []);
  } catch (e) {
    if (e?.name === "AbortError") return;
    setSugError(e?.message || "Failed to load suggestions");
    setSuggestions([]);
  } finally {
    setLoadingSug(false);
  }
};



const onChangeQuery = (text) => {
  setQuery(text);

  // debounce
  if (debounceRef.current) clearTimeout(debounceRef.current);
  debounceRef.current = setTimeout(() => {
    fetchSuggestions(text);
  }, 140);
};


const onCancel = () => {
  Keyboard.dismiss();

  setSuggestions([]);
  setSugError(null);
  setLoadingSug(false);

  animateFocusOut();

  setTimeout(() => {
    if (navigation?.canGoBack?.()) {
      navigation.goBack();
    }
  }, 200); // matches animation duration
};
  


  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.screen}>
        <StatusBar barStyle="dark-content" />

        {/* Soft system-like background */}
        <LinearGradient
          colors={["#F2F2F7", "#F2F2F7", "#F5F6FA"]}
          locations={[0, 0.6, 1]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={StyleSheet.absoluteFill}
        />

        {/* Top blur sheet edge */}
        <View style={styles.topGlass}>
          <BlurView intensity={55} tint="light" style={StyleSheet.absoluteFill} />
          <View style={styles.topGlassBorder} />
        </View>

        {/* ✅ EVERYTHING stays inside this animated container */}
        <Animated.View style={{ flex: 1, transform: [{ translateY: liftAnim }] }}>
          <ScrollView
            contentContainerStyle={styles.content}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >






           {/* Search Row */}
<View style={styles.searchRow}>

 

              {/* ✅ Animated width wrapper */}
           <Animated.View style={[styles.searchPill, { flex: 1 }]}>
                <BlurView intensity={35} tint="light" style={StyleSheet.absoluteFill} />
                <View style={styles.searchPillTint} />





<Ionicons
  name="search"
  size={17}
  color="#8E8E93"
  style={{ marginRight: 8, marginTop: 1 }}
/>

                <TextInput
                  ref={inputRef}
                  value={query}
                  onChangeText={onChangeQuery}
                  placeholder="Search"
                  placeholderTextColor="#9CA3AF"
                  returnKeyType="search"
                onSubmitEditing={() => onSubmit()}
                  onFocus={animateFocusIn}
                  style={styles.searchInput}
                />

                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => Keyboard.dismiss()}
                  style={styles.micBtn}
                >
                  <Ionicons name="mic-outline" size={18} color="#6B7280" />
                </TouchableOpacity>
              </Animated.View>


 {/* 👇 ADD THIS HERE */}
  <TouchableOpacity
    activeOpacity={0.8}
   onPress={() => {
  Keyboard.dismiss();
  navigation.goBack();
}}
    style={styles.allServicesBtn}
  >
    <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
   <Ionicons
  name="close"
  size={22}
  color="#111827"
/>
  </TouchableOpacity>


           
            </View>


{/* Live Suggestions (Google / Maps feel) */}
{(focused || query.trim().length > 0) && (
  <View style={styles.suggestionWrap}>
    <View style={styles.suggestionCard}>
      <BlurView intensity={35} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.cardTint} />

      {/* Loading */}
      {loadingSug && (
        <View style={styles.sugRow}>
          <View style={styles.sugLeft}>
            <Ionicons name="time-outline" size={18} color="#9CA3AF" />
            <Text style={[styles.sugMain, { marginLeft: 10 }]}>Searching…</Text>
          </View>
        </View>
      )}

      {/* Error */}
      {!!sugError && !loadingSug && (
        <View style={styles.sugRow}>
          <View style={styles.sugLeft}>
            <Ionicons name="alert-circle-outline" size={18} color="#9CA3AF" />
            <Text style={[styles.sugMain, { marginLeft: 10 }]}>{sugError}</Text>
          </View>
        </View>
      )}

      {/* Suggestions List */}
      {!loadingSug && !sugError && suggestions?.length > 0 ? (
        suggestions.slice(0, 8).map((s, idx) => (
          <TouchableOpacity
            key={`${s.type || "suggest"}_${s.value || s.label}_${idx}`}
            activeOpacity={0.75}
            onPress={() => {
              const label = s.label || "";
              const value = s.value || label;
              if (!value) return;

              // fill for UX
              setQuery(label);

              // add to recents
             const newRecents = [
  {
    key: `r_${Date.now()}`,
    text: label,
    meta: s.subtitle || s.type || "Search",
  },
  ...recents.filter((x) => x.text.toLowerCase() !== label.toLowerCase()),
].slice(0, 4);

setRecents(newRecents);
saveRecents(newRecents);


              // jump to results feed
              navigation.navigate("MainTabs", {
                screen: "Home",
                params: { searchQuery: value, ts: Date.now() },
              });
            }}
            style={[styles.sugRow, idx !== Math.min(suggestions.length, 8) - 1 && styles.rowDivider]}
          >
            <View style={styles.sugLeft}>
              <Ionicons
                name={
                  s.type === "category"
                    ? "grid-outline"
                    : s.type === "provider"
                    ? "person-circle-outline"
                    : s.type === "service"
                    ? "briefcase-outline"
                    : "search-outline"
                }
                size={18}
                color="#9CA3AF"
              />
              <View style={{ marginLeft: 10 }}>
                <Text style={styles.sugMain}>{s.label}</Text>
                {!!s.subtitle && <Text style={styles.sugMeta}>{s.subtitle}</Text>}
              </View>
            </View>

            <Ionicons name="arrow-forward" size={18} color="#C7CBD1" />
          </TouchableOpacity>
        ))
      ) : (
        !loadingSug &&
        query.trim().length > 0 && (
          <TouchableOpacity activeOpacity={0.75} onPress={onSubmit} style={styles.sugRow}>
            <View style={styles.sugLeft}>
           <Ionicons
  name="search"
  size={18}
  color="#8E8E93"
  style={{ marginRight: 8, marginTop: 1 }}
/>

              <Text style={[styles.sugMain, { marginLeft: 10 }]}>Search “{query.trim()}”</Text>
            </View>
          </TouchableOpacity>
        )
      )}
    </View>
  </View>
)}


            {/* Recents */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Recents</Text>
                <TouchableOpacity activeOpacity={0.75} onPress={() => {}} style={styles.chevBtn}>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

              <View style={styles.card}>
                <BlurView intensity={35} tint="light" style={StyleSheet.absoluteFill} />
                <View style={styles.cardTint} />

                {recents.length === 0 ? (
                  <View style={styles.emptyRow}>
                    <Text style={styles.emptyText}>No recent searches</Text>
                  </View>
                ) : (
                  recents.map((r, idx) => (
                    <TouchableOpacity
                      key={r.key}
                      activeOpacity={0.75}
                      onPress={() => onTapRecent(r.text)}
                      style={[styles.recentRow, idx !== recents.length - 1 && styles.rowDivider]}
                    >
                      <View style={styles.recentLeft}>
                   <Ionicons
  name="search"
  size={18}
  color="#8E8E93"
/>
                        <View style={{ marginLeft: 10 }}>
                          <Text style={styles.recentMain}>{r.text}</Text>
                          {!!r.meta && <Text style={styles.recentMeta}>{r.meta}</Text>}
                        </View>
                      </View>

                    <TouchableOpacity
  activeOpacity={0.7}
  onPress={() => {
    const updated = recents.filter((x) => x.key !== r.key);
    setRecents(updated);
    saveRecents(updated);
  }}
  style={styles.moreBtn}
>
  <Ionicons name="close" size={18} color="#9CA3AF" />
</TouchableOpacity>


                    </TouchableOpacity>
                  ))
                )}
              </View>
            </View>

            {/* Find Nearby */}
            <View style={[styles.section, styles.findNearbySection]}>
              {/* ✅ extra spacing so label isn’t hugging cards */}
              <Text style={[styles.sectionTitle, styles.findNearbyTitle]}>Find Locally</Text>

              <View style={styles.nearbyGrid}>
                {nearby.map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    activeOpacity={0.85}
                   onPress={() => {
  setQuery(item.label);
  onSubmit(item.label);
}}
                    style={styles.nearbyPill}
                  >
                    <BlurView intensity={28} tint="light" style={StyleSheet.absoluteFill} />
                    <View style={styles.nearbyTint} />

                    <View style={[styles.nearbyIconDot, { backgroundColor: item.color }]}>
                      <Ionicons name={item.icon} size={16} color="#fff" />
                    </View>

                    <Text style={styles.nearbyText}>{item.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Guides We Love */}
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                
                <Text style={styles.sectionTitle}>Helpio's Choice</Text>


                <TouchableOpacity activeOpacity={0.75} onPress={() => {}} style={styles.chevBtn}>
                  <Ionicons name="chevron-forward" size={18} color="#9CA3AF" />
                </TouchableOpacity>
              </View>

            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingRight: 16 }}>
  {loadingServices ? (
    <View style={styles.guideCard}>
      <Text style={{ padding: 20, color: "#9CA3AF" }}>Loading...</Text>
    </View>
  ) : services.length === 0 ? (
    <View style={styles.guideCard}>
      <Text style={{ padding: 20, color: "#9CA3AF" }}>No services found</Text>
    </View>
  ) : (
    services.map((item) => (
      <TouchableOpacity
        key={item._id}
        activeOpacity={0.9}
       onPress={() => {
  navigation.navigate("ServiceDetailScreen", {
    service: item,
    viewer: { _id: null }, // or user?._id if available
    isOwnListing: false,
  });
}}
        style={styles.guideCard}
      >
        <BlurView intensity={22} tint="light" style={StyleSheet.absoluteFill} />
        <View style={styles.guideTint} />

        {item.images?.[0] ? (
          <Image source={{ uri: item.images[0] }} style={styles.guideImg} />
        ) : (
          <View style={styles.guideImgPlaceholder} />
        )}

        <View style={styles.guideTextWrap}>
          <Text style={styles.guideTitle} numberOfLines={1}>
            {item.title || "Service"}
          </Text>

          <Text style={styles.guideSubtitle} numberOfLines={1}>
            {item.category || "Local service"}
          </Text>
        </View>

        <View style={styles.guideBorder} />
      </TouchableOpacity>
    ))
  )}
</ScrollView>
            </View>

            <View style={{ height: 36 }} />
          </ScrollView>
        </Animated.View>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },

  topGlass: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 18 : 10,
    zIndex: 10,
  },
  topGlassBorder: {
    ...StyleSheet.absoluteFillObject,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.06)",
  },

  content: {
    paddingTop: Platform.OS === "ios" ? 84 : 28,
    paddingBottom: 28,
  },



allServicesBtn: {
  height: 40,
  width: 40,
  borderRadius: 20,
  overflow: "hidden",

  alignItems: "center",
  justifyContent: "center",

  backgroundColor: "rgba(255,255,255,0.7)",

  marginLeft: 6,   // already good
  marginRight: 6,  // 👈 ADD THIS

  shadowColor: "#000",
  shadowOpacity: 0.08,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },

  elevation: 2,
},


  /* Search Row */
  searchRow: {
   paddingLeft: 16,
paddingRight: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginBottom: 14,
  },

  searchPill: {
    height: 44,
    borderRadius: 999,
    overflow: "hidden",
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  searchPillTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
    paddingVertical: 0,
  },
  micBtn: {
    height: 34,
    width: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  cancelBtn: { paddingHorizontal: 6 },
  cancelText: {
    fontSize: 16,
    fontWeight: "600",
    color: HELPIO_BLUE,
  },

  /* Sections */
  section: { paddingHorizontal: 16, marginTop: 10 },
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.2,
  },
  chevBtn: {
    height: 34,
    width: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },

  /* Card */
  card: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "transparent",
  },
  cardTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.66)",
  },

  /* Recents rows */
  recentRow: {
    height: 58,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  recentLeft: { flexDirection: "row", alignItems: "center" },
  recentMain: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.1,
  },
  recentMeta: {
    marginTop: 2,
    fontSize: 13,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  moreBtn: {
    height: 34,
    width: 34,
    borderRadius: 17,
    alignItems: "center",
    justifyContent: "center",
  },
  rowDivider: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },

  emptyRow: {
    height: 58,
    paddingHorizontal: 14,
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },

  /* Find Nearby */
  findNearbySection: { marginTop: 30 },
  findNearbyTitle: { marginBottom: 10 }, // ✅ label-to-card spacing fix

  nearbyGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    paddingBottom: 24,
  },
  nearbyPill: {
    width: (width - 16 * 2 - 12) / 2,
    height: 52,
    borderRadius: 50,
    overflow: "hidden",
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 2,
  },
  nearbyTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.72)",
  },
  nearbyIconDot: {
    height: 30,
    width: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  nearbyText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
    letterSpacing: -0.1,
  },


/* Suggestions */
suggestionWrap: {
  paddingHorizontal: 16,
  marginBottom: 6,
},
suggestionCard: {
  borderRadius: 18,
  overflow: "hidden",
  backgroundColor: "transparent",
},
sugRow: {
  height: 56,
  paddingHorizontal: 14,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "space-between",
},
sugLeft: { flexDirection: "row", alignItems: "center" },
sugMain: {
  fontSize: 16,
  fontWeight: "700",
  color: "#111827",
  letterSpacing: -0.1,
},
sugMeta: {
  marginTop: 2,
  fontSize: 13,
  fontWeight: "600",
  color: "#9CA3AF",
},


  /* Guides */
  guideCard: {
    width: 188,
    height: 210,
    borderRadius: 22,
    overflow: "hidden",
    marginRight: 14,
    backgroundColor: "transparent",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 14 },
    elevation: 3,
  },
  guideTint: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255,255,255,0.62)",
  },
  guideImg: { width: "100%", height: 126 },
  guideImgPlaceholder: {
    width: "100%",
    height: 126,
    backgroundColor: "rgba(17,24,39,0.06)",
  },
  guideTextWrap: { paddingHorizontal: 14, paddingTop: 12 },
  guideTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#111827",
    letterSpacing: -0.2,
  },
  guideSubtitle: {
    marginTop: 4,
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  guideBorder: {
    ...StyleSheet.absoluteFillObject,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
});
