import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { pageTransition, pageVariants } from '../../../lib/animations';
import { ROUTES } from '../../../lib/constants';
import styles from './SubscribeLayout.module.css';
import type { SubscribeLayoutProps } from './SubscribeLayout.types';

export const SubscribeLayout = ({ children }: SubscribeLayoutProps) => {
  return (
    <div className={styles.layout}>
      <header className={styles.topbar}>
        <Link to={ROUTES.HOME} className={styles.logo}>
          GolfGive
        </Link>

        <div className={styles.steps} aria-hidden="true">
          <div className={styles.stepItem}>
            <span className={`${styles.stepDot} ${styles.stepDotCompleted}`}>✓</span>
            <span className={`${styles.stepLabel} ${styles.stepLabelCompleted}`}>Account</span>
          </div>
          <span className={`${styles.stepLine} ${styles.stepLineCompleted}`} />
          <div className={styles.stepItem}>
            <span className={`${styles.stepDot} ${styles.stepDotActive}`}>2</span>
            <span className={`${styles.stepLabel} ${styles.stepLabelActive}`}>Plan</span>
          </div>
          <span className={`${styles.stepLine} ${styles.stepLineUpcoming}`} />
          <div className={styles.stepItem}>
            <span className={`${styles.stepDot} ${styles.stepDotUpcoming}`}>3</span>
            <span className={`${styles.stepLabel} ${styles.stepLabelUpcoming}`}>Dashboard</span>
          </div>
        </div>

        <Link to={ROUTES.HOW_IT_WORKS} className={styles.helpLink}>
          Need help?
        </Link>
      </header>

      <main className={styles.main}>
        <motion.div className={styles.content} variants={pageVariants} initial="initial" animate="animate" transition={pageTransition}>
          {children}
        </motion.div>
      </main>
    </div>
  );
};
