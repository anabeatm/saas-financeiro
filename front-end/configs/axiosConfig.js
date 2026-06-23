import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:5173",
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("app-token");
    const user = JSON.parse(localStorage.getItem("user") || "null");
    const tokenUser = user?.token;

    if (token || tokenUser) {
      config.headers.Authorization = `Bearer ${token || tokenUser}`;
    }

    return config;
  },
  (error) => Promise.reject(error),
);

export default api;
