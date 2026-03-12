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

export default function VerifyIdentityIntroScreen({ onContinue }) {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.inner}>
        {/* Icon */}
        <View style={styles.iconWrap}>
          <Ionicons
            name="shield-checkmark-outline"
            size={56}
            color={HELPIO_BLUE}
          />
        </View>

        {/* Title */}
        <Text style={styles.title}>Verify your identity</Text>

        {/* Description */}
        <Text style={styles.subtitle}>
          This helps keep Helpio BusinessPlace secure and ensures trust between
          customers and providers.
        </Text>

        {/* What happens */}
        <View style={styles.infoBox}>
          <Text style={styles.infoText}>You’ll need to:</Text>

          <Text style={styles.bullet}>• Scan a valid government ID</Text>
          <Text style={styles.bullet}>• Complete a quick face scan</Text>
        </View>
      </View>

      {/* Continue */}
      <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
        <Text style={styles.continueText}>Continue</Text>
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
    paddingHorizontal: 32,
    paddingTop: Platform.OS === "ios" ? 72 : 56,
  },

  iconWrap: {
    alignItems: "center",
    marginBottom: 28,
  },

  title: {
    fontFamily: Platform.OS === "ios" ? "SFProDisplay-Semibold" : undefined,
    fontSize: 28,
    fontWeight: Platform.OS === "ios" ? "600" : "bold",
    letterSpacing: -0.4,
    color: "#000",
    textAlign: "center",
    marginBottom: 12,
  },

  subtitle: {
    fontFamily: Platform.OS === "ios" ? "SFProText-Regular" : undefined,
    fontSize: 16,
    lineHeight: 22,
    letterSpacing: -0.2,
    color: "#3C3C4399",
    textAlign: "center",
    marginBottom: 28,
  },

  infoBox: {
    backgroundColor: "#F9F9FB",
    borderRadius: 14,
    padding: 16,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: "#D1D1D6",
  },

  infoText: {
    fontFamily: Platform.OS === "ios" ? "SFProText-Semibold" : undefined,
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginBottom: 8,
  },

  bullet: {
    fontFamily: Platform.OS === "ios" ? "SFProText-Regular" : undefined,
    fontSize: 15,
    lineHeight: 22,
    color: "#3C3C4399",
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
