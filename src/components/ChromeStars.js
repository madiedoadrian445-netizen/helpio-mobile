import React, { useEffect, useRef, useState } from "react";
import { View, Animated, StyleSheet, Easing } from "react-native";
import MaskedView from "@react-native-masked-view/masked-view";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function ChromeStars({ size = 15, rating = 5 }) {
  const shimmer = useRef(new Animated.Value(-1)).current;

  const [lockedRating, setLockedRating] = useState(null);

  useEffect(() => {
    if (rating !== undefined && rating !== null) {
      setLockedRating(rating);
    }
  }, [rating]);

  const safeRating = lockedRating ?? 5;

  useEffect(() => {
    let mounted = true;

    const animate = () => {
      if (!mounted) return;

      shimmer.setValue(-1);

      Animated.timing(shimmer, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      }).start(() => animate());
    };

    animate();

    return () => {
      mounted = false;
      shimmer.stopAnimation();
    };
  }, []);

  const translateX = shimmer.interpolate({
    inputRange: [-1, 1],
    outputRange: [-200, 200],
  });

  const fullStars = Math.floor(safeRating);

  return (
    <View style={styles.row}>
      <MaskedView
        maskElement={
          <View style={styles.row}>
            {Array.from({ length: 5 }).map((_, i) => (
              <Ionicons key={i} name="star" size={size} color="#000" style={styles.star} />
            ))}
          </View>
        }
      >
        <View style={styles.row}>
          {Array.from({ length: 5 }).map((_, i) => (
            <Ionicons
              key={i}
              name="star"
              size={size}
              color={i < fullStars ? "#CFCFC9" : "#8E8E93"} // 🔥 Fill logic
              style={[
                styles.star,
                {
                  textShadowColor: "rgba(0,0,0,0.4)",
                  textShadowOffset: { width: 0, height: 1 },
                  textShadowRadius: 3,
                },
              ]}
            />
          ))}
        </View>

        {/* Shine Pass 1 */}
        <Animated.View
          pointerEvents="none"
          style={[StyleSheet.absoluteFill, { transform: [{ translateX }] }]}
        >
          <LinearGradient
            colors={[
              "rgba(255,255,255,0)",
              "rgba(255,255,255,1)",
              "rgba(255,255,255,0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>

        {/* Shine Pass 2 */}
        <Animated.View
          pointerEvents="none"
          style={[
            StyleSheet.absoluteFill,
            {
              transform: [{ translateX }],
              opacity: 0.55,
            },
          ]}
        >
          <LinearGradient
            colors={[
              "rgba(255,255,255,0)",
              "rgba(255,255,255,0.55)",
              "rgba(255,255,255,0)",
            ]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={StyleSheet.absoluteFill}
          />
        </Animated.View>
      </MaskedView>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  star: {
    marginRight: 2,
  },
});