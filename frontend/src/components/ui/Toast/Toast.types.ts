export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export interface AddToastPayload {
  message: string;
  type: ToastType;
  duration?: number;
}

export interface ToastStore {
  toasts: Toast[];
  addToast: (toast: AddToastPayload) => string;
  removeToast: (id: string) => void;
}
