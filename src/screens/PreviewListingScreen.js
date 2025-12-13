// src/screens/PreviewListingScreen.js
import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function PreviewListingScreen({ route, navigation }) {
  const { title, description, category, price, location, images } =
    route.params || {};

  const confirmPublish = () => {
    // Later: send to backend API
    alert("✅ Your listing has been published!");
    navigation.popToTop(); // return to main feed
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {/* Image Carousel */}
        <ScrollView
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          style={styles.imageScroll}
        >
          {images?.map((uri, idx) => (
            <Image key={idx} source={{ uri }} style={styles.mainImage} />
          ))}
        </ScrollView>

        {/* Info Section */}
        <View style={styles.content}>
          <Text style={styles.title}>{title}</Text>
          {price ? <Text style={styles.price}>${price}</Text> : null}
          {location ? <Text style={styles.location}>{location}</Text> : null}
          {category ? (
            <Text style={styles.categoryTag}>{category}</Text>
          ) : null}

          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>
            {description || "No description provided."}
          </Text>
        </View>
      </ScrollView>

      {/* Bottom Buttons */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={[styles.button, styles.backButton]}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={18} color="#007BFF" />
          <Text style={styles.backText}>Edit</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.publishButton]}
          onPress={confirmPublish}
        >
          <Text style={styles.publishText}>Confirm & Publish</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  imageScroll: {
    height: 300,
    backgroundColor: "#f5f5f5",
  },
  mainImage: {
    width: 400,
    height: 300,
    resizeMode: "cover",
  },
  content: {
    padding: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    marginBottom: 6,
  },
  price: {
    fontSize: 20,
    fontWeight: "600",
    color: "#007BFF",
    marginBottom: 4,
  },
  location: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  categoryTag: {
    alignSelf: "flex-start",
    backgroundColor: "#EAF3FF",
    color: "#007BFF",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
    fontWeight: "500",
    marginBottom: 20,
  },
  sectionTitle: {
    fontWeight: "600",
    marginBottom: 4,
    fontSize: 16,
  },
  description: {
    fontSize: 15,
    color: "#444",
    lineHeight: 22,
  },
  bottomBar: {
    flexDirection: "row",
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
  },
  button: {
    flex: 1,
    borderRadius: 50,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  backButton: {
    borderWidth: 1,
    borderColor: "#007BFF",
    marginRight: 10,
    flexDirection: "row",
    gap: 6,
  },
  publishButton: {
    backgroundColor: "#007BFF",
  },
  backText: {
    color: "#007BFF",
    fontWeight: "600",
    fontSize: 15,
  },
  publishText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
});
