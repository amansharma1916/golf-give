import type { Session } from '@supabase/supabase-js';
import api from '../lib/axios';
import { supabase } from '../lib/supabase';
import type { Subscription, User } from '../types';

export interface MeResponse {
  user: User;
  subscription: Subscription | null;
  charityContribution?: {
    charityId: string;
    charityName: string;
    percentage: number;
  } | null;
}

type ApiUser = User & {
  full_name?: string;
  is_admin?: boolean;
  created_at?: string;
};

type ApiSubscription = Subscription & {
  user_id?: string;
  current_period_end?: string;
};

type ApiMeResponse = {
  user: ApiUser;
  subscription: ApiSubscription | null;
  charityContribution?: {
    charityId?: string;
    charity_id?: string;
    charityName?: string;
    charity_name?: string;
    percentage?: number;
  } | null;
};

const normalizeUser = (user: ApiUser): User => {
  return {
    id: user.id,
    email: user.email,
    fullName: user.fullName ?? user.full_name ?? '',
    isAdmin: user.isAdmin ?? user.is_admin ?? false,
    createdAt: user.createdAt ?? user.created_at ?? new Date().toISOString(),
  };
};

const normalizeSubscription = (subscription: ApiSubscription | null): Subscription | null => {
  if (!subscription) {
    return null;
  }

  return {
    id: subscription.id,
    userId: subscription.userId ?? subscription.user_id ?? '',
    plan: subscription.plan,
    status: subscription.status,
    currentPeriodEnd: subscription.currentPeriodEnd ?? subscription.current_period_end ?? new Date().toISOString(),
  };
};

const normalizeMeResponse = (payload: ApiMeResponse): MeResponse => {
  return {
    user: normalizeUser(payload.user),
    subscription: normalizeSubscription(payload.subscription),
    charityContribution: payload.charityContribution
      ? {
          charityId: payload.charityContribution.charityId ?? payload.charityContribution.charity_id ?? '',
          charityName: payload.charityContribution.charityName ?? payload.charityContribution.charity_name ?? '',
          percentage: payload.charityContribution.percentage ?? 0,
        }
      : null,
  };
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

export const signUpWithEmail = async (email: string, password: string): Promise<void> => {
  const { error } = await supabase.auth.signUp({ email, password });

  if (error) {
    throw new Error(error.message);
  }
};

export const getMe = async (): Promise<MeResponse> => {
  const res = await api.get('/auth/me');
  return normalizeMeResponse(res.data.data as ApiMeResponse);
};

export const registerUser = async (payload: {
  fullName: string;
  email: string;
  password: string;
  charityId: string;
  contributionPercentage: number;
}): Promise<MeResponse> => {
  const res = await api.post('/auth/register', payload);
  return normalizeMeResponse(res.data.data as ApiMeResponse);
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
