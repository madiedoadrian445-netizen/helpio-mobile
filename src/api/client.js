// src/api/client.js
import axios from "axios";

export const API_BASE = "https://helpio-backend.onrender.com";

const api = axios.create({
  baseURL: API_BASE,
  timeout: 20000,
});

export default api;
