import axios from "axios";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080/api"
    : "http://192.168.1.77:8080/api"; // change to your server IP

const API = axios.create({
  baseURL: BASE_URL
});

// 🔐 Attach token automatically
API.interceptors.request.use((req) => {
  const token =
    localStorage.getItem("token") || sessionStorage.getItem("token");

  if (token) {
    req.headers.Authorization = `Bearer ${token}`;
  }

  return req;
});

export default API;