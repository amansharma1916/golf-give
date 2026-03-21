import axios from 'axios';
import { useUserStore } from '../stores/userStore';
import { env } from './env';
import { notifyError, notifyWarning } from './notify';

const api = axios.create({
  baseURL: env.VITE_API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = useUserStore.getState().authToken;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const statusCode = error.response?.status as number | undefined;
    const serverMessage = error.response?.data?.error?.message as string | undefined;

    if (statusCode === 401) {
      useUserStore.getState().logout();
      notifyWarning(serverMessage ?? 'Session expired. Please sign in again.');
      return Promise.reject(error);
    }

    if (statusCode && statusCode >= 500) {
      notifyError(serverMessage ?? 'Server error. Please try again in a moment.');
      return Promise.reject(error);
    }

    if (statusCode && statusCode >= 400) {
      notifyError(serverMessage ?? 'Request failed. Please check your input and try again.');
      return Promise.reject(error);
    }

    if (!statusCode) {
      notifyError('Network error. Check your internet connection and try again.');
    }

    return Promise.reject(error);
  },
);

export default api;
