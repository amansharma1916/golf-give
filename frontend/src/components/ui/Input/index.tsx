import { useId } from 'react';
import { cn } from '../../../lib/utils';
import styles from './Input.module.css';
import type { InputProps } from './Input.types';

export const Input = ({
  label,
  placeholder,
  type = 'text',
  value,
  onChange,
  onBlur,
  error,
  hint,
  disabled = false,
  required = false,
  autoComplete,
  leftIcon,
  rightIcon,
  name,
  id,
}: InputProps) => {
  const generatedId = useId();
  const inputId = id ?? generatedId;

  return (
    <div className={styles.wrapper}>
      {label && (
        <label className={styles.label} htmlFor={inputId}>
          {label}
          {required && <span className={styles.required}>*</span>}
        </label>
      )}

      <div className={styles.inputWrapper}>
        {leftIcon && <span className={styles.iconLeft}>{leftIcon}</span>}
        <input
          id={inputId}
          name={name}
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          className={cn(
            styles.input,
            error && styles.inputError,
            Boolean(leftIcon) && styles.hasLeftIcon,
            Boolean(rightIcon) && styles.hasRightIcon,
          )}
        />
        {rightIcon && <span className={styles.iconRight}>{rightIcon}</span>}
      </div>

      {error ? <span className={styles.error}>{error}</span> : hint && <span className={styles.hint}>{hint}</span>}
    </div>
  );
};
