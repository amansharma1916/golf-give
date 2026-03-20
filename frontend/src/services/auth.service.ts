import type { Session } from '@supabase/supabase-js';
import api from '../lib/axios';
import { supabase } from '../lib/supabase';
import type { ApiResponse } from '../types/api.types';
import type { Subscription, User } from '../types';

type BackendUser = {
  id: string;
  email: string;
  full_name: string | null;
  is_admin: boolean;
  created_at: string;
};

type BackendSubscription = {
  id: string;
  user_id: string;
  plan: 'monthly' | 'yearly';
  status: 'active' | 'inactive' | 'cancelled' | 'lapsed';
  current_period_end: string;
};

type MePayload = {
  user: BackendUser;
  subscription: BackendSubscription;
};

type SignupPayload = {
  user: {
    id: string;
    email: string;
  };
};

export type RegisterPayload = {
  fullName: string;
  charityId: string;
  contributionPercentage: number;
};

export const mapBackendUser = (backendUser: BackendUser): User => ({
  id: backendUser.id,
  email: backendUser.email,
  fullName: backendUser.full_name ?? '',
  isAdmin: backendUser.is_admin,
  createdAt: backendUser.created_at,
});

export const mapBackendSubscription = (subscription: BackendSubscription): Subscription => ({
  id: subscription.id,
  userId: subscription.user_id,
  plan: subscription.plan,
  status: subscription.status,
  currentPeriodEnd: subscription.current_period_end,
});

const getSuccessData = <T>(response: ApiResponse<T>): T => {
  if (!response.success) {
    throw new Error(response.error.message);
  }

  return response.data;
};

const requireSession = (session: Session | null): Session => {
  if (!session?.access_token) {
    throw new Error('No active auth session found');
  }

  return session;
};

export const signInWithPassword = async (email: string, password: string): Promise<Session> => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    throw new Error(error.message);
  }

  return requireSession(data.session);
};

export const signUpWithPassword = async (email: string, password: string): Promise<Session> => {
  const { data } = await api.post<ApiResponse<SignupPayload>>('/auth/signup', { email, password });
  getSuccessData(data);

  const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password });

  if (signInError) {
    throw new Error(signInError.message);
  }

  return requireSession(signInData.session);
};

export const registerProfile = async (
  accessToken: string,
  payload: RegisterPayload
): Promise<void> => {
  await api.post<ApiResponse<unknown>>('/auth/register', payload, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });
};

export const getMe = async (): Promise<{ user: User; subscription: Subscription }> => {
  const { data } = await api.get<ApiResponse<MePayload>>('/auth/me');
  const payload = getSuccessData(data);

  return {
    user: mapBackendUser(payload.user),
    subscription: mapBackendSubscription(payload.subscription),
  };
};

export const getCurrentSession = async (): Promise<Session | null> => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    throw new Error(error.message);
  }

  return data.session;
};

export const signOut = async (): Promise<void> => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};
