import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import styles from './Button.module.css';
import type { ButtonProps } from './Button.types';

export const Button = ({
  variant,
  size,
  loading = false,
  disabled = false,
  fullWidth = false,
  leftIcon,
  rightIcon,
  onClick,
  type = 'button',
  children,
}: ButtonProps) => {
  const isDisabled = disabled || loading;
  const hoverScale =
    variant === 'primary' || variant === 'secondary' ? 1.02 : variant === 'ghost' ? 1.01 : undefined;

  return (
    <motion.button
      type={type}
      className={cn(
        styles.btn,
        styles[variant],
        styles[size],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
      )}
      onClick={onClick}
      disabled={isDisabled}
      whileHover={!isDisabled && hoverScale ? { scale: hoverScale } : undefined}
      whileTap={!isDisabled ? { scale: 0.97 } : undefined}
      transition={{ duration: 0.15 }}
    >
      {loading && <span className={styles.spinner} aria-hidden="true" />}
      {!loading && leftIcon}
      <span>{children}</span>
      {!loading && rightIcon}
    </motion.button>
  );
};
