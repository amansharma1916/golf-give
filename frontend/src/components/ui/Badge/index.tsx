import { cn } from '../../../lib/utils';
import styles from './Badge.module.css';
import type { BadgeProps } from './Badge.types';

export const Badge = ({ variant, size = 'md', children }: BadgeProps) => {
  return <span className={cn(styles.badge, styles[size], styles[variant])}>{children}</span>;
};
