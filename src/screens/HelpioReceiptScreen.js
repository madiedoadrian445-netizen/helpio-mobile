import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";

const HELP_IO_BLUE = "#00A6FF";

export default function HelpioReceiptScreen({ route, navigation }) {

  const {
    amount,
    last4 = "4242",
    brand = "Visa",
    transactionId = "TXN-" + Date.now(),
  } = route.params || {};

  const date = new Date().toLocaleString();

  return (
    <SafeAreaView style={styles.safe}>
      <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />

      <View style={styles.container}>

        {/* Success icon */}
        <View style={styles.iconWrap}>
          <Ionicons name="checkmark" size={40} color="#fff" />
        </View>

        <Text style={styles.title}>Payment Successful</Text>

        <Text style={styles.amount}>${amount}</Text>

        {/* Receipt card */}
        <View style={styles.card}>

          <Row label="Date" value={date} />

          <Row label="Payment Method" value={`${brand} •••• ${last4}`} />

          <Row label="Transaction ID" value={transactionId} />

          <Row label="Status" value="Completed" />

        </View>

        {/* Buttons */}
        <View style={styles.buttons}>

          <TouchableOpacity style={styles.primary}>
            <Ionicons name="paper-plane-outline" size={18} color="#fff" />
            <Text style={styles.primaryText}>Send Receipt</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondary}
            onPress={() => navigation.popToTop()}
          >
            <Text style={styles.secondaryText}>Done</Text>
          </TouchableOpacity>

        </View>

      </View>
    </SafeAreaView>
  );
}

function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({

  safe: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },

  container: {
    flex: 1,
    alignItems: "center",
    paddingTop: 80,
    paddingHorizontal: 24,
  },

  iconWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: HELP_IO_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111",
  },

  amount: {
    fontSize: 38,
    fontWeight: "800",
    marginTop: 8,
    marginBottom: 30,
  },

  card: {
    width: "100%",
    backgroundColor: "#fff",
    borderRadius: 18,
    padding: 18,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },

    elevation: 3,
  },

  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 10,
  },

  label: {
    fontSize: 15,
    color: "#6B7280",
  },

  value: {
    fontSize: 15,
    fontWeight: "600",
    color: "#111",
  },

  buttons: {
    width: "100%",
    marginTop: 40,
  },

  primary: {
    height: 50,
    borderRadius: 25,
    backgroundColor: "#000",

    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",

    marginBottom: 12,
  },

  primaryText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },

  secondary: {
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },

  secondaryText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6B7280",
  },
});