// src/screens/LegalPoliciesScreen.js

import React from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
} from "react-native";
import { useTheme } from "../ThemeContext";

const HELP_BLUE = "#00A6FF";

const NumberRow = ({ number, title, children }) => (
  <View style={styles.numberBlock}>
    <View style={styles.numberCircle}>
      <Text style={styles.numberText}>{number}</Text>
    </View>
    <View style={{ flex: 1 }}>
      <Text style={styles.numberTitle}>{title}</Text>
      <View style={{ marginTop: 6 }}>{children}</View>
    </View>
  </View>
);

export default function LegalPoliciesScreen() {
  const { theme } = useTheme();

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: "#F2F3F5" }]}>
      <ScrollView contentContainerStyle={styles.container}>
        
        {/* Header */}
        <Text style={styles.platformTitle}>Helpio</Text>
        <Text style={styles.policyPath}>Policies / Commerce</Text>

        <View style={styles.card}>
          <Text style={styles.mainTitle}>HELPIO TERMS OF SERVICE</Text>
          <Text style={styles.updated}>Last Updated: 2026</Text>

          {/* 1 */}
          <NumberRow number="1" title="Agreement to Terms">
            <Text style={styles.bodyText}>
              By accessing or using Helpio, you agree to these Terms.
              You must be at least 18 years old.
            </Text>
          </NumberRow>

          {/* 2 */}
          <NumberRow number="2" title="The Role of Helpio">
            <Text style={styles.bodyText}>
              Helpio is a communication-based marketplace and is not a party
              to service agreements between users.
            </Text>
            <Text style={styles.bullet}>• Does not perform services</Text>
            <Text style={styles.bullet}>• Does not supervise providers</Text>
            <Text style={styles.bullet}>• Does not guarantee outcomes</Text>
          </NumberRow>

          {/* 3 */}
          <NumberRow number="3" title="No Booking or Service Management">
            <Text style={styles.bodyText}>
              Helpio does not manage bookings or oversee services.
              Users arrange services independently.
            </Text>
          </NumberRow>

          {/* 4 */}
          <NumberRow number="4" title="Independent Contractor Status">
            <Text style={styles.bodyText}>
              Providers operate independently and are not employees,
              partners, or agents of Helpio.
            </Text>
          </NumberRow>

          {/* 5 */}
          <NumberRow number="5" title="No Dispute Mediation Obligation">
            <Text style={styles.bodyText}>
              Service disputes are between the provider and the customer.
              Helpio may investigate fraud but does not arbitrate disputes.
            </Text>
          </NumberRow>

          {/* 6 */}
          <NumberRow number="6" title="Marketplace Integrity Authority">
            <Text style={styles.bodyText}>
              Helpio may remove listings, suspend accounts, or investigate activity.
            </Text>
          </NumberRow>

          {/* 7 */}
          <NumberRow number="7" title="Invoicing & Tax Configuration">
            <Text style={styles.bodyText}>
              Providers are responsible for invoice accuracy and tax compliance.
            </Text>
            <Text style={styles.bullet}>• Helpio does not determine tax rates</Text>
            <Text style={styles.bullet}>• Helpio does not verify invoice accuracy</Text>
          </NumberRow>

          {/* 8 */}
          <NumberRow number="8" title="Identity Verification">
            <Text style={styles.bodyText}>
              Verification confirms identity only and does not guarantee
              service quality or safety.
            </Text>
          </NumberRow>

          {/* 9 */}
          <NumberRow number="9" title="Assumption of Risk">
            <Text style={styles.bodyText}>
              Users assume risks when engaging independent providers.
            </Text>
          </NumberRow>

          {/* 10 */}
          <NumberRow number="10" title="Limitation of Liability">
            <Text style={styles.bodyText}>
              Helpio is not liable for indirect damages or service outcomes.
            </Text>
          </NumberRow>

          {/* 11 */}
          <NumberRow number="11" title="Indemnification">
            <Text style={styles.bodyText}>
              Users agree to indemnify Helpio from claims arising from their conduct.
            </Text>
          </NumberRow>

          {/* 12 */}
          <NumberRow number="12" title="Electronic Communications" />

          {/* 13 */}
          <NumberRow number="13" title="Force Majeure" />

          {/* 14 */}
          <NumberRow number="14" title="Assignment" />

          {/* 15 */}
          <NumberRow number="15" title="Severability" />
        </View>

        {/* MARKETPLACE POLICIES */}
        <View style={styles.card}>
          <Text style={styles.mainTitle}>Marketplace Policies</Text>

          <NumberRow number="1" title="Prohibited Services">
            <Text style={styles.bodyText}>
              Adult services, drugs, weapons, fraud, gambling,
              hazardous materials, and other illegal activities are prohibited.
            </Text>
          </NumberRow>

          <NumberRow number="2" title="Restricted Services">
            <Text style={styles.bodyText}>
              Licensed or high-risk services may require additional review.
            </Text>
          </NumberRow>

          <NumberRow number="3" title="Listing Standards">
            <Text style={styles.bodyText}>
              Services must be accurately described with transparent pricing.
            </Text>
          </NumberRow>

          <NumberRow number="4" title="Monitoring Disclaimer">
            <Text style={styles.bodyText}>
              Helpio may monitor activity but does not guarantee real-time oversight.
            </Text>
          </NumberRow>

          <NumberRow number="5" title="Enforcement" />

          <NumberRow number="6" title="Legal Compliance" />

          <NumberRow number="7" title="Reporting Violations" />
        </View>

        {/* ACCEPTABLE USE */}
        <View style={styles.card}>
          <Text style={styles.mainTitle}>Acceptable Use Policy</Text>
          <Text style={styles.bodyText}>
            Users may not violate laws, commit fraud, harass others,
            upload malicious software, scrape data, or reverse engineer the platform.
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  container: { padding: 20, paddingBottom: 60 },

  platformTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: HELP_BLUE,
  },
  policyPath: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 20,
  },

  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },

  mainTitle: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 10,
  },
  updated: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 20,
  },

  numberBlock: {
    flexDirection: "row",
    marginBottom: 22,
  },
  numberCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#D1D5DB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  numberText: {
    fontWeight: "600",
    fontSize: 14,
  },
  numberTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  bodyText: {
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
  },
  bullet: {
    fontSize: 14,
    color: "#374151",
    marginTop: 4,
  },
});