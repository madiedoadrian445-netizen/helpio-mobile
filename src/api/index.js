import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_BASE_URL } from "../config/apiBase";

console.log("🌐 AXIOS INIT — API_BASE_URL =", API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

/* ===========================
   🔎 REQUEST LOGGER
=========================== */
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem("token");

    console.log("➡️ AXIOS REQUEST");
    console.log("➡️ URL:", config.baseURL + config.url);
    console.log("➡️ METHOD:", config.method);
    console.log("➡️ HEADERS:", config.headers);
    console.log("➡️ BODY:", config.data);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error("❌ AXIOS REQUEST SETUP ERROR", error);
    return Promise.reject(error);
  }
);

/* ===========================
   🔥 RESPONSE LOGGER
=========================== */
api.interceptors.response.use(
  (response) => {
    console.log("✅ AXIOS RESPONSE");
    console.log("✅ STATUS:", response.status);
    console.log("✅ DATA:", response.data);
    return response;
  },
  (error) => {
    console.error("🔥 AXIOS RESPONSE ERROR");

    if (error.response) {
      console.error("📡 STATUS:", error.response.status);
      console.error("📡 DATA:", error.response.data);
      console.error("📡 HEADERS:", error.response.headers);
    } else if (error.request) {
      console.error("📡 REQUEST SENT — NO RESPONSE RECEIVED");
      console.error(error.request);
    } else {
      console.error("🔥 ERROR MESSAGE:", error.message);
    }

    console.error("🔥 FULL ERROR OBJECT:", error);
    return Promise.reject(error);
  }
);

export default api;
