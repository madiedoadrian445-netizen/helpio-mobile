// src/screens/EditProfileScreen.js
import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import { BlurView } from "expo-blur";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import useAuthStore from "../store/auth";
import { api } from "../config/api";

const HELP_IO_BLUE = "#00A6FF";

export default function EditProfileScreen({ navigation }) {
  const { theme } = useTheme();
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const setAuth = useAuthStore((state) => state.setAuth);
const provider = useAuthStore((state) => state.provider);
const isProvider = user?.role === "provider";



 const [name, setName] = useState(
  isProvider
    ? provider?.businessName || ""
    : user?.name || ""
);

const [image, setImage] = useState(
  isProvider
    ? provider?.logo || null
    : user?.avatar || null
);
  const [loading, setLoading] = useState(false);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
    });

    if (!result.canceled) {
      setImage(result.assets[0].uri);
    }
  };

 const handleSave = async () => {
  try {
    setLoading(true);

  let avatarUrl = isProvider
  ? provider?.logo || null
  : user?.avatar || null;

    // 🔥 If user selected a NEW image → upload first
    if (
  image &&
  image !== (isProvider ? provider?.logo : user?.avatar)
) {
      const imageForm = new FormData();
    const asset = {
  uri: image,
  name: image.split("/").pop(),
  type: "image/jpeg",
};

imageForm.append("image", asset);

    const uploadRes = await api.post(
  "/api/upload/single",
  imageForm,
  {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }
);
      avatarUrl = uploadRes.data.url; // ✅ IMPORTANT (your backend returns "url")
    }

    // 🔥 Now update profile using JSON (NOT multipart)
   let res;

if (user?.role === "provider") {
  res = await api.put(
    "/api/providers",
    {
      businessName: name,   // ✅ correct field
      logo: avatarUrl,      // ✅ correct field
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  await setAuth({
    user,                          // user unchanged
    provider: res.data.provider,   // ✅ correct response field
    token,
  });

} else {
  res = await api.put(
    `/api/customers/${user._id}`,
    {
      name,
      avatar: avatarUrl,
    },
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  await setAuth({
    user: res.data,   // customer route returns updated customer
    provider: null,
    token,
  });
}
    navigation.goBack();
  } catch (err) {
    console.log("Update profile error:", err.response?.data || err.message);
    Alert.alert("Error", "Unable to update profile.");
  } finally {
    setLoading(false);
  }
};

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]}>
      <BlurView intensity={40} tint={theme.blurTint} style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>
          Edit Profile
        </Text>
      </BlurView>

      <View style={styles.content}>
        <TouchableOpacity style={styles.avatarWrap} onPress={pickImage}>
          {image ? (
            <Image source={{ uri: image }} style={styles.avatar} />
          ) : (
            <Ionicons name="person-outline" size={40} color={HELP_IO_BLUE} />
          )}
        </TouchableOpacity>

        <TextInput
          value={name}
          onChangeText={setName}
          placeholder="Full Name"
          placeholderTextColor="#999"
          style={[
            styles.input,
            {
              backgroundColor: theme.card,
              color: theme.text,
            },
          ]}
        />

        <TouchableOpacity
          style={styles.saveButton}
          onPress={handleSave}
          disabled={loading}
        >
          <Text style={styles.saveText}>
            {loading ? "Saving..." : "Save Changes"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },

  header: {
    height: Platform.OS === "ios" ? 90 : 70,
    justifyContent: "flex-end",
    alignItems: "center",
    paddingBottom: 10,
  },

  title: {
    fontSize: 20,
    fontWeight: "700",
  },

  content: {
    padding: 20,
    marginTop: 30,
  },

  avatarWrap: {
    alignSelf: "center",
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: "#f2f2f2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 30,
    overflow: "hidden",
  },

  avatar: {
    width: "100%",
    height: "100%",
  },

  input: {
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 20,
  },

  saveButton: {
    backgroundColor: HELP_IO_BLUE,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
  },

  saveText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 16,
  },
});