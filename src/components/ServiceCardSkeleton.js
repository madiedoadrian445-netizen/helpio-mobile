import React, { useEffect, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";

export default function ServiceCardSkeleton() {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(shimmer, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [0, 1],
    outputRange: [-120, 120],
  });

  return (
    <View style={styles.card}>
      {/* image placeholder */}
      <View style={styles.image} />

      {/* text rows */}
      <View style={styles.content}>
        <View style={styles.lineShort} />
        <View style={styles.lineLong} />

        <View style={styles.metaRow}>
          <View style={styles.metaSmall} />
          <View style={styles.metaTiny} />
        </View>
      </View>

      {/* shimmer overlay */}
      <Animated.View
        pointerEvents="none"
        style={[
          styles.shimmer,
          {
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "49.5%",
    borderRadius: 10,
    overflow: "hidden",
    backgroundColor: "rgba(255,255,255,0.6)",
    marginBottom: 12,
  },

  image: {
    width: "100%",
    height: 240,
    backgroundColor: "#E5E7EB",
  },

  content: {
    paddingHorizontal: 8,
    paddingVertical: 8,
  },

  lineShort: {
    height: 12,
    width: "60%",
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
    marginBottom: 6,
  },

  lineLong: {
    height: 10,
    width: "80%",
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
    marginBottom: 10,
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  metaSmall: {
    width: "40%",
    height: 10,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },

  metaTiny: {
    width: "20%",
    height: 10,
    borderRadius: 6,
    backgroundColor: "#E5E7EB",
  },

  shimmer: {
    position: "absolute",
    top: 0,
    bottom: 0,
    width: 120,
    backgroundColor: "rgba(255,255,255,0.35)",
  },
});
