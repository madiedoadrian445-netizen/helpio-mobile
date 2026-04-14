import React, { useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  Animated,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import Svg, { Circle } from "react-native-svg";


import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";

const { width } = Dimensions.get("window");

export default function BusinessPlaceProductsScreen() {

  const navigation = useNavigation();
const buttonScale = useRef(new Animated.Value(1)).current;
  const scrollY = useRef(new Animated.Value(0)).current;
const floatY = useRef(new Animated.Value(0)).current;

React.useEffect(() => {
  Animated.loop(
    Animated.sequence([
      Animated.timing(floatY, {
        toValue: -6, // move up
        duration: 2000,
        useNativeDriver: true,
      }),
      Animated.timing(floatY, {
        toValue: 0, // back down
        duration: 2000,
        useNativeDriver: true,
      }),
    ])
  ).start();
}, []);


  // Header animation
  const headerTranslate = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [0, -40],
    extrapolate: "clamp",
  });

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 120],
    outputRange: [1, 0.7],
    extrapolate: "clamp",
  });


const DotPattern = () => {
  const dots = [];
  const centerX = 170;
  const centerY = 105;

  for (let r = 5; r < 130; r += 6) {
    const density = Math.max(8, Math.floor((2 * Math.PI * r) / 8));

    for (let i = 0; i < density; i++) {
      const angle = (i / density) * Math.PI * 2;

      const jitter = Math.random() * 2 - 1;

      const x = centerX + (r + jitter) * Math.cos(angle);
      const y = centerY + (r + jitter) * Math.sin(angle);

      const opacity = 1 - r / 140; // fade outward
      const size = r < 40 ? 1.8 : 1.2;

      dots.push(
        <Circle
          key={`${r}-${i}`}
          cx={x}
          cy={y}
          r={size}
          fill={`rgba(255,255,255,${opacity * 0.6})`}
        />
      );
    }
  }

  return (
    <Svg
      width="100%"
      height="100%"
      viewBox="0 0 300 200"
      style={{ position: "absolute" }}
    >
      {dots}
    </Svg>
  );
};

return (
  <View style={styles.container}>

    {/* CLOSE BUTTON */}
    <TouchableOpacity
      onPress={() => navigation.goBack()}
      activeOpacity={0.7}
      style={styles.closeButton}
    >
      <Ionicons name="close" size={24} color="#fff" />
    </TouchableOpacity>

    {/* Background */}
    <LinearGradient
      colors={["#80808cff", "#1A1A1F"]}
      style={StyleSheet.absoluteFill}
    />



      {/* Background */}
      <LinearGradient
        colors={["#80808cff", "#1A1A1F"]}
        style={StyleSheet.absoluteFill}
      />

      <Animated.ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 120 }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: true }
        )}
        scrollEventThrottle={16}
      >
        {/* Header */}
        <Animated.View
          style={[
            styles.header,
            {
              transform: [{ translateY: headerTranslate }],
              opacity: headerOpacity,
            },
          ]}
        >
          <Text style={styles.title}>Explore</Text>
          <Text style={styles.titleBold}>BusinessPlace Products</Text>
        </Animated.View>

       {/* Cards */}
<Animated.View
  style={[
    styles.cardGrid,
    {
      transform: [
        {
          translateY: scrollY.interpolate({
            inputRange: [0, 200],
            outputRange: [0, -12],
            extrapolate: "clamp",
          }),
        },
      ],
    },
  ]}
>
         <Card icon="document-outline" label="Invoicing" />
<Card icon="card-outline" label="Client Management" />
        </Animated.View>

        {/* Subtext */}
        <Text style={styles.subText}>Discover new features</Text>

        {/* Feature Card (parallax effect) */}
        <Animated.View
          style={[
            styles.featureCard,
            {
              transform: [
                {
                  translateY: scrollY.interpolate({
                    inputRange: [0, 300],
                    outputRange: [0, -40],
                    extrapolate: "clamp",
                  }),
                },
                {
                  scale: scrollY.interpolate({
                    inputRange: [0, 300],
                    outputRange: [1, 1.05],
                    extrapolate: "clamp",
                  }),
                },
              ],
            },
          ]}
        >
          <View style={styles.payCard}>



<LinearGradient
  colors={[
    "rgba(255,255,255,0.04)",
    "rgba(0,0,0,0.02)",
    "rgba(255,255,255,0.02)",
  ]}
  start={{ x: 0, y: 0 }}
  end={{ x: 1, y: 1 }}
  style={StyleSheet.absoluteFill}
/>



<LinearGradient
  colors={[
    "rgba(0,0,0,0.0)",
    "rgba(0,0,0,0.4)",
  ]}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  style={styles.vignette}
/>

  {/* Base */}
  <LinearGradient
    colors={["#0A0A0A", "#000000"]}
    style={StyleSheet.absoluteFill}
  />


<DotPattern />

<LinearGradient
  colors={[
    "rgba(0,0,0,0.0)",
    "rgba(0,0,0,0.6)",
  ]}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  style={StyleSheet.absoluteFill}
/>


<View style={styles.haloRing} />


  {/* Soft radial glow */}
  <View style={styles.centerGlow} />

  {/* Subtle noise / texture feel */}
  <LinearGradient
    colors={[
      "rgba(255,255,255,0.06)",
      "rgba(255,255,255,0.02)",
      "transparent",
    ]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={StyleSheet.absoluteFill}
  />

  {/* TOP */}
  <View style={styles.cardTop}>
    <Text style={styles.brand}>HELPIO</Text>
    <Text style={styles.visa}>VISA</Text>
  </View>

  {/* CENTER */}
  <View style={styles.centerIcon}>
    <Ionicons name="eye-outline" size={22} color="rgba(255,255,255,0.75)" />
  </View>

  {/* BOTTOM */}
  <View style={styles.cardBottom}>
    <Text style={styles.payLabel}>Helpio Pay</Text>
    <Text style={styles.cardNumber}>•••• 4242</Text>
  </View>
</View>


<View style={styles.handleContainer}>
  <View style={styles.handle} />
</View>




        </Animated.View>
      </Animated.ScrollView>
   
   
  <Animated.View
  style={[
    styles.floatingButtonContainer,
    {
      transform: [{ translateY: floatY }],
    },
  ]}
>
  <Animated.View style={styles.floatingShadow} />

  <TouchableOpacity
    activeOpacity={1}
    onPressIn={() => {
      Animated.spring(buttonScale, {
        toValue: 0.96,
        useNativeDriver: true,
      }).start();
    }}
    onPressOut={() => {
      Animated.spring(buttonScale, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }}
    onPress={() => navigation.navigate("ProviderOnboarding")}
  >
   <Animated.View
  style={[
    styles.floatingButton,
    { transform: [{ scale: buttonScale }] },
  ]}
>
  <LinearGradient
    colors={["#FFFFFF", "#F2F2F2"]}
    start={{ x: 0, y: 0 }}
    end={{ x: 1, y: 1 }}
    style={styles.buttonGradient}
  >
    <Text style={styles.floatingButtonText}>
      Try BusinessPlace
    </Text>
  </LinearGradient>
    </Animated.View>
  </TouchableOpacity>
</Animated.View>
</View>
  );
}





const Card = ({ icon, label }) => {
  const pressAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.94,
      tension: 220,
      friction: 18,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      tension: 220,
      friction: 18,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View
      style={[
        styles.cardWrapper,
        {
          transform: [{ scale: pressAnim }],
        },
      ]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
   

   <BlurView intensity={55} tint="light" style={styles.cardGlass}>



<LinearGradient
  colors={[
    "rgba(255,255,255,0.55)",
    "rgba(255,255,255,0.25)",
    "rgba(255,255,255,0.10)",
    "rgba(255,255,255,0.00)",
  ]}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  style={styles.appleGlass}
/>

        

        <LinearGradient
          colors={[
            "rgba(255,255,255,0.26)",
            "rgba(255,255,255,0.06)",
            "rgba(255,255,255,0.00)",
          ]}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={styles.topEdgeGlow}
        />

        <View style={styles.innerStroke} />


<LinearGradient
  colors={[
    "rgba(255,255,255,0.00)",
    "rgba(255,255,255,0.08)",
  ]}
  start={{ x: 0.5, y: 0 }}
  end={{ x: 0.5, y: 1 }}
  style={styles.bottomEdge}
/>



        <Animated.View
          style={[
            styles.cardContent,
            {
              opacity: pressAnim.interpolate({
                inputRange: [0.985, 1],
                outputRange: [0.96, 1],
              }),
            },
          ]}
        >



          
          <Ionicons name={icon} size={28} color="rgba(255,255,255,0.95)" />
          <Text style={styles.cardText}>{label}</Text>



          
        </Animated.View>
      </BlurView>
    </Animated.View>
  );
};





const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 20,
  },

  /* Header */
  header: {
    marginTop: 40,
    alignItems: "center",
  },
  title: {
    fontSize: 28,
    color: "#E5E7EB",
    fontWeight: "400",
    fontFamily: "System",
  },
  titleBold: {
    fontSize: 34,
    color: "#FFFFFF",
    fontWeight: "600",
    fontFamily: "System",
    textAlign: "center",
  },




vignette: {
  ...StyleSheet.absoluteFillObject,
},

closeButton: {
  position: "absolute",
  top: 60,
  left: 20,
  zIndex: 20,
  width: 40,
  height: 40,
  borderRadius: 20,
  justifyContent: "center",
  alignItems: "center",
  backgroundColor: "rgba(0,0,0,0.35)", // same iOS style
},

haloRing: {
  position: "absolute",
  width: 180,
  height: 180,
  borderRadius: 180,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.08)",
  alignSelf: "center",
  top: "32%",
},

floatingButtonContainer: {
  position: "absolute",
  bottom: 110,
  left: 0,
  right: 0,
  alignItems: "center",
},

floatingShadow: {
  position: "absolute",
  width: 180,
  height: 55,
  borderRadius: 40,
  backgroundColor: "#000",
  opacity: 0.12,
  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 15,
},

floatingButton: {
  borderRadius: 50,
  overflow: "hidden",
},
floatingButtonText: {
  color: "#111", // instead of pure black
  fontSize: 16,
  fontWeight: "600",
  letterSpacing: 0.3,
},

buttonGradient: {
  paddingVertical: 16,
  paddingHorizontal: 36,
  borderRadius: 50,
  alignItems: "center",
  justifyContent: "center",

  shadowColor: "#000",
  shadowOpacity: 0.25,
  shadowRadius: 20,
  shadowOffset: { width: 0, height: 10 },
  elevation: 20,
},





payCard: {
  width: "90%",
  height: "80%",
  borderRadius: 22,
  overflow: "hidden",
  backgroundColor: "#000",
  padding: 18,
  justifyContent: "space-between",
},

centerGlow: {
  position: "absolute",
  width: 160,
height: 160,
  borderRadius: 220,
  backgroundColor: "rgba(255,255,255,0.05)",
  alignSelf: "center",
 top: "36%",
},

cardTop: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

brand: {
  color: "#FFFFFF",
  fontSize: 18,
  fontWeight: "600",
  letterSpacing: 2,
},

visa: {
  color: "#FFFFFF",
  fontSize: 16,
  fontWeight: "500",
},

centerIcon: {
  position: "absolute",
  alignSelf: "center",
  top: "45%",
},

cardBottom: {
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
},

payLabel: {
  color: "rgba(255,255,255,0.85)",
  fontSize: 14,
},

cardNumber: {
  color: "#FFFFFF",
  fontSize: 16,
  letterSpacing: 2,
},










handleContainer: {
  marginTop: 30,
  alignItems: "center",
  justifyContent: "center",
},

handle: {
  width: 42,
  height: 5,
  borderRadius: 10,
  backgroundColor: "rgba(255,255,255,0.55)",
},



bottomEdge: {
  position: "absolute",
  left: 0,
  right: 0,
  bottom: 0,
  height: 20,
  borderBottomLeftRadius: 24,
  borderBottomRightRadius: 24,
},
  

topEdgeGlow: {
  position: "absolute",
  top: 0,
  left: 28,
  right: 28,
  height: 10, // ⬅️ MUCH thinner
  borderRadius: 20,
  opacity: 1.0,
},


  /* Cards */
  cardGrid: {
  marginTop: 42,
  flexDirection: "row",
  justifyContent: "space-between",
},



  cardText: {
  color: "rgba(255,255,255,0.96)",
  marginTop: 14,
  fontSize: 15,
  lineHeight: 18,
  textAlign: "center",
  fontFamily: "System",
  fontWeight: "500",
},


appleGlass: {
  ...StyleSheet.absoluteFillObject,
},

  cardWrapper: {
  width: width * 0.43,
  height: 122,
  borderRadius: 30,
},



cardGlass: {
  flex: 1,
  borderRadius: 30,
  overflow: "hidden",
backgroundColor: "rgba(255,255,255,0.18)",
  borderWidth: 1,
 borderColor: "rgba(255,255,255,0.45)",
},

innerStroke: {
  position: "absolute",
  top: 1,
  left: 1,
  right: 1,
  bottom: 1,
  borderRadius: 29,
  borderWidth: 1,
  borderColor: "rgba(255,255,255,0.05)",
},
cardContent: {
  flex: 1,
  justifyContent: "center",
  alignItems: "center",
  paddingHorizontal: 14,
  paddingTop: 4,
  transform: [{ scale: 1.02 }], // 👈 subtle “magnification”
},

  /* Subtext */
  subText: {
    marginTop: 30,
    color: "#D1D5DB",
    fontSize: 16,
    textAlign: "center",
    fontFamily: "System",
  },

  /* Feature */
  featureCard: {
    marginTop: 20,
    borderRadius: 28,
    overflow: "hidden",
    height: 280,
    backgroundColor: "#111",
    justifyContent: "center",
    alignItems: "center",
  },

  cameraMock: {
    width: "90%",
    height: "80%",
    borderRadius: 20,
  },
});
