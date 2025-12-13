import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Image,
  Pressable,
  Platform,
  StatusBar,
  RefreshControl,
} from "react-native";
import Animated, {
  interpolate,
  useAnimatedScrollHandler,
  useSharedValue,
  useAnimatedStyle,
} from "react-native-reanimated";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useTheme } from "../ThemeContext"; // ✅ global theme

const HEADER_HEIGHT = Platform.OS === "ios" ? 110 : 90;
const TITLE_Y = Platform.OS === "ios" ? 68 : 46;
const HELP_IO_BLUE = "#00A6FF";

const SAMPLE = {
  new: [
    {
      id: "n1",
      titleBold: "Lorena Hernandez Perez",
      text: " sent you a message about your Marketplace listing: ",
      highlight: "Jetski paint fiberglass boat.",
      time: "17h",
      thumb:
        "https://images.unsplash.com/photo-1544551763-7ef0465fa9a6?w=300&q=80",
      kind: "message",
      unread: true,
    },
    {
      id: "n2",
      titleBold: "You can find things to do near ",
      text: "Medley in your Events Weekly. Check out what’s in it this week.",
      time: "2d",
      thumb:
        "https://images.unsplash.com/photo-1661956602116-aa6865609028?w=300&q=80",
      kind: "system",
      unread: true,
    },
    {
      id: "n3",
      titleBold: "An admin changed the name of the group ",
      text: "Owners of ROLEX Watc… to ",
      highlight: "ROLEX Watch Owners.",
      time: "21h",
      thumb:
        "https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=300&q=80",
      kind: "group",
      unread: true,
    },
  ],
  earlier: [
    {
      id: "e1",
      titleBold: "Yamaha VX 2018",
      text: " recently listed for ",
      highlight: "$1,500.00.",
      time: "1d",
      thumb:
        "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?w=300&q=80",
      kind: "listing",
      unread: false,
    },
    {
      id: "e2",
      titleBold: "Custom Starlight Roof – Rolls Royce Look…",
      text: " recently listed for ",
      highlight: "$350.00.",
      time: "2d",
      thumb:
        "https://images.unsplash.com/photo-1483721310020-03333e577078?w=300&q=80",
      kind: "listing",
      unread: false,
    },
    {
      id: "e3",
      titleBold: "Veralet Watches",
      text: " tagged you and others in a post in ",
      highlight: "ROLEX WATCHES FOR SALE.",
      time: "1d",
      thumb:
        "https://images.unsplash.com/photo-1518544801976-3e159e50e5bb?w=300&q=80",
      kind: "group",
      unread: false,
    },
  ],
};

export default function NotificationsScreen() {
  const navigation = useNavigation();
  const { darkMode, theme } = useTheme(); // ✅ access theme
  const [data, setData] = useState({ ...SAMPLE });
  const [refreshing, setRefreshing] = useState(false);

  const scrollY = useSharedValue(0);
  const onScroll = useAnimatedScrollHandler({
    onScroll: (event) => {
      scrollY.value = event.contentOffset.y;
    },
  });

  const blurStyle = useAnimatedStyle(() => {
    const opacity = interpolate(scrollY.value, [0, 60], [0, 1]);
    return { opacity };
  });

  const sections = useMemo(
    () => [
      { title: "New", data: data.new },
      { title: "Earlier", data: data.earlier },
    ],
    [data]
  );

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 1000);
  };

  const toggleRead = (id) => {
    const update = (arr) =>
      arr.map((n) => (n.id === id ? { ...n, unread: !n.unread } : n));
    setData((prev) => ({
      new: update(prev.new),
      earlier: update(prev.earlier),
    }));
  };

  const renderItem = ({ item }) => {
    const badge = iconForKind(item.kind);
    return (
      <Pressable
        key={item.id}
        onPress={() => toggleRead(item.id)}
        style={({ pressed }) => [
          styles.row,
          {
            backgroundColor: item.unread
              ? darkMode
                ? "rgba(0,166,255,0.1)"
                : "#E9F2FF"
              : theme.card,
            shadowOpacity: darkMode ? 0 : 0.05,
          },
          pressed && { opacity: 0.9 },
        ]}
      >
        <View style={styles.thumbWrap}>
          <Image source={{ uri: item.thumb }} style={styles.thumb} />
          <View style={[styles.typeBadge, badge.wrap]}>
            <Ionicons name={badge.name} size={14} color="#fff" />
          </View>
        </View>

        <View style={styles.textWrap}>
          <Text
            style={[styles.rowText, { color: theme.text }]}
            numberOfLines={3}
          >
            <Text style={[styles.bold, { color: theme.text }]}>
              {item.titleBold}
            </Text>
            <Text style={{ color: theme.text }}>{item.text}</Text>
            {item.highlight ? (
              <Text style={[styles.bold, { color: theme.text }]}>
                {item.highlight}
              </Text>
            ) : null}
          </Text>
          <Text style={[styles.time, { color: theme.subtleText }]}>
            {item.time}
          </Text>
        </View>
      </Pressable>
    );
  };

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <StatusBar
        barStyle={darkMode ? "light-content" : "dark-content"}
        translucent={false}
      />

      {/* Frosted Blur Header */}
      <Animated.View style={[styles.frostWrap, blurStyle]}>
        <BlurView
          intensity={70}
          tint={darkMode ? "dark" : "light"}
          style={StyleSheet.absoluteFill}
        />
        <View
          style={[
            styles.hairline,
            { backgroundColor: darkMode ? "#333" : "rgba(0,0,0,0.08)" },
          ]}
        />
      </Animated.View>

      {/* HEADER */}
      <View style={styles.headerContent}>
        <Text style={[styles.title, { color: theme.text }]}>Notifications</Text>

        <View style={styles.headerIcons}>
          <Pressable style={[styles.iconBtn, { marginRight: 6 }]} hitSlop={12}>
            <Ionicons
              name="ellipsis-horizontal"
              size={22}
              color={theme.text}
            />
          </Pressable>
          <Pressable style={[styles.iconBtn, { marginRight: 6 }]} hitSlop={12}>
            <Ionicons name="search" size={22} color={theme.text} />
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            hitSlop={12}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="close" size={24} color={theme.text} />
          </Pressable>
        </View>
      </View>

      {/* BODY */}
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={HELP_IO_BLUE}
          />
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: HEADER_HEIGHT + 10,
          paddingBottom: 50,
        }}
      >
        {sections.map(
          (section) =>
            section.data.length > 0 && (
              <View key={section.title}>
                <View style={styles.sectionHeader}>
                  <Text
                    style={[
                      styles.sectionTitle,
                      { color: darkMode ? "#9A9A9A" : "#6E6E73" },
                    ]}
                  >
                    {section.title}
                  </Text>
                </View>
                {section.data.map((item) => (
                  <View key={item.id}>{renderItem({ item })}</View>
                ))}
              </View>
            )
        )}
      </Animated.ScrollView>
    </SafeAreaView>
  );
}

/* Helper */
function iconForKind(kind) {
  switch (kind) {
    case "message":
      return {
        name: "chatbubble-ellipses",
        wrap: { backgroundColor: "#30D158" },
      };
    case "listing":
      return { name: "pricetag", wrap: { backgroundColor: "#0A84FF" } };
    case "group":
      return { name: "people", wrap: { backgroundColor: "#5856D6" } };
    default:
      return { name: "information", wrap: { backgroundColor: "#8E8E93" } };
  }
}

/* Styles */
const styles = StyleSheet.create({
  container: { flex: 1 },
  frostWrap: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: HEADER_HEIGHT,
    zIndex: 20,
  },
  hairline: {
    position: "absolute",
    bottom: 0,
    height: StyleSheet.hairlineWidth,
    width: "100%",
  },
  headerContent: {
    position: "absolute",
    top: TITLE_Y,
    left: 20,
    right: 20,
    zIndex: 40,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  title: {
    fontSize: 34,
    fontWeight: "800",
    letterSpacing: -0.4,
  },
  headerIcons: { flexDirection: "row", alignItems: "center", gap: 4 },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sectionHeader: {
    paddingHorizontal: 18,
    paddingTop: 8,
    paddingBottom: 4,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.3,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginHorizontal: 16,
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 16,
    shadowColor: "#000",
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    marginBottom: 10,
  },
  thumbWrap: {
    width: 56,
    height: 56,
    borderRadius: 12,
    overflow: "hidden",
    marginRight: 12,
  },
  thumb: { width: "100%", height: "100%" },
  typeBadge: {
    position: "absolute",
    bottom: -2,
    right: -2,
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: "#fff",
  },
  textWrap: { flex: 1 },
  rowText: { fontSize: 15.5, lineHeight: 20 },
  bold: { fontWeight: "700" },
  time: { marginTop: 4, fontSize: 13 },
});

