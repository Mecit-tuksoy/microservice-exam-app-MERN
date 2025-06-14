// src/services/api.js
import axios from "axios";

// API URL'leri
const API_URLS = {
  AUTH: process.env.REACT_APP_AUTH_URL,
  TEST: process.env.REACT_APP_TEST_URL,
  STORAGE: process.env.REACT_APP_STORAGE_URL,
  ANALYTICS: process.env.REACT_APP_ANALYTICS_URL,
};

// API isteklerini yapmak için axios instance'ları
const createAxiosInstance = (baseURL) => {
  const instance = axios.create({
    baseURL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  // Request interceptor - her istekte token eklemek için
  instance.interceptors.request.use(
    (config) => {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (token && user && user.id && user.username) {
        config.headers["x-auth-token"] = token;
        config.headers["user-id"] = user.id;
        config.headers["username"] = user.username;
      }
      return config;
    },
    (error) => {
      return Promise.reject(error);
    }
  );

  // Response interceptor - token süresi dolmuşsa logout yapmak için
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response && error.response.status === 401) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
      }
      return Promise.reject(error);
    }
  );

  return instance;
};

// Service'ler için axios instance'ları
export const authApi = createAxiosInstance(API_URLS.AUTH);
export const testApi = createAxiosInstance(API_URLS.TEST);
export const storageApi = createAxiosInstance(API_URLS.STORAGE);
export const analyticsApi = createAxiosInstance(API_URLS.ANALYTICS);
