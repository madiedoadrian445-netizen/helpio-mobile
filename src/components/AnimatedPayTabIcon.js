import React, { useRef, useEffect } from "react";
import {
  View,
  Animated,
  TouchableWithoutFeedback,
  Text,
  Platform,
  StyleSheet,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";

export default function AnimatedPayTabIcon({ navigation, focused }) {
  const { darkMode } = useTheme();
  const tint = darkMode ? "dark" : "light";

  const scaleAnim = useRef(new Animated.Value(1)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.9,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start(() => navigation.navigate("HelpioPay"));
  };

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.07,
          duration: 1800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1800,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, []);

  return (
    <View style={styles.wrap}>
      <TouchableWithoutFeedback
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Animated.View
          style={[
            styles.centerButton,
            {
              backgroundColor: darkMode ? "#000" : "#FFF",
              borderColor: darkMode ? "#00A6FF" : "#007AFF",
              transform: [{ scale: Animated.multiply(scaleAnim, pulseAnim) }],
            },
          ]}
        >
          <BlurView intensity={55} tint={tint} style={StyleSheet.absoluteFill} />
          <Ionicons
            name="card-outline"
            size={22}
            color={darkMode ? "#00A6FF" : "#007AFF"}
          />
        </Animated.View>
      </TouchableWithoutFeedback>

      <Text
        style={{
          fontSize: 11,
          fontWeight: "600",
          color: focused
            ? darkMode
              ? "#00A6FF"
              : "#007AFF"
            : darkMode
            ? "#CCC"
            : "#1B1B1B",
          marginTop: 6,
        }}
      >
        Helpio Pay
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    alignItems: "center",
    justifyContent: "center",
    top: Platform.OS === "ios" ? -10 : -8,
    width: 90,
  },
  centerButton: {
    width: 58,
    height: 58,
    borderRadius: 29,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    borderWidth: 2,
  },
});
