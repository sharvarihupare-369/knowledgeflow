import axios from "axios";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api",
  headers: {
    "Content-Type": "application/json",
  },
});

// Optionally add interceptors here if needed (e.g. for injecting tokens)
api.interceptors.request.use((config) => {
  // If you use localStorage for token, you could do it here
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    // You can handle global errors like 401 Unauthorized here
    return Promise.reject(error);
  }
);
