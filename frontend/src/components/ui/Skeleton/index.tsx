import type { CSSProperties } from 'react';
import { cn } from '../../../lib/utils';
import styles from './Skeleton.module.css';
import type { SkeletonProps } from './Skeleton.types';

export const Skeleton = ({
  width = '100%',
  height = '16px',
  borderRadius = 'var(--radius-md)',
  className,
}: SkeletonProps) => {
  const customStyle: CSSProperties = {
    width,
    height,
    borderRadius,
  };

  return <div className={cn(styles.skeleton, className)} style={customStyle} aria-hidden="true" />;
};
