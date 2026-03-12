import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
  SafeAreaView,
  Animated,
} from "react-native";

const HELPIO_BLUE = "#00A6FF";

export default function VerifyIdentityFaceScanScreen({ onContinue, onBack }) {
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 4200, // slow, calm iOS pace
        useNativeDriver: true,
      })
    ).start();
  }, []);

  const rotation = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Back */}
      {onBack && (
        <TouchableOpacity style={styles.backBtn} onPress={onBack}>
          <Text style={styles.backChevron}>‹</Text>
        </TouchableOpacity>
      )}

      <View style={styles.inner}>
        {/* Face Ring */}
        <View style={styles.faceWrap}>
          <Animated.View
            style={[
              styles.ring,
              { transform: [{ rotate: rotation }] },
            ]}
          />

          {/* Face Icon */}
          <View style={styles.faceIcon}>
            <View style={styles.eye} />
            <View style={styles.eye} />
            <View style={styles.smile} />
          </View>
        </View>

        {/* Text */}
        <Text style={styles.title}>How to Set Up Face ID</Text>

        <Text style={styles.subtitle}>
          First, position your face in the camera frame.{"\n"}
          Then move your head in a circle to show all the angles of your face.
        </Text>
      </View>

      {/* CTA */}
      <TouchableOpacity style={styles.continueBtn} onPress={onContinue}>
        <Text style={styles.continueText}>Get Started</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },

  inner: {
    flex: 1,
    alignItems: "center",
    paddingTop: Platform.OS === "ios" ? 96 : 72,
    paddingHorizontal: 28,
  },

  backBtn: {
    position: "absolute",
    top: Platform.OS === "ios" ? 56 : 40,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F2F2F7",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },

  backChevron: {
    fontSize: 26,
    color: "#000",
    marginTop: -2,
  },

  faceWrap: {
    width: 260,
    height: 260,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 36,
  },

  ring: {
    position: "absolute",
    width: 260,
    height: 260,
    borderRadius: 130,
    borderWidth: 6,
    borderColor: "#D1D1D6",
    borderStyle: "dashed",
  },

  faceIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: "#C7C7CC",
    alignItems: "center",
    justifyContent: "center",
  },

  eye: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: "#C7C7CC",
    marginHorizontal: 14,
  },

  smile: {
    width: 36,
    height: 18,
    borderBottomWidth: 4,
    borderColor: "#C7C7CC",
    borderBottomLeftRadius: 18,
    borderBottomRightRadius: 18,
    marginTop: 18,
  },

  title: {
    fontFamily: Platform.OS === "ios" ? "SFProDisplay-Semibold" : undefined,
    fontSize: 24,
    letterSpacing: -0.3,
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
  },

  continueBtn: {
    height: 50,
    borderRadius: 25,
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
