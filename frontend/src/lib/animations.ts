export const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
} as const;

export const pageTransition = {
  duration: 0.35,
  ease: [0.22, 1, 0.36, 1],
} as const;

export const containerVariants = {
  initial: {},
  animate: {
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
} as const;

export const itemVariants = {
  initial: { opacity: 0, y: 14 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
} as const;

export const fadeInVariants = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.4 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
} as const;

export const slideUpVariants = {
  initial: { opacity: 0, y: 24 },
  animate: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
  },
} as const;

export const scaleInVariants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
} as const;

export const drawerVariants = {
  initial: { x: '-100%' },
  animate: {
    x: 0,
    transition: { duration: 0.28, ease: [0.22, 1, 0.36, 1] },
  },
  exit: {
    x: '-100%',
    transition: { duration: 0.22, ease: [0.22, 1, 0.36, 1] },
  },
} as const;

export const dropdownVariants = {
  initial: { opacity: 0, scale: 0.95, y: -8 },
  animate: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: -8,
    transition: { duration: 0.1 },
  },
} as const;