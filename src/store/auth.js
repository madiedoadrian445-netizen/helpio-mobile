// src/store/auth.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "helpio_token";

export async function setToken(token) {
  try { await AsyncStorage.setItem(KEY, token); } catch {}
}

export async function getToken() {
  try { return await AsyncStorage.getItem(KEY); } catch { return null; }
}

export async function clearToken() {
  try { await AsyncStorage.removeItem(KEY); } catch {}
}
