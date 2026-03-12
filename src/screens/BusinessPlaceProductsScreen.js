import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Platform
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

const HELPIO_BLUE = "#00A6FF";

export default function BusinessPlaceProductsScreen() {
  const navigation = useNavigation();

  const goBack = () => navigation.goBack?.();

  const onBecomeProvider = () => {
    // TODO: replace with your real route
    // navigation.navigate("BecomeProvider");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <LinearGradient
        colors={["#F6F7FA", "#EEF1F6", "#F7F8FB"]}
        locations={[0, 0.55, 1]}
        style={StyleSheet.absoluteFill}
      />

      {/* Top Nav */}
      <View style={styles.nav}>
        <TouchableOpacity activeOpacity={0.7} onPress={goBack} style={styles.navBtn}>
          <Ionicons name="chevron-back" size={22} color="#0B0B0F" />
        </TouchableOpacity>

        <Text style={styles.navTitle}>BusinessPlace</Text>

        <View style={styles.navBtn} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        {/* Hero */}
        <Text style={styles.title}>BusinessPlace Products</Text>
        <Text style={styles.subtitle}>
          Powerful tools to manage and grow your business.
        </Text>

        {/* Product cards */}
        <View style={{ marginTop: 14 }}>
          <ProductCard
            icon="document-text-outline"
            title="Helpio Invoicing"
            desc="Create and manage invoices"
          />
          <ProductCard
            icon="people-outline"
            title="Helpio CRM System"
            desc="Manage clients and leads"
          />
          <ProductCard
            icon="analytics-outline"
            title="Dashboard"
            desc="Monitor your business performance"
          />
        </View>

        {/* Small note */}
        <View style={styles.note}>
          <Ionicons name="lock-closed-outline" size={16} color="rgba(15,15,20,0.55)" />
          <Text style={styles.noteText}>
            These tools unlock when you become a provider.
          </Text>
        </View>

        {/* Spacer for sticky CTA */}
        <View style={{ height: 120 }} />
      </ScrollView>

      {/* Sticky CTA */}
      <View style={styles.ctaBar}>
        <TouchableOpacity activeOpacity={0.9} style={styles.ctaBtn} onPress={onBecomeProvider}>
          <Text style={styles.ctaText}>Become a Provider</Text>
        </TouchableOpacity>

        <TouchableOpacity activeOpacity={0.8} onPress={goBack} style={styles.secondaryBtn}>
          <Text style={styles.secondaryText}>Not now</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

function ProductCard({ icon, title, desc }) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={30} color="#0B0B0F" />
      </View>

      <View style={{ flex: 1 }}>
        <Text style={styles.cardTitle}>{title}</Text>
        <Text style={styles.cardDesc}>{desc}</Text>
      </View>

      <Ionicons name="chevron-forward" size={18} color="rgba(15,15,20,0.35)" />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F6F7FA" },

  nav: {
    height: 56,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between"
  },
  navBtn: {
    width: 40,
    height: 40,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)"
  },
  navTitle: {
    fontSize: 15.5,
    fontWeight: "800",
    color: "#0B0B0F",
    letterSpacing: Platform.select({ ios: -0.2, android: 0 })
  },

  content: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10
  },

  title: {
    fontSize: 34,
    fontWeight: "800",
    color: "#0B0B0F",
    textAlign: "center",
    letterSpacing: Platform.select({ ios: -0.6, android: 0 })
  },
  subtitle: {
    marginTop: 10,
    fontSize: 15.5,
    fontWeight: "700",
    color: "rgba(15,15,20,0.55)",
    textAlign: "center",
    lineHeight: 20
  },

  card: {
    marginTop: 12,
    borderRadius: 20,
    padding: 16,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    flexDirection: "row",
    alignItems: "center",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: "rgba(0,0,0,0.04)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#0B0B0F"
  },
  cardDesc: {
    marginTop: 4,
    fontSize: 13.5,
    fontWeight: "700",
    color: "rgba(15,15,20,0.55)"
  },

  note: {
    marginTop: 18,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "rgba(255,255,255,0.65)",
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    flexDirection: "row",
    alignItems: "center"
  },
  noteText: {
    marginLeft: 10,
    fontSize: 13.5,
    fontWeight: "700",
    color: "rgba(15,15,20,0.55)",
    flex: 1
  },

  ctaBar: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: "rgba(255,255,255,0.78)",
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.06)"
  },
  ctaBtn: {
    height: 52,
    borderRadius: 18,
    backgroundColor: HELPIO_BLUE,
    alignItems: "center",
    justifyContent: "center",

    shadowColor: HELPIO_BLUE,
    shadowOpacity: 0.25,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12
  },
  ctaText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "900",
    letterSpacing: 0.2
  },

  secondaryBtn: {
    marginTop: 10,
    alignItems: "center",
    paddingVertical: 6
  },
  secondaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "rgba(15,15,20,0.55)"
  }
});
