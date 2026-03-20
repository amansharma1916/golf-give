import api from '../lib/axios';
import type { ApiResponse } from '../types/api.types';
import type { Subscription } from '../types';
import { mapBackendSubscription } from './auth.service';

type BackendSubscription = {
  id: string;
  user_id: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'cancelled' | 'lapsed';
  current_period_end: string;
};

const getSuccessData = <T>(response: ApiResponse<T>): T => {
  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

export const getSubscriptionStatus = async (): Promise<Subscription> => {
  const { data } = await api.get<ApiResponse<BackendSubscription>>('/subscriptions/status');
  const payload = getSuccessData(data);
  return mapBackendSubscription(payload);
};

export const activateSubscription = async (
  plan: 'monthly' | 'yearly'
): Promise<Subscription> => {
  const { data } = await api.post<ApiResponse<BackendSubscription>>('/subscriptions/mock-checkout', {
    plan,
  });
  const payload = getSuccessData(data);
  return mapBackendSubscription(payload);
};

export const cancelSubscription = async (): Promise<void> => {
  const { data } = await api.post<ApiResponse<{ message: string }>>('/subscriptions/mock-cancel');
  if (!data.success) {
    throw new Error(data.error.message);
  }
};
