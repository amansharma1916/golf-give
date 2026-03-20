import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Avatar } from '../../ui';
import { Sidebar } from '../Sidebar';
import { useLocation } from 'react-router-dom';
import { drawerVariants, fadeInVariants, pageTransition, pageVariants } from '../../../lib/animations';
import { useUserStore } from '../../../stores/userStore';
import styles from './AdminLayout.module.css';
import type { AdminLayoutProps } from './AdminLayout.types';

const pageTitles: Record<string, string> = {
  '/admin/users': 'Users',
  '/admin/draws': 'Draw manager',
  '/admin/charities': 'Charities',
  '/admin/winners': 'Winners',
  '/admin/reports': 'Reports',
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

export const AdminLayout = ({ children }: AdminLayoutProps) => {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const user = useUserStore((state) => state.user);

  const pageTitle = useMemo(() => pageTitles[location.pathname] ?? 'Admin', [location.pathname]);

  return (
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
            <span className={styles.adminBadge}>Admin panel</span>
            <h1 className={styles.pageTitle}>{pageTitle}</h1>
          </div>

          <div className={styles.topbarRight}>
            <button type="button" className={styles.iconButton} aria-label="Notifications">
              <BellIcon />
            </button>
            <div className={styles.userMeta}>
              <Avatar name={user?.fullName ?? 'Admin'} size="sm" />
              <span className={styles.userName}>{user?.fullName ?? 'Admin'}</span>
            </div>
          </div>
        </header>

        <main className={styles.content}>
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
      </div>
    </div>
  );
};