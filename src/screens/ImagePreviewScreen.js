// src/screens/ImagePreviewScreen.js
import React from "react";
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import Animated from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";

const { width, height } = Dimensions.get("window");

export default function ImagePreviewScreen({ route, navigation }) {
  const { imageUri } = route.params || {};

  return (
    <View style={styles.container}>
      {/* Close button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={() => navigation.goBack()}
      >
        <Ionicons name="close" size={30} color="#fff" />
      </TouchableOpacity>

      {/* Reanimated shared transition */}
      <Animated.Image
        sharedTransitionTag={imageUri}
        source={{ uri: imageUri }}
        style={styles.image}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width,
    height,
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 10,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 50,
    padding: 6,
  },
});