import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as LocalAuthentication from "expo-local-authentication";
import * as SecureStore from "expo-secure-store";

import { useTheme } from "../ThemeContext";
import useAuthStore from "../store/auth";
import { login as loginApi } from "../api/auth";
import { api } from "../config/api";

const HELP_BLUE = "#00A6FF";

// SecureStore keys
const SS_EMAIL = "helpio_login_email";
const SS_PASSWORD = "helpio_login_password";

export default function LoginScreen({ navigation }) {
  const { theme } = useTheme();
  const isDark = !!theme?.isDark;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [secure, setSecure] = useState(true);
  const [loading, setLoading] = useState(false);

  const [bioReady, setBioReady] = useState(false);
  const [bioLabel, setBioLabel] = useState("Face ID");
  const [hasSavedCreds, setHasSavedCreds] = useState(false);
  const [bioLoading, setBioLoading] = useState(false);

  const tint = useMemo(() => (isDark ? "dark" : "light"), [isDark]);

  useEffect(() => {
    (async () => {
      try {
        const compatible = await LocalAuthentication.hasHardwareAsync();
        const enrolled = await LocalAuthentication.isEnrolledAsync();

        if (!compatible || !enrolled) {
          setBioReady(false);
          return;
        }

        // Determine label (Face ID / Touch ID)
        const types = await LocalAuthentication.supportedAuthenticationTypesAsync();
        const hasFace = types.includes(
          LocalAuthentication.AuthenticationType.FACIAL_RECOGNITION
        );
        const hasFinger = types.includes(
          LocalAuthentication.AuthenticationType.FINGERPRINT
        );

        setBioLabel(hasFace ? "Face ID" : hasFinger ? "Touch ID" : "Biometrics");
        setBioReady(true);

        const savedEmail = await SecureStore.getItemAsync(SS_EMAIL);
        const savedPass = await SecureStore.getItemAsync(SS_PASSWORD);
        setHasSavedCreds(!!savedEmail && !!savedPass);

        // Optional: prefill email for convenience (Apple does this)
        if (savedEmail && !email) setEmail(savedEmail);
      } catch {
        setBioReady(false);
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const saveCreds = async (em, pw) => {
    try {
      await SecureStore.setItemAsync(SS_EMAIL, em, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      await SecureStore.setItemAsync(SS_PASSWORD, pw, {
        keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
      });
      setHasSavedCreds(true);
    } catch {
      // If SecureStore fails, we still allow login; just no Face ID shortcut
    }
  };

  const performLogin = async (em, pw, { fromBiometric } = {}) => {
    if (!em || !pw) {
      Alert.alert("Missing Fields", "Enter email and password.");
      return;
    }

    if (fromBiometric) setBioLoading(true);
    else setLoading(true);

    try {
      const data = await loginApi(em, pw);

      if (!data?.token || !data?.user) {
        throw new Error("Invalid login response");
      }

      let provider = null;
      try {
        const res = await api.get("/api/providers/me");
        provider = res.data?.provider || null;
      } catch {}

      await useAuthStore.getState().setAuth({
        token: data.token,
        user: data.user,
        provider,
      });

      // Save creds AFTER successful login (so Face ID can work next time)
      await saveCreds(em, pw);

      setLoading(false);
      setBioLoading(false);
    } catch (err) {
      setLoading(false);
      setBioLoading(false);

      Alert.alert(
        "Login Failed",
        err?.response?.data?.message || err.message || "Invalid credentials"
      );
    }
  };

  const handleLogin = () => performLogin(email.trim(), password);

  const handleBiometricLogin = async () => {
    try {
      if (!bioReady) return;

      const savedEmail = await SecureStore.getItemAsync(SS_EMAIL);
      const savedPass = await SecureStore.getItemAsync(SS_PASSWORD);

      if (!savedEmail || !savedPass) {
        Alert.alert(
          "Set up biometrics",
          "Please sign in once with your email and password to enable Face ID."
        );
        return;
      }

      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: `Continue with ${bioLabel}`,
        cancelLabel: "Cancel",
        fallbackLabel: "Use Passcode",
        disableDeviceFallback: false,
      });

      if (!result.success) return;

      // Auto sign-in with stored credentials
      await performLogin(savedEmail, savedPass, { fromBiometric: true });
    } catch {
      Alert.alert("Biometric Error", "Unable to use biometrics right now.");
      setBioLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      {/* NAV */}
      <View style={styles.nav}>
        <Text style={[styles.navTitle, { color: theme.text }]}>Helpio</Text>
        <Ionicons name="ellipsis-horizontal" size={22} color={theme.text} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.center}>
          {/* LOGO */}
          <View style={styles.logoWrap}>
            <Ionicons name="hand-left" size={38} color="#fff" />
          </View>

          {/* TITLE */}
          <Text style={[styles.title, { color: theme.text }]}>
            Sign in with{"\n"}Helpio Account
          </Text>

          {/* EMAIL */}
          <TextInput
            placeholder="Email or Phone Number"
            placeholderTextColor="#8E8E93"
            value={email}
            onChangeText={setEmail}
            style={styles.input}
            autoCapitalize="none"
            keyboardType="email-address"
          />

          {/* PASSWORD */}
          <View style={styles.passwordWrap}>
            <TextInput
              placeholder="Password"
              placeholderTextColor="#8E8E93"
              secureTextEntry={secure}
              value={password}
              onChangeText={setPassword}
              style={styles.passwordInput}
              autoCapitalize="none"
            />
            <TouchableOpacity onPress={() => setSecure(!secure)}>
              <Ionicons
                name={secure ? "eye-off-outline" : "eye-outline"}
                size={20}
                color="#8E8E93"
              />
            </TouchableOpacity>
          </View>

          {/* CONTINUE */}
          <TouchableOpacity
            style={styles.continueBtn}
            onPress={handleLogin}
            disabled={loading || bioLoading}
            activeOpacity={0.9}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.continueText}>Continue</Text>
            )}
          </TouchableOpacity>

          {/* FACE ID */}
          {bioReady && hasSavedCreds && (
            <TouchableOpacity
              style={styles.bioBtn}
              onPress={handleBiometricLogin}
              disabled={loading || bioLoading}
              activeOpacity={0.9}
            >
              {bioLoading ? (
                <ActivityIndicator color={HELP_BLUE} />
              ) : (
                <>
                  <Ionicons name="scan-outline" size={20} color={HELP_BLUE} />
                  <Text style={styles.bioText}>Continue with {bioLabel}</Text>
                </>
              )}
            </TouchableOpacity>
          )}

          {/* CREATE ACCOUNT */}
         <TouchableOpacity onPress={() => navigation.navigate("Register")}>

            <Text style={styles.createText}>Create Your Helpio Account</Text>
          </TouchableOpacity>

          {/* SOCIAL LOGIN */}
          <View style={styles.socialStack}>
            <SocialButton icon="logo-google" text="Log in with Google" />
            <SocialButton icon="logo-facebook" text="Log in with BusinessPlace ID" />
            <SocialButton icon="logo-apple" text="Log in with Apple" />
          </View>

          {/* DIVIDER */}
          <View style={styles.dividerRow}>
            <View style={styles.line} />
            <Text style={styles.or}>or</Text>
            <View style={styles.line} />
          </View>

          {/* PROVIDER */}
          <TouchableOpacity onPress={() => navigation.navigate("ProviderOnboarding")}>
            <Text style={styles.provider}>Become a provider</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function SocialButton({ icon, text }) {
  return (
    <TouchableOpacity activeOpacity={0.85} style={styles.socialBtn}>
      <Ionicons name={icon} size={22} color="#000" />
      <Text style={styles.socialText}>{text}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  flex: { flex: 1 },

  nav: {
    height: 52,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 18,
  },
  navTitle: { fontSize: 20, fontWeight: "600" },

  center: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 28,
  },

  logoWrap: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: HELP_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 20,
    marginBottom: 24,

    shadowColor: HELP_BLUE,
    shadowOpacity: 0.45,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 12 },
    elevation: 12,
  },

  title: {
    fontSize: 30,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    letterSpacing: -0.2,
  },

  input: {
    width: "100%",
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D1D6",
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: "#fff",
    marginBottom: 12,
  },

  passwordWrap: {
    width: "100%",
    height: 56,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#D1D1D6",
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  passwordInput: { flex: 1, fontSize: 16 },

  continueBtn: {
    width: "100%",
    height: 56,
    borderRadius: 18,
    backgroundColor: HELP_BLUE,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,

    shadowColor: HELP_BLUE,
    shadowOpacity: 0.5,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 },
    elevation: 10,
  },
  continueText: { color: "#fff", fontSize: 17, fontWeight: "600" },

  bioBtn: {
    width: "100%",
    height: 52,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(0,166,255,0.35)",
    backgroundColor: "rgba(0,166,255,0.06)",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginBottom: 18,
  },
  bioText: {
    color: HELP_BLUE,
    fontSize: 16,
    fontWeight: "600",
  },

  createText: { color: HELP_BLUE, fontSize: 15, marginBottom: 24 },

  socialStack: { width: "100%", gap: 12 },

  socialBtn: {
    height: 54,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    backgroundColor: "#fff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,

    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  socialText: { fontSize: 16, fontWeight: "500" },

  dividerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 24,
    marginBottom: 10,
    width: "100%",
  },
  line: { flex: 1, height: 1, backgroundColor: "#E5E5EA" },
  or: { marginHorizontal: 10, color: "#8E8E93", fontSize: 14 },

  provider: { color: HELP_BLUE, fontSize: 16, fontWeight: "500" },
});
