import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HELPIO_BLUE = "#00A6FF";
const TEST_MODE = true;

export default function VerifyIdentityIDScanScreen({ onContinue }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Header */}
        <Text style={styles.title}>Scan your ID</Text>

        <Text style={styles.subtitle}>
          Position your government-issued ID inside the frame.
        </Text>

        {/* Camera Frame */}
        <View style={styles.cameraWrap}>
          <View style={styles.cameraFrame}>
            {/* Corner Guides */}
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />

            {/* Icon */}
            <Ionicons
              name="card-outline"
              size={56}
              color="#8E8E93"
              style={{ opacity: 0.7 }}
            />
          </View>
        </View>

        {/* Tip */}
        <Text style={styles.tip}>
          Make sure all edges are visible and text is clear.
        </Text>
      </View>

      {/* Continue */}
      <TouchableOpacity
  style={styles.continueBtn}
  onPress={() => {
    if (TEST_MODE) {
      onContinue(); // ✅ advance to face scan
    } else {
      // future: real Stripe Identity start
    }
  }}
>
  <Text style={styles.continueText}>Scan ID</Text>
</TouchableOpacity>

    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  inner: {
    flex: 1,
    paddingHorizontal: 28,
    paddingTop: Platform.OS === "ios" ? 72 : 56,
  },

  title: {
    fontFamily: Platform.OS === "ios" ? "SFProDisplay-Semibold" : undefined,
    fontSize: 28,
    fontWeight: Platform.OS === "ios" ? "600" : "bold",
    letterSpacing: -0.4,
    color: "#000",
    textAlign: "center",
    marginBottom: 10,
  },

  subtitle: {
    fontFamily: Platform.OS === "ios" ? "SFProText-Regular" : undefined,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
    color: "#3C3C4399",
    textAlign: "center",
    marginBottom: 36,
  },

  cameraWrap: {
    alignItems: "center",
    marginBottom: 28,
  },

  cameraFrame: {
    width: "100%",
    maxWidth: 320,
    height: 200,
    borderRadius: 18,
    backgroundColor: "#F9F9FB",
    borderWidth: 1,
    borderColor: "#D1D1D6",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },

  corner: {
    position: "absolute",
    width: 28,
    height: 28,
    borderColor: HELPIO_BLUE,
  },

  topLeft: {
    top: 10,
    left: 10,
    borderTopWidth: 3,
    borderLeftWidth: 3,
    borderTopLeftRadius: 6,
  },

  topRight: {
    top: 10,
    right: 10,
    borderTopWidth: 3,
    borderRightWidth: 3,
    borderTopRightRadius: 6,
  },

  bottomLeft: {
    bottom: 10,
    left: 10,
    borderBottomWidth: 3,
    borderLeftWidth: 3,
    borderBottomLeftRadius: 6,
  },

  bottomRight: {
    bottom: 10,
    right: 10,
    borderBottomWidth: 3,
    borderRightWidth: 3,
    borderBottomRightRadius: 6,
  },

  tip: {
    fontFamily: Platform.OS === "ios" ? "SFProText-Regular" : undefined,
    fontSize: 14,
    lineHeight: 20,
    color: "#3C3C4399",
    textAlign: "center",
  },

  continueBtn: {
    height: 48,
    borderRadius: 24,
    backgroundColor: HELPIO_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 28,
    marginBottom: Platform.OS === "ios" ? 28 : 18,
  },

  continueText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#FFFFFF",
  },
});
