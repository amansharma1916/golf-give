import { create } from 'zustand';
import type { AddToastPayload, ToastStore } from '../components/ui/Toast/Toast.types';

const generateToastId = (): string => {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }

  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
};

export const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (toast: AddToastPayload) => {
    const id = generateToastId();

    set((state) => ({
      toasts: [...state.toasts, { ...toast, id, duration: toast.duration ?? 4000 }],
    }));

    return id;
  },
  removeToast: (id: string) => {
    set((state) => ({
      toasts: state.toasts.filter((toast) => toast.id !== id),
    }));
  },
}));
