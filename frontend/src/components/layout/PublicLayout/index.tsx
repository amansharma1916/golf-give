import { AnimatePresence, motion } from 'framer-motion';
import { useLocation } from 'react-router-dom';
import { pageTransition, pageVariants } from '../../../lib/animations';
import { Footer } from '../Footer';
import { Navbar } from '../Navbar';
import styles from './PublicLayout.module.css';
import type { PublicLayoutProps } from './PublicLayout.types';

export const PublicLayout = ({ children, navbarTransparent = false }: PublicLayoutProps) => {
  const location = useLocation();

  return (
    <div className={styles.layout}>
      <Navbar transparent={navbarTransparent} />
      <main className={styles.main}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={pageTransition}
          >
            {children}
          </motion.div>
        </AnimatePresence>
      </main>
      <Footer />
    </div>
  );
};