// src/api/index.js
import axios from "axios";

/** Base URL of your delivery-service backend  */
const api = axios.create({
  baseURL: "http://localhost:5003/api",
  withCredentials: false,          // set true only if you use cookies
});

/** Request-side interceptor: add Authorization automatically */
api.interceptors.request.use((config) => {
  const token =
    JSON.parse(localStorage.getItem("token"))        // adjust if you store a plain string
    || "";                                           // fallback to empty

  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;
