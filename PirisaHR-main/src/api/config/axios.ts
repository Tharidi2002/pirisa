import axios from "axios";

// Use environment variable for production, fallback to localhost for development
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "https://8080-firebase-pirisagit-1780633820276.cluster-zkm2jrwbnbd4awuedc2alqxrpk.cloudworkstations.dev/";

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
