export const ROUTES = {
  HOME: '/',
  HOW_IT_WORKS: '/how-it-works',
  PRICING: '/pricing',
  CHARITIES: '/charities',
  CHARITY: (id: string) => `/charities/${id}`,
  LOGIN: '/login',
  SIGNUP: '/signup',
  RESET_PASSWORD: '/reset-password',
  SUBSCRIBE: '/subscribe',
  DASHBOARD: '/dashboard',
  SCORES: '/dashboard/scores',
  DRAWS: '/dashboard/draws',
  WINNINGS: '/dashboard/winnings',
  MY_CHARITY: '/dashboard/charity',
  SUBSCRIPTION: '/dashboard/subscription',
  ADMIN_USERS: '/admin/users',
  ADMIN_DRAWS: '/admin/draws',
  ADMIN_CHARITIES: '/admin/charities',
  ADMIN_WINNERS: '/admin/winners',
  ADMIN_REPORTS: '/admin/reports',
} as const;

export const PLANS = {
  monthly: {
    id: 'monthly',
    label: 'Monthly',
    priceDisplay: '£9.99 / month',
    amount: 999,
    interval: 'month',
  },
  yearly: {
    id: 'yearly',
    label: 'Yearly',
    priceDisplay: '£89.99 / year',
    amount: 8999,
    interval: 'year',
    saving: 'Save £29.89',
  },
} as const;

export type PlanId = keyof typeof PLANS;
