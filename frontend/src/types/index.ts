export interface User {
  id: string;
  email: string;
  fullName: string;
  isAdmin: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  userId: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'cancelled' | 'lapsed';
  currentPeriodEnd: string;
}

export interface Score {
  id: string;
  userId: string;
  score: number;
  playedAt: string;
  createdAt: string;
}

export interface Charity {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  websiteUrl: string;
  isFeatured: boolean;
  isActive: boolean;
}

export interface Draw {
  id: string;
  month: string;
  status: 'pending' | 'simulated' | 'published';
  drawType: 'random' | 'algorithmic';
  winningNumbers: number[];
  jackpotAmount: number;
  rolledOverAmount: number;
}

export interface DrawEntry {
  id: string;
  drawId: string;
  userId: string;
  scoreSnapshot: number[];
  matchCount: number;
  isWinner: boolean;
}

export interface PrizePool {
  id: string;
  drawId: string;
  tier: 'five_match' | 'four_match' | 'three_match';
  poolPercentage: number;
  totalPool: number;
  winnerCount: number;
  prizePerWinner: number;
  rolledOver: boolean;
}

export interface Payout {
  id: string;
  userId: string;
  amount: number;
  status: 'pending' | 'verified' | 'paid';
  proofUrl: string | null;
  adminNote: string | null;
  createdAt: string;
}

export interface CharityContribution {
  id: string;
  userId: string;
  charityId: string;
  percentage: number;
}
