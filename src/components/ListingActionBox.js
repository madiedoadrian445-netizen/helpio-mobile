import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const HELPIO_BLUE = "#00A6FF";

export default function ListingActionBox({
  title,
  subtitle,
  buttonLabel,
  onPress,
  icon = "chatbubble-ellipses-outline",
}) {
  return (
    <View style={styles.wrap}>
      <View style={styles.left}>
        <Ionicons name={icon} size={22} color={HELP_IO_BLUE} />
        <View style={styles.textCol}>
          <Text style={styles.title}>{title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>

      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.button,
          pressed && styles.buttonPressed,
        ]}
      >
        <Text style={styles.buttonText}>{buttonLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginTop: 14,
    padding: 14,
    borderRadius: 18,
    backgroundColor: "#fff",

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 12,

    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  left: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 12,
  },

  textCol: {
    marginLeft: 10,
    flexShrink: 1,
  },

  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#111827",
  },

  subtitle: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 2,
  },

  button: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: HELPIO_BLUE,
  },

  buttonPressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },

  buttonText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "600",
  },
});