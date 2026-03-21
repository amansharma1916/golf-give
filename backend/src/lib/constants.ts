export type PlanId = 'monthly' | 'yearly';

export interface Plan {
  id: PlanId;
  label: string;
  priceDisplay: string;
  amount: number;
  currency: string;
  interval: 'month' | 'year';
  stripePriceId: string;
}

export const PLANS: Record<PlanId, Plan> = {
  monthly: {
    id: 'monthly',
    label: 'Monthly',
    priceDisplay: '£9.99 / month',
    amount: 999,
    currency: 'gbp',
    interval: 'month',
    stripePriceId: '',
  },
  yearly: {
    id: 'yearly',
    label: 'Yearly',
    priceDisplay: '£89.99 / year',
    amount: 8999,
    currency: 'gbp',
    interval: 'year',
    stripePriceId: '',
  },
};

export const SUBSCRIPTION_STATUSES = ['active', 'inactive', 'cancelled', 'lapsed'] as const;
export const DRAW_STATUSES = ['pending', 'simulated', 'published'] as const;
export const DRAW_TYPES = ['random', 'algorithmic'] as const;
export const PAYOUT_STATUSES = ['pending', 'verified', 'paid'] as const;
export const PRIZE_TIERS = ['five_match', 'four_match', 'three_match'] as const;

export const PRIZE_POOL_CONFIG = {
  five_match: 40,
  four_match: 35,
  three_match: 25,
};

// Tax withholding configuration (percentage, e.g., 30 = 30%)
export const TAX_WITHHOLDING_RATE = 30;

export const STABLEFORD_MIN = 1;
export const STABLEFORD_MAX = 45;
export const MAX_SCORES_PER_USER = 5;
export const DRAW_WINNING_NUMBERS_COUNT = 5;
export const CHARITY_CONTRIBUTION_MIN = 10;
export const CHARITY_CONTRIBUTION_MAX = 100;
