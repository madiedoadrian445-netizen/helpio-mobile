// src/config/apiBase.js

if (!process.env.EXPO_PUBLIC_API_URL) {
  throw new Error("❌ EXPO_PUBLIC_API_URL is not set");
}

export const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_URL ||
  "https://helpio-backend.onrender.com";


console.log(
  "🌐 apiBase loaded:",
  process.env.EXPO_PUBLIC_API_URL,
  "→",
  API_BASE_URL
);
