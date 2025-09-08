import axios from 'axios';

const apiBaseFromEnv = (import.meta as any)?.env?.VITE_API_URL as string | undefined;
const API_BASE_URL = apiBaseFromEnv && apiBaseFromEnv.length > 0 ? apiBaseFromEnv : '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const token = localStorage.getItem('token');
      const isAuthPage = window.location.pathname.startsWith('/login') || window.location.pathname.startsWith('/register');
      if (token && !isAuthPage) {
        if (!(window as any).__authRedirecting) {
          (window as any).__authRedirecting = true;
          localStorage.removeItem('token');
          const currentPath = window.location.pathname + window.location.search;
          const params = new URLSearchParams();
          params.set('redirect', currentPath);
          window.location.replace(`/login?${params.toString()}`);
        }
      }
    }
    return Promise.reject(error);
  }
);

export default api;
