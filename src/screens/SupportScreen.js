// src/screens/SupportScreen.js
import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";

const HELP_IO_BLUE = "#00A6FF";

const FAQ_ITEMS = [
  {
    id: "1",
    title: "How do payouts work?",
    subtitle: "Learn how and when you receive payments for your services.",
  },
  {
    id: "2",
    title: "How do I edit a listing?",
    subtitle: "Update pricing, photos, and availability any time.",
  },
  {
    id: "3",
    title: "What is Helpio Verified?",
    subtitle: "Understand how verification builds trust with buyers.",
  },
];

export default function SupportScreen() {
  const { darkMode, theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <BlurView intensity={40} tint={theme.blurTint} style={styles.headerBlur}>
        <Text style={[styles.headerTitle, { color: theme.text }]}>Support</Text>
      </BlurView>

      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ height: Platform.OS === "ios" ? 70 : 60 }} />

        {/* Contact */}
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
            Contact
          </Text>

          <View style={styles.contactRow}>
            <View
              style={[
                styles.contactIcon,
                {
                  backgroundColor: darkMode
                    ? "rgba(255,255,255,0.08)"
                    : "rgba(0,0,0,0.05)",
                },
              ]}
            >
              <Ionicons name="chatbubbles-outline" size={22} color={HELP_IO_BLUE} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.contactTitle, { color: theme.text }]}>
                Message Support
              </Text>
              <Text
                style={[styles.contactSub, { color: theme.subtleText }]}
                numberOfLines={2}
              >
                Get help with your account, payments, or listings.
              </Text>
            </View>
          </View>

          <TouchableOpacity activeOpacity={0.8} style={styles.primaryButton}>
            <Text style={styles.primaryButtonText}>Start a Conversation</Text>
          </TouchableOpacity>
        </View>

        {/* FAQ */}
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
            Popular Topics
          </Text>

          {FAQ_ITEMS.map((item, index) => (
            <View key={item.id}>
              {index > 0 && <View style={styles.divider} />}
              <View style={styles.faqRow}>
                <View style={{ flex: 1 }}>
                  <Text
                    style={[styles.faqTitle, { color: theme.text }]}
                    numberOfLines={1}
                  >
                    {item.title}
                  </Text>
                  <Text
                    style={[styles.faqSub, { color: theme.subtleText }]}
                    numberOfLines={2}
                  >
                    {item.subtitle}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={16}
                  color={theme.subtleText}
                />
              </View>
            </View>
          ))}
        </View>

        <Text style={[styles.footer, { color: theme.subtleText }]}>
          Helpio • Support that feels human.
        </Text>
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
  contactRow: {
    flexDirection: "row",
    marginBottom: 14,
  },
  contactIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  contactTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  contactSub: {
    fontSize: 13,
    marginTop: 2,
  },
  primaryButton: {
    height: 44,
    borderRadius: 22,
    backgroundColor: HELP_IO_BLUE,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.08)",
    marginVertical: 8,
  },
  faqRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  faqTitle: {
    fontSize: 15,
    fontWeight: "600",
  },
  faqSub: {
    fontSize: 12,
    marginTop: 2,
  },
  footer: {
    textAlign: "center",
    fontSize: 12,
    marginTop: 8,
  },
});
