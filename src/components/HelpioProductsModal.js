import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Pressable,
  Platform
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
export default function HelpioProductsModal({ visible, onClose }) {
  return (
    <Modal
      visible={!!visible}
      animationType="fade"
      transparent
      onRequestClose={onClose}
    >
      {/* Tap outside to close */}
      <Pressable style={styles.overlay} onPress={onClose}>
        {/* Prevent close when tapping inside */}
        <Pressable style={styles.container} onPress={() => {}}>
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            {/* Header */}
            <Text style={styles.title}>Helpio Products</Text>
            <Text style={styles.subtitle}>
              Powerful tools to manage and grow your business.
            </Text>

            {/* Product Cards */}
            <View style={styles.products}>
              {/* Invoicing */}
              <View style={[styles.card, styles.cardSpacing]}>
              <Ionicons name="document-text-outline" size={46} color="#0B0B0F" />
                <Text style={styles.cardTitle}>Helpio Invoicing</Text>
                <Text style={styles.cardDesc}>Create and manage invoices</Text>
              </View>

              {/* CRM */}
              <View style={[styles.card, styles.cardSpacing]}>
               <Ionicons name="people-outline" size={46} color="#0B0B0F" />
                <Text style={styles.cardTitle}>Helpio CRM System</Text>
                <Text style={styles.cardDesc}>Manage clients and leads</Text>
              </View>

              {/* Dashboard */}
              <View style={styles.card}>
               <Ionicons name="analytics-outline" size={46} color="#0B0B0F" />
                <Text style={styles.cardTitle}>Dashboard</Text>
                <Text style={styles.cardDesc}>
                  Monitor your business performance
                </Text>
              </View>
            </View>

            {/* CTA */}
            <TouchableOpacity
              activeOpacity={0.9}
              style={styles.button}
              onPress={() => {
                // TODO: navigate to provider onboarding
              }}
            >
              <Text style={styles.buttonText}>Become a Provider</Text>
            </TouchableOpacity>

            {/* Optional close text (very iOS) */}
            <TouchableOpacity
              activeOpacity={0.8}
              style={styles.closeLink}
              onPress={onClose}
            >
              <Text style={styles.closeText}>Not now</Text>
            </TouchableOpacity>
          </ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.40)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 14
  },

  container: {
    width: "92%",
    backgroundColor: "#fff",
    borderRadius: 28,
    padding: 25,
    maxHeight: "85%",

    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 30,
    shadowOffset: { width: 0, height: 14 },
    elevation: 10
  },

  scrollContent: {
    paddingBottom: 6
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 6,
    letterSpacing: Platform.select({ ios: -0.3, android: 0 })
  },

  subtitle: {
    fontSize: 16,
    color: "#6e6e73",
    textAlign: "center",
    marginBottom: 22
  },

  products: {
    marginTop: 6
  },

  // replaces `gap`
  cardSpacing: {
    marginBottom: 16
  },

  card: {
    backgroundColor: "#f7f7f7",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 15,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3
  },

 
  cardTitle: {
    fontSize: 18,
    fontWeight: "600"
  },

  cardDesc: {
    fontSize: 14,
    color: "#8e8e93",
    marginTop: 4,
    textAlign: "center"
  },

  button: {
    marginTop: 20,
    backgroundColor: "#007aff",
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center"
  },

  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16
  },

  closeLink: {
    marginTop: 12,
    alignItems: "center"
  },

  closeText: {
    fontSize: 14,
    color: "#8e8e93",
    fontWeight: "500"
  }
});