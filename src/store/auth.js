// src/store/auth.js
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "authToken"; // ⭐ MUST MATCH api.js

const useAuthStore = create((set) => ({
  user: null,
  provider: null,
  token: null,
  isHydrated: false,

  setAuth: async ({ user, provider, token }) => {
    if (token) {
      await AsyncStorage.setItem(TOKEN_KEY, token);
    }

    set({
      user: user || null,
      provider: provider || null,
      token: token || null,
      isHydrated: true,
    });
  },

 hydrate: async () => {
  // 🔥 DEV MODE → always force login on reload
  if (__DEV__) {
    await AsyncStorage.removeItem(TOKEN_KEY);

    set({
      token: null,
      user: null,
      provider: null,
      isHydrated: true,
    });

    return;
  }

  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    if (!token) {
      set({ token: null, user: null, provider: null, isHydrated: true });
      return;
    }

    // restore user from backend
    const res = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!res.ok) throw new Error("Auth restore failed");

    const data = await res.json();

    set({
      token,
      user: data.user || null,
      provider: data.provider || null,
      isHydrated: true,
    });
  } catch (e) {
    console.log("Auth hydrate error:", e);

    await AsyncStorage.removeItem(TOKEN_KEY);

    set({
      token: null,
      user: null,
      provider: null,
      isHydrated: true,
    });
  }
},


  logout: async () => {
    await AsyncStorage.removeItem(TOKEN_KEY);
    set({
      user: null,
      provider: null,
      token: null,
      isHydrated: true,
    });
  },
}));

export default useAuthStore;
