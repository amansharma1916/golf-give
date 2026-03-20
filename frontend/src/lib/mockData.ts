import type { Draw, Score, Subscription, User } from '../types';

export interface DrawResult {
  id: string;
  month: string;
  status: 'pending' | 'simulated' | 'published';
  drawType: 'random' | 'algorithmic';
  winningNumbers: number[];
  jackpotAmount: number;
  rolledOverAmount: number;
  totalPool: number;
  activeMembers: number;
  winners: {
    fiveMatch: number;
    fourMatch: number;
    threeMatch: number;
  };
  myEntry: {
    scoreSnapshot: number[];
    matchCount: number;
    isWinner: boolean;
    prizeAmount: number | null;
    payoutStatus: 'pending' | 'verified' | 'paid' | null;
  };
}

export const MOCK_MEMBER_USER: User = {
  id: 'mock-user-1',
  email: 'james@example.com',
  fullName: 'James Whitfield',
  isAdmin: false,
  createdAt: '2024-06-01T00:00:00Z',
};

export const MOCK_ADMIN_USER: User = {
  id: 'mock-admin-1',
  email: 'admin@golfgive.com',
  fullName: 'Admin User',
  isAdmin: true,
  createdAt: '2024-01-01T00:00:00Z',
};

export const MOCK_SUBSCRIPTION: Subscription = {
  id: 'mock-sub-1',
  userId: 'mock-user-1',
  plan: 'monthly',
  status: 'active',
  currentPeriodEnd: '2026-04-20T00:00:00Z',
};

export const MOCK_SCORES: Score[] = [
  { id: 's1', userId: 'mock-user-1', score: 34, playedAt: '2026-03-18', createdAt: '2026-03-18T10:00:00Z' },
  { id: 's2', userId: 'mock-user-1', score: 28, playedAt: '2026-03-11', createdAt: '2026-03-11T10:00:00Z' },
  { id: 's3', userId: 'mock-user-1', score: 31, playedAt: '2026-03-04', createdAt: '2026-03-04T10:00:00Z' },
  { id: 's4', userId: 'mock-user-1', score: 25, playedAt: '2026-02-25', createdAt: '2026-02-25T10:00:00Z' },
  { id: 's5', userId: 'mock-user-1', score: 38, playedAt: '2026-02-18', createdAt: '2026-02-18T10:00:00Z' },
];

export const MOCK_DRAW: Draw = {
  id: 'draw-march-2026',
  month: '2026-03-01',
  status: 'published',
  drawType: 'random',
  winningNumbers: [28, 31, 14, 38, 7],
  jackpotAmount: 13672,
  rolledOverAmount: 0,
};

export const MOCK_UPCOMING_DRAW: Draw & { daysUntilDraw: number } = {
  id: 'draw-april-2026',
  month: '2026-04-01',
  status: 'pending',
  drawType: 'random',
  winningNumbers: [],
  jackpotAmount: 0,
  rolledOverAmount: 0,
  daysUntilDraw: 11,
};

export const MOCK_CHARITY_CONTRIBUTION = {
  charityId: '1',
  charityName: 'Golf Foundation',
  percentage: 10,
  monthlyAmount: 100,
  totalContributed: 1800,
};

export const MOCK_RECENT_DRAWS = [
  {
    id: 'draw-feb-2026',
    month: '2026-02-01',
    status: 'published' as const,
    winningNumbers: [22, 14, 38, 31, 9],
    myNumbers: [34, 28, 31, 25, 38],
    matchCount: 2,
    isWinner: false,
    prizeAmount: null,
  },
  {
    id: 'draw-jan-2026',
    month: '2026-01-01',
    status: 'published' as const,
    winningNumbers: [34, 7, 28, 19, 31],
    myNumbers: [34, 28, 31, 22, 15],
    matchCount: 3,
    isWinner: true,
    prizeAmount: 14250,
  },
  {
    id: 'draw-dec-2025',
    month: '2025-12-01',
    status: 'published' as const,
    winningNumbers: [12, 45, 33, 8, 21],
    myNumbers: [34, 28, 31, 25, 38],
    matchCount: 0,
    isWinner: false,
    prizeAmount: null,
  },
];

export const MOCK_DASHBOARD_STATS = {
  totalWinnings: 14250,
  drawsEntered: 18,
  currentStreak: 3,
  nextDrawDays: 11,
  nextDrawDate: '2026-04-30',
};

export const MOCK_ALL_DRAWS: DrawResult[] = [
  {
    id: 'draw-march-2026',
    month: '2026-03-01',
    status: 'published',
    drawType: 'random',
    winningNumbers: [28, 31, 14, 38, 7],
    jackpotAmount: 13672,
    rolledOverAmount: 0,
    totalPool: 34180,
    activeMembers: 3420,
    winners: {
      fiveMatch: 0,
      fourMatch: 2,
      threeMatch: 14,
    },
    myEntry: {
      scoreSnapshot: [34, 28, 31, 25, 38],
      matchCount: 3,
      isWinner: true,
      prizeAmount: 609.57,
      payoutStatus: 'paid',
    },
  },
  {
    id: 'draw-feb-2026',
    month: '2026-02-01',
    status: 'published',
    drawType: 'random',
    winningNumbers: [22, 14, 38, 31, 9],
    jackpotAmount: 12840,
    rolledOverAmount: 0,
    totalPool: 32100,
    activeMembers: 3210,
    winners: {
      fiveMatch: 1,
      fourMatch: 3,
      threeMatch: 19,
    },
    myEntry: {
      scoreSnapshot: [34, 28, 31, 22, 15],
      matchCount: 2,
      isWinner: false,
      prizeAmount: null,
      payoutStatus: null,
    },
  },
  {
    id: 'draw-jan-2026',
    month: '2026-01-01',
    status: 'published',
    drawType: 'algorithmic',
    winningNumbers: [34, 7, 28, 19, 31],
    jackpotAmount: 11960,
    rolledOverAmount: 2400,
    totalPool: 29900,
    activeMembers: 2990,
    winners: {
      fiveMatch: 0,
      fourMatch: 1,
      threeMatch: 11,
    },
    myEntry: {
      scoreSnapshot: [34, 28, 31, 22, 15],
      matchCount: 3,
      isWinner: true,
      prizeAmount: 142.50,
      payoutStatus: 'paid',
    },
  },
  {
    id: 'draw-dec-2025',
    month: '2025-12-01',
    status: 'published',
    drawType: 'random',
    winningNumbers: [12, 45, 33, 8, 21],
    jackpotAmount: 10800,
    rolledOverAmount: 0,
    totalPool: 27000,
    activeMembers: 2700,
    winners: {
      fiveMatch: 0,
      fourMatch: 0,
      threeMatch: 8,
    },
    myEntry: {
      scoreSnapshot: [29, 34, 22, 31, 18],
      matchCount: 0,
      isWinner: false,
      prizeAmount: null,
      payoutStatus: null,
    },
  },
  {
    id: 'draw-nov-2025',
    month: '2025-11-01',
    status: 'published',
    drawType: 'random',
    winningNumbers: [31, 25, 18, 40, 29],
    jackpotAmount: 9600,
    rolledOverAmount: 0,
    totalPool: 24000,
    activeMembers: 2400,
    winners: {
      fiveMatch: 1,
      fourMatch: 4,
      threeMatch: 22,
    },
    myEntry: {
      scoreSnapshot: [29, 34, 22, 31, 18],
      matchCount: 3,
      isWinner: true,
      prizeAmount: 87.27,
      payoutStatus: 'paid',
    },
  },
];

export const MOCK_WINNINGS = [
  {
    id: 'win-1',
    drawMonth: '2026-03-01',
    matchCount: 3,
    tier: 'three_match' as const,
    winningNumbers: [28, 31, 14, 38, 7],
    myNumbers: [34, 28, 31, 25, 38],
    amount: 609.57,
    status: 'paid' as const,
    proofUrl: 'https://example.com/proof1.jpg',
    paidAt: '2026-03-08T14:30:00Z',
    deadline: null,
  },
  {
    id: 'win-2',
    drawMonth: '2026-01-01',
    matchCount: 3,
    tier: 'three_match' as const,
    winningNumbers: [34, 7, 28, 19, 31],
    myNumbers: [34, 28, 31, 22, 15],
    amount: 142.50,
    status: 'paid' as const,
    proofUrl: 'https://example.com/proof2.jpg',
    paidAt: '2026-01-09T10:00:00Z',
    deadline: null,
  },
  {
    id: 'win-3',
    drawMonth: '2025-11-01',
    matchCount: 3,
    tier: 'three_match' as const,
    winningNumbers: [31, 25, 18, 40, 29],
    myNumbers: [29, 34, 22, 31, 18],
    amount: 87.27,
    status: 'paid' as const,
    proofUrl: 'https://example.com/proof3.jpg',
    paidAt: '2025-11-10T09:15:00Z',
    deadline: null,
  },
  {
    id: 'win-pending-1',
    drawMonth: '2026-03-01',
    matchCount: 3,
    tier: 'three_match' as const,
    winningNumbers: [28, 31, 14, 38, 7],
    myNumbers: [34, 28, 31, 25, 38],
    amount: 609.57,
    status: 'pending' as const,
    proofUrl: null,
    paidAt: null,
    deadline: '2026-04-05T23:59:59Z',
  },
];

export const MOCK_ALL_USERS = [
  {
    id: 'u1',
    fullName: 'James Whitfield',
    email: 'james@example.com',
    isAdmin: false,
    createdAt: '2024-06-01T00:00:00Z',
    subscription: { plan: 'monthly', status: 'active', currentPeriodEnd: '2026-04-20T00:00:00Z' },
    scores: [34, 28, 31, 25, 38],
    totalWinnings: 839.34,
  },
  {
    id: 'u2',
    fullName: 'Sarah O\'Brien',
    email: 'sarah@example.com',
    isAdmin: false,
    createdAt: '2024-07-15T00:00:00Z',
    subscription: { plan: 'yearly', status: 'active', currentPeriodEnd: '2026-07-15T00:00:00Z' },
    scores: [22, 29, 18, 35, 27],
    totalWinnings: 0,
  },
  {
    id: 'u3',
    fullName: 'Mark Patel',
    email: 'mark@example.com',
    isAdmin: false,
    createdAt: '2025-01-10T00:00:00Z',
    subscription: { plan: 'monthly', status: 'lapsed', currentPeriodEnd: '2026-02-10T00:00:00Z' },
    scores: [31, 24, 28, 33, 19],
    totalWinnings: 180.00,
  },
  {
    id: 'u4',
    fullName: 'Emma Clarke',
    email: 'emma@example.com',
    isAdmin: false,
    createdAt: '2025-03-22T00:00:00Z',
    subscription: { plan: 'yearly', status: 'active', currentPeriodEnd: '2026-03-22T00:00:00Z' },
    scores: [40, 38, 42, 37, 39],
    totalWinnings: 420.75,
  },
  {
    id: 'u5',
    fullName: 'Tom Richards',
    email: 'tom@example.com',
    isAdmin: false,
    createdAt: '2025-05-01T00:00:00Z',
    subscription: { plan: 'monthly', status: 'cancelled', currentPeriodEnd: '2026-03-01T00:00:00Z' },
    scores: [],
    totalWinnings: 0,
  },
];

export const MOCK_ADMIN_STATS = {
  totalUsers: 3420,
  activeSubscribers: 3102,
  monthlyRevenue: 28640,
  yearlyRevenue: 12480,
  totalPrizePoolAllTime: 284500,
  totalCharityAllTime: 42680,
  currentMonthPool: 34180,
  drawsCompleted: 18,
  pendingVerifications: 3,
  pendingPayouts: 2,
};

export const MOCK_ADMIN_DRAWS = [
  {
    id: 'draw-april-2026',
    month: '2026-04-01',
    status: 'pending' as const,
    drawType: 'random' as const,
    winningNumbers: [],
    totalPool: 34180,
    activeMembers: 3420,
    jackpotAmount: 13672,
    rolledOverAmount: 0,
  },
  {
    id: 'draw-march-2026',
    month: '2026-03-01',
    status: 'published' as const,
    drawType: 'random' as const,
    winningNumbers: [28, 31, 14, 38, 7],
    totalPool: 34180,
    activeMembers: 3420,
    jackpotAmount: 13672,
    rolledOverAmount: 0,
  },
];

export const MOCK_ADMIN_WINNERS = [
  {
    id: 'aw-1',
    userId: 'u1',
    userName: 'James Whitfield',
    userEmail: 'james@example.com',
    drawMonth: '2026-03-01',
    matchCount: 3,
    tier: 'three_match',
    amount: 609.57,
    status: 'pending' as const,
    proofUrl: 'https://example.com/proof1.jpg',
    submittedAt: '2026-03-06T10:00:00Z',
    adminNote: null,
  },
  {
    id: 'aw-2',
    userId: 'u4',
    userName: 'Emma Clarke',
    userEmail: 'emma@example.com',
    drawMonth: '2026-03-01',
    matchCount: 4,
    tier: 'four_match',
    amount: 2099.25,
    status: 'verified' as const,
    proofUrl: 'https://example.com/proof2.jpg',
    submittedAt: '2026-03-05T14:00:00Z',
    adminNote: 'Scores verified',
  },
  {
    id: 'aw-3',
    userId: 'u2',
    userName: 'Sarah O\'Brien',
    userEmail: 'sarah@example.com',
    drawMonth: '2026-01-01',
    matchCount: 3,
    tier: 'three_match',
    amount: 142.50,
    status: 'paid' as const,
    proofUrl: 'https://example.com/proof3.jpg',
    submittedAt: '2026-01-04T09:00:00Z',
    adminNote: 'Paid via bank transfer',
  },
];

export const MOCK_CHARITY_STATS = [
  { charityId: '1', charityName: 'Golf Foundation', memberCount: 312, monthlyAmount: 312.00, totalAllTime: 48200 },
  {
    charityId: '2',
    charityName: 'Veterans Golf Society',
    memberCount: 218,
    monthlyAmount: 218.00,
    totalAllTime: 32100,
  },
  { charityId: '3', charityName: 'Caddy Scholarship Fund', memberCount: 189, monthlyAmount: 189.00, totalAllTime: 27600 },
  { charityId: '5', charityName: 'Mind on the Fairway', memberCount: 167, monthlyAmount: 167.00, totalAllTime: 22800 },
];
