// src/screens/AddClientScreen.js
import React, { useState, memo, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  Pressable,
  ScrollView,
  StyleSheet,
  Platform,
  KeyboardAvoidingView,
  ActivityIndicator,
  Alert,
} from "react-native";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../ThemeContext";
import { api } from "../config/api";
import useAuthStore from "../store/auth";
import ContactAvatar from "../components/ContactAvatar";

/* ----------------------------------------------------
   MEMOIZED FIELD COMPONENT
---------------------------------------------------- */
const Field = memo(function Field({
  label,
  value,
  onChange,
  placeholder,
  theme,
  darkMode,
}) {
  return (
    <View style={styles.fieldRow}>
      <Text style={[styles.label, { color: theme.subtleText }]}>
        {label}
      </Text>


<TextInput
  style={[styles.input, { color: theme.text }]}
  placeholder={placeholder}
  placeholderTextColor={darkMode ? "#888" : "#A8A8AD"}
  value={value}
  onChangeText={onChange}
  keyboardType={label === "Phone" ? "phone-pad" : "default"}
  maxLength={label === "Phone" ? 14 : undefined}
/>
    </View>
  );
});

export default function AddClientScreen({ navigation, route }) {
  const { darkMode, theme } = useTheme();
const user = useAuthStore((state) => state.user);
const token = useAuthStore((state) => state.token);
const isProvider = !!user?.providerId;

const editingClient = route?.params?.client || null;
const isEditMode = !!editingClient;


 const [fullName, setFullName] = useState(editingClient?.name || "");
const [phone, setPhone] = useState(editingClient?.phone || "");
const [email, setEmail] = useState(editingClient?.email || "");
const [company, setCompany] = useState(editingClient?.company || "");
const [address, setAddress] = useState(editingClient?.address || "");
const [notes, setNotes] = useState(editingClient?.notes || "");
const [loading, setLoading] = useState(false);

const formatPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 10);

  const area = digits.slice(0, 3);
  const middle = digits.slice(3, 6);
  const last = digits.slice(6, 10);

  if (digits.length < 4) return area;
  if (digits.length < 7) return `(${area}) ${middle}`;
  return `(${area}) ${middle}-${last}`;
};
const handlePreviewBlock = () => {
  if (!isProvider) {
    navigation.navigate("BusinessPlaceProducts");
  }
};

  /* -------------------------
       DEBUG TOKEN ON MOUNT
  ------------------------- */
  useEffect(() => {
    AsyncStorage.getItem("authToken").then((t) =>
      console.log("🔑 CURRENT STORED TOKEN:", t)
    );
  }, []);

const isValidEmail = (value) => {
  if (!value) return true; // ✅ email optional
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

const handleDelete = () => {
  // 🔒 BLOCK FIRST (before Alert)
  if (!isProvider) {
    navigation.navigate("BusinessPlaceProducts");
    return;
  }

  if (!editingClient?._id) return;


  Alert.alert(
    "Delete Client",
    "This action cannot be undone.",
    [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          try {
            await api.delete(`/api/customers/${editingClient._id}`);
            navigation.pop(2); // back to Clients list
          } catch (err) {
            Alert.alert("Error", "Failed to delete client.");
          }
        },
      },
    ]
  );
};


  /* -------------------------
       SAVE TO BACKEND (FIXED)
  ------------------------- */
 const handleSave = async () => {
  // 🔒 FIRST — block preview users
  if (!isProvider) {
    navigation.navigate("BusinessPlaceProducts");
    return;
  }

  // ✅ THEN validation
  if (!fullName.trim() || fullName.trim().length < 2) {
    Alert.alert("Name required", "Client name must be at least 2 characters");
    return;
  }



if (!isValidEmail(email)) {
  Alert.alert("Invalid email", "Please enter a valid email address");
  return;
}


    try {
      setLoading(true);

      const payload = {
  name: fullName.trim(),
 phone: phone ? phone.replace(/\D/g, "") : undefined,
  email: email?.trim() || undefined,
  company: company || undefined,
  address: address || undefined,
  notes: notes || undefined,
};


      console.log("📤 Sending client payload:", payload);

      // 🔥 FIXED — using correct endpoint + axios wrapper with auto-token
     const res = isEditMode
  ? await api.put(`/api/customers/${editingClient._id}`, payload)
  : await api.post("/api/customers", payload);


      console.log("📥 Add Client Response:", res.data);

      if (!res.data.success) {
        Alert.alert("Error", res.data.message || "Failed to save client.");
        return;
      }

      // ✅ Always return to Clients list after save
// ✅ Go back to the existing Clients screen
const newClient = res.data.customer || res.data.client;

const fromPicker = route?.params?.fromPicker;
const onSelect = route?.params?.onSelect;

if (fromPicker && onSelect) {
  // 🔥 Auto select client
  onSelect(newClient);

  // 🔥 Go back twice (AddClient → Clients → Invoice)
  navigation.goBack();
  navigation.goBack();
} else {
  navigation.goBack();
}




    } catch (err) {
      console.log("❌ Add Client Error:", err.response?.data || err);
      Alert.alert("Error", "Something went wrong saving this client.");
    } finally {
      setLoading(false);
    }
  };

  /* -------------------------
         UI (UNCHANGED)
  ------------------------- */
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      
      {/* HEADER */}
      <BlurView intensity={50} tint={theme.blurTint} style={styles.header}>
        <TouchableOpacity style={styles.headerSide} onPress={() => navigation.goBack()}>
          <Text style={[styles.headerText, { color: "#007AFF" }]}>Cancel</Text>
        </TouchableOpacity>

        <View style={styles.headerCenter}>
         <Text style={[styles.headerTitle, { color: theme.text }]}>
  {isEditMode ? "Edit Client" : "New Client"}
</Text>

        </View>



       <TouchableOpacity
  onPress={handleSave}
  disabled={!fullName.trim().length || loading}
  style={[
    styles.checkButton,
    {
      backgroundColor:
        fullName.trim().length && !loading
          ? "#007AFF"
          : darkMode
          ? "rgba(255,255,255,0.15)"
          : "rgba(0,0,0,0.1)",
    },
  ]}
>
  {loading ? (
    <ActivityIndicator color="#fff" size="small" />
  ) : (
    <Ionicons
      name="checkmark"
      size={20}
      color={
        fullName.trim().length && !loading
          ? "#fff"
          : darkMode
          ? "#888"
          : "#999"
      }
    />
  )}
</TouchableOpacity>
      </BlurView>

      {/* FORM */}
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingBottom: 120,
            paddingTop: 70,
          }}
        >
          {/* AVATAR */}
         <View style={styles.avatarWrap}>
  <ContactAvatar size={160} />
</View>
         {/* MAIN CARD */}
<TouchableOpacity
  activeOpacity={1}
  onPress={() => {
    if (!isProvider) {
      navigation.navigate("BusinessPlaceProducts");
      return;
    }
  }}
>
  <View
    style={[
      styles.card,
      { backgroundColor: theme.card, shadowOpacity: darkMode ? 0 : 0.06 },
    ]}
  >
    <Field
      label="Full Name"
      placeholder="Client's full name"
      value={fullName}
      onChange={setFullName}
      theme={theme}
      darkMode={darkMode}
    />
            <View style={styles.hairline} />

            <Field
              label="Phone"
              placeholder="Contact Number"
              value={phone}
              onChange={(text) => setPhone(formatPhoneNumber(text))}
              theme={theme}
              darkMode={darkMode}
       
            />
            <View style={styles.hairline} />

            <Field
              label="Email"
              placeholder="john@example.com"
              value={email}
              onChange={setEmail}
              theme={theme}
              darkMode={darkMode}
        
            />
          </View>
</TouchableOpacity>

          {/* ADDITIONAL INFO */}
          <Text style={[styles.sectionHeader, { color: theme.subtleText }]}>
            ADDITIONAL INFO
          </Text>

        <TouchableOpacity
  activeOpacity={1}
  onPress={() => {
    if (!isProvider) {
      navigation.navigate("BusinessPlaceProducts");
      return;
    }
  }}
>
  <View
    style={[
      styles.card,
      { backgroundColor: theme.card, shadowOpacity: darkMode ? 0 : 0.06 },
    ]}
  >
            <Field
              label="Company"
              placeholder="Optional"
              value={company}
              onChange={setCompany}
              theme={theme}
              darkMode={darkMode}
  
            />
            <View style={styles.hairline} />

            <Field
              label="Address"
              placeholder="Street, city, state"
              value={address}
              onChange={setAddress}
              theme={theme}
              darkMode={darkMode}

            />
            <View style={styles.hairline} />

            <Field
              label="Notes"
              placeholder="Special instructions…"
              value={notes}
              onChange={setNotes}
              theme={theme}
              darkMode={darkMode}
            
            />
      </View>
</TouchableOpacity>


{isEditMode && (
  <TouchableOpacity
    onPress={handleDelete}
    style={styles.deleteButton}
  >
    <Ionicons
      name="trash-outline"
      size={18}
      color="#FF3B30"
      style={{ marginRight: 6 }}
    />
    <Text style={styles.deleteText}>Delete Client</Text>
  </TouchableOpacity>
)}


          
        </ScrollView>
      </KeyboardAvoidingView>



      {/* BOTTOM SAVE BUTTON */}
      <BlurView intensity={50} tint={theme.blurTint} style={styles.bottomBar}>
        <TouchableOpacity
          onPress={handleSave}
          disabled={!fullName.trim().length || loading}
          style={[
            styles.saveButton,
            {
              backgroundColor:
                !fullName.trim().length || loading ? "#B9B9BC" : "#007AFF",
            },
          ]}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
           <Text style={styles.saveText}>
  {isEditMode ? "Save Changes" : "Save Client"}
</Text>

          )}
        </TouchableOpacity>
      </BlurView>



    </SafeAreaView>
  );
}

/* ---------- Styles (unchanged) ---------- */
const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    height: 92,
    paddingTop: Platform.OS === "ios" ? 12 : 8,
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    paddingHorizontal: 15,
    paddingBottom: 8,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 20,
  },

  headerSide: { width: 70, justifyContent: "center" },
  headerCenter: { flex: 1, alignItems: "center" },

  headerTitle: { fontSize: 17, fontWeight: "700" },
  headerText: { fontSize: 17, fontWeight: "600" },

  avatarWrap: { alignItems: "center", marginBottom: 20 },

  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    alignItems: "center",
    justifyContent: "center",
  },


checkButton: {
  width: 34,
  height: 34,
  borderRadius: 17,
  alignItems: "center",
  justifyContent: "center",
  marginBottom: -12,
},



  card: {
    borderRadius: 24,
    marginHorizontal: 16,
    marginBottom: 22,
    paddingHorizontal: 14,
    paddingVertical: 6,
    shadowColor: "#000",
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
  },

  fieldRow: { paddingVertical: 12 },

  label: {
    fontSize: 13,
    marginBottom: 4,
    fontWeight: "600",
  },

  input: {
    fontSize: 17,
    fontWeight: "500",
    paddingVertical: 4,
  },

  hairline: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: "rgba(0,0,0,0.12)",
  },

  sectionHeader: {
    marginLeft: 22,
    marginBottom: 6,
    fontSize: 12,
    fontWeight: "700",
    letterSpacing: 0.5,
  },

  bottomBar: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    height: 85,
    paddingHorizontal: 16,
    justifyContent: "center",
  },

  saveButton: {
    height: 52,
    borderRadius: 30,
    alignItems: "center",
    justifyContent: "center",
  },

deleteButton: {
  marginTop: 30,
  marginHorizontal: 16,
  paddingVertical: 14,
  borderRadius: 18,
  flexDirection: "row",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "rgba(255,59,48,0.12)",
},

deleteText: {
  fontSize: 15,
  fontWeight: "700",
  color: "#FF3B30",
},



  saveText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600",
  },
});
