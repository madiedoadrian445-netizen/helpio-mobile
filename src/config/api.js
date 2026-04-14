// src/config/api.js
import axios from "axios";

/*
====================================================
 BACKEND SOURCES (SAFE)
====================================================
*/
let getToken;
let getRefreshToken;
let setAuth;
let logout;

export const injectStore = (store) => {
  getToken = () => store.getState().token;
  getRefreshToken = () => store.getState().refreshToken;
  setAuth = store.getState().setAuth;
  logout = store.getState().logout;
};

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

  const token = getToken?.();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)

);


let isRefreshing = false;
let refreshSubscribers = [];

const subscribeTokenRefresh = (callback) => {
  refreshSubscribers.push(callback);
};

const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

api.interceptors.response.use(
  (response) => response,

  async (error) => {
    const originalRequest = error.config;

    if (!originalRequest) return Promise.reject(error);

    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
  !originalRequest.url.includes("/api/auth/login") &&
!originalRequest.url.includes("/api/auth/refresh")
    ) {
      originalRequest._retry = true;

      // 🔁 queue if already refreshing
      if (isRefreshing) {
        return new Promise((resolve) => {
          subscribeTokenRefresh((newToken) => {
            originalRequest.headers = originalRequest.headers || {};
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(api(originalRequest));
          });
        });
      }

      isRefreshing = true;

      try {
        const refreshToken = getRefreshToken?.();

        if (!refreshToken) {
          await logout?.();
          return Promise.reject(error);
        }

        console.log("🔄 Refreshing token...");

        const res = await axios.post(
          `${API_BASE_URL}/api/auth/refresh`,
          { refreshToken }
        );

        const newToken = res.data.token;
        const newRefreshToken = res.data.refreshToken;

        // 🔥 update BOTH tokens
        await setAuth?.({
          token: newToken,
          refreshToken: newRefreshToken,
        });

        // 🔁 resolve queued requests
        onRefreshed(newToken);

        // 🔁 retry original request
        originalRequest.headers = originalRequest.headers || {};
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return api(originalRequest);

      } catch (refreshError) {
        console.log("❌ Refresh failed — logging out");
        await logout?.();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);