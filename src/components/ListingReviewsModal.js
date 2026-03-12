import React, { useEffect, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  Image,
  Animated,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HELPIO_BLUE = "#00A6FF";
const ANIM_MS = 180;
const PAGE_SIZE = 6;

export default function ListingReviewsModal({
  visible,
  onClose,
  listingTitle = "Service",
  reviews = [],
}) {
  const anim = useRef(new Animated.Value(0)).current;

  const [page, setPage] = useState(1);
  const [activeFilter, setActiveFilter] = useState("seller");
  const [sortOption, setSortOption] = useState("recent");

  useEffect(() => {
    Animated.timing(anim, {
      toValue: visible ? 1 : 0,
      duration: ANIM_MS,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  if (!visible) return null;

  /* -------- SORT -------- */
  const sorted = [...reviews].sort((a, b) => {
    if (sortOption === "recent") return new Date(b.date) - new Date(a.date);
    if (sortOption === "oldest") return new Date(a.date) - new Date(b.date);
    if (sortOption === "high") return b.rating - a.rating;
    if (sortOption === "low") return a.rating - b.rating;
    return 0;
  });

  const totalPages = Math.ceil(sorted.length / PAGE_SIZE);
  const start = (page - 1) * PAGE_SIZE;
  const visibleReviews = sorted.slice(start, start + PAGE_SIZE);

  return (
    <Modal visible={visible} transparent animationType="none">
      <Pressable style={styles.overlay} onPress={onClose}>
        <Pressable onPress={() => {}}>
          <Animated.View
            style={[
              styles.sheet,
              {
                opacity: anim,
                transform: [
                  {
                    scale: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.97, 1],
                    }),
                  },
                  {
                    translateY: anim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [12, 0],
                    }),
                  },
                ],
              },
            ]}
          >
            {/* HEADER */}
            <View style={styles.header}>
              <View>
                <Text style={styles.headerTitle}>Reviews for this service</Text>
                <Text style={styles.headerSubtitle}>{listingTitle}</Text>
              </View>
              <Pressable style={styles.closeBtn} onPress={onClose}>
                <Ionicons name="close" size={18} />
              </Pressable>
            </View>

            {/* FILTERS */}
            <View style={styles.filterRow}>
              {["seller", "quality", "accuracy"].map((key) => (
                <Pressable
                  key={key}
                  onPress={() => setActiveFilter(key)}
                  style={[
                    styles.chip,
                    activeFilter === key && styles.chipActive,
                  ]}
                >
                  <Text
                    style={[
                      styles.chipText,
                      activeFilter === key && styles.chipTextActive,
                    ]}
                  >
                    {key === "seller"
                      ? "Seller service"
                      : key === "quality"
                      ? "Quality"
                      : "Description accuracy"}
                  </Text>
                </Pressable>
              ))}
            </View>

            {/* CONTENT */}
            <ScrollView contentContainerStyle={styles.content}>
              {visibleReviews.map((r) => (
              <View key={r._id || r.id || `${r.author || "anon"}-${r.date || ""}-${r.rating || 0}`} style={styles.reviewCard}>

  {/* AUTHOR */}
  <View style={styles.footer}>
    <View style={styles.avatar}>
      <Text style={styles.avatarText}>{r.initials}</Text>
    </View>
    <View>
      <Text style={styles.author}>{r.author}</Text>
      <Text style={styles.date}>{r.date}</Text>
    </View>
  </View>

  {/* STARS */}
  <View style={styles.ratingRow}>
    <Text style={styles.stars}>
      {"★".repeat(r.rating)}
      {"☆".repeat(5 - r.rating)}
    </Text>
    <Text style={styles.ratingScore}>{r.rating}</Text>
    {r.recommends && (
      <Text style={styles.recommend}>✓ Recommends</Text>
    )}
  </View>

  {r.variant && (
    <Text style={styles.variant}>{r.variant}</Text>
  )}

  <Text style={styles.body} numberOfLines={4}>
    {r.body}
  </Text>

  {r.images?.length > 0 && (
    <ScrollView horizontal style={styles.imageRow}>
      {r.images.map((img, i) => (
        <Image
          key={`${img}-${i}`}
          source={{ uri: img }}
          style={styles.reviewImage}
        />
      ))}
    </ScrollView>
  )}

</View>
              ))}

              {totalPages > 1 && (
                <View style={styles.pagination}>
                  <Pressable
                    disabled={page === 1}
                    onPress={() => setPage((p) => p - 1)}
                  >
                    <Text style={styles.pageBtn}>Previous</Text>
                  </Pressable>

                  <Text style={styles.pageText}>
                    Page {page} of {totalPages}
                  </Text>

                  <Pressable
                    disabled={page === totalPages}
                    onPress={() => setPage((p) => p + 1)}
                  >
                    <Text style={styles.pageBtn}>Next</Text>
                  </Pressable>
                </View>
              )}
            </ScrollView>
          </Animated.View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(15,23,42,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  sheet: {
    width: "94%",
    maxHeight: "86%",
    backgroundColor: "#fff",
    borderRadius: 20,
    overflow: "hidden",
    elevation: 24,
  },
  header: {
    padding: 18,
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    flexDirection: "row",
    justifyContent: "space-between",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#6B7280",
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  filterRow: {
    flexDirection: "row",
    padding: 12,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: HELPIO_BLUE,
    borderColor: HELPIO_BLUE,
  },
  chipText: {
    fontSize: 12,
    color: "#374151",
  },
  chipTextActive: {
    color: "#fff",
  },
  content: {
    padding: 18,
  },
  reviewCard: {
    borderBottomWidth: 1,
    borderColor: "#E5E7EB",
    paddingBottom: 16,
    marginBottom: 16,
  },
 ratingRow: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 6,
  marginBottom: 4,
},
  stars: {
    color: HELPIO_BLUE,
    marginRight: 6,
  },
  ratingScore: {
    fontWeight: "600",
    marginRight: 6,
  },
  recommend: {
    color: "#16A34A",
    fontSize: 12,
  },
  variant: {
    fontSize: 11,
    color: "#6B7280",
    marginTop: 4,
  },
  body: {
    marginTop: 6,
    fontSize: 14,
  },
  imageRow: {
    marginTop: 10,
  },
  reviewImage: {
    width: 84,
    height: 84,
    borderRadius: 12,
    marginRight: 8,
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  avatarText: {
    fontWeight: "600",
  },
  author: {
    fontWeight: "600",
  },
  date: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  pagination: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  pageBtn: {
    fontSize: 12,
    padding: 6,
  },
  pageText: {
    fontSize: 12,
  },
});
