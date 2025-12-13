// src/screens/CreateListingScreen.js
import React, { useState, useRef, useEffect } from "react";
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
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import DraggableFlatList from "react-native-draggable-flatlist";
import AnimatedReanimated, {
  Layout,
  ZoomIn,
  ZoomOut,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { BlurView } from "expo-blur";
const ITEM_SIZE = 100;
const HELP_IO_BLUE = "#00A6FF";
const BOTTOM_SCROLL_DELTA = 70; // ~medium scroll as you picked (option 2)

export default function CreateListingScreen({ navigation }) {
  const { darkMode, theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [images, setImages] = useState([]);
  const [video, setVideo] = useState(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [businessName, setBusinessName] = useState("Your Company Name");

  const scrollY = useRef(new Animated.Value(0)).current;
  const [scrollOffset, setScrollOffset] = useState(0);
  const blurOpacity = scrollY.interpolate({
    inputRange: [0, 80],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  const scrollRef = useRef(null);

  // Track current scroll position so we can apply a relative micro-scroll
  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      setScrollOffset(value || 0);
    });
    return () => {
      scrollY.removeListener(id);
    };
  }, [scrollY]);

  // Micro-scroll ONLY for bottom inputs (Price + Location)
  const handleBottomFieldFocus = () => {
    if (!scrollRef.current) return;

    const targetY = scrollOffset + BOTTOM_SCROLL_DELTA;

    // KeyboardAwareScrollView exposes scrollToPosition; fall back to scrollTo
    if (scrollRef.current.scrollToPosition) {
      scrollRef.current.scrollToPosition(0, targetY, true);
    } else if (scrollRef.current.scrollTo) {
      scrollRef.current.scrollTo({ x: 0, y: targetY, animated: true });
    }
  };

  /* ------------ Validation & Continue ------------ */
  const handlePreview = () => {
    if (!title || !price || images.length === 0) {
      Alert.alert(
        "Missing Info",
        "Please add at least 1 photo, a title, and a price."
      );
      return;
    }

    navigation.navigate("PreviewListing", {
      title,
      description,
      category,
      price,
      location,
      images,
      businessName,
      video,
    });
  };

  /* ------------ Media pickers ------------ */
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
        if (asset.type && asset.type.startsWith("video")) {
          if (!newVideo) newVideo = asset.uri;
        } else {
          newPhotos.push(asset.uri);
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

    if (!result.canceled) {
      setVideo(result.assets[0].uri);
    }
  };

  /* ------------ Drag item renderer ------------ */
  const renderImage = ({ item, drag, isActive }) => (
    <AnimatedReanimated.View
      entering={ZoomIn}
      exiting={ZoomOut}
      layout={Layout.springify()}
      style={[
        styles.imageWrapper,
        {
          backgroundColor: theme.card,
          borderColor: darkMode ? "#333" : "#E5E5EA",
        },
        isActive && { transform: [{ scale: 1.08 }], zIndex: 20 },
      ]}
    >
      <TouchableOpacity activeOpacity={0.9} onLongPress={drag} delayLongPress={80}>
        <Image source={{ uri: item }} style={styles.image} />
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() =>
          setImages((prev) => prev.filter((uri) => uri !== item))
        }
      >
        <Ionicons name="close-circle" size={22} color="#fff" />
      </TouchableOpacity>
    </AnimatedReanimated.View>
  );

  /* ------------ Main UI Renderer ------------ */
  const renderHeader = () => (
    <View>
      {/* HERO */}
      <View
        style={[
          styles.heroBlock,
          {
            paddingTop: Platform.OS === "ios" ? -60 : -20,
          },
        ]}
      >
        <Text style={[styles.heroTitle, { color: theme.text }]}>New listing</Text>
        <Text style={[styles.heroSubtitle, { color: theme.subtleText }]}>
          Create a clean, trusted service listing your clients will love.
        </Text>

        <View
          style={[
            styles.stepPill,
            { backgroundColor: darkMode ? "#1F1F24" : "#E7F4FF" },
          ]}
        >
          <View style={[styles.stepDot, { backgroundColor: HELP_IO_BLUE }]} />
          <Text style={[styles.stepText, { color: HELP_IO_BLUE }]}>
            Step 1 · Details
          </Text>
        </View>
      </View>

      {/* BUSINESS */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.subtleText }]}>
          BUSINESS
        </Text>
        <View
          style={[
            styles.cardGroup,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={styles.cardRow}>
            <Text style={[styles.cardRowLabel, { color: theme.subtleText }]}>
              Name
            </Text>
            <TextInput
              style={[styles.cardRowInput, { color: theme.text }]}
              placeholder="Enter your business name"
              placeholderTextColor={theme.subtleText}
              value={businessName}
              onChangeText={setBusinessName}
            />
          </View>
        </View>
      </View>

      {/* MEDIA */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.subtleText }]}>MEDIA</Text>

        <View
          style={[
            styles.cardGroup,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {images.length === 0 && !video && (
            <View style={styles.mediaEmptyState}>
              <View
                style={[
                  styles.mediaIconCircle,
                  { backgroundColor: darkMode ? "#202024" : "#EFF3FA" },
                ]}
              >
                <Ionicons
                  name="camera-outline"
                  size={26}
                  color={darkMode ? "#F5F5F7" : "#222222"}
                />
              </View>

              <Text style={[styles.mediaTitle, { color: theme.text }]}>
                Add photos and video
              </Text>
              <Text style={[styles.mediaSubtitle, { color: theme.subtleText }]}>
                Listings with photos perform better. Add up to 10 photos and 1 video.
              </Text>

              <View style={styles.mediaButtonsRow}>
                <TouchableOpacity
                  style={[styles.primaryMediaBtn, { backgroundColor: HELP_IO_BLUE }]}
                  onPress={pickMedia}
                >
                  <Ionicons name="image-outline" size={18} color="#fff" />
                  <Text style={styles.primaryMediaBtnText}>Choose from library</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.secondaryMediaBtn,
                    {
                      borderColor: darkMode ? "#3F3F46" : "#D6D6D6",
                      backgroundColor: darkMode ? "#151516" : "#F5F5F7",
                    },
                  ]}
                  onPress={recordVideo}
                >
                  <Ionicons
                    name="videocam-outline"
                    size={18}
                    color={darkMode ? "#F5F5F7" : "#222222"}
                  />
                  <Text
                    style={[
                      styles.secondaryMediaBtnText,
                      { color: darkMode ? "#F5F5F7" : "#222222" },
                    ]}
                  >
                    Record video
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}

          {(images.length > 0 || video) && (
            <>
              <View style={styles.mediaHeaderRow}>
                <Text style={[styles.mediaHeaderTitle, { color: theme.text }]}>
                  Library
                </Text>
                <Text style={[styles.mediaCounter, { color: theme.subtleText }]}>
                  Photos {images.length}/10 · Video {video ? "1/1" : "0/1"}
                </Text>
              </View>

              {/* Photo list */}
              <View style={{ height: ITEM_SIZE + 32, marginTop: 10 }}>
                <DraggableFlatList
                  data={images}
                  keyExtractor={(item) => item}
                  onDragEnd={({ data }) => setImages(data)}
                  renderItem={renderImage}
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  containerStyle={{ flexGrow: 0 }}
                  contentContainerStyle={{ paddingRight: 8 }}
                />
              </View>

              <View style={styles.mediaButtonsRowCompact}>
                <TouchableOpacity style={styles.textLinkBtn} onPress={pickMedia}>
                  <Ionicons
                    name="add-circle-outline"
                    size={18}
                    color={HELP_IO_BLUE}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.textLinkBtnText, { color: HELP_IO_BLUE }]}>
                    Add more media
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.textLinkBtn} onPress={recordVideo}>
                  <Ionicons
                    name={video ? "videocam" : "videocam-outline"}
                    size={18}
                    color={HELP_IO_BLUE}
                    style={{ marginRight: 4 }}
                  />
                  <Text style={[styles.textLinkBtnText, { color: HELP_IO_BLUE }]}>
                    {video ? "Replace video" : "Add video"}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      {/* DETAILS */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.subtleText }]}>
          DETAILS
        </Text>

        <View
          style={[
            styles.cardGroup,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          {/* Title */}
          <View style={[styles.cardRow, styles.cardRowBorder]}>
            <Text style={[styles.cardRowLabel, { color: theme.subtleText }]}>
              Title
            </Text>
            <TextInput
              style={[styles.cardRowInput, { color: theme.text }]}
              placeholder="What service are you offering?"
              placeholderTextColor={theme.subtleText}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View style={[styles.cardRow, styles.cardRowBorder, { paddingVertical: 10 }]}>
            <Text style={[styles.cardRowLabel, { color: theme.subtleText }]}>
              Description
            </Text>
            <TextInput
              style={[styles.cardRowInputArea, { color: theme.text }]}
              placeholder="Describe your service, what's included, and any important details."
              placeholderTextColor={theme.subtleText}
              multiline
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Category */}
          <View style={styles.cardRow}>
            <Text style={[styles.cardRowLabel, { color: theme.subtleText }]}>
              Category
            </Text>
            <TextInput
              style={[styles.cardRowInput, { color: theme.text }]}
              placeholder="e.g. Automotive, Home Services"
              placeholderTextColor={theme.subtleText}
              value={category}
              onChangeText={setCategory}
            />
          </View>
        </View>
      </View>

      {/* PRICING */}
      <View style={styles.section}>
        <Text style={[styles.sectionLabel, { color: theme.subtleText }]}>
          PRICING
        </Text>

        <View
          style={[
            styles.cardGroup,
            { backgroundColor: theme.card, borderColor: theme.border },
          ]}
        >
          <View style={[styles.inlineRow, styles.cardRowBorder]}>
            {/* Price */}
            <View style={styles.inlineItem}>
              <Text style={[styles.cardRowLabel, { color: theme.subtleText }]}>
                Price
              </Text>
              <View style={styles.inlineInputRow}>
                <Text style={[styles.currencySymbol, { color: theme.subtleText }]}>
                  $
                </Text>
                <TextInput
                  style={[styles.inlineInput, { color: theme.text }]}
                  placeholder="0.00"
                  keyboardType="numeric"
                  placeholderTextColor={theme.subtleText}
                  value={price}
                  onChangeText={setPrice}
                  onFocus={handleBottomFieldFocus} // 🔥 micro-scroll ONLY here
                />
              </View>
            </View>

            {/* Location */}
            <View style={[styles.inlineItem, { marginLeft: 12 }]}>
              <Text style={[styles.cardRowLabel, { color: theme.subtleText }]}>
                Location
              </Text>
              <TextInput
                style={[styles.inlineInputAlone, { color: theme.text }]}
                placeholder="City or area"
                placeholderTextColor={theme.subtleText}
                value={location}
                onChangeText={setLocation}
                onFocus={handleBottomFieldFocus} // 🔥 and here
              />
            </View>
          </View>

          <View style={styles.cardRow}>
            <Text style={[styles.hint, { color: theme.subtleText }]}>
              Price can be updated later. You can also customize this per invoice inside Helpio Pay.
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <StatusBar barStyle={darkMode ? "light-content" : "dark-content"} />

      {/* Frosted nav (background) */}
      <Animated.View style={[styles.navWrapper, { opacity: blurOpacity }]}>
        <BlurView
          intensity={70}
          tint={darkMode ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>

      {/* Foreground nav */}
      <View style={styles.navBarContent}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.navSideBtn}
          activeOpacity={0.7}
        >
          <Text style={[styles.navSideText, { color: HELP_IO_BLUE }]}>
            Cancel
          </Text>
        </TouchableOpacity>

        <Text style={[styles.navTitle, { color: HELP_IO_BLUE }]} />

        <View style={styles.navSideBtnRight} />
      </View>

      {/* Scroll */}
      <KeyboardAwareScrollView
        innerRef={(ref) => {
          scrollRef.current = ref;
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        enableOnAndroid={true}
        extraScrollHeight={0}        // no extra jump
        enableAutomaticScroll={false} // we control scroll manually
        contentContainerStyle={{
          paddingBottom: 190 + insets.bottom,
          paddingHorizontal: 18,
          paddingTop: Platform.OS === "ios" ? 50 : 30,
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false }
        )}
        scrollEventThrottle={16}
      >
        {renderHeader()}
      </KeyboardAwareScrollView>

      {/* Continue button */}
      <View style={styles.bottomBarWrapper}>
        <BlurView
          intensity={50}
          tint={darkMode ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <View style={styles.bottomBarContent}>
          <TouchableOpacity
            activeOpacity={0.9}
            style={[styles.publishButton, { backgroundColor: HELP_IO_BLUE }]}
            onPress={handlePreview}
          >
            <Text style={styles.publishText}>Continue</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

/* ------------ Styles ------------ */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  navWrapper: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: Platform.OS === "ios" ? 90 : 70,
    zIndex: 40,
  },
  navBarContent: {
    position: "absolute",
    top: Platform.OS === "ios" ? 55 : 35,
    left: 0,
    right: 0,
    zIndex: 50,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    paddingHorizontal: 12,
  },
  navTitle: {
    fontSize: 17,
    fontWeight: "600",
  },
  navSideBtn: {
    position: "absolute",
    left: 14,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  navSideBtnRight: {
    position: "absolute",
    right: 14,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  navSideText: {
    fontSize: 16,
    fontWeight: "500",
  },

  heroBlock: {
    marginBottom: 18,
    paddingTop: 4,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: "700",
  },
  heroSubtitle: {
    marginTop: 4,
    fontSize: 14,
    lineHeight: 20,
  },
  stepPill: {
    marginTop: 12,
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
    flexDirection: "row",
    alignItems: "center",
  },
  stepDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  stepText: {
    fontSize: 13,
    fontWeight: "500",
  },

  section: {
    marginBottom: 24,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: "600",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    marginBottom: 8,
  },
  cardGroup: {
    borderRadius: 16,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
  },
  cardRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  cardRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#E1E1E1",
  },
  cardRowLabel: {
    fontSize: 13,
    marginBottom: 4,
  },
  cardRowInput: {
    fontSize: 15,
    paddingVertical: 0,
  },
  cardRowInputArea: {
    fontSize: 15,
    paddingVertical: 0,
    minHeight: 60,
    textAlignVertical: "top",
  },
  inlineRow: {
    flexDirection: "row",
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  inlineItem: {
    flex: 1,
  },
  inlineInputRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  currencySymbol: {
    fontSize: 15,
    marginRight: 4,
  },
  inlineInput: {
    flex: 1,
    fontSize: 15,
    paddingVertical: 0,
  },
  inlineInputAlone: {
    fontSize: 15,
    paddingVertical: 0,
    marginTop: 2,
  },
  hint: {
    fontSize: 12,
    lineHeight: 16,
  },
  mediaEmptyState: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 20,
  },
  mediaIconCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  mediaTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  mediaSubtitle: {
    fontSize: 13,
    textAlign: "center",
    marginTop: 4,
  },
  mediaButtonsRow: {
    flexDirection: "row",
    marginTop: 14,
  },
  primaryMediaBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    marginRight: 8,
  },
  primaryMediaBtnText: {
    color: "#fff",
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
  },
  secondaryMediaBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 999,
    borderWidth: 0.7,
  },
  secondaryMediaBtnText: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "500",
  },

  mediaHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 14,
    paddingTop: 12,
  },
  mediaHeaderTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  mediaCounter: {
    fontSize: 12,
  },
  mediaButtonsRowCompact: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 14,
    paddingBottom: 10,
    paddingTop: 6,
  },
  textLinkBtn: {
    flexDirection: "row",
    alignItems: "center",
  },
  textLinkBtnText: {
    fontSize: 13,
    fontWeight: "500",
  },

  imageWrapper: {
    width: ITEM_SIZE,
    height: ITEM_SIZE,
    marginLeft: 14,
    borderRadius: 12,
    overflow: "hidden",
    borderWidth: StyleSheet.hairlineWidth,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  removeButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "rgba(0,0,0,0.4)",
    borderRadius: 50,
    padding: 2,
  },

  bottomBarWrapper: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    height: 90,
    justifyContent: "center",
    paddingBottom: Platform.OS === "ios" ? 18 : 10,
  },
  bottomBarContent: {
    paddingHorizontal: 18,
  },
  publishButton: {
    borderRadius: 999,
    paddingVertical: 14,
    alignItems: "center",
    shadowColor: HELP_IO_BLUE,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 7 },
    shadowRadius: 12,
    elevation: 3,
  },
  publishText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
