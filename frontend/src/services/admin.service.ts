import api from '../lib/axios';

type ApiUser = {
  id: string;
  email: string;
  fullName?: string;
  full_name?: string;
  isAdmin?: boolean;
  is_admin?: boolean;
  createdAt?: string;
  created_at?: string;
};

type ApiSubscription = {
  id: string;
  userId?: string;
  user_id?: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'cancelled' | 'lapsed';
  currentPeriodEnd?: string;
  current_period_end?: string;
  createdAt?: string;
  created_at?: string;
};

type AdminUsersPayload = {
  users?: ApiUser[];
  subscriptions?: ApiSubscription[];
};

export type AdminUserView = {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  scores: number[];
  totalWinnings: number;
  subscription: {
    plan: 'monthly' | 'yearly';
    status: 'active' | 'inactive' | 'cancelled' | 'lapsed';
    currentPeriodEnd: string;
  };
};

const getLatestSubscriptionMap = (subscriptions: ApiSubscription[]): Map<string, ApiSubscription> => {
  const sorted = [...subscriptions].sort((a, b) => {
    const aDate = new Date(a.createdAt ?? a.created_at ?? 0).getTime();
    const bDate = new Date(b.createdAt ?? b.created_at ?? 0).getTime();
    return bDate - aDate;
  });

  const map = new Map<string, ApiSubscription>();

  sorted.forEach((subscription) => {
    const userId = subscription.userId ?? subscription.user_id;
    if (userId && !map.has(userId)) {
      map.set(userId, subscription);
    }
  });

  return map;
};

export const getAdminUsers = async () => {
  const res = await api.get('/admin/users');
  const payload = res.data.data as AdminUsersPayload | ApiUser[];

  if (Array.isArray(payload)) {
    return payload.map((user) => ({
      id: user.id,
      fullName: user.fullName ?? user.full_name ?? '',
      email: user.email,
      createdAt: user.createdAt ?? user.created_at ?? new Date().toISOString(),
      scores: [],
      totalWinnings: 0,
      subscription: {
        plan: 'monthly' as const,
        status: 'inactive' as const,
        currentPeriodEnd: new Date().toISOString(),
      },
    })) as AdminUserView[];
  }

  const users = payload.users ?? [];
  const subscriptions = payload.subscriptions ?? [];
  const latestSubscriptionMap = getLatestSubscriptionMap(subscriptions);

  return users.map((user) => {
    const subscription = latestSubscriptionMap.get(user.id);

    return {
      id: user.id,
      fullName: user.fullName ?? user.full_name ?? '',
      email: user.email,
      createdAt: user.createdAt ?? user.created_at ?? new Date().toISOString(),
      scores: [],
      totalWinnings: 0,
      subscription: {
        plan: subscription?.plan ?? 'monthly',
        status: subscription?.status ?? 'inactive',
        currentPeriodEnd:
          subscription?.currentPeriodEnd ??
          subscription?.current_period_end ??
          new Date().toISOString(),
      },
    } satisfies AdminUserView;
  });
};

export const updateUserScores = async (
  userId: string,
  scores: { score: number; playedAt: string }[]
): Promise<void> => {
  await api.put(`/admin/users/${userId}`, { scores });
};

export const getAdminDraws = async () => {
  const res = await api.get('/draws');
  return res.data.data;
};

export const configureDrawType = async (
  drawId: string,
  drawType: 'random' | 'algorithmic'
): Promise<void> => {
  await api.put(`/draws/${drawId}/configure`, { drawType });
};

export const simulateDraw = async (drawId: string) => {
  const res = await api.post('/draws/simulate', { drawId });
  return res.data.data;
};

export const publishDraw = async (drawId: string): Promise<void> => {
  await api.post(`/draws/${drawId}/publish`);
};

export const getAdminWinners = async () => {
  const res = await api.get('/winners');
  return res.data.data;
};

export const verifyWinner = async (
  winnerId: string,
  approved: boolean,
  adminNote?: string
): Promise<void> => {
  await api.post(`/winners/${winnerId}/verify`, { approved, adminNote });
};

export const markWinnerPaid = async (winnerId: string): Promise<void> => {
  await api.post(`/winners/${winnerId}/mark-paid`);
};

export const getAdminReports = async () => {
  const res = await api.get('/admin/reports');
  return res.data.data;
};

export const getCharityStats = async () => {
  const res = await api.get('/charities');
  return res.data.data;
};

export const createCharity = async (payload: {
  name: string;
  category: string;
  description: string;
  websiteUrl: string;
  imageUrl: string;
  isFeatured: boolean;
  isActive: boolean;
}): Promise<void> => {
  await api.post('/charities', payload);
};

export const updateCharity = async (
  id: string,
  payload: Partial<{
    name: string;
    category: string;
    description: string;
    websiteUrl: string;
    imageUrl: string;
    isFeatured: boolean;
    isActive: boolean;
  }>
): Promise<void> => {
  await api.put(`/charities/${id}`, payload);
};

export const deleteCharity = async (id: string): Promise<void> => {
  await api.delete(`/charities/${id}`);
};
