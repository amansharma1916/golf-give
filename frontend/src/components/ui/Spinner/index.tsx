import { cn } from '../../../lib/utils';
import styles from './Spinner.module.css';
import type { SpinnerProps } from './Spinner.types';

export const Spinner = ({ size = 'md', color = 'primary' }: SpinnerProps) => {
  return <span className={cn(styles.spinner, styles[size], styles[color])} aria-hidden="true" />;
};
