import type { ChangeEvent, FocusEventHandler, ReactNode } from 'react';

export interface InputProps {
  label?: string;
  placeholder?: string;
  type?: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  onBlur?: FocusEventHandler<HTMLInputElement>;
  error?: string;
  hint?: string;
  disabled?: boolean;
  required?: boolean;
  autoComplete?: string;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  name?: string;
  id?: string;
}
