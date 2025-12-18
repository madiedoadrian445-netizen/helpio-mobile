// src/config/api.js
import axios from "axios";
import useAuthStore from "../store/auth";

export const API_BASE_URL = "https://helpio-backend.onrender.com";

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

