import axios from "axios";

// Use production API URL
const BASE_URL = import.meta.env.PROD 
  ? "http://129.212.239.12/api"
  : "http://localhost:8081/api";

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
