import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../../lib/utils';
import { fadeInVariants, scaleInVariants } from '../../../lib/animations';
import styles from './Modal.module.css';
import type { ModalProps } from './Modal.types';

export const Modal = ({ isOpen, onClose, title, size = 'md', children, footer }: ModalProps) => {
  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <motion.div
          className={styles.overlay}
          onClick={(event) => event.target === event.currentTarget && onClose()}
          variants={fadeInVariants}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          <motion.div
            className={cn(styles.panel, styles[size])}
            role="dialog"
            aria-modal="true"
            aria-label={title ?? 'Modal'}
            variants={scaleInVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            onClick={(event) => event.stopPropagation()}
          >
            <div className={styles.header}>
              {title && <h2 className={styles.title}>{title}</h2>}
              <button type="button" className={styles.closeBtn} onClick={onClose} aria-label="Close modal">
                ×
              </button>
            </div>
            <div className={styles.body}>{children}</div>
            {footer && <div className={styles.footer}>{footer}</div>}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
};
