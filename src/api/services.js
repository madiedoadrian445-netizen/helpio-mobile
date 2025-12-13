// src/api/services.js
import api from "./client";

export const getServices = async () => {
  try {
    console.log("🌐 Fetching services from:", api.defaults.baseURL + "/api/services");
    const res = await api.get("/api/services");
    console.log("✅ Got response:", res.data);
    return res.data;
  } catch (err) {
    console.log("❌ Fetch services error:", err.message);
    return [];
  }
};
