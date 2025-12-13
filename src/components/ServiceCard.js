// src/components/ServiceCard.js
import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const GAP = 12;                          // space between columns
const SCREEN_W = Dimensions.get("window").width;
const H_PADDING = 18;                    // screen horizontal padding (matches header)
const CARD_W = (SCREEN_W - H_PADDING * 2 - GAP) / 2;

export default function ServiceCard({ item, onPress }) {
  const photo =
    item?.photos?.[0] ||
    "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop";

  const price = typeof item?.price === "number" ? `$${item.price}` : "$—";
  const title = item?.title || "Untitled";
  const location = item?.location || "—";

  return (
    <TouchableOpacity activeOpacity={0.9} onPress={onPress} style={styles.touch}>
      <View style={styles.card}>

        {/* Image */}
        <Image source={{ uri: photo }} style={styles.image} resizeMode="cover" />

        {/* Price + Service name */}
        <View style={styles.info}>
          <Text style={styles.price}>{price}</Text>
          <Text numberOfLines={1} style={styles.title}>
            {title}
          </Text>
        </View>

        {/* Location bar (blue pin + city/state) */}
        <View style={styles.locationBar}>
          <Ionicons name="location-sharp" size={16} color="#1877F2" />
          <Text numberOfLines={1} style={styles.locationText}>
            {location}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  touch: {
    width: CARD_W,
  },
  card: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#fff",
  },
  image: {
    width: "100%",
    height: 190, // visual height to match your mock
  },
  info: {
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 8,
    gap: 4,
    backgroundColor: "#fff",
  },
  price: {
    fontSize: 22,
    fontWeight: "900",
    color: "#0E1525",
  },
  title: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2A3447",
  },
  locationBar: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 10,
    backgroundColor: "#EAF1FF", // light ribbon like the mock
  },
  locationText: {
    fontSize: 16,
    fontWeight: "800",
    color: "#1877F2",
  },
});
