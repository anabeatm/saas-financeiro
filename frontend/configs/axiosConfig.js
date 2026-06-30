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

api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("app-token");
      localStorage.removeItem("user");
      window.location.href = "/login";
      return Promise.reject("Your session expired. Please, try login again");
    }
    if (error.response && error.response.data && error.response.data.message) {
      return Promise.reject(error.response.data.message);
    } else if (error.message === "Network Error") {
      return Promise.reject("Error conecting server. Verify backend");
    } else {
      return Promise.reject("An unexpected error occurred. Try again.");
    }
  },
);

export default api;
