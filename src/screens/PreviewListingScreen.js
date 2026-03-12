// src/screens/PreviewListingScreen.js
import React, { useState } from "react";

import { Alert } from "react-native";
import ServiceDetailScreen from "./ServiceDetailScreen";
import { api } from "../config/api";
import { clearDraftListing } from "../utils/draftListingStorage";


/**
 * PRODUCTION PREVIEW SCREEN
 * ------------------------------------------------------------
 * Uses the REAL ServiceDetail renderer with draft data.
 * Zero duplicated UI.
 */

export default function PreviewListingScreen({ route, navigation }) {
  const {
    mode = "create",
    listingId,
    title,
    description,
    category,
    price,
    location,
    images = [],
    businessName,
  } = route.params || {};

  const [loading, setLoading] = useState(false);

  /* ------------------------------------------------------------ */
  /* BUILD DRAFT SERVICE OBJECT                                    */
  /* ------------------------------------------------------------ */

  const previewService = {
    _id: "preview-id", // fake id so renderer works
    title,
    description,
    category,
    price: Number(price),
    businessName,

    images: images?.map((img) => img.uri) || [],

    location: location || {
      city: "Local area",
      state: "",
      country: "",
    },

    // preview defaults
    rating: 5,
    ratingCount: 0,
    isVerified: true,
    reviews: [],
  };

  /* ------------------------------------------------------------ */
  /* PUBLISH LOGIC (UNCHANGED)                                     */
  /* ------------------------------------------------------------ */

  const uploadImages = async (images = []) => {



    const formData = new FormData();

    const localImages = images.filter((img) => !img.isRemote);
    if (localImages.length === 0) return [];

    localImages.forEach((img, index) => {
      const uri = img.uri;
      const filename = uri.split("/").pop();
      const ext = filename.split(".").pop()?.toLowerCase();

      const safeType =
        ext === "heic" || ext === "heif"
          ? "image/jpeg"
          : `image/${ext || "jpeg"}`;

      formData.append("files", {
        uri,
        name: `listing_${index}.${ext || "jpg"}`,
        type: safeType,
      });
    });

    const res = await api.post("/api/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (!res.data?.success || !Array.isArray(res.data.urls)) {
      throw new Error("Image upload failed");
    }

    return res.data.urls;
  };

  const publishListing = async () => {
  if (loading) return; // prevents double-tap

  try {
    setLoading(true);

    const uploadedImageUrls = await uploadImages(images);

    const existingImageUrls = images
      .filter((img) => img.isRemote)
      .map((img) => img.uri);

    const finalImages = [...existingImageUrls, ...uploadedImageUrls];

console.log("LOCATION DEBUG →", location);


    const payload = {
      title,
      description,
      category,
      price: Number(price),
      businessName,
      images: finalImages,
   location: {
  city: location?.city || "Miami",
  state: location?.state || "FL",
  zip: location?.zip || "",

  coordinates: {
    type: "Point",
    coordinates: [location.lng, location.lat],
  },
},


    };

    let response;

    if (mode === "edit" && listingId) {
      response = await api.put(`/api/listings/provider/${listingId}`, payload);
    } else {
      response = await api.post("/api/listings/provider", payload);
    }

    if (!response?.data?.success) {
      throw new Error(response?.data?.message || "Failed to publish listing");
    }

    Alert.alert("Success", "Your listing has been published!");

await clearDraftListing(); // ⭐ CRITICAL — remove saved draft

navigation.navigate("MainTabs", { screen: "Home" });

  } catch (err) {
    Alert.alert(
      "Error",
      err?.response?.data?.message || err?.message || "Something went wrong."
    );
  } finally {
    setLoading(false); // always reset
  }
};


  /* ------------------------------------------------------------ */
  /* RENDER REAL SERVICE DETAIL                                    */
  /* ------------------------------------------------------------ */

  return (
  <ServiceDetailScreen
    navigation={navigation}
    previewData={previewService}
    onPublish={publishListing}
    loading={loading}   // ⭐ critical
  />
);

}
