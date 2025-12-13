// src/screens/SavedScreen.js
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";

const MOCK_SAVED = [
  {
    id: "1",
    title: "Premium Boat Detailing",
    provider: "AFM Showroom",
    tag: "Marine",
  },
  {
    id: "2",
    title: "Luxury Kitchen Remodel",
    provider: "Veloz Contractors",
    tag: "Home",
  },
  {
    id: "3",
    title: "Exotic Car Wrap",
    provider: "Redline Underground Cars",
    tag: "Auto",
  },
];

export default function SavedScreen() {
  const { darkMode, theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <BlurView intensity={40} tint={theme.blurTint} style={styles.headerBlur}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Saved</Text>
      </BlurView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: Platform.OS === "ios" ? 70 : 60 }} />

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              shadowOpacity: darkMode ? 0 : 0.06,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.subtleText }]}>
            Collections
          </Text>
          <View style={styles.collectionRow}>
            <View style={styles.collectionBadge}>
              <Ionicons name="heart-outline" size={18} color="#FF2D55" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.collectionTitle, { color: theme.text }]}>
                Favorites
              </Text>
              <Text
                style={[styles.collectionSub, { color: theme.subtleText }]}
              >
                3 saved services
              </Text>
            </View>
          </View>
        </View>

        <View
          style={[
            styles.card,
            {
              backgroundColor: theme.card,
              shadowOpacity: darkMode ? 0 : 0.06,
            },
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.subtleText }]}>
            Saved Services
          </Text>

          {MOCK_SAVED.map((item, index) => (
            <View key={item.id}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.row}>
                <View style={styles.iconWrap}>
                  <Ionicons
                    name="bookmark-outline"
                    size={18}
                    color={theme.text}
                  />
                </View>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.title, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[styles.sub, { color: theme.subtleText }]}
                    numberOfLines={1}
                  >
                    {item.provider} • {item.tag}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerBlur: {
    position: "absolute",
    top: Platform.OS === "ios" ? 10 : 0,
    left: 0,
    right: 0,
    height: Platform.OS === "ios" ? 85 : 80,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
    zIndex: 10,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.2,
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  card: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    shadowColor: "#000",
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 8 },
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 0.4,
    marginBottom: 10,
  },
  collectionRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  collectionBadge: {
    width: 34,
    height: 34,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,45,85,0.08)",
    marginRight: 10,
  },
  collectionTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  collectionSub: {
    fontSize: 12,
    marginTop: 2,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 8,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "rgba(0,0,0,0.04)",
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
  },
  sub: {
    fontSize: 12,
    marginTop: 2,
  },
});
