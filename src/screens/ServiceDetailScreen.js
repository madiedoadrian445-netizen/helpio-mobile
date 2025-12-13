// src/screens/ServiceDetailScreen.js
import React, { useMemo, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ImageBackground,
  Image,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Animated,
  Platform,
  StatusBar,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import ImageViewing from "react-native-image-viewing";
import MapView, { Marker, PROVIDER_DEFAULT } from "react-native-maps";

const { width } = Dimensions.get("window");
const PADDING_H = 16;
const HELPIO_BLUE = "#00A6FF";

export default function ServiceDetailScreen({ route, navigation }) {
  const { service } = route.params;

  const rating = service.rating ?? 5;
  const ratingCount = service.ratingCount ?? 0;

  const companyName = service.title;
  const category = service.category;
  const verified = service.isVerified;
  const cityLine = service.description;
  const startingPrice = service.price;
  const heroSrc = service.photos?.[0];
  const gallerySrc = service.photos || [];

  // Lightbox state
  const [visible, setVisible] = React.useState(false);
  const [currentIndex, setCurrentIndex] = React.useState(0);

  // Pulse animation
  const pulse = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1.06, duration: 1100, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 1.0, duration: 1100, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  // Fading header
  const scrollY = useRef(new Animated.Value(0)).current;
  const blurOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  });

  // Gallery card width
  const cardW = useMemo(() => Math.min(280, width * 0.72), []);

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" translucent backgroundColor="transparent" />

      {/* ===== HEADER BLUR ===== */}
      <Animated.View style={[styles.statusBlur, { opacity: blurOpacity }]}>
        <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill} />
      </Animated.View>

      <Animated.ScrollView
        bounces
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 140 }}
        scrollEventThrottle={16}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], {
          useNativeDriver: true,
        })}
      >
        {/* ===== HERO ===== */}
        <View style={styles.heroWrap}>
          <ImageBackground source={{ uri: heroSrc }} style={styles.heroImg} resizeMode="cover">
            <LinearGradient
              colors={["rgba(0,0,0,0.45)", "rgba(0,0,0,0)"]}
              style={StyleSheet.absoluteFill}
            />

            <View style={styles.titleBandWrap}>
              <BlurView intensity={55} tint="dark" style={styles.titleBandBlur}>
                <View style={styles.titleInner}>
                  <Text numberOfLines={1} style={styles.title}>
                    {companyName}
                  </Text>

                  {/* ===== META ROW ===== */}
                  <View style={styles.metaRow}>

                    {verified && (
                      <View style={styles.verifiedPill}>
                        <View style={styles.badgeDot} />
                        <Text style={styles.verifiedText}>Helpio Verified</Text>
                      </View>
                    )}

                    <Text style={styles.metaDot}>•</Text>
                    <Text style={styles.metaText}>{category}</Text>
                    <Text style={styles.metaDot}>•</Text>

                    <Text style={styles.metaText}>
                      {"★".repeat(rating)} <Text style={styles.muted}>({ratingCount})</Text>
                    </Text>

                  </View>
                </View>
              </BlurView>
            </View>
          </ImageBackground>

          <LinearGradient
            colors={["rgba(0,0,0,0.18)", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.fadeDivider}
          />
        </View>

        {/* ===== ABOUT ===== */}
        <View style={styles.sectionWrap}>
          <Text style={styles.sectionTitle}>About This Service</Text>
          <Text style={styles.aboutLine}>{cityLine}</Text>

          <View style={styles.priceCard}>
            <Text style={styles.priceHint}>Starting at</Text>
            <Text style={styles.priceValue}>${formatPrice(startingPrice)}</Text>
          </View>
        </View>

        {/* ===== GALLERY ===== */}
        <View style={[styles.sectionWrap, { paddingTop: 8 }]}>
          <Text style={styles.sectionTitle}>Gallery</Text>

          <LinearGradient
            colors={["#FFFFFF", "rgba(255,255,255,0)"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={styles.galleryBg}
          />

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingHorizontal: PADDING_H, paddingBottom: 10 }}
          >
            {gallerySrc.map((uri, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.9}
                onPress={() => {
                  setCurrentIndex(i);
                  setVisible(true);
                }}
                style={[styles.card, { width: cardW }]}
              >
                <Image source={{ uri }} style={styles.cardImg} />
                <View style={styles.cardShade} />
                <View style={styles.cardFooter}>
                  <Text style={styles.cardFootText}>Tap to expand</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ===== MAP ===== */}
        <View style={[styles.sectionWrap, { paddingTop: 8, paddingBottom: 40 }]}>
          <Text style={styles.sectionTitle}>Approximate Location</Text>

          <View style={styles.mapContainer}>
            <BlurView intensity={35} tint="light" style={StyleSheet.absoluteFill} />
            <MapView
              style={StyleSheet.absoluteFill}
              provider={PROVIDER_DEFAULT}
              initialRegion={{
                latitude: 25.7617,
                longitude: -80.1918,
                latitudeDelta: 0.05,
                longitudeDelta: 0.05,
              }}
              showsUserLocation={false}
            >
              <Marker
                coordinate={{ latitude: 25.7617, longitude: -80.1918 }}
                title={companyName}
                description="Approximate Service Area"
                pinColor={HELPIO_BLUE}
              />
            </MapView>
          </View>
        </View>
      </Animated.ScrollView>

      {/* ===== CTA BUTTON ===== */}
      <Animated.View style={[styles.ctaWrap, { transform: [{ scale: pulse }] }]}>
        <BlurView intensity={40} tint="light" style={styles.ctaBlur}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() =>
              navigation.navigate("ChatDetail", {
                companyName,
                companyId: route?.params?.companyId,
                companyAvatar: route?.params?.companyAvatar,
              })
            }
            style={styles.ctaBtn}
          >
            <Text style={styles.ctaText}>Message {companyName}</Text>
          </TouchableOpacity>
        </BlurView>
      </Animated.View>

      {/* ===== LIGHTBOX ===== */}
      <ImageViewing
        images={gallerySrc.map((uri) => ({ uri }))}
        imageIndex={currentIndex}
        visible={visible}
        onRequestClose={() => setVisible(false)}
        backgroundColor="rgba(0,0,0,0.95)"
        swipeToCloseEnabled
        doubleTapToZoomEnabled
        animationType="fade"
      />
    </View>
  );
}

// ===== UTIL =====
function formatPrice(n) {
  try {
    return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(n);
  } catch {
    return String(n);
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0B0E14" },

  statusBlur: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 90 : 70,
    zIndex: 10,
  },

  heroWrap: { width: "100%", height: width * 1.05, backgroundColor: "#121621" },
  heroImg: { flex: 1, justifyContent: "flex-end" },

  titleBandWrap: { paddingHorizontal: PADDING_H, paddingBottom: 24 },

  titleBandBlur: {
    borderRadius: 18,
    overflow: "hidden",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  titleInner: { paddingVertical: 14, paddingHorizontal: 16 },

  title: { color: "#fff", fontSize: 28, fontWeight: "800", letterSpacing: 0.3 },

  metaRow: {
    marginTop: 6,
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },

  verifiedPill: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.08)",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.12)",
  },

  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 8,
    backgroundColor: HELPIO_BLUE,
    marginRight: 6,
  },

  verifiedText: { color: "#EAF2FF", fontWeight: "700" },

  metaDot: { color: "rgba(255,255,255,0.5)", marginHorizontal: 2 },

  metaText: {
    color: "rgba(255,255,255,0.9)",
    fontWeight: "600",
  },

  muted: {
    color: "rgba(255,255,255,0.5)",
    fontSize: 14,
    fontWeight: "600",
  },

  fadeDivider: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -1,
    height: 48,
  },

  sectionWrap: {
    backgroundColor: "#0F141F",
    paddingHorizontal: PADDING_H,
    paddingTop: 18,
    paddingBottom: 14,
  },

  sectionTitle: {
    color: "#F5F8FF",
    fontSize: 22,
    fontWeight: "800",
    letterSpacing: 0.2,
    marginBottom: 8,
  },

  aboutLine: {
    color: "#C6D3EA",
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 14,
  },

  priceCard: {
    backgroundColor: "rgba(255,255,255,0.06)",
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.10)",
  },

  priceHint: { color: "#BBD0FF", fontSize: 15, marginBottom: 6 },

  priceValue: {
    fontSize: 32,
    fontWeight: "900",
    color: HELPIO_BLUE,
  },

  galleryBg: {
    position: "absolute",
    top: 44,
    left: 0,
    right: 0,
    height: 120,
    opacity: 0.5,
  },

  card: {
    height: 180,
    marginRight: 14,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#121825",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },

  cardImg: { width: "100%", height: "100%" },

  cardShade: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.15)",
  },

  cardFooter: {
    position: "absolute",
    left: 10,
    right: 10,
    bottom: 10,
    borderRadius: 999,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.35)",
  },

  cardFootText: {
    color: "#EAF2FF",
    fontWeight: "700",
    fontSize: 12,
    letterSpacing: 0.3,
  },

  ctaWrap: {
    position: "absolute",
    bottom: Platform.select({ ios: 35, android: 30 }),
    alignSelf: "center",
  },

  ctaBlur: {
    borderRadius: 30,
    overflow: "hidden",
    padding: 2,
  },

  ctaBtn: {
    height: 60,
    paddingHorizontal: 30,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },

  ctaText: {
    color: "#fff",
    fontWeight: "800",
    fontSize: 18,
    letterSpacing: 0.3,
  },

  mapContainer: {
    height: 220,
    marginTop: 12,
    borderRadius: 20,
    overflow: "hidden",
    backgroundColor: "#EDEFF3",
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
});
