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
import useAuthStore from "../store/auth";
import { Image } from "react-native";



const HELP_IO_PURPLE = "#7B61FF";
const HELP_IO_BLACK = "#000000";

export default function HelpioPayScreen({ navigation }) {
 const provider = useAuthStore((state) => state.provider);
  const isHydrated = useAuthStore((state) => state.isHydrated);
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
const contentOpacity = useRef(new Animated.Value(1)).current;


  if (!isHydrated) {
  return (
    <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
      <ActivityIndicator />
    </View>
  );
}



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

   // Allow simulated payments even if provider isn't ready
const providerId = provider?._id || null;



    setIsProcessing(true);
    setErrorMessage(null);

    try {
      setPhase("tapping");

Animated.timing(contentOpacity, {
  toValue: 0,
  duration: 220,
  useNativeDriver: true,
}).start();


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
  providerId, // null-safe
});


// ✅ allow request + logs to fully flush
await new Promise((r) => setTimeout(r, 300));

playSuccessAnimation();

await new Promise((r) => setTimeout(r, 650));

Animated.timing(contentOpacity, {
  toValue: 1,
  duration: 180,
  useNativeDriver: true,
}).start();

closeSheet();



    } catch (err) {
      console.log("Simulated payment error:", err);
      setErrorMessage("Payment failed (simulated).");
    }

    setPhase("idle");
    setIsProcessing(false);
  };

  const keypadRows = [
  [
    { n: "1", l: "" },
    { n: "2", l: "" },
    { n: "3", l: "" },
  ],
  [
    { n: "4", l: "" },
    { n: "5", l: "" },
    { n: "6", l: "" },
  ],
  [
    { n: "7", l: "" },
    { n: "8", l: "" },
    { n: "9", l: "" },
  ],
  [
    { n: null, l: "" }, // empty spacer
    { n: "0", l: "" }, // centered zero
    { n: "<", l: "" },  // backspace
  ],
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
        <BlurView intensity={30} tint="light" style={StyleSheet.absoluteFill} />

        

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
    <Image
      source={require("../../assets/ui/helpio-cash-card.png")}
      style={styles.cardImage}
      resizeMode="cover"
    />
  </View>

  {/* Inline Apple-Pay NFC */}
  {phase === "tapping" && (
    <Animated.View
      style={[
        styles.inlineTap,
        { opacity: Animated.subtract(1, contentOpacity) },
      ]}
    >
      <Animated.View
        style={[styles.tapRing, { transform: [{ scale: nfcPulse }] }]}
      >
        <Ionicons name="phone-portrait-outline" size={44} color="#007AFF" />
      </Animated.View>

      <Text style={styles.tapText}>Hold Near Reader</Text>
    </Animated.View>
  )}

  {/* Fading content */}
  <Animated.View style={{ opacity: contentOpacity }}>
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
      {keypadRows.map((row, r) => (
        <View key={r} style={styles.keypadRow}>
          {row.map((key, i) => {
            if (!key.n) {
              return <View key={i} style={[styles.iosKey, { opacity: 0 }]} />;
            }

            if (key.n === "<") {
              return (
                <TouchableOpacity
                  key={i}
                  style={styles.iosKey}
                  onPress={handleBackspace}
                  activeOpacity={0.7}
                >
                  <Ionicons name="backspace-outline" size={24} color="#000" />
                </TouchableOpacity>
              );
            }

            return (
              <TouchableOpacity
                key={i}
                style={styles.iosKey}
                onPress={() => handleDigitPress(key.n)}
                activeOpacity={0.7}
              >
                <Text style={styles.iosNumber}>{key.n}</Text>
                {key.l ? <Text style={styles.iosLetters}>{key.l}</Text> : null}
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
        </Animated.View>
      </View>
    </SafeAreaView>
  </Animated.View>
);
}

/* ---------- Styles ---------- */
const styles = StyleSheet.create({
  safe: {
  flex: 1,
  backgroundColor: "#F2F2F7",
},

  container: {
  flex: 1,
  paddingTop: Platform.OS === "ios" ? 16 : 24,
  paddingHorizontal: 8, // ← makes card wider
},


  tapContent: {
  flex: 1,
  alignItems: "center",
},

tapCardTop: {
  width: "100%",
  paddingHorizontal: 16,
  marginTop: Platform.OS === "ios" ? 90 : 70,
},

tapCardImage: {
  width: "100%",
  height: 220,
  borderRadius: 26,
},

tapCenter: {
  position: "absolute",
  top: "48%",
  alignItems: "center",
},

tapRing: {
  width: 100,
  height: 100,
  borderRadius: 50,
  borderWidth: 3,
  borderColor: "#007AFF",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 16,

  shadowColor: "#007AFF",
  shadowOpacity: 0.25,
  shadowRadius: 16,
  shadowOffset: { width: 0, height: 6 },
},

tapText: {
  fontSize: 17,
  fontWeight: "600",
  color: "#8E8E93",
},

tapOverlay: {
  ...StyleSheet.absoluteFillObject,   // 🔥 makes it full screen
  zIndex: 9999,                       // 🔥 ensures it sits above EVERYTHING
  elevation: 9999,                    // 🔥 Android safety
  backgroundColor: "#F2F2F7",         // Apple system background
},



  cardShadow: {
  borderRadius: 28,
  overflow: "visible",

  marginTop: 24,
  marginBottom: 56,

  marginHorizontal: -8, // ⭐️ KEY: pushes card closer to screen edges



  shadowColor: "#000",
  shadowOpacity: 0.55,           // ✅ heavy
  shadowRadius: 45,              // ✅ wide blur
  shadowOffset: { width: 0, height: 26 }, // ✅ deep drop

  elevation: 18,                 // ✅ Android depth
},

  card: {
  height: 240,   // true Apple Cash height

  borderRadius: 24,   // Apple curve
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
  backgroundColor: "#00A6FF", // Apple-style success green
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

cardClip: {
  borderRadius: 24,
  overflow: "hidden",
},


iosKey: {
  width: 66,        // was 72
  height: 66,       // was 72
  borderRadius: 33,

  backgroundColor: "#E5E5EA",
  alignItems: "center",
  justifyContent: "center",

  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 6,
  shadowOffset: { width: 0, height: 2 },

  elevation: 1,
},



iosNumber: {
  fontSize: 34,
  fontWeight: "500",
  color: "#000",
},

iosLetters: {
  fontSize: 11,
  fontWeight: "600",
  color: "#000",
  marginTop: -2,
  letterSpacing: 1,
},

inlineTap: {
  position: "absolute",
  top: "42%",
  left: 0,
  right: 0,
  alignItems: "center",
  justifyContent: "center",
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
  marginTop: 20,     // was 28
  marginBottom: 18,
},


  keypadRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 14,   // was 18
  paddingHorizontal: 28,
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

cardImage: {
  width: "104%", // ⭐️ slightly wider than container
  height: 240,
  borderRadius: 28,
  alignSelf: "center",
},



  bottomBar: {
  flexDirection: "row",
  alignItems: "center",
  marginTop: 8,
  marginBottom: 10,
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
    backgroundColor:  HELP_IO_BLACK,
    alignItems: "center",
    justifyContent: "center",
  },
});


