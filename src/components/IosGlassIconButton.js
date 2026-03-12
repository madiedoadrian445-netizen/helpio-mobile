import React from "react";
import { TouchableOpacity, StyleSheet, View } from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

export default function IosGlassIconButton({
  icon = "call",
  size = 18,
  onPress,
  disabled = false,
}) {
  return (
    <TouchableOpacity activeOpacity={0.75} onPress={onPress} disabled={disabled}>
      <View style={styles.outerShadow}>
        <View style={[styles.circle, disabled && { opacity: 0.4 }]}>
          {/* Frosted glass blur */}
         <BlurView intensity={80} tint="systemMaterialLight" />


          {/* Radial-style lighting */}
          <LinearGradient
            colors={[
              "rgba(255,255,255,0.85)",
              "rgba(255,255,255,0.25)",
              "rgba(255,255,255,0.05)",
            ]}
            start={{ x: 0.2, y: 0 }}
            end={{ x: 0.8, y: 1 }}
            style={StyleSheet.absoluteFill}
          />

          {/* Inner highlight ring */}
          <View style={styles.innerRing} />

          <Ionicons name={icon} size={size} color="#000" />
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  /* Floating separation from background */
  outerShadow: {
    shadowColor: "#000",
   shadowOpacity: 0.28,
shadowRadius: 18,
shadowOffset: { width: 0, height: 8 },

    elevation: 10,
  },

  /* Glass circle */
  circle: {
    width: 42,          // 👈 iOS-accurate size
    height: 42,
    borderRadius: 21,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",

   backgroundColor: "rgba(235,235,240,0.82)",


  },

  /* Subtle inner edge highlight */
  innerRing: {
    position: "absolute",
    inset: 0,
    borderRadius: 21,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
  },
});
