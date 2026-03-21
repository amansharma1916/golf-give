import type { ToastType } from '../components/ui/Toast/Toast.types';
import { useToastStore } from '../stores/toastStore';

const DEFAULT_DURATION = 4000;

const pushToast = (type: ToastType, message: string, duration = DEFAULT_DURATION): string => {
  return useToastStore.getState().addToast({ type, message, duration });
};

export const notifySuccess = (message: string, duration?: number): string => {
  return pushToast('success', message, duration);
};

export const notifyError = (message: string, duration?: number): string => {
  return pushToast('error', message, duration);
};

export const notifyWarning = (message: string, duration?: number): string => {
  return pushToast('warning', message, duration);
};

export const notifyInfo = (message: string, duration?: number): string => {
  return pushToast('info', message, duration);
};

export const getErrorMessage = (error: unknown, fallback = 'Something went wrong'): string => {
  if (typeof error === 'string' && error.trim()) {
    return error;
  }

  if (error && typeof error === 'object') {
    const maybeMessage = Reflect.get(error, 'message');
    if (typeof maybeMessage === 'string' && maybeMessage.trim()) {
      return maybeMessage;
    }
  }

  return fallback;
};
