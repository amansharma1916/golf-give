import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Avatar, Button } from '../../ui';
import { containerVariants, dropdownVariants, itemVariants } from '../../../lib/animations';
import { ROUTES } from '../../../lib/constants';
import { cn } from '../../../lib/utils';
import { useUserStore } from '../../../stores/userStore';
import styles from './Navbar.module.css';
import type { NavbarProps } from './Navbar.types';

interface NavItem {
  label: string;
  to: string;
}

const PUBLIC_NAV: NavItem[] = [
  { label: 'How it works', to: ROUTES.HOW_IT_WORKS },
  { label: 'Charities', to: ROUTES.CHARITIES },
  { label: 'Pricing', to: ROUTES.PRICING },
];

const dropdownItems = [
  { label: 'Dashboard', to: ROUTES.DASHBOARD },
  { label: 'My scores', to: ROUTES.SCORES },
  { label: 'My charity', to: ROUTES.MY_CHARITY },
  { label: 'Settings', to: ROUTES.SUBSCRIPTION },
];

export const Navbar = ({ transparent = false }: NavbarProps) => {
  const navigate = useNavigate();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const user = useUserStore((state) => state.user);
  const subscription = useUserStore((state) => state.subscription);
  const logout = useUserStore((state) => state.logout);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const hasActiveSubscription = subscription?.status === 'active';
  const isTransparentState = transparent && !isScrolled;

  const mobileAuthItems = useMemo(() => {
    if (!isAuthenticated) {
      return [
        { label: 'Log in', to: ROUTES.LOGIN },
        { label: 'Get started', to: ROUTES.SIGNUP },
      ];
    }

    const items = [
      { label: 'Dashboard', to: ROUTES.DASHBOARD },
      { label: 'My scores', to: ROUTES.SCORES },
      { label: 'My charity', to: ROUTES.MY_CHARITY },
      { label: 'Settings', to: ROUTES.SUBSCRIPTION },
    ];

    if (!hasActiveSubscription) {
      return [{ label: 'Subscribe', to: ROUTES.SUBSCRIBE }, ...items];
    }

    return items;
  }, [hasActiveSubscription, isAuthenticated]);

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 60);
    };

    onScroll();
    window.addEventListener('scroll', onScroll);

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (!dropdownRef.current) {
        return;
      }

      if (!dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleOutsideClick);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    if (!isMobileOpen) {
      return;
    }

    const onResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileOpen(false);
      }
    };

    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('resize', onResize);
    };
  }, [isMobileOpen]);

  const handleLogout = () => {
    logout();
    setIsDropdownOpen(false);
    setIsMobileOpen(false);
    navigate(ROUTES.HOME);
  };

  return (
    <header
      className={cn(
        styles.navbar,
        transparent ? styles.transparent : styles.solid,
        transparent && isScrolled && styles.scrolledTransparent,
      )}
    >
      <div className={styles.inner}>
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
          <Link to={ROUTES.HOME} className={styles.logo}>
            GolfGive
          </Link>
        </motion.div>

        <motion.nav
          className={styles.navLinks}
          aria-label="Main"
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          {PUBLIC_NAV.map((item) => (
            <motion.div key={item.to} variants={itemVariants}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                  cn(
                    styles.navLink,
                    isTransparentState && styles.navLinkTransparent,
                    isActive && styles.navLinkActive,
                  )
                }
              >
                {item.label}
              </NavLink>
            </motion.div>
          ))}
        </motion.nav>

        <motion.div className={styles.navActions} variants={containerVariants} initial="initial" animate="animate">
          {!isAuthenticated && (
            <>
              <motion.div variants={itemVariants}>
                <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.LOGIN)}>
                  Log in
                </Button>
              </motion.div>
              <motion.div variants={itemVariants}>
                <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.SIGNUP)}>
                  Get started
                </Button>
              </motion.div>
            </>
          )}

          {isAuthenticated && !hasActiveSubscription && (
            <motion.div variants={itemVariants}>
              <Button variant="primary" size="sm" onClick={() => navigate(ROUTES.SUBSCRIBE)}>
                Subscribe
              </Button>
            </motion.div>
          )}

          {isAuthenticated && user && (
            <motion.div className={styles.dropdownWrapper} ref={dropdownRef} variants={itemVariants}>
              <button
                type="button"
                className={styles.avatarBtn}
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                aria-expanded={isDropdownOpen}
                aria-haspopup="menu"
              >
                <Avatar name={user.fullName} size="sm" />
              </button>

              <AnimatePresence>
                {isDropdownOpen ? (
                  <motion.div
                    className={styles.dropdown}
                    role="menu"
                    variants={dropdownVariants}
                    initial="initial"
                    animate="animate"
                    exit="exit"
                  >
                    {dropdownItems.map((item) => (
                      <Link
                        key={item.to}
                        to={item.to}
                        className={styles.dropdownItem}
                        onClick={() => setIsDropdownOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <div className={styles.dropdownDivider} />
                    <button type="button" className={styles.dropdownItem} onClick={handleLogout}>
                      Log out
                    </button>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </motion.div>
          )}
        </motion.div>

        <button
          type="button"
          className={cn(styles.hamburger, isTransparentState && styles.hamburgerTransparent)}
          onClick={() => setIsMobileOpen((prev) => !prev)}
          aria-expanded={isMobileOpen}
          aria-label="Toggle menu"
        >
          <motion.span
            key={isMobileOpen ? 'close' : 'open'}
            initial={{ rotate: -24, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            exit={{ rotate: 24, opacity: 0 }}
            transition={{ duration: 0.18 }}
            className={styles.hamburgerGlyph}
          >
            {isMobileOpen ? '✕' : '☰'}
          </motion.span>
        </button>
      </div>

      <AnimatePresence>
        {isMobileOpen ? (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <div className={styles.mobileMenuInner}>
              {PUBLIC_NAV.map((item) => (
                <Link key={item.to} to={item.to} className={styles.mobileLink} onClick={() => setIsMobileOpen(false)}>
                  {item.label}
                </Link>
              ))}

              {mobileAuthItems.map((item) => (
                <Link key={item.to} to={item.to} className={styles.mobileLink} onClick={() => setIsMobileOpen(false)}>
                  {item.label}
                </Link>
              ))}

              {isAuthenticated ? (
                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  Log out
                </Button>
              ) : null}
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
};