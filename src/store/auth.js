// src/store/auth.js
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../config/api";
import { injectStore } from "../config/api";
import * as SecureStore from "expo-secure-store";


const TOKEN_KEY = "authToken"; // ⭐ MUST MATCH api.js
const REFRESH_TOKEN_KEY = "refreshToken";
const SECURE_REFRESH_KEY = "secure_refresh_token";


const useAuthStore = create((set) => ({
  user: null,
  provider: null,
  token: null,
  refreshToken: null,
  isHydrated: false,
   isGuest: false,
   authReady: false,


analyticsCache: {
  revenueAllTime: 0,
  revenue30Days: 0,
  totalInvoices: 0,
  totalTransactions: 0,
  totalClients: 0,
},


setAnalyticsCache: (data) =>
  set((state) => ({
    analyticsCache: {
      ...state.analyticsCache,
      ...data,
    },
  })),



   continueAsGuest: () => {
  set({
    user: null,
    provider: null,
    token: null, // 🔥 key trick
    refreshToken: null,
    isGuest: true,
    isHydrated: true,
    authReady: true,
  });
},
  
  setAuth: async ({ user, provider, token, refreshToken }) => {
  const current = useAuthStore.getState();

  const finalUser = user ?? current.user;
  const finalProvider = provider ?? current.provider;

// 🔥 ACCESS TOKEN → MEMORY ONLY (do NOT store)

// 🔒 REFRESH TOKEN → SecureStore
if (refreshToken) {
  await SecureStore.setItemAsync(SECURE_REFRESH_KEY, refreshToken);
}

  if (finalUser) {
    await AsyncStorage.setItem("user", JSON.stringify(finalUser));
  }

  if (finalProvider) {
    await AsyncStorage.setItem("provider", JSON.stringify(finalProvider));
  }

  set({
  user: finalUser,
  provider: finalProvider,
  token: token || current.token,
  refreshToken: refreshToken || current.refreshToken,
  isGuest: false, // 🔥 IMPORTANT
  isHydrated: true,
  authReady: true,
});
},

hydrate: async () => {
  console.log("🌐 HYDRATE START");

 // 🔒 Load refresh token from SecureStore
let refreshToken = await SecureStore.getItemAsync(SECURE_REFRESH_KEY);

// 🔁 MIGRATION (IMPORTANT — keeps existing users logged in)
if (!refreshToken) {
  const oldRefresh = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

  if (oldRefresh) {
    console.log("🔄 Migrating refresh token to SecureStore");

    await SecureStore.setItemAsync(SECURE_REFRESH_KEY, oldRefresh);
    await AsyncStorage.removeItem(REFRESH_TOKEN_KEY);

    refreshToken = oldRefresh;
  }
}

  const storedUser = await AsyncStorage.getItem("user");
  const storedProvider = await AsyncStorage.getItem("provider");

  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const parsedProvider = storedProvider ? JSON.parse(storedProvider) : null;




if (!refreshToken) {
set({
  token: null,
  refreshToken: null,
  user: null,
  provider: null,
  isGuest: false,
  isHydrated: true,
  authReady: true,
});
  return;
}


  // 🔥 INSTANT HYDRATION (NO WAIT)
set({
  token: null, // 🔥 CRITICAL FIX
  refreshToken,
  user: parsedUser,
  provider: parsedProvider,
  isHydrated: true,
  authReady: true,
});

  // 🔥 BACKGROUND REFRESH (NON-BLOCKING)
  try {
  const res = await api.post("/api/auth/refresh", {
  refreshToken,
});

const newToken = res.data.token;
const newRefreshToken = res.data.refreshToken;

// 🔒 update SecureStore
if (newRefreshToken) {
  await SecureStore.setItemAsync(
    SECURE_REFRESH_KEY,
    newRefreshToken
  );
}

set({
  token: newToken,
  refreshToken: newRefreshToken || refreshToken,
authReady: true,
});



    console.log("✅ Background auth refresh success");
} catch (e) {
  if (e.response?.status === 401) {
    console.log("❌ Refresh token invalid — logging out");

    await SecureStore.deleteItemAsync(SECURE_REFRESH_KEY);

    set({
      user: null,
      provider: null,
      token: null,
      refreshToken: null,
      isGuest: false,
      isHydrated: true,
      authReady: true,
    });
  } else {
    console.log("⚠️ Temporary refresh failure — keeping session");

    set({
      token: null,
      isHydrated: true,
      authReady: true,
    });
  }
}
},

logout: async () => {
  await SecureStore.deleteItemAsync(SECURE_REFRESH_KEY);

  await AsyncStorage.multiRemove([
    "user",
    "provider",
  ]);

  set({
    user: null,
    provider: null,
    token: null,
    refreshToken: null,
    isGuest: false,
    isHydrated: true,
    authReady: true,


   analyticsCache: {
  revenueAllTime: 0,
  revenue30Days: 0,
  totalInvoices: 0,
  totalTransactions: 0,
  totalClients: 0,
},
  });
},
}));

export default useAuthStore;
injectStore(useAuthStore);