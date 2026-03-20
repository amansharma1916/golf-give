import { motion } from 'framer-motion';
import styles from './PageHeader.module.css';
import type { PageHeaderProps } from './PageHeader.types';

export const PageHeader = ({ title, subtitle, actions }: PageHeaderProps) => {
  return (
    <motion.header
      className={styles.header}
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
    >
      <div>
        <h2 className={styles.title}>{title}</h2>
        {subtitle ? <p className={styles.subtitle}>{subtitle}</p> : null}
      </div>
      {actions ? <div className={styles.actions}>{actions}</div> : null}
    </motion.header>
  );
};