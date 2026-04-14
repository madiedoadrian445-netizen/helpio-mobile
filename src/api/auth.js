import api from "./index";

/* ---------------- LOGIN ---------------- */
export async function login(email, password) {
  const body = {
    email: (email || "").trim().toLowerCase(),
    password: (password || "").trim(),
  };

  const { data } = await api.post("/api/auth/login", body);
return data; // { token, refreshToken, user }
}

/* ---------------- REGISTER CUSTOMER ---------------- */
export async function register({ name, email, password }) {
  const body = {
    name: (name || "").trim(),
    email: (email || "").trim().toLowerCase(),
    password: (password || "").trim(),
  };

  const { data } = await api.post("/api/auth/register", body);
 return data; // { token, refreshToken, user }
}

/* ---------------- REGISTER PROVIDER (TEMP FLOW) ---------------- */
export async function registerProvider({
  name,
  email,
  password,
  companyName,
   phone, 
}) {
  const body = {
    name: (name || "").trim(),
    email: (email || "").trim().toLowerCase(),
    password: (password || "").trim(),
    companyName: (companyName || "").trim(),
     phone: (phone || "").replace(/\D/g, ""),
  };

  const { data } = await api.post("/api/auth/register-provider", body);
return data; // { token, refreshToken, user }
}
