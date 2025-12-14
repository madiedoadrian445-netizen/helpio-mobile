// src/api/auth.js
import api from "./index";

export async function login(email, password) {
  const body = {
    email: (email || "").trim().toLowerCase(),
    password: (password || "").trim(),
  };

  const { data } = await api.post("/api/auth/login", body);
  return data; // { token, user, provider }
}

export async function register({ name, email, password, role = "provider" }) {
  const body = {
    name: (name || "").trim(),
    email: (email || "").trim().toLowerCase(),
    password: (password || "").trim(),
    role,
  };

  const { data } = await api.post("/api/auth/register", body);
  return data; // { token, user }
}
