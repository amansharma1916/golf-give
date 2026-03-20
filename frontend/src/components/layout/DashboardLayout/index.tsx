import { useMemo, useState } from 'react';
import { AnimatePresence, MotionConfig, motion } from 'framer-motion';
import { Avatar } from '../../ui';
import { Sidebar } from '../Sidebar';
import { useLocation } from 'react-router-dom';
import { drawerVariants, fadeInVariants } from '../../../lib/animations';
import { useUserStore } from '../../../stores/userStore';
import styles from './DashboardLayout.module.css';
import type { DashboardLayoutProps } from './DashboardLayout.types';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/dashboard/scores': 'My scores',
  '/dashboard/draws': 'Draws',
  '/dashboard/winnings': 'Winnings',
  '/dashboard/charity': 'My charity',
  '/dashboard/subscription': 'Subscription',
};

const MenuIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const BellIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path
      d="M12 3a5 5 0 0 0-5 5v2.3c0 .8-.3 1.6-.8 2.2L5 14h14l-1.2-1.5a3.4 3.4 0 0 1-.8-2.2V8a5 5 0 0 0-5-5Z"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinejoin="round"
    />
    <path d="M10 17a2 2 0 0 0 4 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
  </svg>
);

export const DashboardLayout = ({ children }: DashboardLayoutProps) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = useUserStore((state) => state.user);
  const subscription = useUserStore((state) => state.subscription);

  const pageTitle = useMemo(() => pageTitles[location.pathname] ?? 'Dashboard', [location.pathname]);

  return (
    <MotionConfig reducedMotion="always" transition={{ duration: 0 }}>
      <div className={styles.layout}>
        <div className={styles.sidebarDesktop}>
          <Sidebar />
        </div>

        <AnimatePresence>
          {isSidebarOpen ? (
            <>
              <motion.button
                type="button"
                className={styles.sidebarMobileOverlay}
                onClick={() => setIsSidebarOpen(false)}
                variants={fadeInVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                aria-label="Close sidebar"
              />
              <motion.div
                className={styles.sidebarMobileDrawer}
                variants={drawerVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <Sidebar onClose={() => setIsSidebarOpen(false)} />
              </motion.div>
            </>
          ) : null}
        </AnimatePresence>

        <div className={styles.main}>
          <header className={styles.topbar}>
            <div className={styles.topbarLeft}>
              <button type="button" className={styles.hamburger} onClick={() => setIsSidebarOpen(true)} aria-label="Open sidebar">
                <MenuIcon />
              </button>
              <h1 className={styles.pageTitle}>{pageTitle}</h1>
            </div>

            <div className={styles.topbarRight}>
              <span className={styles.subscriptionStatus}>{subscription?.status ?? 'inactive'}</span>
              <button type="button" className={styles.iconButton} aria-label="Notifications">
                <BellIcon />
              </button>
              <div className={styles.userMeta}>
                <Avatar name={user?.fullName ?? 'Guest'} size="sm" />
                <span className={styles.userName}>{user?.fullName ?? 'Guest'}</span>
              </div>
            </div>
          </header>

          <main className={styles.content}>
            <div>{children}</div>
          </main>
        </div>
      </div>
    </MotionConfig>
  );
};