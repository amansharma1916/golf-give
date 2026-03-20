import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { containerVariants, itemVariants } from '../../../lib/animations';
import { ROUTES } from '../../../lib/constants';
import styles from './Footer.module.css';

interface FooterLink {
  label: string;
  to: string;
}

const platformLinks: FooterLink[] = [
  { label: 'How it works', to: ROUTES.HOW_IT_WORKS },
  { label: 'Pricing', to: ROUTES.PRICING },
  { label: 'Charities', to: ROUTES.CHARITIES },
  { label: 'Draw results', to: ROUTES.DRAWS },
];

const accountLinks: FooterLink[] = [
  { label: 'Sign up', to: ROUTES.SIGNUP },
  { label: 'Log in', to: ROUTES.LOGIN },
  { label: 'Dashboard', to: ROUTES.DASHBOARD },
  { label: 'My scores', to: ROUTES.SCORES },
];

const companyLinks: FooterLink[] = [
  { label: 'About', to: ROUTES.HOME },
  { label: 'Contact', to: ROUTES.HOME },
  { label: 'Privacy policy', to: ROUTES.HOME },
  { label: 'Terms of service', to: ROUTES.HOME },
];

export const Footer = () => {
  const footerRef = useRef<HTMLElement | null>(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.2 });

  return (
    <motion.footer
      ref={footerRef}
      className={styles.footer}
      variants={containerVariants}
      initial="initial"
      animate={isInView ? 'animate' : 'initial'}
    >
      <div className={styles.inner}>
        <div className={styles.grid}>
          <motion.div className={styles.brand} variants={itemVariants}>
            <div className={styles.logo}>GolfGive</div>
            <p className={styles.tagline}>Play golf. Win prizes. Change lives.</p>
            <p className={styles.description}>
              GolfGive combines your golf journey with monthly prize draws and meaningful support for the charities
              that matter to you.
            </p>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className={styles.colTitle}>Platform</h3>
            <div className={styles.links}>
              {platformLinks.map((link) => (
                <Link key={link.label} to={link.to} className={styles.link}>
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className={styles.colTitle}>Account</h3>
            <div className={styles.links}>
              {accountLinks.map((link) => (
                <Link key={link.label} to={link.to} className={styles.link}>
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>

          <motion.div variants={itemVariants}>
            <h3 className={styles.colTitle}>Company</h3>
            <div className={styles.links}>
              {companyLinks.map((link) => (
                <Link key={link.label} to={link.to} className={styles.link}>
                  {link.label}
                </Link>
              ))}
            </div>
          </motion.div>
        </div>

        <div className={styles.divider} />

        <div className={styles.bottom}>
          <span>© 2026 GolfGive. All rights reserved.</span>
          <span>Made with purpose</span>
        </div>
      </div>
    </motion.footer>
  );
};