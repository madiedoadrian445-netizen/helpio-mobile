// src/screens/AllServicesScreen.js
import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  RefreshControl,
  SafeAreaView,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  TouchableWithoutFeedback,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import HeroHeader from "../components/HeroHeader";
import { useTheme } from "../ThemeContext";
import axios from "axios";

const API_URL = "https://helpio-backend.onrender.com/api/services";
const HELP_IO_BLUE = "#00A6FF";

const featuredPosts = [
  {
    _id: "featured1",
    title: "Veloz Contractors",
    description: "Luxury Bathroom Remodel – South Beach, Miami",
    price: 1500,
    photos: [require("../../assets/images/veloz_contractors.jpg")],
  },
  {
    _id: "featured2",
    title: "Miami Jetski Shop",
    description: "Yamaha 1.8 HO Remanufactured Long Block – Ready to Ship",
    price: 4200,
    photos: [require("../../assets/images/miami_jetski.jpg")],
  },
  {
    _id: "featured3",
    title: "Redline Underground Cars",
    description: "Exotic Car Customization – Diamond Wrap Collection",
    price: 2500,
    photos: [require("../../assets/images/redline_cars.jpg")],
  },
];

export default function AllServicesScreen({ navigation }) {
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

  const fetchServices = async () => {
    try {
      const response = await axios.get(API_URL, { timeout: 20000 });
      setServices(response.data);
    } catch (err) {
      console.log("❌ Fetch services error:", err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchServices();
  };

  // 🟦 Normalize backend data
  const normalizedServices = React.useMemo(() => {
    return services.map((s) => ({
      ...s,
      title: s.title || "",
      description: s.description || "",
      category: s.category || "",
      location: s.location || "",
    }));
  }, [services]);
// 🧠 Smart iOS-style location abbreviation
const formatLocation = (name = "") => {
  if (!name) return "";

  // Trim spaces
  name = name.trim();

  // If short enough, show normally
  if (name.length <= 18) return name;

  // Common directional words → abbreviations
  const map = {
    north: "N.",
    south: "S.",
    east: "E.",
    west: "W.",
    northeast: "NE",
    northwest: "NW",
    southeast: "SE",
    southwest: "SW",
    "northwest territory": "NW Terr.",
  };

  let words = name.toLowerCase().split(" ");

  // Replace directional words with abbreviations
  words = words.map((w) => map[w] || w);

  let rebuilt = words
    .map((w) => (w.length > 10 ? w.slice(0, 8) + "." : w)) // shrink long words
    .join(" ");

  // Final safety truncation
  if (rebuilt.length > 22) {
    rebuilt = rebuilt.slice(0, 22) + "…";
  }

  return rebuilt
    .split(" ")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
};

  // 🔥 FINAL FIXED FILTER FUNCTION
  const applyFilters = () => {
    let filtered = [...normalizedServices]; //  ✅ FIXED HERE

    if (localActive) {
      filtered = filtered.filter((s) =>
        s.location?.toLowerCase().includes("miami")
      );
    }

    if (minPrice && maxPrice) {
      filtered = filtered.filter(
        (s) =>
          s.price >= parseFloat(minPrice) && s.price <= parseFloat(maxPrice)
      );
    }

    if (sortOrder === "asc") filtered.sort((a, b) => a.price - b.price);
    if (sortOrder === "desc") filtered.sort((a, b) => b.price - a.price);

    return filtered.filter((item) => {
      const q = search.toLowerCase().trim();
      if (!q) return true;

      const haystack = JSON.stringify(item).toLowerCase();
      return haystack.includes(q);
    });
  };

  const filtered = React.useMemo(
    () => applyFilters(),
    [search, services, localActive, minPrice, maxPrice, sortOrder]
  );

  const combinedServices = [...featuredPosts, ...filtered];
  const hasQuery = search.trim().length > 0;
  const listToShow = hasQuery ? filtered : combinedServices;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <BlurView intensity={40} tint={theme.blurTint} style={styles.topBlur}>
        <View style={styles.headerContainer}>
          <Text style={[styles.headerTitleBlue, { color: HELP_IO_BLUE, fontSize: 20.5 }]}>
            BusinessPlace
          </Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => navigation.navigate("Notifications")}
            style={styles.iconWrap}
          >
            <BlurView
              intensity={40}
              tint={theme.blurTint}
              style={styles.blurCircle}
            >
              <Ionicons
                name="notifications-outline"
                size={20}
                color={HELP_IO_BLUE}
              />
              <View style={styles.badgeDot} />
            </BlurView>
          </TouchableOpacity>
        </View>
      </BlurView>

      <ScrollView
        style={[styles.container, { backgroundColor: theme.background }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={HELP_IO_BLUE}
          />
        }
        contentContainerStyle={{ paddingTop: Platform.OS === "ios" ? 10 : 8 }}
      >
        <View style={{ marginTop: -8 }}>
          <HeroHeader
            navigation={navigation}
            search={search}
            setSearch={setSearch}
            activeFeed="all"
            onFeedChange={(key) => {
              if (key === "choice") navigation.navigate("HelpiosChoice");
              if (key === "verified") navigation.navigate("HelpioVerified");
              if (key === "trending") navigation.navigate("TrendingNow");
              if (key === "all") navigation.navigate("Home");
            }}
            onLocalPress={() => setLocalActive(!localActive)}
            onPricePress={() => setPriceVisible(true)}
            onSortPress={() => setSortVisible(true)}
          />
        </View>

        <View style={{ marginTop: 8 }}>
          <Text style={[styles.sectionTitle, { color: theme.text }]}>
            Trending Now
          </Text>

          {loading ? (
            <ActivityIndicator
              size="large"
              color={HELP_IO_BLUE}
              style={{ marginTop: 40 }}
            />
          ) : listToShow.length === 0 ? (
            <Text style={[styles.empty, { color: theme.subtleText }]}>
              No services found.
            </Text>
          ) : (
            <View style={styles.grid}>
              {listToShow.map((service) => (
                <TouchableOpacity
                  key={service._id}
                  style={[
                    styles.card,
                    {
                      backgroundColor: theme.card,
                      shadowOpacity: darkMode ? 0 : 0.08,
                    },
                  ]}
                  onPress={() =>
                    navigation.navigate("ServiceDetailScreen", { service })
                  }
                >
                  {service.photos?.length > 0 ? (
                    typeof service.photos[0] === "number" ? (
                      <Image
                        source={service.photos[0]}
                        style={styles.image}
                        resizeMode="cover"
                      />
                    ) : (
                      <Image
                        source={{ uri: service.photos[0] }}
                        style={styles.image}
                      />
                    )
                  ) : (
                    <View style={styles.noImage}>
                      <Ionicons name="image-outline" size={30} color="#ccc" />
                    </View>
                  )}
<View style={styles.cardContent}>
  <View style={styles.titleRow}>
    <Text
      numberOfLines={1}
      style={[styles.title, { color: theme.text }]}
    >
      {service.title}
    </Text>
    {localActive && (
      <Ionicons
        name="checkmark-circle"
        size={16}
        color={HELP_IO_BLUE}
      />
    )}
  </View>

  <Text
    numberOfLines={1}
    style={[styles.desc, { color: theme.subtleText }]}
  >
    {service.description}
  </Text>

  {/* PRICE + LOCATION */}
  <View
    style={{
      flexDirection: "row",
      alignItems: "center",
      marginTop: 4,
      position: "relative",
    }}
  >
    {/* PRICE */}
    <Text
      style={[
        styles.price,
        { color: HELP_IO_BLUE, marginRight: 8 },
      ]}
    >
      {`$${service.price}`}
    </Text>

    {/* LOCATION PIN – ABSOLUTE POSITION */}
    <Ionicons
      name="location"
      size={12}
      color={HELP_IO_BLUE}
      style={{
        position: "absolute",
        right: 45,   // ← adjust freely
        top: 2,
      }}
    />

    {/* LOCATION TEXT */}
    <Text
      numberOfLines={1}
      style={{
        fontSize: 14,
        fontWeight: "600",
        color: HELP_IO_BLUE,
        marginLeft: 105,
      }}
    >
      {service.location?.length > 15
        ? service.location.substring(0, 12) + "..."
        : service.location || "Miami"}
    </Text>
  </View>
</View>
                 
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      <TouchableOpacity
        style={[styles.addButton, { backgroundColor: HELP_IO_BLUE }]}
        onPress={() => navigation.navigate("CreateListing")}
      >
        <Ionicons name="add" size={30} color="#fff" />
      </TouchableOpacity>

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

        <View
          style={[styles.modalContainer, { backgroundColor: theme.card }]}
        >
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
    </SafeAreaView>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1 },
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
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 20,
    paddingBottom: 10,
    paddingTop: Platform.OS === "ios" ? 40 : 20,
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
    fontSize: 22,
    fontWeight: "800",
    paddingHorizontal: 18,
    marginTop: 4,
    marginBottom: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    columnGap: 4,
    rowGap: 12,
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
    height: 190,
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
  addButton: {
    position: "absolute",
    bottom: 100,
    right: 25,
    width: 64,
    height: 64,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowOpacity: 0.4,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 5,
    zIndex: 999,
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
