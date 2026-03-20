import { cn } from '../../../lib/utils';
import { motion } from 'framer-motion';
import styles from './Card.module.css';
import type { CardProps } from './Card.types';

const PADDING_CLASS_MAP = {
  sm: styles.paddingSm,
  md: styles.paddingMd,
  lg: styles.paddingLg,
} as const;

export const Card = ({
  children,
  padding = 'md',
  hoverable = false,
  onClick,
  className,
}: CardProps) => {
  const isHoverable = hoverable || Boolean(onClick);
  const classNameValue = cn(styles.card, PADDING_CLASS_MAP[padding], isHoverable && styles.hoverable, className);

  if (isHoverable) {
    return (
      <motion.div
        className={classNameValue}
        onClick={onClick}
        whileHover={{ y: -3, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }}
        whileTap={{ scale: 0.99 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
      >
        {children}
      </motion.div>
    );
  }

  return (
    <div className={classNameValue} onClick={onClick}>
      {children}
    </div>
  );
};
