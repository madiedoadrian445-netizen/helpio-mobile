import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
} from "react-native";
import HelpioGlobeIcon from "../components/HelpioGlobeIcon";
import { Animated, Dimensions, Easing } from "react-native";
import VerifyIdentityIDScanScreen from "./VerifyIdentityIDScanScreen";
import { useStripe } from "@stripe/stripe-react-native";
import { registerProvider } from "../api/auth";
import useAuthStore from "../store/auth";
const HELPIO_BLUE = "#00A6FF";
const { width } = Dimensions.get("window");
const formatPhoneToE164 = (phone) => {
  const digits = phone.replace(/\D/g, "");

  return digits.startsWith("1")
    ? `+${digits}`
    : `+1${digits}`;
};
/* ---------------- DATA ---------------- */

const LANGUAGES = [
  "English",
  "Español",
  "Deutsch",
  "Français",
  "Italiano",
  "Português",
  "Русский",
  "简体中文",
  "繁體中文",
  "日本語",
  "한국어",
];

const STEPS = [
  { title: "Language" },
  { title: "Helpio BusinessPlace ID" },
  { title: "Business name", subtitle: "Displayed to customers." },
  { title: "Business location", subtitle: "Enter your ZIP code." },
  { title: "Verify your phone", subtitle: "We’ll send a verification code." },
  { title: "Verify your identity" }
];




/* ---------------- SCREEN ---------------- */

export default function ProviderOnboardingScreen({ navigation }) {
  const [step, setStep] = useState(0);
  const [verifying, setVerifying] = useState(false);
const { presentIdentityVerificationSheet } = useStripe();
  const translateX = React.useRef(new Animated.Value(0)).current;

const [verificationCode, setVerificationCode] = useState("");
const [sendingCode, setSendingCode] = useState(false);
const [verifyingCode, setVerifyingCode] = useState(false);
const [cooldown, setCooldown] = useState(0);
const timerRef = React.useRef(null);
const [firstName, setFirstName] = useState("");
const [lastName, setLastName] = useState("");
const [email, setEmail] = useState("");
const [password, setPassword] = useState("");
const [phone, setPhone] = useState("");

const [businessName, setBusinessName] = useState("");
const [zipCode, setZipCode] = useState("");

const handleSendCode = async () => {
  try {
    console.log("CLICKED SEND CODE");

    if (sendingCode || cooldown > 0) {
      console.log("Blocked");
      return;
    }

    if (phone.length < 10) {
      console.log("Invalid phone");
      return;
    }

    setSendingCode(true);

    const finalPhone = formatPhoneToE164(phone);
    console.log("Formatted:", finalPhone);

    const res = await sendPhoneCodeRequest(finalPhone);
    console.log("API RESPONSE:", res);

    if (!res?.success) {
      console.log("Failed to send code");
      return;
    }

    console.log("Code sent ✅");

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    setCooldown(30);

    const newTimer = setInterval(() => {
      setCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(newTimer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    timerRef.current = newTimer;

  } catch (err) {
    console.log("Send code error:", err);
  } finally {
    setSendingCode(false);
  }
};

useEffect(() => {
  return () => {


    if (timerRef.current) {
      clearInterval(timerRef.current);
    }
  };
}, []);

const sendPhoneCodeRequest = async (phone) => {
  const res = await fetch(
    "https://helpio-backend.onrender.com/api/auth/send-phone-code",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    }
  );

  return res.json();
};

const verifyPhoneCodeRequest = async (phone, code) => {
  const res = await fetch(
    "https://helpio-backend.onrender.com/api/auth/verify-phone-code",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, code }),
    }
  );

  return res.json();
};

const handleRegisterProvider = async () => {
  try {
    console.log("REGISTER INPUTS:", {
      firstName,
      lastName,
      email,
      password,
      businessName,
      zipCode,
      phone,
    });

    // 🔴 VALIDATION (more informative)
    if (!firstName) {
      console.log("Missing: firstName");
      return;
    }
    if (!lastName) {
      console.log("Missing: lastName");
      return;
    }
    if (!email) {
      console.log("Missing: email");
      return;
    }
    if (!password) {
      console.log("Missing: password");
      return;
    }
    if (!businessName) {
      console.log("Missing: businessName");
      return;
    }
    if (!zipCode) {
      console.log("Missing: zipCode");
      return;
    }
    if (!phone) {
      console.log("Missing: phone");
      return;
    }

    // ✅ REGISTER
 const data = await registerProvider({
  name: `${firstName} ${lastName}`,
  email: email.trim().toLowerCase(),
  password: password.trim(),
  companyName: businessName.trim(),
  phone: formatPhoneToE164(phone), // 🔥 REQUIRED
});

    console.log("REGISTER RESPONSE:", data);

    if (!data?.token || !data?.user) {
      throw new Error("Invalid register response");
    }

    await useAuthStore.getState().setAuth({
      token: data.token,
      user: data.user,
      provider: { _id: data.user.providerId },
    });

    console.log("REGISTER SUCCESS ✅");

    // 👉 MOVE TO NEXT STEP
    setStep(5);

  } catch (err) {
    console.log("Register error:", err);
  }
};






const startStripeVerification = async () => {
  if (verifying) return;

  setVerifying(true);

  try {

   
    const token = useAuthStore.getState().token;
console.log("AUTH TOKEN BEFORE STRIPE:", token);
   

    if (!token) {
      console.log("Missing auth token");
      return;
    }

    const response = await fetch(
      "https://helpio-backend.onrender.com/api/stripe/create-verification-session",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      const text = await response.text();
      console.log("Stripe backend error:", text);
      throw new Error("Failed to create verification session");
    }

    const { clientSecret } = await response.json();

    if (!clientSecret) {
      throw new Error("Missing Stripe client secret");
    }

    const { error } = await presentIdentityVerificationSheet({
      verificationSessionClientSecret: clientSecret,
    });

    // User cancelled verification
    if (error?.code === "Canceled") {
      console.log("User cancelled verification");
      return;
    }

    // Real Stripe error
    if (error) {
      console.log("Stripe verification error:", error);
      return;
    }

    // Verification flow completed
    animateNext();

  } catch (err) {
    console.log("Verification error:", err);
  } finally {
    setVerifying(false);
  }
};

 const animateNext = async () => {
if (step === 4) {
  try {
    if (verificationCode.length !== 6) {
      console.log("Code incomplete");
      return;
    }

    setVerifyingCode(true);

    const finalPhone = formatPhoneToE164(phone);

  const res = await verifyPhoneCodeRequest(
  finalPhone,
  verificationCode
);

console.log("VERIFY RESPONSE:", res);

// ❌ REMOVE success check
// ✅ ONLY block if backend explicitly sends error
if (!res?.success) {
  console.log("Verification failed:", res?.message);
  return;
}

console.log("Code verified ✅");

await handleRegisterProvider();

  } catch (err) {
    console.log("Verify error:", err);
  } finally {
    setVerifyingCode(false);
  }

  return;
}


  if (step === STEPS.length - 1) {
    navigation.replace("MainTabs");
    return;
  }

  Animated.sequence([
    Animated.timing(translateX, {
      toValue: -width,
      duration: 320,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }),
  ]).start(() => {
    translateX.setValue(width);
    setStep(prev => prev + 1);

    Animated.timing(translateX, {
      toValue: 0,
      duration: 320,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      useNativeDriver: true,
    }).start();
  });
};




  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.inner}
      >
        {/* Brand */}
        <Text style={styles.brand}></Text>

        {/* Progress (hidden on language step) */}
        {step !== 0 && (
          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${((step + 1) / STEPS.length) * 100}%` },
              ]}
            />
          </View>
        )}
<Animated.View
  pointerEvents="box-none"
  style={[
    styles.content,
    { transform: [{ translateX }] },
  ]}
>
  {step === 0 ? (
  <LanguageStep onSelect={animateNext} />

) : step === 1 ? (
  <AppleIDInput
    firstName={firstName}
    setFirstName={setFirstName}
    lastName={lastName}
    setLastName={setLastName}
    email={email}
    setEmail={setEmail}
    password={password}
    setPassword={setPassword}
    phone={phone}
    setPhone={setPhone}
  />

) : step === 5 ? (
 <VerifyIdentityIDScanScreen
  onContinue={startStripeVerification}
  verifying={verifying}
/>


) : (
  <>
    <Text style={styles.title}>{STEPS[step].title}</Text>
    {STEPS[step].subtitle && (
      <Text style={styles.subtitle}>{STEPS[step].subtitle}</Text>
    )}
 {renderInput(step, {
  businessName,
  setBusinessName,
  zipCode,
  setZipCode,
  phone,
  setPhone,
  sendingCode,
  cooldown,
  verificationCode,
  setVerificationCode,
  verifyingCode,
  animateNext,
  timerRef,
  setCooldown,
  setSendingCode,
  handleSendCode,
})}



  </>
)}


</Animated.View>


        {/* Continue */}
      {step !== 0 && step !== 5 && (



 <TouchableOpacity
  style={styles.continueBtn}
  onPress={animateNext}
  disabled={
    verifyingCode ||
    (step === 4 && verificationCode.length !== 6)
  }
>


   <Text style={styles.continueText}>
  {step === 4
    ? (verifyingCode ? "VERIFYING..." : "VERIFY PHONE")
    : "CREATE ID"}
</Text>

  </TouchableOpacity>
)}

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

/* ---------------- LANGUAGE STEP ---------------- */

function LanguageStep({ onSelect }) {
  return (
    <View style={styles.languageWrap}>
      <View style={{ alignItems: "center", marginBottom: 22 }}>
        <HelpioGlobeIcon size={68} color={HELPIO_BLUE} />
      </View>

      <View style={styles.languageGroup}>
        {LANGUAGES.map((lang, index) => (
          <TouchableOpacity
            key={lang}
            style={[
              styles.languageRow,
              index === LANGUAGES.length - 1 && { borderBottomWidth: 0 },
            ]}
            activeOpacity={0.6}
            onPress={onSelect}
          >
            <Text style={styles.languageText}>{lang}</Text>
            <Text style={styles.chevron}>›</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

/* ---------------- APPLE ID INPUT ---------------- */

function AppleIDInput({
  firstName,
  setFirstName,
  lastName,
  setLastName,
  email,
  setEmail,
  password,
  setPassword,
  phone,
  setPhone,
}) {
  return (
    <View>
      <Text style={styles.title}>Helpio BusinessPlace ID</Text>

      <Text style={styles.subtitle}>
        Your account is used to access provider tools, payments, and secure
        services.
      </Text>

      {/* First + Last Name */}
      <View style={styles.row}>
        <View style={[styles.appleInputWrap, styles.half]}>
       <TextInput
  placeholder="First name"
  value={firstName}
  onChangeText={setFirstName}
  placeholderTextColor="#8E8E93"
  style={styles.appleInput}
/>
        </View>

        <View style={[styles.appleInputWrap, styles.half]}>
         <TextInput
  placeholder="Last name"
  value={lastName}
  onChangeText={setLastName}
  placeholderTextColor="#8E8E93"
  style={styles.appleInput}
/>
        </View>
      </View>

      {/* Email */}
      <View style={styles.appleInputWrap}>
        <TextInput
  placeholder="Email address"
  value={email}
  onChangeText={setEmail}
  placeholderTextColor="#8E8E93"
  keyboardType="email-address"
  autoCapitalize="none"
  style={styles.appleInput}
/>
      </View>

      {/* Password */}
      <View style={styles.appleInputWrap}>
        <TextInput
  placeholder="Password"
  value={password}
  onChangeText={setPassword}
  placeholderTextColor="#8E8E93"
  secureTextEntry
  style={styles.appleInput}
/>
      </View>

      {/* Phone */}
      <View style={styles.appleInputWrap}>
       <TextInput
  placeholder="Phone number"
  value={phone}
  onChangeText={setPhone}
  placeholderTextColor="#8E8E93"
  keyboardType="phone-pad"
  style={styles.appleInput}
/>
      </View>

      <Text style={styles.appleFootnote}>
        Your Helpio BusinessPlace ID is used to access provider tools, payments,
        subscriptions, and secure services.
      </Text>
    </View>
  );
}

/* ---------------- OTHER INPUTS ---------------- */

function renderInput(step, {
  businessName,
  setBusinessName,
  zipCode,
  setZipCode,
  phone,
  setPhone,
  sendingCode,
  cooldown,
  verificationCode,
  setVerificationCode,
  verifyingCode,
  animateNext,
  timerRef,
  setCooldown,
  setSendingCode,
  handleSendCode,
}) {



  switch (step) {
    case 2:
  return (
    <View>
      <View style={styles.appleInputWrap}>
      <TextInput
  placeholder="Business name"
  value={businessName}
  onChangeText={setBusinessName}
  placeholderTextColor="#8E8E93"
  autoCapitalize="words"
  style={styles.appleInput}
/>
      </View>

      <Text style={styles.appleFootnote}>
        Your business name will be displayed on your listings by default to help
        customers recognize and trust your services.
      </Text>
    </View>
  );


   case 3:
  return (
    <View>
      <View style={styles.appleInputWrap}>
      <TextInput
  placeholder="ZIP code"
  value={zipCode}
  onChangeText={setZipCode}
  placeholderTextColor="#8E8E93"
  keyboardType="numeric"
  style={styles.appleInput}
/>
      </View>

      <Text style={styles.appleFootnote}>
        Your ZIP code helps clients discover your business within their area and
        allows your services to appear in nearby searches.
      </Text>
    </View>
  );


    case 4:
  return (
    <View>
      {/* Phone Number */}
      <View style={styles.appleInputWrap}>
     <TextInput
  placeholder="Phone number"
  value={phone}
 onChangeText={(text) => {
  const digits = text.replace(/\D/g, "").slice(0, 10);
  setPhone(digits);
}}
  keyboardType="phone-pad"
  placeholderTextColor="#8E8E93"
  style={styles.appleInput}
/>
      </View>



<View style={{ zIndex: 10, elevation: 10 }}>
  <TouchableOpacity
    activeOpacity={0.7}
    onPress={() => {
      console.log("PRESS WORKING");
      handleSendCode();
    }}
    disabled={sendingCode || cooldown > 0}
    style={{
      marginTop: 10,
      backgroundColor:
        sendingCode || cooldown > 0 ? "#D1D5DB" : "#E5E7EB",
      padding: 12,
      opacity: sendingCode || cooldown > 0 ? 0.6 : 1,
      borderRadius: 10,
      alignItems: "center",
    }}
  >
    <Text
      style={{
        color: sendingCode || cooldown > 0 ? "#6B7280" : "#000",
        fontWeight: "500",
      }}
    >
      {sendingCode
        ? "Sending..."
        : cooldown > 0
        ? `Resend in ${cooldown}s`
        : "Send Code"}
    </Text>
  </TouchableOpacity>
</View>




      {/* Verification Code */}
      <View style={styles.appleInputWrap}>
      <TextInput
  maxLength={6}
  placeholder="Verification code"
  value={verificationCode}
 onChangeText={(text) => {
  setVerificationCode(text);


}}
  keyboardType="numeric"
  style={[
  styles.appleInput,
  { textAlign: "center", letterSpacing: 6 }
]}
/>
      </View>






      <Text style={styles.appleFootnote}>
        Verifying your phone number helps Helpio maintain a trusted marketplace,
        prevent fraud, and ensure safe communication between providers and
        clients.
      </Text>
    </View>
  );


    

    default:
      return null;
  }
}


function Input(props) {
  return (
    <TextInput
      {...props}
      style={styles.input}
      placeholderTextColor="#9CA3AF"
    />
  );
}

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
  flex: 1,
  backgroundColor: "#FFFFFF",
},


  inner: {
  flex: 1,
  backgroundColor: "#FFFFFF",
  paddingTop: Platform.OS === "ios" ? 56 : 40,
  overflow: "hidden",
},


  brand: {
    fontSize: 15,
    fontWeight: "600",
    color: HELPIO_BLUE,
    marginBottom: 20,
  },

  progressTrack: {
    height: 2,
    backgroundColor: "rgba(0,0,0,0.12)",
    marginBottom: 32,
  },

  progressFill: {
    height: "100%",
    backgroundColor: HELPIO_BLUE,
  },

 content: {
  flex: 1,
  width: width,
  paddingHorizontal: 28, // 🔥 MOVE IT HERE
},


 title: {
  fontFamily: Platform.OS === "ios" ? "SFProDisplay-Semibold" : undefined,
  fontSize: 28,
  fontWeight: Platform.OS === "ios" ? "600" : "bold",
  letterSpacing: -0.4,
  lineHeight: 34,
  color: "#000",
  marginBottom: 6,
},


 subtitle: {
  fontFamily: Platform.OS === "ios" ? "SFProText-Regular" : undefined,
  fontSize: 16,
  fontWeight: "400",
  letterSpacing: -0.2,
  lineHeight: 22,
  color: "#3C3C4399", // iOS secondary label
  marginBottom: 24,
},


  input: {
    height: 52,
    borderBottomWidth: 1,
    borderColor: "#D1D5DB",
    fontSize: 17,
    marginBottom: 28,
    color: "#111827",
  },

  info: {
    fontSize: 16,
    color: "#374151",
    lineHeight: 24,
    marginTop: 10,
  },

  continueBtn: {
  height: 48,                  // 🔽 slightly shorter
  borderRadius: 24,            // 🔥 perfect pill
  backgroundColor: HELPIO_BLUE,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: Platform.OS === "ios" ? 28 : 18,

  marginHorizontal: 28,        // 🔥 NOT full width (Apple style)
},


  continueText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },

  /* -------- Apple ID Input -------- */

  appleInputWrap: {
  height: 52,
  borderRadius: 12,
  backgroundColor: "#FFFFFF",
  borderWidth: 1,
  borderColor: "#D1D1D6",
  justifyContent: "center",
  paddingHorizontal: 14,
  marginBottom: 10,
},

 appleInput: {
  fontFamily: Platform.OS === "ios" ? "SFProText-Regular" : undefined,
  fontSize: 17,
  letterSpacing: -0.2,
  color: "#000",
},


  appleLink: {
    fontSize: 14,
    color: HELPIO_BLUE,
    marginTop: 8,
    marginBottom: 18,
  },

  appleFootnote: {
  fontFamily: Platform.OS === "ios" ? "SFProText-Regular" : undefined,
  fontSize: 12,
  letterSpacing: 0,
  lineHeight: 16,
  color: "#3C3C434D", // iOS tertiary label
},


  /* -------- Language -------- */

  languageWrap: {
    marginTop: 8,
  },

  languageGroup: {
  backgroundColor: "#f8f6f6d2",
  borderRadius: 16,
  overflow: "hidden",
  borderWidth: StyleSheet.hairlineWidth,
  borderColor: "#D1D1D6",
},


  languageRow: {
    height: 56,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: "#dedee0ff",
  },

  languageText: {
  fontFamily: Platform.OS === "ios" ? "SFProText-Regular" : undefined,
  fontSize: 17,
  letterSpacing: -0.2,
  color: "#000",
},


  chevron: {
    fontSize: 22,
    color: "#C7C7CC",
  },
});
