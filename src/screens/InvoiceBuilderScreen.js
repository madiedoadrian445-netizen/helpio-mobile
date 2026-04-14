import React, { useMemo, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable, 
  Image,
  StyleSheet,
  Alert,
  Platform,
  Animated,
  KeyboardAvoidingView,
  findNodeHandle,
  UIManager,   // <-- 🔥 NEW
} from "react-native";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../../src/ThemeContext";
import { generateInvoicePDF } from "../utils/generateInvoicePDF";
import useAuthStore from "../store/auth";
import { api } from "../config/api";



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

function TapToFocus({ inputKey, inputRefs, children, style, hitSlop }) {
  return (
    <Pressable
      onPress={() => inputRefs.current?.[inputKey]?.focus?.()}
      hitSlop={hitSlop || { top: 10, bottom: 10, left: 10, right: 10 }}
      style={style}
    >
      {children}
    </Pressable>
  );
}



export default function InvoiceBuilderScreen({ navigation, route }) {
  const { darkMode } = useTheme();
  const tint = darkMode ? "dark" : "light";

const formatPhoneNumber = (phone) => {
  if (!phone) return "";

  let cleaned = phone.replace(/\D/g, "");

  if (cleaned.length === 11 && cleaned.startsWith("1")) {
    cleaned = cleaned.slice(1);
  }

  if (cleaned.length !== 10) return phone;

  const area = cleaned.slice(0, 3);
  const middle = cleaned.slice(3, 6);
  const last = cleaned.slice(6);

  return `(${area}) ${middle}-${last}`;
};


const formatAddress = (address) => {
  if (!address) return "";

  // Remove extra spaces
  let cleaned = address.trim().replace(/\s+/g, " ");

  // Split into parts
  const parts = cleaned.split(" ");

  // Capitalize each word (except state codes later)
  let formatted = parts
    .map((word) => {
      if (word.length === 2) return word.toUpperCase(); // state codes like FL
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(" ");

  // Add commas before city/state (basic heuristic)
  formatted = formatted
    .replace(/(\d{5})$/, (zip) => zip) // keep ZIP intact
    .replace(/(\b[A-Za-z]+\b) (\b[A-Z]{2}\b)/, "$1, $2");

  return formatted;
};


  const scrollRef = useRef(null);
  const inputRefs = useRef({});
const token = useAuthStore((state) => state.token);
  // ------------------------------------------------------
  // ⭐ REAL CRM CLIENT FETCH — paste this block here
  // ------------------------------------------------------
  const [clients, setClients] = useState([]);
  const [clientsLoading, setClientsLoading] = useState(false);
const [searchQuery, setSearchQuery] = useState("");
const [provider, setProvider] = useState(null);

const filteredClients = useMemo(() => {
  if (!searchQuery.trim()) return clients;

  const q = searchQuery.toLowerCase();

  return clients.filter((c) =>
    (c.name || "").toLowerCase().includes(q) ||
    (c.email || "").toLowerCase().includes(q) ||
    (c.phone || "").toLowerCase().includes(q)
  );
}, [clients, searchQuery]);

const loadClients = async () => {
  try {
    setClientsLoading(true);

    // ✅ Zustand ONLY
    if (!token) {
      console.log("❌ No auth token (Zustand)");
      return;
    }

 const response = await api.get("/api/customers");


  if (response.data?.success && Array.isArray(response.data.customers)) {
  setClients(response.data.customers);
}



  } catch (err) {
    console.log("Error loading clients:", err);
  } finally {
    setClientsLoading(false);
  }
};

  // Load on mount
 React.useEffect(() => {
  if (token) {
    loadClients();
  }
}, [token]);
  
  // ------------------------------------------------------
// ⭐ ALL INVOICE STATE — must appear BEFORE the auto-fill effect
// ------------------------------------------------------

const scrollToBottom = () => {
  setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 50);
};
const businessName = provider?.businessName || "";
const businessLine2 = provider?.businessLine2 || "";
const businessAddr1 = provider?.address || "";
const businessAddr2 = provider?.cityState || "";
const businessPhone = provider?.phone || "";
const businessEmail = provider?.email || "";


const [clientName, setClientName] = useState("");
const [clientAddr1, setClientAddr1] = useState("");
const [clientPhone, setClientPhone] = useState("");
const [clientEmail, setClientEmail] = useState("");






const getCurrentDate = () => {
  return new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const [invoiceDate, setInvoiceDate] = useState(getCurrentDate());



const [invoiceDue, setInvoiceDue] = useState("On Receipt");
const [status, setStatus] = useState("DUE");
const [selectedClient, setSelectedClient] = useState(null);
const [isSaving, setIsSaving] = useState(false);
const [isSaved, setIsSaved] = useState(false);
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

const loadProvider = async () => {
  try {
    const res = await api.get("/api/providers/me");

    if (res.data?.success) {
      setProvider(res.data.provider);
    }
  } catch (err) {
    console.log("Error loading provider:", err);
  }
};



React.useEffect(() => {
  if (token) {
    loadProvider();
  }
}, [token]);


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


const toNumber = (val) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

const numbers = useMemo(() => {
  const subtotal = items.reduce((sum, it) => {
    const amt = toNumber(it.rate) * toNumber(it.qty);
    return sum + amt;
  }, 0);

  const taxRate = toNumber(taxPct) / 100;
  const tax = subtotal * taxRate;

  const total = subtotal + tax;

  const paidNum = toNumber(paid);

  return {
    subtotal,
    tax,
    total,
    balance: Math.max(total - paidNum, 0),
  };
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
  date: invoiceDate,
  due: invoiceDue,
};


   const safeItems = Array.isArray(items) ? items : [];

const pdfItems = safeItems.map((it) => ({
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


const saveInvoiceToCRM = async () => {

  if (isSaving) return; // ✅ prevent duplicate saves

  // ✅ VALIDATION
  if (!clientName.trim()) {
    throw new Error("Client is required");
  }

  if (!selectedClient?._id) {
    throw new Error("Please select a client");
  }

  if (items.length === 0) {
    throw new Error("Add at least one item");
  }

  for (const item of items) {
    if (!item.title.trim()) {
      throw new Error("Each item must have a title");
    }

    if (Number(item.rate) < 0) {
      throw new Error("Rate cannot be negative");
    }

    if (Number(item.qty) <= 0) {
      throw new Error("Quantity must be greater than 0");
    }
  }

  const payload = buildInvoicePayload();

  if (!token) throw new Error("No auth token");

  const customerId = selectedClient?._id;
  if (!customerId) throw new Error("No client selected");






const {
  items: payloadItems,
  numbers,
  invoiceMeta,
  taxPct,
  paid,
} = payload;




const response = await api.post("/api/invoices", {
  customer: customerId,

  customerSnapshot: {
    name: clientName,
    address: clientAddr1,
    phone: clientPhone,
    email: clientEmail,
  },

  providerSnapshot: {
    name: businessName,
    address: businessAddr1,
    phone: businessPhone,
    email: businessEmail,
  },

items: payloadItems.map((i) => ({
    name: i.title || "",
    description: i.note || "",
    qty: Number(i.qty) || 1,
    rate: Number(i.rate) || 0,
amount: toNumber(i.rate) * toNumber(i.qty),
  })),

  subtotal: numbers.subtotal,
  tax: numbers.tax,
  taxPct: Number(taxPct) || 0,
  total: numbers.total,
  paid: Number(paid) || 0,
  balance: numbers.balance,

 
  issueDate: invoiceMeta.date,
  dueDate: invoiceMeta.due,
  status: status || "DUE",

  notes: "",
});



if (!response.data?.success) {
  throw new Error("Failed to save invoice");
}

const saved = response.data.invoice;

// optional state if you want to display it


return saved;
};



 const onShare = async () => {
  try {
    setIsSaving(true);

    // ✅ Always save first (ensures clean state)
    if (!isSaved) {
      await saveInvoiceToCRM();
      setIsSaved(true);
    }

    // ✅ Build payload AFTER save
    const payload = buildInvoicePayload();

    // ✅ HARD SAFETY CHECK (prevents your crash)
    if (!payload?.items || !Array.isArray(payload.items)) {
      throw new Error("Invalid invoice data");
    }

    // ✅ Generate PDF
  try {
  await generateInvoicePDF(payload);
} catch (pdfErr) {
  console.error("PDF generation failed:", pdfErr);

  Alert.alert(
    "Invoice Saved",
    "Invoice was saved, but PDF generation failed."
  );
}


  } catch (err) {
    console.error("share invoice error:", err);
    Alert.alert("Error", err.message || "Failed to share invoice");
  } finally {
    setIsSaving(false);
  }
};


  // -----------------------------------------------------

  const onPreview = () => {
  const payload = buildInvoicePayload();
  navigation.navigate("InvoicePreview", payload);
};


 const handleSelectClient = (client) => {
  setSelectedClient(client);

  setClientName(client.name || "");
  setClientAddr1(client.address || "");
  setClientPhone(client.phone || "");
  setClientEmail(client.email || "");
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
          colors={
  darkMode
    ? ["#050509", "#050509"]
    : ["#ECEEF3", "#E6E9F0"]
}
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
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
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
                   {formatAddress(clientAddr1)}
                  </Text>
                )}
              {!!clientPhone && (
  <Text style={[styles.meta, { color: darkMode ? "#D9DAE0" : "#444" }]}>
    {formatPhoneNumber(clientPhone)}
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
            onPress={() =>
  navigation.navigate("ClientsScreen", {
    selectMode: true,
    onSelect: (client) => handleSelectClient(client),
  })
}
              style={styles.changeClientBtn}
            >
              <Text style={[styles.changeClientTxt, { color: HELP_BLUE }]}>
                {clientName ? "Change or Add Client" : "Add Client"}
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
          const amount = toNumber(it.rate) * toNumber(it.qty);

              return (
                <View
                  key={it.id}
                  style={[
                    styles.itemTile,
                    {
                      marginTop: 8,
                      marginBottom: isLast ? 10 : 8,
                      backgroundColor: darkMode
                        ? "rgba(0,0,0,0.35)"
                        : "rgba(255,255,255,0.9)",
                    },
                  ]}
                >
               <View style={styles.inputGroup}>

  {/* TITLE */}
 <TapToFocus
  inputKey={`itemTitle${it.id}`}
  inputRefs={inputRefs}
  style={{ flex: 1 }}
>
  <View style={styles.inputRow}>
    <TextInput
      ref={(r) => (inputRefs.current[`itemTitle${it.id}`] = r)}
      onFocus={() => scrollToInput(`itemTitle${it.id}`)}
      placeholder="Item title"
      placeholderTextColor={darkMode ? "#9A9AA0" : "#8A8A94"}
      value={it.title}
      onChangeText={(v) => editRow(it.id, "title", v)}
      style={[styles.groupInputTitle, { color: darkMode ? "#FFF" : "#111" }]}
    />
  </View>
</TapToFocus>


  {/* DIVIDER */}
  <View style={styles.inputDivider} />

  {/* DESCRIPTION */}
  <TapToFocus
  inputKey={`itemNote${it.id}`}
  inputRefs={inputRefs}
  style={{ flex: 1 }}
>
  <View style={styles.inputRow}>
    <TextInput
      ref={(r) => (inputRefs.current[`itemNote${it.id}`] = r)}
      onFocus={() => scrollToInput(`itemNote${it.id}`)}
      placeholder="Optional description"
      placeholderTextColor={darkMode ? "#6F6F78" : "#B0B0B8"}
      value={it.note}
      onChangeText={(v) => editRow(it.id, "note", v)}
      multiline
      style={[styles.groupInputNote, { color: darkMode ? "#CFCFD7" : "#555" }]}
    />
  </View>
</TapToFocus>

</View>


                  <View style={{ alignItems: "flex-end", gap: 6 }}>
           <TapToFocus
  inputKey={`itemRate${it.id}`}
  inputRefs={inputRefs}
  style={[
    styles.amountPill,
    {
      backgroundColor: darkMode
        ? "rgba(255,255,255,0.10)"
        : "#F0F0F5",
    },
  ]}
>
  <TextInput
    ref={(r) => (inputRefs.current[`itemRate${it.id}`] = r)}
    onFocus={() => scrollToInput(`itemRate${it.id}`)}
    placeholder="$0.00"
    placeholderTextColor={darkMode ? "#9A9AA0" : "#8A8A94"}
    keyboardType="decimal-pad"
    value={it.rate}
    onChangeText={(v) => editRow(it.id, "rate", v)}
    style={[
      styles.itemSideInput,
      {
        color: darkMode ? "#FFF" : "#111",
        padding: 0,
        minWidth: 40,
        flexShrink: 1,
        textAlign: "right",
      },
    ]}
  />
</TapToFocus>


                   <TapToFocus
  inputKey={`itemQty${it.id}`}
  inputRefs={inputRefs}
  style={styles.tapWrapRight}
>
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
</TapToFocus>


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

                   <TouchableOpacity
  onPress={() => removeRow(it.id)}
  hitSlop={{ top: 14, bottom: 14, left: 14, right: 14 }}   style={{ marginTop: 8 }} // 👈 adjust this
>


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

               <TapToFocus inputKey="taxPct" inputRefs={inputRefs} style={styles.pillMini}>
  <TextInput
    ref={(r) => (inputRefs.current.taxPct = r)}
    onFocus={scrollToBottom}
    value={taxPct}
    onChangeText={setTaxPct}
    keyboardType="numeric"
    style={[styles.pillMiniText, { color: darkMode ? "#FFF" : "#111" }]}
  />
</TapToFocus>

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

                <TapToFocus
  inputKey="paid"
  inputRefs={inputRefs}
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
</TapToFocus>

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

  {/* SAVE BUTTON */}
  <TouchableOpacity
    disabled={isSaving || isSaved}
    style={[
      styles.secondaryBtn,
      {
        borderColor: darkMode ? "rgba(255,255,255,0.16)" : "#E6E6EA",
        backgroundColor: isSaved
          ? "rgba(0,166,255,0.12)"
          : darkMode
          ? "rgba(255,255,255,0.04)"
          : "#FFF",
        opacity: isSaving ? 0.7 : 1,
      },
    ]}
    onPress={async () => {
      if (isSaved) return;

      try {
        setIsSaving(true);
        await saveInvoiceToCRM();
        setIsSaved(true);
      } catch (err) {
        Alert.alert("Error", err.message || "Failed to save invoice");
      } finally {
        setIsSaving(false);
      }
    }}
  >
    {isSaved ? (
      <>
        <Ionicons
          name="checkmark-circle"
          size={18}
          color={HELP_BLUE}
          style={{ marginRight: 6 }}
        />
        <Text style={[styles.secondaryTxt, { color: HELP_BLUE }]}>
          Saved
        </Text>
      </>
    ) : (
      <Text style={[styles.secondaryTxt, { color: darkMode ? "#FFF" : "#111" }]}>
        {isSaving ? "Saving..." : "Save"}
      </Text>
    )}
  </TouchableOpacity>

  {/* SHARE BUTTON */}
  <TouchableOpacity
  onPress={onShare}
  disabled={isSaving}
  style={[
    styles.primaryBtn,
    {
      backgroundColor: HELP_BLUE,
      opacity: isSaving ? 0.7 : 1,
    },
  ]}
>
    <Text style={styles.primaryTxt}>Share Invoice</Text>
  </TouchableOpacity>

</View>

          

          <View style={{ height: 40 }} />
        </Animated.ScrollView>
      </KeyboardAvoidingView>



             

{!token && (
  <Pressable
    onPress={() => {
      console.log("🚨 NO TOKEN - redirecting to login");

      const rootNav =
        navigation.getParent?.()?.getParent?.() || navigation;

      rootNav.navigate("LoginScreen", {
        redirectTo: "InvoiceBuilderScreen",
      });
    }}
    style={[
      StyleSheet.absoluteFill,
      {
        zIndex: 999,
        elevation: 10, // Android
      },
    ]}
  />
)}

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
  borderColor: "rgba(255, 255, 255, 1)",
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

tapWrapRight: {
  minHeight: 44,      // Apple minimum touch target
  paddingVertical: 8, // invisible forgiveness
  paddingHorizontal: 8,
  borderRadius: 12,
  alignItems: "flex-end",
  justifyContent: "center",
},










inputGroup: {
  flex: 1,
  borderRadius: 14,
  overflow: "hidden",
  backgroundColor: "rgba(255,255,255,0.65)", // iOS grouped feel
},

inputRow: {
  paddingHorizontal: 12,
  paddingVertical: 10,
  justifyContent: "center",
},

inputDivider: {
  height: StyleSheet.hairlineWidth,
  backgroundColor: "rgba(0,0,0,0.16)", // 🔥 darker
  marginLeft: 12,
},

groupInputTitle: {
  fontSize: 15,
  fontWeight: "600",
},

groupInputNote: {
  fontSize: 13,
  minHeight: 85, // 👈 increase this
},












titleTapZone: {
  minHeight: 36,        // compact title strip
  justifyContent: "center",
},

noteTapZone: {
  minHeight: 80,        // big comfortable writing zone (blue box)
  justifyContent: "flex-start",
  paddingTop: 4,
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
  borderRadius: 18,
  padding: 12,
  flexDirection: "row",


 // ✅ NEW BORDER
  borderWidth: 1,
  borderColor: "rgba(239, 239, 239, 0.95)",


  shadowColor: "#000",
  shadowOpacity: 0.06,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },

  elevation: 2, // Android
},



  itemTitleInput: { fontSize: 15, fontWeight: "600", marginBottom: 3 },
  itemNoteInput: {
  fontSize: 13,
},


  itemSideInput: 
  { fontSize: 13, 
    fontWeight: "600", 
    textAlign: "right" 
  
  
  
  },
    amountPill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 30,
     alignSelf: "flex-end",
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
  flexDirection: "row",      // 👈 important
  alignItems: "center",
  justifyContent: "center",  // 👈 important
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



