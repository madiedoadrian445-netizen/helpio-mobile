// src/screens/HelpioPayScreen.js
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Platform,
  PanResponder,
  ActivityIndicator,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { api } from "../config/api";
import { Audio } from "expo-av";

const HELP_IO_PURPLE = "#7B61FF";
const HELP_IO_BLACK = "#000000";

export default function HelpioPayScreen({ navigation }) {
  const [cents, setCents] = useState("0");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  const [phase, setPhase] = useState("idle"); // idle | tapping | processing
  const nfcPulse = useRef(new Animated.Value(1)).current;

  const tapAcceptSound = useRef(null);
  const [showSuccess, setShowSuccess] = useState(false);

  const pulse = useRef(new Animated.Value(1)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.6)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  // Format cents → "42.00"
  const formattedAmount = React.useMemo(() => {
    const n = parseInt(cents || "0", 10);
    return (n / 100).toFixed(2);
  }, [cents]);

  /* -------------------------------------------
   * NFC eye pulse animation
   ------------------------------------------- */
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1.15,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 1,
          duration: 900,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulse]);

  useEffect(() => {
    Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      interruptionModeIOS: Audio.INTERRUPTION_MODE_IOS_DO_NOT_MIX,
    });

    (async () => {
      const { sound } = await Audio.Sound.createAsync(
        require("../../assets/sounds/helpio_accept_B.wav"),
        { volume: 0.45 }
      );
      tapAcceptSound.current = sound;
    })();

    return () => {
      if (tapAcceptSound.current) {
        tapAcceptSound.current.unloadAsync();
        tapAcceptSound.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (phase !== "tapping") return;

    Animated.loop(
      Animated.sequence([
        Animated.timing(nfcPulse, {
          toValue: 1.12,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(nfcPulse, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [phase, nfcPulse]);

  const playTapAcceptedSound = async () => {
    try {
      if (tapAcceptSound.current) {
        await tapAcceptSound.current.replayAsync();
      }
    } catch (e) {
      console.log("Sound error:", e);
    }
  };

  const playSuccessAnimation = () => {
    setShowSuccess(true);

    Animated.parallel([
      Animated.spring(successScale, {
        toValue: 1,
        useNativeDriver: true,
        friction: 6,
        tension: 120,
      }),
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 180,
        useNativeDriver: true,
      }),
    ]).start();
  };

  /* -------------------------------------------
   * Keypad Input Logic
   ------------------------------------------- */
  const handleDigitPress = (digit) => {
    setCents((prev) => {
      const clean = prev.replace(/^0+/, "") || "0";
      let next = clean === "0" ? String(digit) : clean + String(digit);
      if (next.length > 7) next = next.slice(0, 7);
      return next.replace(/^0+$/, "0");
    });
  };

  const handleBackspace = () => {
    setCents((prev) => {
      if (prev.length <= 1) return "0";
      const next = prev.slice(0, -1);
      return next === "" ? "0" : next;
    });
  };

 const closeSheet = () => {
  if (isProcessing || phase === "tapping") return;

  Animated.timing(translateY, {
    toValue: 900,
    duration: 220,
    useNativeDriver: true,
  }).start(() => navigation.goBack());
};


  /* -------------------------------------------
   * SIMULATED PAYMENT (Expo-safe)
   ------------------------------------------- */
  const handlePayPress = async () => {
    if (isProcessing) return;

    const numericAmount = parseFloat(formattedAmount);
    if (!numericAmount || numericAmount <= 0) {
      setErrorMessage("Enter an amount above $0.00.");
      return;
    }

    setIsProcessing(true);
    setErrorMessage(null);

    try {
      setPhase("tapping");

      await new Promise((r) => setTimeout(r, 650));
      await playTapAcceptedSound();

      await new Promise((r) => setTimeout(r, 1150)); // reader detection

      console.log("🚀 FIRING SIM PAYMENT REQUEST", {
  amount: Math.round(numericAmount * 100),
});

console.log("🌍 API BASE URL:", api.defaults.baseURL);

    await api.post("/api/terminal-payments-sim/simulate", {
  amount: Math.round(numericAmount * 100),
  currency: "usd",
  providerId: provider._id, // ⭐ REQUIRED FOR REVENUE
});


// ✅ allow request + logs to fully flush
await new Promise((r) => setTimeout(r, 300));

playSuccessAnimation();

await new Promise((r) => setTimeout(r, 650));
closeSheet();


    } catch (err) {
      console.log("Simulated payment error:", err);
      setErrorMessage("Payment failed (simulated).");
    }

    setPhase("idle");
    setIsProcessing(false);
  };

  const keypadRows = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [".", "0", "<"],
  ];

  const panResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: (_, g) =>
  !isProcessing &&
  phase !== "tapping" &&
  g.dy > 5 &&
  Math.abs(g.dy) > Math.abs(g.dx),

      onPanResponderMove: (_, g) => {
        if (g.dy > 0) translateY.setValue(g.dy);
      },
      onPanResponderRelease: (_, g) => {
        if (g.dy > 120 || g.vy > 0.9) {
          Animated.timing(translateY, {
            toValue: 900,
            duration: 220,
            useNativeDriver: true,
          }).start(() => navigation.goBack());
        } else {
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            friction: 8,
            tension: 80,
          }).start();
        }
      },
    })
  ).current;

  return (
    <Animated.View
      style={{ flex: 1, transform: [{ translateY }] }}
      {...panResponder.panHandlers}
    >
      <SafeAreaView style={styles.safe}>
        <BlurView intensity={40} tint="light" style={StyleSheet.absoluteFill} />

        {phase === "tapping" && (
  <View style={styles.tapOverlay} pointerEvents="auto">
    <BlurView intensity={60} tint="light" style={StyleSheet.absoluteFill} />

    <View style={styles.tapContent}>
      {/* Card */}
      <View style={styles.tapCardWrapper}>
        <View style={styles.tapCardShadow}>
          <BlurView intensity={30} tint="dark" style={styles.card}>
            <View style={styles.cardRowTop}>
              <Text style={styles.cardName}>HELPIO</Text>
              <Text style={styles.cardBrand}>VISA</Text>
            </View>

            <View style={styles.cardEyeWrap}>
              <View style={styles.cardEyeCircle}>
                <Ionicons
                  name="eye-outline"
                  size={22}
                  color="rgba(255,255,255,0.85)"
                />
              </View>
            </View>

            <View style={styles.cardRowBottom}>
              <Text style={styles.cardLabel}>Helpio Pay</Text>
              <Text style={styles.cardLast4}>•••• 4242</Text>
            </View>
          </BlurView>
        </View>
      </View>

      {/* NFC Center */}
      <View style={styles.nfcCenter}>
        <Animated.View
          style={[styles.tapRing, { transform: [{ scale: nfcPulse }] }]}
        >
          <Ionicons name="phone-portrait-outline" size={42} color="#007AFF" />
        </Animated.View>

        <Text style={styles.tapText}>Hold Near Reader</Text>
      </View>
    </View>
  </View>
)}

{showSuccess && (
  <View style={styles.successOverlay} pointerEvents="none">
    <BlurView intensity={70} tint="light" style={StyleSheet.absoluteFill} />

    <Animated.View
      style={[
        styles.successCard,
        {
          opacity: successOpacity,
          transform: [{ scale: successScale }],
        },
      ]}
    >
      <View style={styles.successIcon}>
        <Ionicons name="checkmark" size={44} color="#fff" />
      </View>

      <Text style={styles.successTitle}>Payment Complete</Text>
      <Text style={styles.successAmount}>${formattedAmount}</Text>
    </Animated.View>
  </View>
)}


          
        <View style={styles.container}>
          {/* Card */}
          <View style={styles.cardShadow}>
            <BlurView intensity={30} tint="dark" style={styles.card}>
              <View style={styles.cardRowTop}>
                <Text style={styles.cardName}>HELPIO</Text>
                <Text style={styles.cardBrand}>VISA</Text>
              </View>

              <View style={styles.cardEyeWrap}>
                <Animated.View
                  style={[styles.cardEyeCircle, { transform: [{ scale: pulse }] }]}
                >
                  <Ionicons
                    name="eye-outline"
                    size={22}
                    color="rgba(255,255,255,0.85)"
                  />
                </Animated.View>
              </View>

              <View style={styles.cardRowBottom}>
                <Text style={styles.cardLabel}>Helpio Pay</Text>
                <Text style={styles.cardLast4}>•••• 4242</Text>
              </View>
            </BlurView>
          </View>

          {/* Amount */}
          <View style={styles.amountBlock}>
            <View style={styles.amountRow}>
              <Text style={styles.amount}>{formattedAmount}</Text>
              <Text style={styles.currency}>USD</Text>
            </View>
            <Text style={styles.amountHint}>Enter amount to charge</Text>
          </View>

          {errorMessage ? <Text style={styles.errorText}>{errorMessage}</Text> : null}

          {/* Keypad */}
          <View style={styles.keypad}>
            {keypadRows.map((row, rowIndex) => (
              <View key={`row-${rowIndex}`} style={styles.keypadRow}>
                {row.map((key) => {
                  if (key === ".") {
                    return (
                      <View key="dot" style={[styles.keypadKey, styles.keypadKeyDisabled]}>
                        <Text style={[styles.keyText, styles.keyTextDisabled]}>.</Text>
                      </View>
                    );
                  }

                  if (key === "<") {
                    return (
                      <TouchableOpacity
                        key="backspace"
                        style={styles.keypadKey}
                        onPress={handleBackspace}
                      >
                        <Ionicons name="backspace-outline" size={24} color="#111" />
                      </TouchableOpacity>
                    );
                  }

                  return (
                    <TouchableOpacity
                      key={key}
                      style={styles.keypadKey}
                      onPress={() => handleDigitPress(key)}
                    >
                      <Text style={styles.keyText}>{key}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ))}
          </View>

          {/* Buttons */}
          <View style={styles.bottomBar}>
            <TouchableOpacity
              style={[styles.primaryButton, isProcessing && { opacity: 0.7 }]}
              onPress={handlePayPress}
              disabled={isProcessing}
            >
              {isProcessing ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.primaryText}>Charge</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => console.log("Sparkle button pressed")}
              disabled={isProcessing}
            >
              <Ionicons name="sparkles-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    </Animated.View>
  );
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    paddingTop: Platform.OS === "ios" ? 16 : 24,
    paddingHorizontal: 22,
  },

  tapOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(242,242,247,0.92)",
    zIndex: 999,
  },
  tapContent: {
    flex: 1,
  },
  tapCardShadow: {
    borderRadius: 18,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  tapRing: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 3,
    borderColor: "#007AFF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  tapText: {
    fontSize: 17,
    fontWeight: "600",
    color: "#8E8E93",
  },

  cardShadow: {
    borderRadius: 18,
    overflow: "hidden",
    marginTop: 12,
    marginBottom: 80,
    shadowColor: "#000",
    shadowOpacity: 0.35,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  card: {
    height: 220,
    borderRadius: 18,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "rgba(10,10,10,0.9)",
  },
  cardRowTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardName: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
    letterSpacing: 2,
  },
  cardBrand: {
    color: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 1,
  },
  cardEyeWrap: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  cardEyeCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.06)",
  },
  cardRowBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
  },
  cardLabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
  },
  cardLast4: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "700",
  },

successOverlay: {
  ...StyleSheet.absoluteFillObject,
  zIndex: 1000,
  alignItems: "center",
  justifyContent: "center",
},

successCard: {
  alignItems: "center",
  paddingHorizontal: 32,
  paddingVertical: 28,
  borderRadius: 20,
  backgroundColor: "rgba(255,255,255,0.9)",
},

successIcon: {
  width: 72,
  height: 72,
  borderRadius: 36,
  backgroundColor: "#22C55E", // Apple-style success green
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,
},

successTitle: {
  fontSize: 18,
  fontWeight: "700",
  color: "#111",
  marginBottom: 6,
},

successAmount: {
  fontSize: 22,
  fontWeight: "800",
  color: "#111",
},


  tapCardWrapper: {
    position: "absolute",
    top: Platform.OS === "ios" ? 96 : 110,
    width: "100%",
    paddingHorizontal: 22,
  },
  nfcCenter: {
    position: "absolute",
    top: "50%",
    left: 0,
    right: 0,
    alignItems: "center",
    transform: [{ translateY: -24 }],
  },

  amountBlock: {
    marginBottom: 9,
    alignItems: "center",
  },
  amountRow: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  amount: {
    fontSize: 42,
    fontWeight: "800",
    color: "#111",
    letterSpacing: 0.5,
  },
  currency: {
    marginLeft: 8,
    marginBottom: 4,
    fontSize: 16,
    fontWeight: "600",
    color: "#C7C7CC",
  },
  amountHint: {
    marginTop: 6,
    color: "#A0A0A5",
    fontSize: 14,
  },
  errorText: {
    marginTop: 4,
    textAlign: "center",
    fontSize: 13,
    color: "#DC2626",
  },

  keypad: {
    marginTop: 40,
    marginBottom: 24,
  },
  keypadRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 6,
  },
  keypadKey: {
    flex: 1,
    marginHorizontal: 4,
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  keypadKeyDisabled: {
    opacity: 0.3,
  },
  keyText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#111",
  },
  keyTextDisabled: {
    color: "#999",
  },

  bottomBar: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: "auto",
    marginBottom: 8,
  },
  primaryButton: {
    flex: 1,
    height: 52,
    borderRadius: 26,
    backgroundColor: HELP_IO_BLACK,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  primaryText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "700",
  },
  secondaryButton: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: HELP_IO_PURPLE,
    alignItems: "center",
    justifyContent: "center",
  },
});
