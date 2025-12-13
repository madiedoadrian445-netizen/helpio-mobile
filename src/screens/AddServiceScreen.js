// src/screens/AddServiceScreen.js
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { createService } from "../api/services";

export default function AddServiceScreen({ navigation }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);

  const onSubmit = async () => {
    if (!title.trim() || !description.trim() || !price.trim()) {
      Alert.alert("Missing fields", "Title, description, and price are required.");
      return;
    }
    const priceNum = Number(price);
    if (Number.isNaN(priceNum) || priceNum < 0) {
      Alert.alert("Invalid price", "Enter a non-negative number.");
      return;
    }

    try {
      setLoading(true);
      await createService({
        title: title.trim(),
        description: description.trim(),
        price: priceNum,
        category: category.trim(),
        location: location.trim(),
      });
      setLoading(false);
      Alert.alert("Success", "Your service was created!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      setLoading(false);
      const msg = e?.response?.data?.error || e.message || "Failed to create service";
      Alert.alert("Error", msg);
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Create a Service</Text>

        <Text style={styles.label}>Title *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. AC Repair"
          value={title}
          onChangeText={setTitle}
        />

        <Text style={styles.label}>Description *</Text>
        <TextInput
          style={[styles.input, styles.multiline]}
          placeholder="Describe what you offer..."
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={4}
        />

        <Text style={styles.label}>Price (USD) *</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. 75"
          keyboardType="numeric"
          value={price}
          onChangeText={setPrice}
        />

        <Text style={styles.label}>Category</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Home Services"
          value={category}
          onChangeText={setCategory}
        />

        <Text style={styles.label}>Location</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g. Miami, FL"
          value={location}
          onChangeText={setLocation}
        />

        <TouchableOpacity style={styles.button} onPress={onSubmit} disabled={loading}>
          {loading ? <ActivityIndicator /> : <Text style={styles.buttonText}>Publish</Text>}
        </TouchableOpacity>

        <Text style={styles.hint}>Fields with * are required</Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, gap: 12 },
  title: { fontSize: 22, fontWeight: "700", marginBottom: 8 },
  label: { fontSize: 14, color: "#333", marginTop: 4 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 12,
    backgroundColor: "#fff",
  },
  multiline: { height: 110, textAlignVertical: "top" },
  button: {
    marginTop: 18,
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  hint: { textAlign: "center", color: "#666", marginTop: 8 },
});
