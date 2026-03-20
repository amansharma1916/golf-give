import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../ui';
import { containerVariants, itemVariants } from '../../../lib/animations';
import { ROUTES } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import { useUserStore } from '../../../stores/userStore';
import styles from './Sidebar.module.css';
import type { SidebarProps } from './Sidebar.types';

type IconType = 'grid' | 'list' | 'trophy' | 'star' | 'heart' | 'card' | 'users' | 'settings' | 'chart';

interface SidebarItem {
  label: string;
  to: string;
  icon: IconType;
}

const subscriberItems: SidebarItem[] = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD, icon: 'grid' },
  { label: 'My scores', to: ROUTES.SCORES, icon: 'list' },
  { label: 'Draws', to: ROUTES.DRAWS, icon: 'trophy' },
  { label: 'Winnings', to: ROUTES.WINNINGS, icon: 'star' },
  { label: 'My charity', to: ROUTES.MY_CHARITY, icon: 'heart' },
  { label: 'Subscription', to: ROUTES.SUBSCRIPTION, icon: 'card' },
];

const adminItems: SidebarItem[] = [
  { label: 'Users', to: ROUTES.ADMIN_USERS, icon: 'users' },
  { label: 'Draw manager', to: ROUTES.ADMIN_DRAWS, icon: 'settings' },
  { label: 'Charities', to: ROUTES.ADMIN_CHARITIES, icon: 'heart' },
  { label: 'Winners', to: ROUTES.ADMIN_WINNERS, icon: 'star' },
  { label: 'Reports', to: ROUTES.ADMIN_REPORTS, icon: 'chart' },
];

const Icon = ({ type }: { type: IconType }) => {
  if (type === 'grid') {
    return (
      <svg viewBox="0 0 16 16" className={styles.navIcon} fill="none" aria-hidden="true">
        <rect x="1.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" />
        <rect x="9.5" y="1.5" width="5" height="5" rx="1" stroke="currentColor" />
        <rect x="1.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" />
        <rect x="9.5" y="9.5" width="5" height="5" rx="1" stroke="currentColor" />
      </svg>
    );
  }

  if (type === 'list') {
    return (
      <svg viewBox="0 0 16 16" className={styles.navIcon} fill="none" aria-hidden="true">
        <path d="M3 4h10M3 8h10M3 12h10" stroke="currentColor" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'trophy') {
    return (
      <svg viewBox="0 0 16 16" className={styles.navIcon} fill="none" aria-hidden="true">
        <path d="M4 2h8v2a4 4 0 0 1-8 0V2Z" stroke="currentColor" />
        <path d="M6 10h4M7 10v3M9 10v3M5 14h6" stroke="currentColor" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'star') {
    return (
      <svg viewBox="0 0 16 16" className={styles.navIcon} fill="none" aria-hidden="true">
        <path d="m8 2 1.8 3.6 4 .6-2.9 2.8.7 4-3.6-1.9-3.6 1.9.7-4L2.2 6.2l4-.6L8 2Z" stroke="currentColor" />
      </svg>
    );
  }

  if (type === 'heart') {
    return (
      <svg viewBox="0 0 16 16" className={styles.navIcon} fill="none" aria-hidden="true">
        <path d="M8 13.5S2.5 10.3 2.5 6.3A2.8 2.8 0 0 1 8 5a2.8 2.8 0 0 1 5.5 1.3c0 4-5.5 7.2-5.5 7.2Z" stroke="currentColor" />
      </svg>
    );
  }

  if (type === 'card') {
    return (
      <svg viewBox="0 0 16 16" className={styles.navIcon} fill="none" aria-hidden="true">
        <rect x="1.5" y="3" width="13" height="10" rx="1.5" stroke="currentColor" />
        <path d="M1.5 6h13" stroke="currentColor" />
      </svg>
    );
  }

  if (type === 'users') {
    return (
      <svg viewBox="0 0 16 16" className={styles.navIcon} fill="none" aria-hidden="true">
        <circle cx="6" cy="5" r="2" stroke="currentColor" />
        <circle cx="11" cy="6" r="1.5" stroke="currentColor" />
        <path d="M2.5 12a3.5 3.5 0 0 1 7 0M8.5 12a2.5 2.5 0 0 1 5 0" stroke="currentColor" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === 'settings') {
    return (
      <svg viewBox="0 0 16 16" className={styles.navIcon} fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="2.2" stroke="currentColor" />
        <path
          d="M8 1.8v1.6M8 12.6v1.6M3.6 3.6l1.1 1.1M11.3 11.3l1.1 1.1M1.8 8h1.6M12.6 8h1.6M3.6 12.4l1.1-1.1M11.3 4.7l1.1-1.1"
          stroke="currentColor"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 16 16" className={styles.navIcon} fill="none" aria-hidden="true">
      <path d="M2 13.5h12M3 13.5v-4h2v4M7 13.5v-7h2v7M11 13.5v-9h2v9" stroke="currentColor" strokeLinecap="round" />
    </svg>
  );
};

export const Sidebar = ({ onClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const user = useUserStore((state) => state.user);
  const logout = useUserStore((state) => state.logout);

  const isAdminArea = location.pathname.startsWith('/admin');
  const canSeeAdmin = user?.isAdmin === true;

  const orderedSections = useMemo(
    () => (isAdminArea ? ['admin', 'subscriber'] as const : ['subscriber', 'admin'] as const),
    [isAdminArea],
  );

  const isActivePath = (itemPath: string) => {
    if (itemPath === ROUTES.DASHBOARD || itemPath === ROUTES.ADMIN_USERS) {
      return location.pathname === itemPath;
    }

    return location.pathname.startsWith(itemPath);
  };

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  return (
    <aside className={styles.sidebar}>
      <Link to={ROUTES.HOME} className={styles.logo} onClick={onClose}>
        GolfGive
      </Link>

      {orderedSections.map((section) => {
        if (section === 'subscriber') {
          return (
            <motion.div
              key="subscriber"
              className={styles.navSection}
              variants={containerVariants}
              initial="initial"
              animate="animate"
            >
              {subscriberItems.map((item) => (
                <motion.div key={item.to} className={styles.navItemWrapper} variants={itemVariants} whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
                  {isActivePath(item.to) ? <motion.div layoutId="activeNavIndicator" className={styles.activeIndicator} /> : null}
                  <Link
                    to={item.to}
                    onClick={onClose}
                    className={cn(styles.navItem, isActivePath(item.to) && styles.navItemActive)}
                  >
                    <Icon type={item.icon} />
                    {item.label}
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          );
        }

        if (!canSeeAdmin) {
          return null;
        }

        return (
          <motion.div
            key="admin"
            className={styles.navSection}
            variants={containerVariants}
            initial="initial"
            animate="animate"
          >
            <div className={styles.sectionLabel}>Admin</div>
            {adminItems.map((item) => (
              <motion.div key={item.to} className={styles.navItemWrapper} variants={itemVariants} whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
                {isActivePath(item.to) ? <motion.div layoutId="activeNavIndicator" className={styles.activeIndicator} /> : null}
                <Link
                  to={item.to}
                  onClick={onClose}
                  className={cn(styles.navItem, isActivePath(item.to) && styles.navItemActive)}
                >
                  <Icon type={item.icon} />
                  {item.label}
                </Link>
              </motion.div>
            ))}
          </motion.div>
        );
      })}

      <div className={styles.bottom}>
        <div className={styles.userName}>{user?.fullName ?? 'Guest'}</div>
        <div className={styles.userEmail}>{user?.email ?? 'guest@example.com'}</div>
        <Button variant="ghost" size="sm" fullWidth onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </aside>
  );
};