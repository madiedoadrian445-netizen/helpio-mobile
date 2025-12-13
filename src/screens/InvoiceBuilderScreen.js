import React, { useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  Alert,
  Platform,
  Animated,
  KeyboardAvoidingView,
  Modal,
  findNodeHandle,
  UIManager,   // <-- 🔥 NEW
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/ThemeContext";
import { generateInvoicePDF } from "../utils/generateInvoicePDF";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../../src/config/api";





const HELP_BLUE = "#00A6FF";

const currency = (n) =>
  (isNaN(Number(n)) ? 0 : Number(n)).toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  });

function GlassCard({ children, style, tint = "light", intensity = 50 }) {
  return (
    <View style={[styles.cardWrap, style]}>
      <BlurView intensity={intensity} tint={tint} style={StyleSheet.absoluteFill} />
      <LinearGradient
        colors={["rgba(255,255,255,0.80)", "rgba(245,245,250,0.45)"]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <View style={styles.cardInnerStroke} />
      <View style={styles.cardContent}>{children}</View>
    </View>
  );
}

export default function InvoiceBuilderScreen({ navigation, route }) {
  const { darkMode } = useTheme();
  const tint = darkMode ? "dark" : "light";

  const scrollRef = useRef(null);
  const inputRefs = useRef({});

  // ------------------------------------------------------
  // ⭐ REAL CRM CLIENT FETCH — paste this block here
  // ------------------------------------------------------
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);

  const loadClients = async () => {
  try {
    setClientsLoading(true);

    // ⭐ FULL TOKEN FALLBACK (same pattern as onShare)
    const token =
      (await AsyncStorage.getItem("token")) ||
      (await AsyncStorage.getItem("userToken")) ||
      (await AsyncStorage.getItem("authToken")) ||
      (await AsyncStorage.getItem("providerToken"));

    if (!token) {
      console.log("❌ No token found for client fetch");
      return;
    }

    const response = await fetch(`${API_BASE_URL}/api/customers`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.trim()}`,
      },
    });

    const data = await response.json();
    console.log("🚀 CLIENTS API RESPONSE:", data);

    if (data.success && Array.isArray(data.customers)) {
      setClients(data.customers);
    }
  } catch (err) {
    console.log("Error loading clients:", err);
  } finally {
    setClientsLoading(false);
  }
};


  // Load on mount
  React.useEffect(() => {
    loadClients();
  }, []);
  
  // ------------------------------------------------------
// ⭐ ALL INVOICE STATE — must appear BEFORE the auto-fill effect
// ------------------------------------------------------

const scrollToBottom = () => {
  setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
};

const [businessName, setBusinessName] = useState("ABC Lawn Care");
const [businessLine2, setBusinessLine2] = useState("Mike Clay Landscaping");
const [businessAddr1, setBusinessAddr1] = useState("123 Grass Ln");
const [businessAddr2, setBusinessAddr2] = useState("Big City, New York");
const [businessPhone, setBusinessPhone] = useState("(555) 555-5555");
const [businessEmail, setBusinessEmail] = useState("abclawncare@example.com");

const firstClient = clients.length > 0 ? clients[0] : null;

const [clientName, setClientName] = useState(firstClient?.name || "");
const [clientAddr1, setClientAddr1] = useState(firstClient?.address || "");
const [clientPhone, setClientPhone] = useState(firstClient?.phone || "");
const [clientEmail, setClientEmail] = useState(firstClient?.email || "");

const [invoiceNo, setInvoiceNo] = useState("INVO001");
const [invoiceDate, setInvoiceDate] = useState("Oct 30, 2025");
const [invoiceDue, setInvoiceDue] = useState("On Receipt");
const [status, setStatus] = useState("DUE");

const [items, setItems] = useState([
  { id: "1", title: "", note: "", rate: "", qty: "1" },
]);

const addRow = () =>
  setItems((prev) => [
    ...prev,
    { id: Date.now().toString(), title: "", note: "", rate: "", qty: "1" },
  ]);

const removeRow = (id) =>
  setItems((prev) => (prev.length === 1 ? prev : prev.filter((r) => r.id !== id)));

const editRow = (id, field, val) =>
  setItems((prev) =>
    prev.map((r) => (r.id === id ? { ...r, [field]: val } : r))
  );

const [taxPct, setTaxPct] = useState("7");
const [paid, setPaid] = useState("");

  
  // ------------------------------------------------------




  // ✅ NEW FIXED scrollToInput()
  const scrollToInput = (key) => {
    const scroll = scrollRef.current;
    const input = inputRefs.current[key];
    if (!scroll || !input) return;

    const scrollHandle = findNodeHandle(scroll);
    if (!scrollHandle) return;

    requestAnimationFrame(() => {
      const node = findNodeHandle(input);
      if (!node) return;

      UIManager.measureLayout(
        node,
        scrollHandle,
        () => {},
        (x, y, width, height) => {
          const TARGET_OFFSET = 120;
          const scrollY = Math.max(0, y - TARGET_OFFSET);
          scroll.scrollTo({ y: scrollY, animated: true });
        }
      );
    });
  };

// ⭐ FIX — Automatically load first client into invoice form
React.useEffect(() => {
  if (clients.length > 0 && !clientName) {
    const c = clients[0];

    setClientName(c.name || "");
    setClientAddr1(c.address || "");
    setClientPhone(c.phone || "");
    setClientEmail(c.email || "");

    if (route?.params) {
      route.params.client = c;
    }
  }
}, [clients]);


  const numbers = useMemo(() => {
    const subtotal = items.reduce((sum, it) => {
      const amt = (parseFloat(it.rate) || 0) * (parseFloat(it.qty) || 0);
      return sum + amt;
    }, 0);
    const tax = subtotal * ((parseFloat(taxPct) || 0) / 100);
    const total = subtotal + tax;
    const paidNum = parseFloat(paid) || 0;
    return { subtotal, tax, total, balance: Math.max(total - paidNum, 0) };
  }, [items, taxPct, paid]);

  const buildInvoicePayload = () => {
    const business = {
      name: businessName,
      line2: businessLine2,
      addr1: businessAddr1,
      addr2: businessAddr2,
      phone: businessPhone,
      email: businessEmail,
    };
    const client = {
      name: clientName,
      addr1: clientAddr1,
      phone: clientPhone,
      email: clientEmail,
    };
    const invoiceMeta = {
      number: invoiceNo,
      date: invoiceDate,
      due: invoiceDue,
    };
    const pdfItems = items.map((it) => ({
      ...it,
      desc: it.title,
      description: it.note,
    }));
    return {
      business,
      client,
      items: pdfItems,
      numbers,
      taxPct,
      paid,
      invoiceMeta,
    };
  };

  const onShare = async () => {
  try {
    const payload = buildInvoicePayload();

    // Generate local PDF as usual
    await generateInvoicePDF(payload);

    // ⭐ FULL TOKEN FALLBACK (consistent with loadClients)
    const token =
      (await AsyncStorage.getItem("token")) ||
      (await AsyncStorage.getItem("userToken")) ||
      (await AsyncStorage.getItem("authToken")) ||
      (await AsyncStorage.getItem("providerToken"));

    if (!token) {
      Alert.alert("Authentication Error", "No valid token found. Please log in again.");
      return;
    }

    const customerId = route?.params?.client?._id;

    if (!customerId) {
      Alert.alert("Missing Client", "Select a client before sharing invoice.");
      return;
    }

    const {
      items,
      numbers,
      invoiceMeta,
      taxPct,
      paid,
    } = payload;

    const response = await fetch(`${API_BASE_URL}/api/invoices`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token.trim()}`,
      },
      body: JSON.stringify({
        customer: customerId,

        items: items.map((i) => ({
          description: i.desc || i.title || "",
          qty: Number(i.qty) || 1,
          rate: Number(i.rate) || 0,
          amount: (Number(i.rate) || 0) * (Number(i.qty) || 0),
        })),

        subtotal: numbers.subtotal,
        tax: numbers.tax,
        taxPct: Number(taxPct) || 0,
        total: numbers.total,
        paid: Number(paid) || 0,
        balance: numbers.balance,

        invoiceNumber: invoiceMeta.number,
        issueDate: invoiceMeta.date,
        dueDate: invoiceMeta.due,
        status: status || "DUE",
        notes: "",
      }),
    });

    if (!response.ok) {
      const errTxt = await response.text();
      console.log("🔥 Invoice create error:", errTxt);
      throw new Error("Invoice could not be saved to CRM");
    }

    const created = await response.json();
    const invoiceId = created?.invoice?._id;

    console.log("Saved Invoice ID:", invoiceId);

    Alert.alert("Success", "Invoice saved + CRM timeline updated!");
  } catch (err) {
    console.error("share invoice error:", err);
    Alert.alert("Error", err.message || "Failed to share invoice");
  }
};


  // -----------------------------------------------------

  const onPreview = () => {
    const payload = buildInvoicePayload();
    navigation.navigate("InvoicePreviewScreen", payload);
  };

  const [clientPickerVisible, setClientPickerVisible] = useState(false);

 const handleSelectClient = (client) => {
  setClientName(client.name);
  setClientAddr1(client.address);
  setClientPhone(client.phone);
  setClientEmail(client.email);

  // 🔥 Save selected client to route params for invoice saving
  if (route?.params) {
    route.params.client = client;
  }

  setClientPickerVisible(false);
};


  const y = useRef(new Animated.Value(0)).current;
  const headerOpacity = y.interpolate({
    inputRange: [0, 60],
    outputRange: [1, 0],
  });

  return (
    <SafeAreaView
      style={[styles.safe, { backgroundColor: darkMode ? "#050509" : "#F2F2F7" }]}
    >
      
      {/* BACKGROUND */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient
          colors={darkMode ? ["#050509", "#050509"] : ["#F7F7FA", "#F2F3F7"]}
          style={StyleSheet.absoluteFill}
        />
        <BlurView intensity={40} tint={tint} style={StyleSheet.absoluteFill} />
      </View>

      {/* HEADER */}
      <View style={styles.headerWrap}>
        <BlurView
          intensity={72}
          tint={tint}
          style={[StyleSheet.absoluteFill, styles.headerBlur]}
        />
        <View style={styles.headerBar}>
          <Animated.Text
            style={[
              styles.headerTitle,
              { opacity: headerOpacity, color: darkMode ? "#FFF" : "#000" },
            ]}
          >
            Invoice
          </Animated.Text>

          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconBtn} onPress={onShare}>
              <Ionicons
                name="share-outline"
                size={20}
                color={darkMode ? "#FFF" : "#111"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* MAIN SCROLL */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        style={{ flex: 1 }}
      >
        <Animated.ScrollView
          ref={scrollRef}
          keyboardShouldPersistTaps="handled"
          onScroll={Animated.event(
            [{ nativeEvent: { contentOffset: { y } } }],
            { useNativeDriver: false }
          )}
          scrollEventThrottle={16}
          contentContainerStyle={{ paddingBottom: 0 }}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ height: 26 }} />

          {/* CLIENT CARD */}
          <GlassCard tint={tint} intensity={55} style={{ marginHorizontal: 16, marginTop: 14 }}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: darkMode ? "#A9ABB5" : "#6B6B6B" },
                ]}
              >
                CLIENT
              </Text>
              <View style={{ flex: 1 }} />
              <TouchableOpacity
                onPress={onPreview}
                style={[
                  styles.previewBtn,
                  {
                    backgroundColor: darkMode
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(0,0,0,0.04)",
                  },
                ]}
              >
                <Ionicons
                  name="eye-outline"
                  size={16}
                  color={darkMode ? "#FFF" : "#111"}
                  style={{ marginRight: 4 }}
                />
                <Text
                  style={[
                    styles.previewTxt,
                    { color: darkMode ? "#FFF" : "#111" },
                  ]}
                >
                  Preview Invoice
                </Text>
              </TouchableOpacity>
            </View>

            {clientName ? (
              <View style={{ marginBottom: 10 }}>
                <Text
                  style={[
                    styles.h2,
                    { color: darkMode ? "#FFF" : "#1B1B1B", marginBottom: 4 },
                  ]}
                >
                  {clientName}
                </Text>
                {!!clientAddr1 && (
                  <Text style={[styles.meta, { color: darkMode ? "#D9DAE0" : "#444" }]}>
                    {clientAddr1}
                  </Text>
                )}
                {!!clientPhone && (
                  <Text style={[styles.meta, { color: darkMode ? "#D9DAE0" : "#444" }]}>
                    {clientPhone}
                  </Text>
                )}
                {!!clientEmail && (
                  <Text style={[styles.meta, { color: darkMode ? "#D9DAE0" : "#444" }]}>
                    {clientEmail}
                  </Text>
                )}
              </View>
            ) : (
              <Text
                style={[
                  styles.meta,
                  {
                    color: darkMode ? "#8E8E93" : "#8E8E93",
                    marginBottom: 10,
                  },
                ]}
              >
                No client selected
              </Text>
            )}

            <TouchableOpacity
              onPress={() => setClientPickerVisible(true)}
              style={styles.changeClientBtn}
            >
              <Text style={[styles.changeClientTxt, { color: HELP_BLUE }]}>
                {clientName ? "Change Client" : "Add Client"}
              </Text>
            </TouchableOpacity>
          </GlassCard>

          {/* ITEMS CARD */}
          <GlassCard tint={tint} intensity={55} style={{ marginHorizontal: 16, marginTop: 15 }}>
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Text
                style={[
                  styles.sectionLabel,
                  { color: darkMode ? "#A9ABB5" : "#6B6B6B" },
                ]}
              >
                ITEMS
              </Text>

              <Text style={{ fontSize: 12, color: darkMode ? "#B0B0B8" : "#8E8E93" }}>
                Tap to edit
              </Text>
            </View>

            {items.map((it, idx) => {
              const isLast = idx === items.length - 1;
              const amount = (parseFloat(it.rate) || 0) * (parseFloat(it.qty) || 0);

              return (
                <View
                  key={it.id}
                  style={[
                    styles.itemTile,
                    {
                      marginBottom: isLast ? 10 : 8,
                      backgroundColor: darkMode
                        ? "rgba(0,0,0,0.35)"
                        : "rgba(255,255,255,0.9)",
                    },
                  ]}
                >
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <TextInput
                      ref={(r) => (inputRefs.current[`itemTitle${it.id}`] = r)}
                      onFocus={() => scrollToInput(`itemTitle${it.id}`)}
                      placeholder="Item title"
                      placeholderTextColor={darkMode ? "#8C8C94" : "#A1A1AA"}
                      value={it.title}
                      onChangeText={(v) => editRow(it.id, "title", v)}
                      style={[styles.itemTitleInput, { color: darkMode ? "#FFF" : "#111" }]}
                    />

                    <TextInput
                      ref={(r) => (inputRefs.current[`itemNote${it.id}`] = r)}
                      onFocus={() => scrollToInput(`itemNote${it.id}`)}
                      placeholder="Optional description"
                      placeholderTextColor={darkMode ? "#6F6F78" : "#B0B0B8"}
                      value={it.note}
                      onChangeText={(v) => editRow(it.id, "note", v)}
                      multiline
                      style={[styles.itemNoteInput, { color: darkMode ? "#CFCFD7" : "#555" }]}
                    />
                  </View>

                  <View style={{ alignItems: "flex-end", gap: 6 }}>
                    <TextInput
                      ref={(r) => (inputRefs.current[`itemRate${it.id}`] = r)}
                      onFocus={() => scrollToInput(`itemRate${it.id}`)}
                      placeholder="$0.00"
                      placeholderTextColor={darkMode ? "#8C8C94" : "#A1A1AA"}
                      keyboardType="decimal-pad"
                      value={it.rate}
                      onChangeText={(v) => editRow(it.id, "rate", v)}
                      style={[styles.itemSideInput, { color: darkMode ? "#FFF" : "#111" }]}
                    />

                    <TextInput
                      ref={(r) => (inputRefs.current[`itemQty${it.id}`] = r)}
                      onFocus={() => scrollToInput(`itemQty${it.id}`)}
                      placeholder="Qty"
                      placeholderTextColor={darkMode ? "#8C8C94" : "#A1A1AA"}
                      keyboardType="numeric"
                      value={it.qty}
                      onChangeText={(v) => editRow(it.id, "qty", v)}
                      style={[styles.itemSideInput, { color: darkMode ? "#FFF" : "#111" }]}
                    />

                    <View
                      style={[
                        styles.amountPill,
                        {
                          backgroundColor: darkMode
                            ? "rgba(255,255,255,0.10)"
                            : "#F0F0F5",
                        },
                      ]}
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          fontWeight: "700",
                          color: darkMode ? "#FFF" : "#111",
                        }}
                      >
                        {currency(amount)}
                      </Text>
                    </View>

                    <TouchableOpacity onPress={() => removeRow(it.id)}>
                      <Ionicons
                        name="trash-outline"
                        size={18}
                        color={darkMode ? "#A6A6AE" : "#A0A0A0"}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}

            <TouchableOpacity style={styles.addBtn} onPress={addRow}>
              <Ionicons name="add-circle-outline" size={20} color={darkMode ? "#FFF" : "#111"} />
              <Text style={[styles.addBtnTxt, { color: darkMode ? "#FFF" : "#111" }]}>
                Add Item
              </Text>
            </TouchableOpacity>
          </GlassCard>

          {/* SUMMARY CARD */}
          <GlassCard tint={tint} intensity={55} style={{ marginHorizontal: 16, marginTop: 14 }}>
            <View style={{ gap: 12 }}>
              <View style={styles.summaryRow}>
                <Text style={[styles.sumLabel, { color: darkMode ? "#D0D0D8" : "#4A4A4A" }]}>
                  SUBTOTAL
                </Text>
                <View
                  style={[
                    styles.pill,
                    { backgroundColor: darkMode ? "rgba(255,255,255,0.06)" : "#F0F0F3" },
                  ]}
                >
                  <Text style={[styles.pillText, { color: darkMode ? "#FFF" : "#111" }]}>
                    {currency(numbers.subtotal)}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.sumLabel, { color: darkMode ? "#D0D0D8" : "#4A4A4A" }]}>
                  SALES TAX
                </Text>

                <View
                  style={[
                    styles.pillMini,
                    { backgroundColor: darkMode ? "rgba(255,255,255,0.06)" : "#F0F0F3" },
                  ]}
                >
                  <TextInput
                    ref={(r) => (inputRefs.current.taxPct = r)}
                    onFocus={scrollToBottom}
                    value={taxPct}
                    onChangeText={setTaxPct}
                    keyboardType="numeric"
                    style={[styles.pillMiniText, { color: darkMode ? "#FFF" : "#111" }]}
                  />
                </View>

                <View
                  style={[
                    styles.pill,
                    { backgroundColor: darkMode ? "rgba(255,255,255,0.06)" : "#F0F0F3" },
                  ]}
                >
                  <Text style={[styles.pillText, { color: darkMode ? "#FFF" : "#111" }]}>
                    {currency(numbers.tax)}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.sumLabel, { color: darkMode ? "#D0D0D8" : "#4A4A4A" }]}>
                  TOTAL
                </Text>

                <View
                  style={[
                    styles.pill,
                    { backgroundColor: darkMode ? "rgba(255,255,255,0.06)" : "#F0F0F3" },
                  ]}
                >
                  <Text style={[styles.pillText, { color: darkMode ? "#FFF" : "#111" }]}>
                    {currency(numbers.total)}
                  </Text>
                </View>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.sumLabel, { color: darkMode ? "#D0D0D8" : "#4A4A4A" }]}>
                  PAID
                </Text>

                <View
                  style={[
                    styles.pillEditable,
                    { backgroundColor: darkMode ? "rgba(255,255,255,0.06)" : "#F0F0F3" },
                  ]}
                >
                  <TextInput
                    ref={(r) => (inputRefs.current.paid = r)}
                    onFocus={scrollToBottom}
                    value={paid}
                    onChangeText={setPaid}
                    keyboardType="decimal-pad"
                    placeholder="$0.00"
                    placeholderTextColor={darkMode ? "#8E8E93" : "#6D6D72"}
                    style={[styles.pillEditText, { color: darkMode ? "#FFF" : "#111" }]}
                  />
                </View>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.balanceLabel, { color: darkMode ? "#FFF" : "#1B1B1B" }]}>
                  BALANCE DUE
                </Text>

                <View
                  style={[
                    styles.pillStrong,
                    { backgroundColor: darkMode ? "rgba(255,255,255,0.16)" : "#ECECF1" },
                  ]}
                >
                  <Text style={[styles.pillStrongText, { color: darkMode ? "#FFF" : "#111" }]}>
                    {currency(numbers.balance)}
                  </Text>
                </View>
              </View>
            </View>
          </GlassCard>

          <View style={{ height: 14 }} />

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={[
                styles.secondaryBtn,
                {
                  borderColor: darkMode ? "rgba(255,255,255,0.16)" : "#E6E6EA",
                  backgroundColor: darkMode ? "rgba(255,255,255,0.04)" : "#FFF",
                },
              ]}
              onPress={() => Alert.alert("Saved", "Invoice saved locally.")}
            >
              <Text style={[styles.secondaryTxt, { color: darkMode ? "#FFF" : "#111" }]}>
                Save
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={onShare}
              style={[styles.primaryBtn, { backgroundColor: HELP_BLUE }]}
            >
              <Text style={styles.primaryTxt}>Share Invoice</Text>
            </TouchableOpacity>
          </View>

          <View style={{ height: 40 }} />
        </Animated.ScrollView>
      </KeyboardAvoidingView>

      <Modal
        visible={clientPickerVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setClientPickerVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View
            style={[
              styles.modalSheet,
              { backgroundColor: darkMode ? "#111118" : "#F9F9FC" },
            ]}
          >
            <View style={styles.modalHandle} />
            <Text style={[styles.modalTitle, { color: darkMode ? "#FFF" : "#111" }]}>
              Select Client
            </Text>

            {clients.map((client) => (
              <TouchableOpacity
                key={client._id}
                style={[
                  styles.clientRow,
                  {
                    borderBottomColor: darkMode
                      ? "rgba(255,255,255,0.06)"
                      : "rgba(0,0,0,0.06)",
                  },
                ]}
                onPress={() => handleSelectClient(client)}
              >
                <View>
                  <Text style={[styles.clientName, { color: darkMode ? "#FFF" : "#111" }]}>
                    {client.name}
                  </Text>
                  <Text style={[styles.clientMeta, { color: darkMode ? "#A0A0AA" : "#6D6D72" }]}>
                    {client.address}
                  </Text>
                  <Text style={[styles.clientMeta, { color: darkMode ? "#A0A0AA" : "#6D6D72" }]}>
                    {client.phone}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color={darkMode ? "#888" : "#999"} />
              </TouchableOpacity>
            ))}

            <TouchableOpacity
              style={styles.modalCancelBtn}
              onPress={() => setClientPickerVisible(false)}
            >
              <Text style={[styles.modalCancelTxt, { color: darkMode ? "#FFF" : "#111" }]}>
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  headerWrap: {
    position: "absolute",
    left: 0,
    right: 0,
    top: 0,
    height: 64,
    zIndex: 100,
  },
  headerBlur: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  headerBar: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: { fontSize: 18, fontWeight: "700" },
  headerActions: {
    position: "absolute",
    right: 10,
    top: 0,
    bottom: 0,
    justifyContent: "center",
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },

  cardWrap: {
    borderRadius: 22,
    overflow: "hidden",
  },
  cardInnerStroke: {
    position: "absolute",
    borderRadius: 22,
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderColor: "rgba(255,255,255,0.7)",
    borderWidth: 1,
  },
  cardContent: { padding: 16 },

  overviewLabel: { fontSize: 11, fontWeight: "700", letterSpacing: 0.8 },
  overviewBalance: { fontSize: 30, fontWeight: "800", marginTop: 6 },
  overviewMeta: { fontSize: 13 },
  overviewFooter: { fontSize: 12 },
  statusPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 30,
  },
  statusText: { fontSize: 12, fontWeight: "700" },

  h1: { fontSize: 22, fontWeight: "800" },
  h2: { fontSize: 20, fontWeight: "800" },
  meta: { fontSize: 14, marginTop: 3 },

  sectionLabel: {
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 6,
    textTransform: "uppercase",
  },

  metaRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    alignItems: "center",
  },
  metaLabelStrong: { fontSize: 13, fontWeight: "800" },
  metaValue: { fontSize: 13, textAlign: "right", minWidth: 90 },

  balancePill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  metaValueStrong: { fontSize: 15, fontWeight: "800" },

  itemTile: {
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
  },
  itemTitleInput: { fontSize: 15, fontWeight: "600", marginBottom: 3 },
  itemNoteInput: { fontSize: 13 },
  itemSideInput: { fontSize: 13, fontWeight: "600", textAlign: "right" },
  amountPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 30,
  },

  addBtn: { flexDirection: "row", alignItems: "center", marginTop: 8 },
  addBtnTxt: { fontSize: 14, fontWeight: "700" },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  sumLabel: { fontSize: 14 },

  pill: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  pillText: { fontSize: 14, fontWeight: "700" },

  pillMini: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    minWidth: 48,
  },
  pillMiniText: { fontSize: 14, fontWeight: "700", textAlign: "center" },

  pillEditable: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  pillEditText: { fontSize: 14, fontWeight: "700", textAlign: "right" },

  pillStrong: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
  },
  pillStrongText: { fontSize: 16, fontWeight: "800" },
  balanceLabel: { fontSize: 13, fontWeight: "800" },

  actionsRow: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 16,
  },
  secondaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderWidth: 1,
    borderRadius: 14,
    alignItems: "center",
  },
  secondaryTxt: { fontSize: 16, fontWeight: "700" },

  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  primaryTxt: { fontSize: 16, fontWeight: "700", color: "#FFF" },

  previewBtn: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  previewTxt: { fontSize: 12, fontWeight: "700" },

  changeClientBtn: {
    alignSelf: "flex-start",
    marginTop: 2,
  },
  changeClientTxt: {
    fontSize: 13,
    fontWeight: "700",
  },

  modalBackdrop: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  modalSheet: {
    borderTopLeftRadius: 22,
    borderTopRightRadius: 22,
    paddingBottom: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  modalHandle: {
    alignSelf: "center",
    width: 38,
    height: 4,
    borderRadius: 999,
    backgroundColor: "rgba(140,140,150,0.7)",
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 10,
  },
  clientRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  clientName: { fontSize: 15, fontWeight: "600" },
  clientMeta: { fontSize: 12, marginTop: 1 },
  modalCancelBtn: {
    marginTop: 14,
    alignSelf: "center",
    paddingVertical: 8,
    paddingHorizontal: 20,
  },
  modalCancelTxt: {
    fontSize: 14,
    fontWeight: "600",
  },
});
