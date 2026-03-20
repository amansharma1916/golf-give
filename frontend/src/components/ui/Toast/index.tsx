import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useToastStore } from '../../../stores/toastStore';
import { cn } from '../../../lib/utils';
import styles from './Toast.module.css';
import type { Toast as ToastType } from './Toast.types';

const TOAST_ICONS: Record<ToastType['type'], string> = {
  success: '✓',
  error: '✕',
  warning: '⚠',
  info: 'ℹ',
};

interface ToastItemProps {
  toast: ToastType;
}

const ToastItem = ({ toast }: ToastItemProps) => {
  const removeToast = useToastStore((state) => state.removeToast);

  useEffect(() => {
    const duration = toast.duration ?? 4000;
    const removeTimer = window.setTimeout(() => {
      removeToast(toast.id);
    }, duration);

    return () => {
      window.clearTimeout(removeTimer);
    };
  }, [toast, removeToast]);

  return (
    <motion.div
      className={cn(styles.toast, styles[toast.type])}
      role="status"
      aria-live="polite"
      initial={{ opacity: 0, x: 60, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
      layout
    >
      <span className={styles.icon}>{TOAST_ICONS[toast.type]}</span>
      <span className={styles.message}>{toast.message}</span>
      <button type="button" className={styles.dismiss} onClick={() => removeToast(toast.id)} aria-label="Dismiss toast">
        ✕
      </button>
    </motion.div>
  );
};

export const Toast = () => {
  const toasts = useToastStore((state) => state.toasts);

  return (
    <div className={styles.container}>
      <AnimatePresence>
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
};
