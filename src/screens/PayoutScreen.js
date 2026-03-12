import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert
} from "react-native";

const API = process.env.EXPO_PUBLIC_API_URL;

export default function PayoutScreen() {

  const [providerId, setProviderId] = useState(null);
  const [balance, setBalance] = useState({
    available: 0,
    pending: 0
  });
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

 useEffect(() => {
  loadProvider();
}, []);


const loadProvider = async () => {
  try {

    const res = await fetch(`${API}/api/providers/me`);

    const data = await res.json();

    if (data.success) {
      setProviderId(data.provider._id);
      loadBalance(data.provider._id);
    }

  } catch (err) {
    console.log("Provider fetch error:", err);
  }
};


  const loadBalance = async (id) => {
    try {

      const res = await fetch(
       `${API}/api/stripe/balance/${id}`
      );

      const data = await res.json();

      if (data.success) {
        setBalance(data.balance);
      }

    } catch (err) {
      console.log("Balance error:", err);
    }

    setLoading(false);
  };

  const withdrawFunds = async () => {
    try {

      setWithdrawing(true);

      const res = await fetch(
        `${API}/api/stripe/payout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            providerId,
            amount: balance.available
          })
        }
      );

      const data = await res.json();

      if (data.success) {
        Alert.alert("Success", "Payout sent!");
        loadBalance();
      }

    } catch (err) {
      console.log(err);
    }

    setWithdrawing(false);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>

      <Text style={styles.title}>Helpio Pay</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Available Balance</Text>
        <Text style={styles.amount}>
        ${balance?.available || 0}
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>Pending</Text>
        <Text style={styles.pending}>
        ${balance?.pending || 0}
        </Text>
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={withdrawFunds}
        disabled={withdrawing}
      >
        <Text style={styles.buttonText}>
          {withdrawing ? "Processing..." : "Withdraw Funds"}
        </Text>
      </TouchableOpacity>

    </View>
  );
}

const styles = StyleSheet.create({

  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 24
  },

  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  title: {
    fontSize: 28,
    fontWeight: "600",
    marginBottom: 30
  },

  card: {
    backgroundColor: "#f6f6f6",
    padding: 20,
    borderRadius: 14,
    marginBottom: 20
  },

  label: {
    fontSize: 16,
    color: "#666"
  },

  amount: {
    fontSize: 32,
    fontWeight: "700",
    marginTop: 6,
    color: "#00A6FF"
  },

  pending: {
    fontSize: 26,
    fontWeight: "600",
    marginTop: 6
  },

  button: {
    marginTop: 20,
    backgroundColor: "#00A6FF",
    padding: 16,
    borderRadius: 12,
    alignItems: "center"
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600"
  }
});