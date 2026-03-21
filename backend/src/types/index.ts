export interface User {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
}

export interface Subscription {
  id: string;
  user_id: string;
  stripe_customer_id: string | null;
  stripe_subscription_id: string | null;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'cancelled' | 'lapsed';
  current_period_end: string;
  created_at: string;
}

export interface Score {
  id: string;
  user_id: string;
  score: number;
  played_at: string;
  created_at: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  website_url: string | null;
  is_featured: boolean;
  is_active: boolean;
  created_at: string;
}

export interface CharityContribution {
  id: string;
  user_id: string;
  charity_id: string;
  percentage: number;
  created_at: string;
}

export interface Draw {
  id: string;
  month: string;
  status: 'pending' | 'simulated' | 'published';
  draw_type: 'random' | 'algorithmic';
  algorithm_mode?: 'most_common' | 'least_common' | null;
  winning_numbers: number[] | null;
  jackpot_amount: number;
  rolled_over_amount: number;
  created_at: string;
}

export interface DrawEntry {
  id: string;
  draw_id: string;
  user_id: string;
  score_snapshot: number[];
  match_count: number;
  is_winner: boolean;
}

export interface PrizePool {
  id: string;
  draw_id: string;
  tier: 'five_match' | 'four_match' | 'three_match';
  pool_percentage: number;
  total_pool: number;
  winner_count: number;
  prize_per_winner: number;
  rolled_over: boolean;
}

export interface Payout {
  id: string;
  draw_entry_id: string;
  user_id: string;
  amount: number;
  gross_amount: number;
  net_amount: number;
  tax_amount: number;
  tax_rate: number;
  status: 'pending' | 'verified' | 'paid';
  proof_url: string | null;
  admin_note: string | null;
  created_at: string;
}

export interface WinnerDispute {
  id: string;
  payout_id: string;
  user_id: string;
  reason: string;
  status: 'open' | 'investigating' | 'resolved' | 'rejected';
  admin_response: string | null;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    message: string;
    code?: string;
  };
}

export interface AuthenticatedRequest {
  user: {
    id: string;
    email: string;
    is_admin: boolean;
  };
}
