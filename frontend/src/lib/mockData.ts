import type { Draw, Score, Subscription, User } from '../types';

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
