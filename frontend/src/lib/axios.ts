import axios from 'axios';
import { useUserStore } from '../stores/userStore';
import type { User } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const user = useUserStore.getState().user as (User & { token?: string }) | null;
  const token = user?.token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useUserStore.getState().logout();
    }

    return Promise.reject(error);
  },
);

export default api;
