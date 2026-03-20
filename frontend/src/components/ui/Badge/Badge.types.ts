import type { ReactNode } from 'react';

export type BadgeVariant = 'success' | 'warning' | 'error' | 'info' | 'neutral';

export type BadgeSize = 'sm' | 'md';

export interface BadgeProps {
  variant: BadgeVariant;
  size?: BadgeSize;
  children: ReactNode;
}
