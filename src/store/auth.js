// src/store/auth.js
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { api } from "../config/api";
import { injectStore } from "../config/api";

const TOKEN_KEY = "authToken"; // ⭐ MUST MATCH api.js
const REFRESH_TOKEN_KEY = "refreshToken";



const useAuthStore = create((set) => ({
  user: null,
  provider: null,
  token: null,
  refreshToken: null,
  isHydrated: false,
   isGuest: false,

   continueAsGuest: () => {
  set({
    user: null,
    provider: null,
    token: null, // 🔥 key trick
    refreshToken: null,
    isGuest: true,
    isHydrated: true,
  });
},
  
  setAuth: async ({ user, provider, token, refreshToken }) => {
  const current = useAuthStore.getState();

  const finalUser = user ?? current.user;
  const finalProvider = provider ?? current.provider;

  if (token) {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  }

  if (refreshToken) {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
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
});
},

hydrate: async () => {
  console.log("🌐 HYDRATE START");

  const token = await AsyncStorage.getItem(TOKEN_KEY);
  const refreshToken = await AsyncStorage.getItem(REFRESH_TOKEN_KEY);

  const storedUser = await AsyncStorage.getItem("user");
  const storedProvider = await AsyncStorage.getItem("provider");

  const parsedUser = storedUser ? JSON.parse(storedUser) : null;
  const parsedProvider = storedProvider ? JSON.parse(storedProvider) : null;

  console.log("🧪 TOKEN:", token);


  if (!token) {
  set({
    token: null,
    refreshToken: null,
    user: null,
    provider: null,
    isGuest: false,
    isHydrated: true,
  });
  return;
}


  // 🔥 INSTANT HYDRATION (NO WAIT)
  set({
    token,
    refreshToken,
    user: parsedUser,
    provider: parsedProvider,
    isHydrated: true,
  });

  // 🔥 BACKGROUND REFRESH (NON-BLOCKING)
  try {
    const res = await api.get("/api/auth/me");

    const data = res.data;

    set({
      user: data.user || parsedUser,
      provider: data.provider || parsedProvider,
    });

    console.log("✅ Background auth refresh success");
  } catch (e) {
    console.log("⚠️ Background auth refresh failed (ignored):", e);
  }
},

logout: async () => {
  await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);

  set({
    user: null,
    provider: null,
    token: null,
    refreshToken: null,
    isGuest: false, // 🔥 REQUIRED
    isHydrated: true,
  });
},
}));

export default useAuthStore;
injectStore(useAuthStore);