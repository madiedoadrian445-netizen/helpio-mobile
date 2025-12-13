// src/screens/SubscriptionPlansScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Switch,
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SubscriptionPlansScreen({ navigation }) {
  const insets = useSafeAreaInsets();

  // 🔹 Initial mock plans (same as before, just extended with autoBilling)
  const INITIAL_PLANS = [
    {
      id: "1",
      name: "Bi-Weekly Wash & Wax",
      price: "$80",
      frequency: "Bi-weekly",
      active: 12,
      autoBilling: true,
    },
    {
      id: "2",
      name: "Basic Cleaning",
      price: "$100",
      frequency: "Monthly",
      active: 8,
      autoBilling: true,
    },
    {
      id: "3",
      name: "Lawn Care Package",
      price: "$150",
      frequency: "Monthly",
      active: 5,
      autoBilling: true,
    },
  ];

  // 🔹 Local state for provider subscription plans
  const [plans, setPlans] = useState(INITIAL_PLANS);

  // 🔹 Editor modal state
  const [showEditor, setShowEditor] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState(null);
  const [formName, setFormName] = useState("");
  const [formPrice, setFormPrice] = useState("");
  const [formFrequency, setFormFrequency] = useState("Bi-weekly");
  const [formAutoBilling, setFormAutoBilling] = useState(true);

  const openCreatePlan = () => {
    setEditingPlanId(null);
    setFormName("");
    setFormPrice("");
    setFormFrequency("Bi-weekly");
    setFormAutoBilling(true);
    setShowEditor(true);
  };

  const openEditPlan = (plan) => {
    setEditingPlanId(plan.id);
    setFormName(plan.name || "");
    const cleanPrice = (plan.price || "").replace("$", "");
    setFormPrice(cleanPrice);
    setFormFrequency(plan.frequency || "Bi-weekly");
    setFormAutoBilling(
      typeof plan.autoBilling === "boolean" ? plan.autoBilling : true
    );
    setShowEditor(true);
  };

  const handleSavePlan = () => {
    const trimmedName = formName.trim();
    const priceVal = formPrice.trim();

    if (!trimmedName || !priceVal) {
      // Keep it simple for now – you can add fancier validation later
      return;
    }

    const formattedPrice = priceVal.startsWith("$")
      ? priceVal
      : `$${priceVal}`;

    if (editingPlanId) {
      // Update existing plan
      setPlans((prev) =>
        prev.map((p) =>
          p.id === editingPlanId
            ? {
                ...p,
                name: trimmedName,
                price: formattedPrice,
                frequency: formFrequency,
                autoBilling: formAutoBilling,
              }
            : p
        )
      );
    } else {
      // Create new plan
      const newPlan = {
        id: Date.now().toString(),
        name: trimmedName,
        price: formattedPrice,
        frequency: formFrequency,
        active: 0,
        autoBilling: formAutoBilling,
      };
      setPlans((prev) => [newPlan, ...prev]);
    }

    setShowEditor(false);
  };

  return (
    <View style={styles.container}>
      {/* iOS style background gradient */}
      <LinearGradient
        colors={["#e7f4ff", "#f4f9ff"]}
        style={StyleSheet.absoluteFill}
      />

      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 5 }]}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <BlurView tint="light" intensity={40} style={styles.backBlur}>
            <Ionicons name="chevron-back" size={22} color="#0a0a0a" />
          </BlurView>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Subscription Plans</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingBottom: 120,
          paddingHorizontal: 20,
        }}
      >
        {/* Summary Card */}
        <BlurView intensity={60} tint="light" style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            <View style={styles.hCircle}>
              <Text style={styles.hText}>H</Text>
            </View>
            <View>
              <Text style={styles.summaryLabel}>HELPIO PAY</Text>
              <Text style={styles.summarySub}>Recurring Revenue</Text>
            </View>
          </View>

          {/* Still static for now — you can later compute from plans */}
          <Text style={styles.summaryAmount}>$2,300.00</Text>

          <View style={styles.summaryFooter}>
            <View style={styles.tag}>
              <View style={styles.tagDot} />
              <Text style={styles.tagText}>
                {plans.reduce((sum, p) => sum + (p.active || 0), 0)} active
                subscriptions
              </Text>
            </View>
            <Text style={styles.updated}>Updated in real-time</Text>
          </View>
        </BlurView>

        {/* Section Title */}
        <Text style={styles.sectionTitle}>Active Plans</Text>

        {/* Plans List */}
        {plans.map((p) => (
          <TouchableOpacity
            key={p.id}
            style={styles.planCard}
           onPress={() => navigation.navigate("SubscriptionPlanDetail", { plan: p })}
            activeOpacity={0.9}
          >
            <BlurView intensity={55} tint="light" style={styles.planBlur}>
              <View style={styles.planHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.planName}>{p.name}</Text>
                  <Text style={styles.planFreq}>{p.frequency}</Text>
                </View>

                <View style={styles.planRight}>
                  <Text style={styles.planPrice}>{p.price}</Text>
                  <Text style={styles.planActive}>{p.active} active</Text>
                </View>
              </View>

              <View style={styles.planFooter}>
                <View style={styles.pill}>
                  <Ionicons
                    name="repeat-outline"
                    size={14}
                    color="rgba(33,33,33,0.7)"
                  />
                  <Text style={styles.pillText}>
                    {p.autoBilling ? "Auto-billing" : "Manual billing"}
                  </Text>
                </View>

                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color="rgba(0,0,0,0.35)"
                />
              </View>
            </BlurView>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Create Plan Button */}
<View style={[styles.floatingBtnWrap, { bottom: insets.bottom + 20 }]}>
  <TouchableOpacity
    activeOpacity={0.9}
    style={styles.floatingBtn}
    onPress={() => navigation.navigate("CreateSubscriptionPlan")}
  >
    <LinearGradient
      colors={["#00A6FF", "#007AFF"]}
      style={styles.floatingGradient}
    >
      <Ionicons name="add" size={20} color="#fff" />
      <Text style={styles.floatingText}>Create New Plan</Text>
    </LinearGradient>
  </TouchableOpacity>
</View>


      {/* 🔹 Bottom Sheet Editor for Create / Edit Plan */}
      <Modal
        visible={showEditor}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEditor(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHandle} />

            <Text style={styles.modalTitle}>
              {editingPlanId ? "Edit Subscription Plan" : "Create Subscription Plan"}
            </Text>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Plan name</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Bi-Weekly Wash & Wax"
                placeholderTextColor="rgba(0,0,0,0.35)"
                value={formName}
                onChangeText={setFormName}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Price per cycle (USD)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="80"
                placeholderTextColor="rgba(0,0,0,0.35)"
                keyboardType="numeric"
                value={formPrice}
                onChangeText={setFormPrice}
              />
            </View>

            <View style={styles.modalField}>
              <Text style={styles.modalLabel}>Frequency</Text>
              <View style={styles.frequencyRow}>
                {["Weekly", "Bi-weekly", "Monthly"].map((freq) => {
                  const active = formFrequency === freq;
                  return (
                    <TouchableOpacity
                      key={freq}
                      onPress={() => setFormFrequency(freq)}
                      style={[
                        styles.freqChip,
                        active && styles.freqChipActive,
                      ]}
                    >
                      <Text
                        style={[
                          styles.freqChipText,
                          active && styles.freqChipTextActive,
                        ]}
                      >
                        {freq}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.modalToggleRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.modalLabel}>Auto-billing</Text>
                <Text style={styles.modalHint}>
                  Charge your client automatically each cycle.
                </Text>
              </View>
              <Switch
                value={formAutoBilling}
                onValueChange={setFormAutoBilling}
                thumbColor={formAutoBilling ? "#fff" : "#f4f3f4"}
                trackColor={{
                  false: "rgba(0,0,0,0.15)",
                  true: "#00A6FF",
                }}
              />
            </View>

            <View style={styles.modalButtonsRow}>
              <TouchableOpacity
                style={styles.modalButtonGhost}
                onPress={() => setShowEditor(false)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalButtonGhostText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.modalButtonPrimary}
                onPress={handleSavePlan}
                activeOpacity={0.9}
              >
                <Text style={styles.modalButtonPrimaryText}>
                  {editingPlanId ? "Save Changes" : "Create Plan"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

/* iOS Design Styles */
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  /* Header */
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
  },
  backBlur: {
    flex: 1,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0a0a0a",
  },

  /* Summary Card */
  summaryCard: {
    borderRadius: 24,
    padding: 20,
    marginTop: 10,
    overflow: "hidden",
    borderWidth: 0.5,
    borderColor: "rgba(0,0,0,0.1)",
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  hCircle: {
    width: 36,
    height: 36,
    borderRadius: 50,
    backgroundColor: "#00A6FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  hText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "800",
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(0,0,0,0.5)",
  },
  summarySub: {
    fontSize: 13,
    color: "rgba(0,0,0,0.65)",
  },
  summaryAmount: {
    fontSize: 34,
    fontWeight: "700",
    marginTop: 10,
    color: "#000",
  },
  summaryFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  tag: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.08)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 50,
    alignItems: "center",
  },
  tagDot: {
    width: 6,
    height: 6,
    borderRadius: 6,
    backgroundColor: "#00A6FF",
    marginRight: 5,
  },
  tagText: {
    fontSize: 11,
    color: "rgba(0,0,0,0.65)",
  },
  updated: {
    fontSize: 11,
    color: "rgba(0,0,0,0.45)",
  },

  /* Section Title */
  sectionTitle: {
    fontSize: 17,
    fontWeight: "700",
    marginTop: 25,
    marginBottom: 8,
    color: "#000",
  },

  /* Plan Card */
  planCard: {
    marginBottom: 14,
  },
  planBlur: {
    padding: 16,
    borderRadius: 22,
    overflow: "hidden",
    borderWidth: 0.4,
    borderColor: "rgba(0,0,0,0.08)",
  },
  planHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  planName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  planFreq: {
    fontSize: 13,
    marginTop: 3,
    color: "rgba(0,0,0,0.5)",
  },
  planRight: {
    alignItems: "flex-end",
  },
  planPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  planActive: {
    fontSize: 12,
    color: "rgba(0,0,0,0.5)",
    marginTop: 2,
  },
  planFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 12,
  },
  pill: {
    flexDirection: "row",
    backgroundColor: "rgba(0,0,0,0.07)",
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 100,
    alignItems: "center",
  },
  pillText: {
    fontSize: 11,
    marginLeft: 5,
    color: "rgba(0,0,0,0.7)",
  },

  /* Floating Button */
  floatingBtnWrap: {
    position: "absolute",
    left: 20,
    right: 20,
  },
  floatingBtn: {
    borderRadius: 50,
    overflow: "hidden",
  },
  floatingGradient: {
    paddingVertical: 14,
    borderRadius: 50,
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
  },
  floatingText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "600",
  },

  /* Modal / Bottom Sheet */
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#F5F7FF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 22,
  },
  modalHandle: {
    alignSelf: "center",
    width: 42,
    height: 5,
    borderRadius: 999,
    backgroundColor: "rgba(0,0,0,0.18)",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 14,
    color: "#000",
  },
  modalField: {
    marginBottom: 10,
  },
  modalLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(0,0,0,0.6)",
    marginBottom: 4,
  },
  modalInput: {
    borderRadius: 12,
    borderWidth: 0.7,
    borderColor: "rgba(0,0,0,0.12)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  frequencyRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  freqChip: {
    flex: 1,
    borderRadius: 999,
    paddingVertical: 6,
    marginRight: 6,
    borderWidth: 0.6,
    borderColor: "rgba(0,0,0,0.12)",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  freqChipActive: {
    backgroundColor: "#00A6FF",
    borderColor: "#00A6FF",
  },
  freqChipText: {
    fontSize: 12,
    fontWeight: "600",
    color: "rgba(0,0,0,0.65)",
  },
  freqChipTextActive: {
    color: "#fff",
  },
  modalToggleRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
    marginBottom: 14,
  },
  modalHint: {
    fontSize: 11,
    color: "rgba(0,0,0,0.5)",
    marginTop: 2,
  },
  modalButtonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  modalButtonGhost: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.16)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    backgroundColor: "rgba(255,255,255,0.9)",
  },
  modalButtonGhostText: {
    fontSize: 14,
    fontWeight: "600",
    color: "rgba(0,0,0,0.75)",
  },
  modalButtonPrimary: {
    flex: 1,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 8,
    backgroundColor: "#007AFF",
  },
  modalButtonPrimaryText: {
    fontSize: 14,
    fontWeight: "700",
    color: "#fff",
  },
});
