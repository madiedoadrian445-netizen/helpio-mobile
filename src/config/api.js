// src/config/api.js
import axios from "axios";
import useAuthStore from "../store/auth";

/*
====================================================
 BACKEND SOURCES (SAFE)
====================================================
*/

const LOCAL_URL = "http://192.168.1.217:5001"; // keep your real local IP
const RENDER_URL = "https://helpio-backend.onrender.com";
const CLOUDFLARE_URL = "https://floors-procedures-flows-jimmy.trycloudflare.com";

/*
====================================================
 TOGGLE MODE
====================================================
*/

const MODE = "render";

// "local" | "render" | "cloudflare"

/*
====================================================
 RESOLVE BASE URL
====================================================
*/

const resolveBaseURL = () => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }

  if (MODE === "local") return LOCAL_URL;
  if (MODE === "render") return RENDER_URL;

  return CLOUDFLARE_URL;
};

export const API_BASE_URL = resolveBaseURL();

console.log("🔗 API Base URL =>", API_BASE_URL);

console.log(
  "🔗 API Base URL =>",
  process.env.EXPO_PUBLIC_API_URL,
  " | resolved =>",
  API_BASE_URL
);

/* ---------------------------------------------------------
   Axios instance
---------------------------------------------------------- */
export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

/* ---------------------------------------------------------
   Automatically attach token to every request (ZUSTAND)
---------------------------------------------------------- */
api.interceptors.request.use(
  (config) => {
    // ⭐ Ensure headers exist
    config.headers = config.headers || {};

    const token = useAuthStore.getState().token;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

