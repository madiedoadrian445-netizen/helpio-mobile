// src/api/client.js
import axios from "axios";

import { API_BASE_URL } from "../config/apiBase";
export const API_BASE = API_BASE_URL;


const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
});

export default api;
