// src/api/index.js
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ✅ Always use your live backend (Render)
export const API_BASE = "https://helpio-backend.onrender.com";

console.log("🔗 API Base URL =>", API_BASE);

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

api.interceptors.request.use(async (req) => {
  const token = await AsyncStorage.getItem("token");
  if (token) req.headers.Authorization = `Bearer ${token}`;
  return req;
});

export default api;
