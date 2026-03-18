import axios from "axios";

const BASE_URL =
  window.location.hostname === "localhost"
    ? "http://localhost:8080/api"
    : "http://192.168.1.9:8080/api";

const API = axios.create({
  baseURL: BASE_URL
});

export default API;