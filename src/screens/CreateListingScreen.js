// src/screens/CreateListingScreen.js
import React, { useEffect, useMemo, useRef, useState, memo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  SafeAreaView,
  Alert,
  Animated,
  Platform,
  StatusBar,
  ActivityIndicator,
 } from "react-native";

import {
  saveDraftListing,
  loadDraftListing,
  clearDraftListing,
} from "../utils/draftListingStorage";
import useAuthStore from "../store/auth";

import * as ImagePicker from "expo-image-picker";
import DraggableFlatList from "react-native-draggable-flatlist";
import AnimatedReanimated, { Layout, ZoomIn, ZoomOut } from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { BlurView } from "expo-blur";
import { api } from "../config/api";
import CoverEditorModal from "../components/CoverEditorModal";
const ITEM_SIZE = 120;
const HELP_IO_BLUE = "#00A6FF";
const BOTTOM_SCROLL_DELTA = 70;

const Field = memo(function Field({
  label,
  value,
  onChange,
  placeholder,
  theme,
  darkMode,
  keyboardType,
  multiline,
  onFocus,
  rightAccessory,
}) {
  return (
    <View style={styles.fieldRow}>
      <View style={styles.fieldTopRow}>
        <Text style={[styles.label, { color: theme.subtleText }]}>{label}</Text>
        {rightAccessory ? <View style={{ marginLeft: 10 }}>{rightAccessory}</View> : null}
      </View>

      <TextInput
        style={[
          styles.input,
          { color: theme.text },
          multiline && styles.inputArea,
        ]}
        placeholder={placeholder}
        placeholderTextColor={darkMode ? "#888" : "#A8A8AD"}
        value={value}
        onChangeText={onChange}
        keyboardType={keyboardType}
        multiline={multiline}
        onFocus={onFocus}
      />
    </View>
  );
});

export default function CreateListingScreen({ navigation, route }) {
  const { darkMode, theme } = useTheme();
  const insets = useSafeAreaInsets();

  const { mode = "create", listing } = route?.params || {};
  const isEdit = mode === "edit";

  const [images, setImages] = useState([]); // [{ uri, isRemote }]
  const [video, setVideo] = useState(null);
const authUser = useAuthStore((state) => state.user);

const providerId =
  authUser?.providerId ||
  authUser?.provider?._id ||
  authUser?.provider ||
  null;

  const [businessName, setBusinessName] = useState("Your Company Name");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
const [editorVisible, setEditorVisible] = useState(false);
const [editingCover, setEditingCover] = useState(null);
  // location object from LocationPicker: { city, state, zip, lat, lng, radiusMiles? }
  const [location, setLocation] = useState(null);
const [originalCover, setOriginalCover] = useState(null);
  const scrollY = useRef(new Animated.Value(0)).current;
  const [scrollOffset, setScrollOffset] = useState(0);
  const scrollRef = useRef(null);
const isHydratingRef = useRef(true);
const isAuthHydrated = useAuthStore((state) => state.isHydrated);
const didRestoreRef = useRef(false);
  
  const blurOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });


  const setAsCover = (uri) => {
  setImages((prev) => {
    const selected = prev.find((img) => img.uri === uri);
    const others = prev.filter((img) => img.uri !== uri);
    return [selected, ...others];
  });
};

useEffect(() => {
  if (!isAuthHydrated) return;
  if (didRestoreRef.current) return;

  if (isEdit || !providerId) {
    isHydratingRef.current = false;
    return;
  }

  let mounted = true;

  const restoreDraft = async () => {
    const draft = await loadDraftListing(providerId);

    if (!mounted) return;

    isHydratingRef.current = false;
    didRestoreRef.current = true;

    if (!draft) return;

    setBusinessName(draft.businessName || "Your Company Name");
    setTitle(draft.title || "");
    setDescription(draft.description || "");
    setCategory(draft.category || "");
    setPrice(draft.price || "");
    setImages(draft.images || []);
    setLocation(draft.location || null);
    setVideo(draft.video || null);

    Alert.alert("Draft restored", "We restored your unfinished listing.");
  };

  restoreDraft();

  return () => {
    mounted = false;
  };
}, [isAuthHydrated, isEdit, providerId]);


useEffect(() => {
  if (isEdit) return;
  if (!providerId) return;
  if (isHydratingRef.current) return; // 🚫 don't save while restoring

  const draft = {
    businessName,
    title,
    description,
    category,
    price,
    images,
    location,
    video,
  };

  const timeout = setTimeout(() => {
    saveDraftListing(providerId, draft);
  }, 800);

  return () => clearTimeout(timeout);
}, [
  businessName,
  title,
  description,
  category,
  price,
  images,
  location,
  video,
  isEdit,
  providerId,
]);

  /* -------------------------
   HYDRATE EDIT MODE
------------------------- */
useEffect(() => {
  if (!isEdit || !listing) return;

  setTitle(listing.title || "");
  setDescription(listing.description || "");
  setCategory(listing.category || "");
  setPrice(listing.price ? String(listing.price) : "");

  const loc =
    typeof listing.location === "string"
      ? { city: listing.location, state: "", zip: "", lat: null, lng: null }
      : listing.location || null;

  setLocation(loc);

  setBusinessName(
    listing.businessName || listing.companyName || "Your Company Name"
  );

  // ✅ FIX — actually hydrate images
  const rawImages =
    Array.isArray(listing.images) && listing.images.length
      ? listing.images
      : Array.isArray(listing.photos) && listing.photos.length
      ? listing.photos
      : [];

  setImages(
    rawImages.map((img) => ({
      uri: typeof img === "object" && img.uri ? img.uri : img,
      isRemote: true,
    }))
  );

  if (listing.video) setVideo(listing.video);
}, [isEdit, listing]);
  /* -------------------------
     TRACK SCROLL OFFSET
  ------------------------- */
  useEffect(() => {
    const id = scrollY.addListener(({ value }) => setScrollOffset(value || 0));
    return () => scrollY.removeListener(id);
  }, [scrollY]);

  const handleBottomFieldFocus = () => {
    if (!scrollRef.current) return;
    const targetY = scrollOffset + BOTTOM_SCROLL_DELTA;

    if (scrollRef.current.scrollToPosition) {
      scrollRef.current.scrollToPosition(0, targetY, true);
    } else if (scrollRef.current.scrollTo) {
      scrollRef.current.scrollTo({ x: 0, y: targetY, animated: true });
    }
  };

  /* -------------------------
     MEDIA
  ------------------------- */
  const pickMedia = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "We need access to your gallery!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      selectionLimit: 10,
      quality: 0.8,
    });

    if (!result.canceled) {
      const newPhotos = [];
      let newVideo = video;

      result.assets.forEach((asset) => {
        if (asset.type?.startsWith("video")) {
          if (!newVideo) newVideo = asset.uri;
        } else {
          newPhotos.push({ uri: asset.uri, isRemote: false });
        }
      });

      if (newPhotos.length) setImages((prev) => [...prev, ...newPhotos]);
      if (newVideo && !video) setVideo(newVideo);
    }
  };

  const recordVideo = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "We need access to your camera!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Videos,
      videoMaxDuration: 60,
      quality: 1,
    });

    if (!result.canceled) setVideo(result.assets[0].uri);
  };

  /* -------------------------
     DRAGGABLE THUMBNAILS
  ------------------------- */
const renderThumb = ({ item, drag, isActive, index }) => {
  const isCover = index === 0;

  return (
    <AnimatedReanimated.View
      entering={ZoomIn}
      exiting={ZoomOut}
      layout={Layout.springify()}
      style={[
        styles.thumbWrap,
        {
          backgroundColor: theme.card,
          borderColor: darkMode
            ? "rgba(255,255,255,0.10)"
            : "rgba(0,0,0,0.10)",
          borderWidth: StyleSheet.hairlineWidth,
        },
        isActive && { transform: [{ scale: 1.06 }], zIndex: 20 },
      ]}
    >
     <TouchableOpacity
  activeOpacity={0.9}
  onLongPress={drag}
  delayLongPress={80}
  onPress={() => {
    if (index === 0) {
      setEditingCover(item.uri);
      setEditorVisible(true);
    }
  }}
>
        <Image source={{ uri: item.uri }} style={styles.thumbImg} />
      </TouchableOpacity>

      {/* COVER BADGE */}
      {isCover && (
        <View style={styles.coverInsideBadge}>
          <Text style={styles.coverInsideText}>COVER</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.thumbRemove}
        onPress={() =>
          setImages((prev) => prev.filter((img) => img.uri !== item.uri))
        }
      >
        <Ionicons name="close-circle" size={20} color="#fff" />
      </TouchableOpacity>
    </AnimatedReanimated.View>
  );
};
  /* -------------------------
     DELETE LISTING
  ------------------------- */
  const handleDeleteListing = () => {
    if (!listing?._id) return;

    Alert.alert(
      "Delete listing",
      "This action cannot be undone. Are you sure you want to delete this listing?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await api.delete(`/api/listings/provider/${listing._id}`);
              Alert.alert("Deleted", "Your listing has been removed.");

              navigation.navigate("MainTabs", {
                screen: "Home",
              });
            } catch (err) {
              Alert.alert("Error", err.response?.data?.message || "Unable to delete listing.");
            }
          },
        },
      ]
    );
  };

  /* -------------------------
     CONTINUE → PREVIEW
  ------------------------- */
  const canContinue = useMemo(() => {
    return Boolean(title?.trim() && price?.trim() && images.length > 0);
  }, [title, price, images]);

 const handlePreview = () => {
  if (!canContinue) {
    Alert.alert("Missing Info", "Please add at least 1 photo, a title, and a price.");
    return;
  }

  // ⭐ NEW — REQUIRE VALID LOCATION
 if (
  !location ||
  location.lat == null ||
  location.lng == null
) {
  Alert.alert(
    "Valid location required",
    "Please choose a location from the map so coordinates are included."
  );
  return;
}

  

   navigation.navigate("ServiceDetailScreen", {
  previewData: {
    title,
    description,
    category,
    price,
    location,
    images,
    businessName,
    video,
  },
  isPreview: true,
});
};

  const locationDisplay = useMemo(() => {
    if (!location) return "Choose location";
    const city = location?.city?.trim();
    const state = location?.state?.trim();
    if (city && state) return `${city}, ${state}`;
    if (city) return city;
    if (location?.zip) return location.zip;
    return "Choose location";
  }, [location]);

  const topAvatarUri = images?.[0]?.uri || null;



  return (


    
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />





      {/* HEADER (AddClient style) */}
      <BlurView intensity={50} tint={theme.blurTint} style={styles.header}>
        <TouchableOpacity style={styles.headerSide} onPress={() => navigation.goBack()}>
          <Text style={[styles.headerText, { color: HELP_IO_BLUE }]}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {isEdit ? "Edit Listing" : "New Listing"}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.headerSide}
          onPress={handlePreview}
          disabled={!canContinue}
        >
          <Text
            style={[
              styles.headerText,
              {
                color: canContinue ? HELP_IO_BLUE : "rgba(0,0,0,0)",
              },
            ]}
          >
            Next
          </Text>
        </TouchableOpacity>
      </BlurView>

      {/* FORM */}
      <KeyboardAwareScrollView
        innerRef={(ref) => (scrollRef.current = ref)}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={0}
        enableAutomaticScroll={false}
        contentContainerStyle={{
  paddingBottom: 140 + insets.bottom,
  paddingTop: 50,
}}

        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      >
      {/* --- MEDIA ------------------------------------------------------ */}
<Text style={[styles.sectionHeader, { color: theme.subtleText }]}>
  MEDIA
</Text>

<View
  style={[
    styles.card,
    {
      backgroundColor: theme.card,
      shadowOpacity: darkMode ? 0 : 0.06,
      paddingVertical: images.length === 0 && !video ? 28 : 14,
      alignItems: images.length === 0 && !video ? "center" : "stretch",
    },
  ]}
>
  {/* ================= EMPTY STATE ================= */}
  {images.length === 0 && !video ? (
    <>
      <View
        style={[
          styles.emptyIconCircle,
          { backgroundColor: darkMode ? "#202024" : "#EFF3FA" },
        ]}
      >
        <Ionicons
          name="camera-outline"
          size={30}
          color={darkMode ? "#F5F5F7" : "#1C1C1E"}
        />
      </View>

      <Text style={[styles.emptyTitle, { color: theme.text }]}>
        Add photos and video
      </Text>

      <Text style={[styles.emptySubtitle, { color: theme.subtleText }]}>
        Listings with photos perform better. Add up to 10 photos and 1 video.
      </Text>

      <View style={styles.emptyButtonsRow}>
        <TouchableOpacity
          style={[styles.primaryEmptyBtn, { backgroundColor: HELP_IO_BLUE }]}
          onPress={pickMedia}
          activeOpacity={0.9}
        >
          <Ionicons name="image-outline" size={18} color="#fff" />
          <Text style={styles.primaryEmptyText}>Choose from library</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.secondaryEmptyBtn,
            {
              borderColor: darkMode ? "#3A3A3C" : "#D1D1D6",
              backgroundColor: darkMode ? "#1C1C1E" : "#F2F2F7",
            },
          ]}
          onPress={recordVideo}
          activeOpacity={0.9}
        >
          <Ionicons
            name="videocam-outline"
            size={18}
            color={darkMode ? "#F5F5F7" : "#1C1C1E"}
          />
          <Text
            style={[
              styles.secondaryEmptyText,
              { color: darkMode ? "#F5F5F7" : "#1C1C1E" },
            ]}
          >
            Record video
          </Text>
        </TouchableOpacity>
      </View>
    </>
  ) : (
    <>
      {/* ================= LIBRARY STATE ================= */}
      <View style={styles.mediaHeaderRow}>
        <Text style={[styles.mediaHeaderTitle, { color: theme.text }]}>
          Library
        </Text>

        <Text style={[styles.mediaCounter, { color: theme.subtleText }]}>
          Photos {images.length}/10 · Video {video ? "1/1" : "0/1"}
        </Text>
      </View>

      <View style={{ marginTop: 16 }}>
        <DraggableFlatList
  data={images}
  keyExtractor={(item, index) => item.uri + index}
  onDragEnd={({ data }) => setImages(data)}
  renderItem={({ item, drag, isActive, getIndex }) =>
    renderThumb({
      item,
      drag,
      isActive,
      index: getIndex?.() ?? 0,
    })
  }
  horizontal
  showsHorizontalScrollIndicator={false}
  contentContainerStyle={{ paddingHorizontal: 4 }}
/>
      </View>

      <View style={styles.mediaActionRowBottom}>
        <TouchableOpacity
          style={styles.mediaActionBtnBottom}
          onPress={pickMedia}
          activeOpacity={0.85}
        >
          <Ionicons name="add-circle-outline" size={18} color={HELP_IO_BLUE} />
          <Text style={[styles.mediaActionTextBottom, { color: HELP_IO_BLUE }]}>
            Add more media
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mediaActionBtnBottom}
          onPress={recordVideo}
          activeOpacity={0.85}
        >
          <Ionicons
            name={video ? "videocam" : "videocam-outline"}
            size={18}
            color={HELP_IO_BLUE}
          />
          <Text style={[styles.mediaActionTextBottom, { color: HELP_IO_BLUE }]}>
            {video ? "Replace video" : "Add video"}
          </Text>
        </TouchableOpacity>
      </View>
    </>
  )}
</View>

 




        {/* MAIN CARD (like AddClient) */}
        <View style={[styles.card, { backgroundColor: theme.card, shadowOpacity: darkMode ? 0 : 0.06 }]}>
          <Field
            label="Business Name"
            placeholder="Your Company Name"
            value={businessName}
            onChange={setBusinessName}
            theme={theme}
            darkMode={darkMode}
          />
          <View style={styles.hairline} />

          <Field
            label="Title"
            placeholder="What service are you offering?"
            value={title}
            onChange={setTitle}
            theme={theme}
            darkMode={darkMode}
          />
          <View style={styles.hairline} />

          <Field
            label="Description"
            placeholder="Describe your service, what's included, and any important details."
            value={description}
            onChange={setDescription}
            theme={theme}
            darkMode={darkMode}
            multiline
          />
        </View>

        {/* SECTION HEADER */}
        <Text style={[styles.sectionHeader, { color: theme.subtleText }]}>LISTING INFO</Text>

        <View style={[styles.card, { backgroundColor: theme.card, shadowOpacity: darkMode ? 0 : 0.06 }]}>
          <Field
            label="Category"
            placeholder="e.g. Automotive, Home Services"
            value={category}
            onChange={setCategory}
            theme={theme}
            darkMode={darkMode}
          />
          <View style={styles.hairline} />

          {/* Price row */}
          <View style={styles.fieldRow}>
            <Text style={[styles.label, { color: theme.subtleText }]}>Price</Text>

            <View style={styles.priceRow}>
              <Text style={[styles.currency, { color: theme.subtleText }]}>$</Text>
              <TextInput
                style={[styles.input, { color: theme.text, flex: 1 }]}
                placeholder="0.00"
                placeholderTextColor={darkMode ? "#888" : "#A8A8AD"}
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
                onFocus={handleBottomFieldFocus}
              />
            </View>

            <Text style={[styles.helper, { color: theme.subtleText }]}>
              Services usually require a quote — you can update pricing later in Helpio Pay.
            </Text>
          </View>

          <View style={styles.hairline} />

          {/* Location selector row (Apple “Edit” style) */}
          <View style={styles.fieldRow}>
            <Text style={[styles.label, { color: theme.subtleText }]}>Location</Text>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() =>
                navigation.navigate("LocationPicker", {
                  onSelect: (loc) => setLocation(loc),
                })
              }
              style={styles.locationRow}
            >
              <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                <Ionicons name="location-outline" size={18} color={HELP_IO_BLUE} />
                <Text
                  numberOfLines={1}
                  style={[
                    styles.locationText,
                    { color: location ? theme.text : theme.subtleText },
                  ]}
                >
                  {locationDisplay}
                </Text>
              </View>

              <Text style={[styles.locationEdit, { color: HELP_IO_BLUE }]}>Edit</Text>
            </TouchableOpacity>

            {location?.zip ? (
              <Text style={[styles.locationSub, { color: theme.subtleText }]}>
                ZIP {location.zip}
              </Text>
            ) : null}
          </View>
        </View>

        {/* DELETE (Edit mode) */}
        {isEdit && listing?._id ? (
          <TouchableOpacity onPress={handleDeleteListing} style={styles.deleteButton} activeOpacity={0.88}>
            <Ionicons name="trash-outline" size={18} color="#FF3B30" style={{ marginRight: 6 }} />
            <Text style={styles.deleteText}>Delete Listing</Text>
          </TouchableOpacity>
        ) : null}
      </KeyboardAwareScrollView>

      {/* BOTTOM BAR (AddClient style) */}
      <BlurView intensity={50} tint={theme.blurTint} style={[styles.bottomBar, { paddingBottom: 18 + (insets.bottom ? 6 : 0) }]}>
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={handlePreview}
          disabled={!canContinue}
          style={[
            styles.primaryBtn,
            { backgroundColor: canContinue ? HELP_IO_BLUE : "#B9B9BC" },
          ]}
        >
          <Text style={styles.primaryBtnText}>Continue</Text>
        </TouchableOpacity>
      </BlurView>




      {/* Frost fade for header (keeps it Apple-clean) */}
      <Animated.View pointerEvents="none" style={[styles.headerFade, { opacity: blurOpacity }]}>
        <BlurView intensity={70} tint={theme.blurTint} style={StyleSheet.absoluteFill} />
      </Animated.View>

<CoverEditorModal
  visible={editorVisible}
  imageUri={editingCover}
  onClose={() => setEditorVisible(false)}
  onSave={(newUri) => {
    setImages((prev) => {
      const updated = [...prev];
      updated[0] = { uri: newUri, isRemote: false };
      return updated;
    });
  }}
/>


    </SafeAreaView>
  );
}

/* ---------------- STYLES ---------------- */
const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    height: 92,
    paddingTop: Platform.OS === "ios" ? 12 : 8,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 8,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },
  headerSide: { width: 70, justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 17, fontWeight: "700" },
  headerText: { fontSize: 17, fontWeight: "600" },

  headerFade: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 100 : 85,
    zIndex: 10,
  },



coverInsideBadge: {
  position: "absolute",
  bottom: 8,
  left: 8,
  backgroundColor: Platform.OS === "ios"
    ? "rgba(120,120,128,0.75)"  // systemFill feel
    : "rgba(0,0,0,0.6)",
  paddingHorizontal: 10,
  paddingVertical: 5,
  borderRadius: 999,
},

coverInsideText: {
  color: "#fff",
  fontSize: 11,
  fontWeight: "600",
  letterSpacing: 0.3,
},


  avatarWrap: {
    alignItems: "center",
    marginBottom: 18,
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImg: {
    width: "100%",
    height: "100%",
  },
  avatarHint: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  avatarBadge: {
    position: "absolute",
    bottom: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: HELP_IO_BLUE,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },

coverBadge: {
  position: "absolute",
  bottom: 6,
  left: 6,
  backgroundColor: HELP_IO_BLUE,
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
},

coverBadgeText: {
  color: "#fff",
  fontSize: 11,
  fontWeight: "700",
},

setCoverBtn: {
  position: "absolute",
  bottom: 6,
  left: 6,
  backgroundColor: "rgba(0,0,0,0.55)",
  paddingHorizontal: 8,
  paddingVertical: 4,
  borderRadius: 12,
},

coverUnderLabel: {
  marginTop: 6,
  fontSize: 12,
  fontWeight: "700",
  color: HELP_IO_BLUE,
  letterSpacing: 0.3,
},

setCoverText: {
  color: "#fff",
  fontSize: 11,
  fontWeight: "600",
},
  
mediaHeaderRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

mediaHeaderTitle: {
  fontSize: 17,
  fontWeight: "700",
},

mediaCounter: {
  fontSize: 13,
  fontWeight: "600",
},

mediaActionRowBottom: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  marginTop: 16,
},

mediaActionBtnBottom: {
  flexDirection: "row",
  alignItems: "center",
},

mediaActionTextBottom: {
  marginLeft: 6,
  fontSize: 14,
  fontWeight: "700",
},


emptyIconCircle: {
  width: 64,
  height: 64,
  borderRadius: 32,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 12,
},

emptyTitle: {
  fontSize: 18,          // ↓ from 20
  fontWeight: "700",
  marginBottom: 4,
},

emptySubtitle: {
  fontSize: 14,          // ↓ from 15
  textAlign: "center",
  lineHeight: 19,
  maxWidth: 240,         // ↓ tighter like iOS
},

emptyButtonsRow: {
  flexDirection: "row",
  marginTop: 14,         // ↓ from 18
},

primaryEmptyBtn: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16, // ↓ from 18
  paddingVertical: 10,   // ↓ from 12
  borderRadius: 999,
  marginRight: 8,
},

secondaryEmptyBtn: {
  flexDirection: "row",
  alignItems: "center",
  paddingHorizontal: 16,
  paddingVertical: 10,
  borderRadius: 999,
  borderWidth: 1,
},


primaryEmptyText: {
  marginLeft: 6,
  fontSize: 15,
  fontWeight: "600",
  color: "#fff", // ← makes text readable on blue button
},


secondaryEmptyText: {
  marginLeft: 6,
  fontSize: 15,
  fontWeight: "600",
},


  thumbRail: {
    width: "100%",
    marginTop: 12,
  },
  thumbHelper: {
    marginTop: 8,
    alignSelf: "center",
    fontSize: 12,
    fontWeight: "600",
  },

  thumbWrap: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    borderRadius: 16,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
    marginRight: 10,
  },
  thumbImg: { width: "100%", height: "100%" },
  thumbRemove: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.35)",
    borderRadius: 50,
    padding: 1,
  },

 card: {
  borderRadius: 24,
  marginHorizontal: 16,
  marginBottom: 22,
  paddingHorizontal: 14,
  paddingVertical: 6,
},

  sectionHeader: {
    marginLeft: 22,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  fieldRow: { paddingVertical: 12 },
  fieldTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  label: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: "600",
  },

  input: {
    fontSize: 17,
    fontWeight: "500",
    paddingVertical: 4,
  },
  inputArea: {
    minHeight: 70,
    textAlignVertical: "top",
  },

  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.12)",
  },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  currency: {
    fontSize: 17,
    fontWeight: "700",
    marginRight: 6,
  },
  helper: {
    marginTop: 8,
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 6,
  },
  locationText: {
    marginLeft: 8,
    fontSize: 17,
    fontWeight: "600",
    flexShrink: 1,
  },
  locationEdit: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 12,
  },
  locationSub: {
    marginTop: 6,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.3,
  },

  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 95,
    paddingHorizontal: 16,
    justifyContent: "center",
  },
  primaryBtn: {
    height: 52,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
    elevation: 3,
  },
  primaryBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },

  deleteButton: {
    marginTop: 8,
    marginHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 18,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,59,48,0.12)",
    marginBottom: 26,
  },
  deleteText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#FF3B30",
  },
});
