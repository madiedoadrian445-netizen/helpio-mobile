// src/screens/ImagePreviewScreen.js
import React from "react";
import {
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { SharedElement } from "react-navigation-shared-element";
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

      {/* Shared element animated image */}
      <SharedElement id={imageUri}>
        <Image
          source={{ uri: imageUri }}
          style={styles.image}
          resizeMode="contain"
        />
      </SharedElement>
    </View>
  );
}

// Enable shared element transition
ImagePreviewScreen.sharedElements = (route) => {
  const { imageUri } = route.params;
  return [imageUri];
};

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
