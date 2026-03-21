import api from '../lib/axios';
import type { Subscription } from '../types';

type ApiSubscription = Subscription & {
  user_id?: string;
  current_period_end?: string;
};

const normalizeSubscription = (subscription: ApiSubscription): Subscription => {
  return {
    id: subscription.id,
    userId: subscription.userId ?? subscription.user_id ?? '',
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd ?? subscription.current_period_end ?? new Date().toISOString(),
  };
};

export const getMySubscription = async (): Promise<Subscription> => {
  const res = await api.get('/subscriptions/status');
  return normalizeSubscription(res.data.data as ApiSubscription);
};

export const mockCheckout = async (plan: 'monthly' | 'yearly'): Promise<Subscription> => {
  const res = await api.post('/subscriptions/mock-checkout', { plan });
  return normalizeSubscription(res.data.data as ApiSubscription);
};

export const mockCancel = async (): Promise<void> => {
  await api.post('/subscriptions/mock-cancel');
};

export const switchPlan = async (plan: 'monthly' | 'yearly'): Promise<Subscription> => {
  const res = await api.post('/subscriptions/switch-plan', { plan });
  return normalizeSubscription(res.data.data as ApiSubscription);
};
