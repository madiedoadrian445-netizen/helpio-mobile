// src/screens/PayoutsBalancesScreen.js
import React, { useEffect, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Platform
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";

const API = process.env.EXPO_PUBLIC_API_URL;
const HELP_BLUE = "#00A6FF";

export default function PayoutsBalancesScreen({ navigation, route }) {

  const { darkMode, theme } = useTheme();
  const isLight = !darkMode;
  const insets = useSafeAreaInsets();

 

  const [balance, setBalance] = useState({
    available: 0,
    pending: 0
  });

  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);
const providerId = route?.params?.providerId;
 
 console.log("ProviderId received:", providerId);
  
useEffect(() => {
  if (!providerId) return;

  loadBalance(providerId);
}, [providerId]);


  const loadBalance = async (id) => {

    try {

      const res = await fetch(`${API}/api/stripe/balance/${id}`);
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

    if (!balance.available) {
      Alert.alert("No funds", "You have no available balance to withdraw.");
      return;
    }

    try {

      setWithdrawing(true);

      const res = await fetch(`${API}/api/stripe/payout`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          providerId,
          amount: balance.available
        })
      });

      const data = await res.json();

      if (data.success) {

        Alert.alert("Success", "Payout sent!");

        loadBalance(providerId);

      }

    } catch (err) {
      console.log(err);
    }

    setWithdrawing(false);
  };

  if (loading) {
  return (
    <View style={[styles.loadingWrap, { backgroundColor: theme.background }]}>
      <ActivityIndicator size="large"color="#000" />
    </View>
  );
}

  return (
  <SafeAreaView style={styles.safe}>

      

     <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />
      {/* Header */}
    <View
  style={[
    styles.header,
    { paddingTop: insets.top - 22 }
  ]}
>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <BlurView
            intensity={40}
            tint={isLight ? "light" : "dark"}
            style={styles.backBlur}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={isLight ? "#111827" : "#f9fafb"}
            />
          </BlurView>
        </TouchableOpacity>

        <Text style={[styles.headerTitle, { color: theme.text }]}>
          Payouts & Balances
        </Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          padding: 18,
          paddingBottom: insets.bottom + 40
        }}
      >

     {/* Apple Wallet Style Card */}
<LinearGradient
  colors={["#0B0B0F", "#121217", "#020203"]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={styles.walletCard}
>

  <Text style={styles.walletTitle}>
    Helpio Pay
  </Text>

  <View style={styles.walletBalanceWrap}>
    <Text style={styles.walletLabel}>
      Available
    </Text>

    <Text style={styles.walletBalance}>
      ${balance.available}
    </Text>
  </View>

  <Text style={styles.walletPending}>
    Pending ${balance.pending}
  </Text>

</LinearGradient>


<View style={styles.balanceActionCard}>

  <View>
    <Text style={styles.balanceLabel}>
      Balance
    </Text>

    <Text style={styles.balanceAmount}>
      ${balance.available}
    </Text>
  </View>

  <TouchableOpacity
    style={styles.appleWithdrawButton}
    onPress={withdrawFunds}
    disabled={withdrawing}
  >
    <Text style={styles.appleWithdrawText}>
      {withdrawing ? "Processing..." : "Withdraw"}
    </Text>
  </TouchableOpacity>

</View>


    <View style={styles.transactionsCard}>

<Text style={styles.transactionsTitle}>
Latest Payouts
</Text>

{[
  { date: "Feb 11", amount: "$945.00" },
  { date: "Feb 6", amount: "$1,270.12" },
  { date: "Jan 30", amount: "$1,034.77" }
].map((p, i) => (

<View key={i} style={styles.transactionRow}>

  <View style={styles.transactionIcon}>
    <Ionicons name="cash-outline" size={18} color="#000"/>
  </View>

  <View style={{flex:1}}>
    <Text style={styles.transactionTitle}>
      Bank Transfer
    </Text>

    <Text style={styles.transactionSub}>
      {p.date}
    </Text>
  </View>

  <Text style={styles.transactionAmount}>
    {p.amount}
  </Text>

</View>

))}

</View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({

safe: {
  flex: 1,
  backgroundColor: "#F2F2F7",
},


  loadingWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },

  header: {
    paddingHorizontal: 18,
    flexDirection: "row",
    alignItems: "center",
    paddingBottom: 8
  },

  headerTitle: {
    flex: 1,
    textAlign: "center",
    fontSize: 20,
    fontWeight: "700"
  },

  backButton: {
    width: 40,
    height: 40
  },



walletCard:{
  height:190,
  borderRadius:28, // ⭐ more rounded like Apple Wallet
  overflow:"hidden", // ⭐ ensures gradient respects the round corners
  padding:22,
  marginBottom:24,

  shadowColor:"#000",
  shadowOpacity:0.35,
  shadowRadius:22,
  shadowOffset:{width:0,height:12},
  elevation:12
},

walletTitle:{
  color:"#fff",
  fontSize:20,
  fontWeight:"700"
},

walletBalanceWrap:{
  marginTop:30
},

walletLabel:{
  color:"rgba(255,255,255,0.6)",
  fontSize:13
},

walletBalance:{
  color:"#fff",
  fontSize:38,
  fontWeight:"800",
  marginTop:4
},

walletPending:{
  color:"rgba(255,255,255,0.7)",
  marginTop:8,
  fontSize:13
},

balanceActionCard:{
  backgroundColor:"#ffffff",
  shadowColor:"#000",
shadowOpacity:0.08,
shadowRadius:10,
shadowOffset:{width:0,height:4},
elevation:3,
  borderRadius:18,
  padding:20,
  flexDirection:"row",
  justifyContent:"space-between",
  alignItems:"center",
  marginBottom:20
},

balanceLabel:{
  fontSize:13,
  color:"#6b7280"
},

balanceAmount:{
  fontSize:30,
  fontWeight:"800"
},

appleWithdrawButton:{
  backgroundColor:"#000",
  paddingVertical:10,
  paddingHorizontal:20,
  borderRadius:999
},

appleWithdrawText:{
  color:"#fff",
  fontWeight:"600",
  fontSize:14
},

transactionsCard:{
  backgroundColor:"#fff",
  borderRadius:18,
  padding:18
},

transactionsTitle:{
  fontSize:18,
  fontWeight:"700",
  marginBottom:12
},

transactionRow:{
  flexDirection:"row",
  alignItems:"center",
  paddingVertical:12
},

transactionIcon:{
  width:36,
  height:36,
  borderRadius:10,
  backgroundColor:"#f3f4f6",
  justifyContent:"center",
  alignItems:"center",
  marginRight:12
},

transactionTitle:{
  fontSize:15,
  fontWeight:"600"
},

transactionSub:{
  fontSize:12,
  color:"#6b7280"
},

transactionAmount:{
  fontSize:15,
  fontWeight:"700"
},



  backBlur: {
    flex: 1,
    borderRadius: 999,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden"
  },

  card: {
    borderRadius: 18,
    padding: 18,
    marginBottom: 20
  },

  cardLabel: {
    fontSize: 13,
    fontWeight: "600"
  },

  cardAmount: {
    fontSize: 34,
    fontWeight: "800",
    marginTop: 6
  },

  cardSub: {
    fontSize: 12,
    marginTop: 6
  },

  withdrawButton: {
    marginTop: 16,
    backgroundColor: HELP_BLUE,
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center"
  },

  withdrawText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 15
  },

  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 12
  },

  payoutRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10
  },

  payoutDate: {
    fontSize: 14
  },

  payoutAmount: {
    fontSize: 14,
    fontWeight: "600"
  }

});
