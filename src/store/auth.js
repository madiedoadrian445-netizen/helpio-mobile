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
    const token = await AsyncStorage.getItem(TOKEN_KEY);

    set({
      token: token || null,
      isHydrated: true,
    });
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
