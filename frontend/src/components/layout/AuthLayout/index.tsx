import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { pageTransition, pageVariants } from '../../../lib/animations';
import { ROUTES } from '../../../lib/constants';
import styles from './AuthLayout.module.css';
import type { AuthLayoutProps } from './AuthLayout.types';

const DefaultRightPanel = () => {
  return (
    <>
      <Link to={ROUTES.HOME} className={styles.brandLogoTop}>
        GolfGive
      </Link>
      <div className={styles.brandBg} />
      <div className={styles.brandContent}>
        <p className={styles.brandQuote}>"Play golf. Win prizes. Change lives."</p>
        <div className={styles.brandBullets}>
          <div className={styles.brandBullet}>
            <span className={styles.bulletCheck}>✓</span>
            <span className={styles.bulletText}>Monthly prize draws</span>
          </div>
          <div className={styles.brandBullet}>
            <span className={styles.bulletCheck}>✓</span>
            <span className={styles.bulletText}>Real charity impact</span>
          </div>
          <div className={styles.brandBullet}>
            <span className={styles.bulletCheck}>✓</span>
            <span className={styles.bulletText}>Cancel anytime</span>
          </div>
        </div>
      </div>
      <div className={styles.brandFooter}>Join 3,420+ members already playing for purpose.</div>
    </>
  );
};

export const AuthLayout = ({ children, rightPanel }: AuthLayoutProps) => {
  return (
    <div className={styles.layout}>
      <motion.section
        className={styles.formSide}
        variants={pageVariants}
        initial="initial"
        animate="animate"
        transition={pageTransition}
      >
        <div className={styles.formContainer}>
          <Link to={ROUTES.HOME} className={styles.brandLogo}>
            GolfGive
          </Link>
          {children}
        </div>
      </motion.section>
      <aside className={styles.brandSide}>{rightPanel ?? <DefaultRightPanel />}</aside>
    </div>
  );
};
