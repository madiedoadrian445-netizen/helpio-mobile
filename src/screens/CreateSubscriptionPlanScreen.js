// src/screens/CreateSubscriptionPlanScreen.js
import React, { useState, memo, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Switch,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "../ThemeContext";
import { api } from "../config/api";

const HELP_BLUE = "#00A6FF";

/* -------------------------------------------------------
   ⭐ MEMOIZED COMPONENTS
--------------------------------------------------------*/

const CardBase = ({ children, style, isLight }) => (
  <BlurView
    intensity={55}
    tint={isLight ? "light" : "dark"}
    style={[styles.card, style]}
  >
    {children}
  </BlurView>
);
const Card = memo(CardBase);

const SectionLabelBase = ({ title, subtitle, theme }) => (
  <View style={styles.sectionLabelWrap}>
    <Text style={[styles.sectionLabelText, { color: theme.subtleText }]}>
      {title}
    </Text>
    {subtitle ? (
      <Text style={[styles.sectionSubtitleText, { color: theme.subtleText }]}>
        {subtitle}
      </Text>
    ) : null}
  </View>
);
const SectionLabel = memo(SectionLabelBase);

const SegChipBase = ({ label, active, onPress, compact, isLight, theme }) => (
  <TouchableOpacity
    onPress={onPress}
    activeOpacity={0.85}
    style={[
      styles.chip,
      compact && styles.chipCompact,
      active && {
        backgroundColor: isLight
          ? "rgba(0,166,255,0.15)"
          : "rgba(0,166,255,0.25)",
        borderColor: HELP_BLUE,
      },
    ]}
  >
    <Text
      style={[
        styles.chipText,
        compact && styles.chipTextCompact,
        { color: active ? HELP_BLUE : theme.subtleText },
      ]}
    >
      {label}
    </Text>
  </TouchableOpacity>
);
const SegChip = memo(SegChipBase);

const ToggleRowBase = ({
  label,
  description,
  value,
  onValueChange,
  theme,
  isLight,
}) => (
  <View style={styles.toggleRow}>
    <View style={{ flex: 1 }}>
      <Text style={[styles.rowLabel, { color: theme.text }]}>{label}</Text>
      {description ? (
        <Text style={[styles.rowSubLabel, { color: theme.subtleText }]}>
          {description}
        </Text>
      ) : null}
    </View>
    <Switch
      value={value}
      onValueChange={onValueChange}
      thumbColor={value ? "#ffffff" : isLight ? "#f2f2f7" : "#1c1c1e"}
      trackColor={{
        false: isLight ? "#d1d1d6" : "#3a3a3c",
        true: HELP_BLUE,
      }}
    />
  </View>
);
const ToggleRow = memo(ToggleRowBase);

/* -------------------------------------------------------
   MAIN SCREEN
--------------------------------------------------------*/

export default function CreateSubscriptionPlanScreen({ navigation, route }) {
  const insets = useSafeAreaInsets();
  const { darkMode, theme } = useTheme();
  const isLight = !darkMode;

  const existingPlan = route?.params?.plan || null;

  const [planName, setPlanName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  const [billingFrequency, setBillingFrequency] = useState("monthly");
  const [customIntervalCount, setCustomIntervalCount] = useState("1");
  const [customIntervalUnit, setCustomIntervalUnit] = useState("months");

  const [autoBilling, setAutoBilling] = useState(true);
  const [maxCycles, setMaxCycles] = useState("");
  const [prorateChanges, setProrateChanges] = useState(true);

  const [hasTrial, setHasTrial] = useState(false);
  const [trialLength, setTrialLength] = useState("7");
  const [trialUnit, setTrialUnit] = useState("days");

  const [allowPause, setAllowPause] = useState(true);
  const [reminderEnabled, setReminderEnabled] = useState(true);
  const [reminderDays, setReminderDays] = useState(3);

  const [minCyclesLock, setMinCyclesLock] = useState(false);
  const [minCycles, setMinCycles] = useState("3");

  const [isMinCyclesFocused, setIsMinCyclesFocused] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  /* -------------------------------------------------------
     PREFILL EDIT MODE (patched for planName)
  --------------------------------------------------------*/
  useEffect(() => {
    if (!existingPlan) return;

    setPlanName(existingPlan.planName || "");
    setDescription(existingPlan.description || "");

    if (existingPlan.price != null) {
      setPrice(String(existingPlan.price));
    }

    if (existingPlan.billingFrequency) {
      setBillingFrequency(existingPlan.billingFrequency);
    }

    if (existingPlan.customInterval?.every != null) {
      setCustomIntervalCount(String(existingPlan.customInterval.every));
    }

    if (existingPlan.customInterval?.unit) {
      setCustomIntervalUnit(existingPlan.customInterval.unit);
    }

    if (typeof existingPlan.autoBilling === "boolean") {
      setAutoBilling(existingPlan.autoBilling);
    }

    if (existingPlan.maxCycles != null) {
      setMaxCycles(String(existingPlan.maxCycles));
    }

    if (typeof existingPlan.prorateChanges === "boolean") {
      setProrateChanges(existingPlan.prorateChanges);
    }

    if (existingPlan.trial?.length != null) {
      setHasTrial(true);
      setTrialLength(String(existingPlan.trial.length));
      setTrialUnit(existingPlan.trial.unit || "days");
    }

    if (typeof existingPlan.allowPause === "boolean") {
      setAllowPause(existingPlan.allowPause);
    }

    if (existingPlan.reminder?.daysBefore != null) {
      setReminderEnabled(true);
      setReminderDays(existingPlan.reminder.daysBefore);
    }

    if (existingPlan.minCyclesLock?.minCycles != null) {
      setMinCyclesLock(true);
      setMinCycles(String(existingPlan.minCyclesLock.minCycles));
    }
  }, [existingPlan]);

  /* -------------------------------------------------------
     PATCHED PAYLOAD (uses planName)
  --------------------------------------------------------*/
  const onCreatePlan = async () => {
    if (submitting) return;

    const trimmedName = planName.trim();
    const numericPrice = Number(price || "0");

    if (!trimmedName || !numericPrice) return;

    const payload = {
      planName: trimmedName, // 🔥 FIXED
      description,
      price: numericPrice,
      billingFrequency,
      customInterval:
        billingFrequency === "custom"
          ? {
              every: Number(customIntervalCount || "1"),
              unit: customIntervalUnit,
            }
          : null,
      autoBilling,
      maxCycles: maxCycles ? Number(maxCycles) : null,
      prorateChanges,
      hasTrial,
      trial: hasTrial
        ? { length: Number(trialLength || "0"), unit: trialUnit }
        : null,
      allowPause,
      reminder: reminderEnabled ? { daysBefore: reminderDays } : null,
      minCyclesLock: minCyclesLock
        ? { minCycles: Number(minCycles || "0") }
        : null,
    };

    try {
      setSubmitting(true);

      if (existingPlan?._id) {
        await api.put(`/api/subscription-plans/${existingPlan._id}`, payload);
      } else {
        await api.post(`/api/subscription-plans`, payload);
      }

      navigation.goBack();
    } catch (err) {
      console.log(
        "❌ Error saving subscription plan",
        err.response?.data || err.message
      );
    } finally {
      setSubmitting(false);
    }
  };

  const onSaveDraft = () => navigation.goBack();

  /* -------------------------------------------------------
     RENDER
  --------------------------------------------------------*/
  return (
    <View style={styles.container}>
      <LinearGradient
        colors={isLight ? ["#e7f4ff", "#f7fbff"] : ["#050608", "#050814"]}
        style={StyleSheet.absoluteFill}
      />

      <BlurView
        intensity={isLight ? 15 : 25}
        tint={isLight ? "light" : "dark"}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 5 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <BlurView
            tint={isLight ? "light" : "dark"}
            intensity={40}
            style={styles.backBlur}
          >
            <Ionicons
              name="chevron-back"
              size={22}
              color={isLight ? "#0a0a0a" : "#f5f5f5"}
            />
          </BlurView>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>
            {existingPlan ? "Edit Subscription Plan" : "New Subscription Plan"}
          </Text>
          <Text style={[styles.headerSubtitle, { color: theme.subtleText }]}>
            Helpio Pay • Recurring
          </Text>
        </View>

        <View style={{ width: 40 }} />
      </View>

      {/* Content */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={insets.bottom + 10}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: (isMinCyclesFocused ? 10 : 100) + insets.bottom,
            paddingHorizontal: 20,
            paddingTop: insets.top - 55,
          }}
        >
          {/* ---- Plan Details ---- */}
          <SectionLabel
            title="Plan Details"
            subtitle="What your client sees on their invoice and receipts."
            theme={theme}
          />
          <Card isLight={isLight}>
            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.subtleText }]}>
                Plan name
              </Text>
              <TextInput
                value={planName}
                onChangeText={setPlanName}
                placeholder="Ex: Bi-Weekly Wash & Wax"
                placeholderTextColor={isLight ? "#A1A1AA" : "#6e6e73"}
                style={[styles.textInput, { color: theme.text }]}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={[styles.inputLabel, { color: theme.subtleText }]}>
                Description
              </Text>
              <TextInput
                value={description}
                onChangeText={setDescription}
                placeholder="Optional details your client will see"
                placeholderTextColor={isLight ? "#A1A1AA" : "#6e6e73"}
                style={[
                  styles.textInput,
                  styles.textArea,
                  { color: theme.text },
                ]}
                multiline
              />
            </View>

            <View style={styles.row}>
              <View style={{ flex: 1 }}>
                <Text style={[styles.inputLabel, { color: theme.subtleText }]}>
                  Price per cycle
                </Text>
                <View style={styles.priceRow}>
                  <Text style={styles.currencySymbol}>$</Text>
                  <TextInput
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                    placeholderTextColor={isLight ? "#A1A1AA" : "#6e6e73"}
                    style={[styles.priceInput, { color: theme.text }]}
                  />
                </View>
              </View>
            </View>
          </Card>

          {/* ---- Billing Frequency ---- */}
          <SectionLabel
            title="Billing frequency"
            subtitle="How often your client is charged."
            theme={theme}
          />

          <Card isLight={isLight}>
            <View style={styles.chipRow}>
              <SegChip
                label="Weekly"
                active={billingFrequency === "weekly"}
                onPress={() => setBillingFrequency("weekly")}
                isLight={isLight}
                theme={theme}
              />
              <SegChip
                label="Bi-weekly"
                active={billingFrequency === "biweekly"}
                onPress={() => setBillingFrequency("biweekly")}
                isLight={isLight}
                theme={theme}
              />
              <SegChip
                label="Monthly"
                active={billingFrequency === "monthly"}
                onPress={() => setBillingFrequency("monthly")}
                isLight={isLight}
                theme={theme}
              />
              <SegChip
                label="Custom"
                active={billingFrequency === "custom"}
                onPress={() => setBillingFrequency("custom")}
                isLight={isLight}
                theme={theme}
              />
            </View>

            {billingFrequency === "custom" && (
              <View style={styles.customRow}>
                <Text style={[styles.rowLabel, { color: theme.text }]}>
                  Every
                </Text>
                <TextInput
                  value={customIntervalCount}
                  onChangeText={setCustomIntervalCount}
                  keyboardType="number-pad"
                  style={[
                    styles.customNumberInput,
                    { color: theme.text },
                  ]}
                />
                <View style={styles.customUnitRow}>
                  <SegChip
                    label="days"
                    compact
                    active={customIntervalUnit === "days"}
                    onPress={() => setCustomIntervalUnit("days")}
                    isLight={isLight}
                    theme={theme}
                  />
                  <SegChip
                    label="weeks"
                    compact
                    active={customIntervalUnit === "weeks"}
                    onPress={() => setCustomIntervalUnit("weeks")}
                    isLight={isLight}
                    theme={theme}
                  />
                  <SegChip
                    label="months"
                    compact
                    active={customIntervalUnit === "months"}
                    onPress={() => setCustomIntervalUnit("months")}
                    isLight={isLight}
                    theme={theme}
                  />
                </View>
              </View>
            )}

            <ToggleRow
              label="Automatic billing"
              description="Charge saved payment method automatically."
              value={autoBilling}
              onValueChange={setAutoBilling}
              isLight={isLight}
              theme={theme}
            />

            <View style={[styles.row, { marginTop: 10 }]}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.inputLabel, { color: theme.subtleText }]}>
                  Maximum cycles (optional)
                </Text>
                <TextInput
                  value={maxCycles}
                  onChangeText={setMaxCycles}
                  keyboardType="number-pad"
                  placeholder="Ex: 12"
                  placeholderTextColor={isLight ? "#A1A1AA" : "#6e6e73"}
                  style={[styles.textInput, { color: theme.text }]}
                />
              </View>
            </View>

            <ToggleRow
              label="Prorate changes"
              description="Auto-adjust charges when changing plans."
              value={prorateChanges}
              onValueChange={setProrateChanges}
              isLight={isLight}
              theme={theme}
            />
          </Card>

          {/* ---- Trial ---- */}
          <SectionLabel
            title="Free trial"
            subtitle="Let clients try before billing."
            theme={theme}
          />

          <Card isLight={isLight}>
            <ToggleRow
              label="Offer free trial"
              value={hasTrial}
              onValueChange={setHasTrial}
              isLight={isLight}
              theme={theme}
            />

            {hasTrial && (
              <View style={styles.customRow}>
                <Text style={[styles.rowLabel, { color: theme.text }]}>
                  Trial length
                </Text>
                <TextInput
                  value={trialLength}
                  onChangeText={setTrialLength}
                  keyboardType="number-pad"
                  style={[
                    styles.customNumberInput,
                    { color: theme.text },
                  ]}
                />
                <View style={styles.customUnitRow}>
                  <SegChip
                    label="days"
                    compact
                    active={trialUnit === "days"}
                    onPress={() => setTrialUnit("days")}
                    isLight={isLight}
                    theme={theme}
                  />
                  <SegChip
                    label="weeks"
                    compact
                    active={trialUnit === "weeks"}
                    onPress={() => setTrialUnit("weeks")}
                    isLight={isLight}
                    theme={theme}
                  />
                </View>
              </View>
            )}
          </Card>

          {/* ---- Client Options ---- */}
          <SectionLabel
            title="Client options"
            subtitle="Control flexibility for clients."
            theme={theme}
          />

          <Card isLight={isLight}>
            <ToggleRow
              label="Allow clients to pause"
              description="Let clients pause instead of cancel."
              value={allowPause}
              onValueChange={setAllowPause}
              isLight={isLight}
              theme={theme}
            />

            <ToggleRow
              label="Send reminder before charge"
              description="Email reminder before each charge."
              value={reminderEnabled}
              onValueChange={setReminderEnabled}
              isLight={isLight}
              theme={theme}
            />

            {reminderEnabled && (
              <View style={[styles.chipRow, { marginTop: 4 }]}>
                <SegChip
                  label="1 day before"
                  compact
                  active={reminderDays === 1}
                  onPress={() => setReminderDays(1)}
                  isLight={isLight}
                  theme={theme}
                />
                <SegChip
                  label="3 days before"
                  compact
                  active={reminderDays === 3}
                  onPress={() => setReminderDays(3)}
                  isLight={isLight}
                  theme={theme}
                />
                <SegChip
                  label="7 days before"
                  compact
                  active={reminderDays === 7}
                  onPress={() => setReminderDays(7)}
                  isLight={isLight}
                  theme={theme}
                />
              </View>
            )}

            <ToggleRow
              label="Require minimum commitment"
              description="Lock in minimum cycles before canceling."
              value={minCyclesLock}
              onValueChange={() => setMinCyclesLock(!minCyclesLock)}
              isLight={isLight}
              theme={theme}
            />

            {minCyclesLock && (
              <View style={[styles.row, { marginTop: 8 }]}>
                <Text style={[styles.rowLabel, { color: theme.text }]}>
                  Minimum cycles
                </Text>
                <TextInput
                  value={minCycles}
                  onChangeText={setMinCycles}
                  keyboardType="number-pad"
                  style={[
                    styles.minCyclesInput,
                    { color: theme.text },
                  ]}
                  onFocus={() => setIsMinCyclesFocused(true)}
                  onBlur={() => setIsMinCyclesFocused(false)}
                />
              </View>
            )}
          </Card>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* ---- Bottom Bar ---- */}
      <View style={[styles.bottomBarWrap, { paddingBottom: 0 }]}>
        <BlurView
          intensity={40}
          tint={isLight ? "light" : "dark"}
          style={[styles.bottomBarBlur, { paddingBottom: insets.bottom + 10 }]}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={onSaveDraft}
            style={styles.draftButton}
          >
            <Text style={[styles.draftText, { color: theme.subtleText }]}>
              Save as draft
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.9}
            onPress={onCreatePlan}
            style={styles.primaryButton}
          >
            <LinearGradient
              colors={["#00A6FF", "#007AFF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={styles.primaryGradient}
            >
              <Ionicons name="checkmark" size={18} color="#fff" />
              <Text style={styles.primaryText}>
                {existingPlan ? "Save Changes" : "Create Plan"}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        </BlurView>
      </View>
    </View>
  );
}

/* -------------------------------------------------------
   STYLES (UNCHANGED)
--------------------------------------------------------*/
const styles = StyleSheet.create({
  container: { flex: 1 },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 6,
  },
  backButton: { width: 40, height: 40 },
  backBlur: {
    flex: 1,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  headerCenter: { flex: 1, alignItems: "center" },
  headerTitle: { fontSize: 19, fontWeight: "700" },
  headerSubtitle: { fontSize: 12, fontWeight: "500", marginTop: 2 },

  sectionLabelWrap: { marginTop: 16, marginBottom: 6 },
  sectionLabelText: {
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
  sectionSubtitleText: { fontSize: 12, marginTop: 2 },

  card: {
    borderRadius: 22,
    padding: 16,
    borderWidth: 0.4,
    borderColor: "rgba(0,0,0,0.06)",
    marginBottom: 12,
    overflow: "hidden",
  },

  inputGroup: { marginBottom: 12 },
  inputLabel: { fontSize: 12, fontWeight: "600", marginBottom: 4 },
  textInput: {
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: Platform.OS === "ios" ? 9 : 7,
    backgroundColor: "rgba(255,255,255,0.75)",
    fontSize: 14,
    fontWeight: "500",
  },
  textArea: { minHeight: 70, textAlignVertical: "top" },

  row: { flexDirection: "row", alignItems: "center" },

  priceRow: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 8 : 6,
    backgroundColor: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "700",
    color: "#6E6E73",
    marginRight: 2,
  },
  priceInput: { flex: 1, fontSize: 18, fontWeight: "700" },

  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginBottom: 8,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: "rgba(255,255,255,0.7)",
    borderWidth: 0.6,
    borderColor: "transparent",
  },
  chipCompact: { paddingHorizontal: 10, paddingVertical: 5 },
  chipText: { fontSize: 13, fontWeight: "600" },
  chipTextCompact: { fontSize: 11 },

  customRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rowLabel: { fontSize: 13, fontWeight: "600", marginRight: 8 },
  customNumberInput: {
    width: 54,
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: Platform.OS === "ios" ? 7 : 5,
    backgroundColor: "rgba(255,255,255,0.8)",
    fontSize: 14,
    fontWeight: "600",
    marginRight: 8,
    textAlign: "center",
  },
  customUnitRow: { flexDirection: "row", flex: 1, gap: 4 },

  toggleRow: { flexDirection: "row", alignItems: "center", marginTop: 10 },
  rowSubLabel: { fontSize: 11, marginTop: 2 },

  minCyclesInput: {
    marginLeft: 8,
    width: 50,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: Platform.OS === "ios" ? 6 : 4,
    backgroundColor: "rgba(255,255,255,0.8)",
    fontSize: 13,
    fontWeight: "600",
    textAlign: "center",
  },

  bottomBarWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  bottomBarBlur: {
    borderRadius: 26,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },

  draftButton: {
    flex: 1,
    height: 44,
    borderRadius: 20,
    borderWidth: 0.8,
    borderColor: "rgba(0,0,0,0.1)",
    alignItems: "center",
    justifyContent: "center",
  },
  draftText: { fontSize: 14, fontWeight: "600" },

  primaryButton: {
    flex: 1.6,
    height: 44,
    borderRadius: 20,
    overflow: "hidden",
  },
  primaryGradient: {
    flex: 1,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
  },
  primaryText: {
    color: "#fff",
    fontSize: 15,
    fontWeight: "700",
    marginLeft: 6,
  },
});
