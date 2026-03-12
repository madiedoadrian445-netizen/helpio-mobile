import React, { useMemo } from "react";
import { View, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function FeedStars({ size = 13, rating = 0 }) {
  const safeRating = rating ?? 0;
  const fullStars = useMemo(() => Math.floor(safeRating), [safeRating]);

  return (
    <View style={styles.row}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Ionicons
          key={i}
          name="star"
          size={size}
          color={i < fullStars ? "#373739cb" : "#82827fff"} // 🔥 DARKER + CLEAN
          style={styles.star}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    marginRight: 1.5,
  },
});