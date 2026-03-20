import { supabase } from '../lib/supabase';
import { User, Subscription } from '../types';

type SignupResult = {
  user: {
    id: string;
    email: string;
  };
};

export async function signupWithPassword(email: string, password: string): Promise<SignupResult> {
  const { data: createdAuthUser, error: createError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
  });

  if (createError || !createdAuthUser.user?.email) {
    throw new Error(createError?.message ?? 'Failed to create auth user');
  }

  return {
    user: {
      id: createdAuthUser.user.id,
      email: createdAuthUser.user.email,
    },
  };
}

export async function registerUser(
  userId: string,
  email: string,
  fullName: string,
  charityId: string,
  contributionPercentage: number
): Promise<{ user: User; subscription: Subscription }> {
  const { data: existingUser, error: existingUserError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .maybeSingle();

  if (existingUserError) {
    throw new Error(existingUserError.message);
  }

  let user = existingUser;

  if (!user) {
    const { data: createdUser, error: userError } = await supabase
      .from('users')
      .insert({
        id: userId,
        email,
        full_name: fullName,
        is_admin: false,
      })
      .select()
      .single();

    if (userError || !createdUser) {
      throw new Error(userError?.message ?? 'Failed to create user');
    }

    user = createdUser;
  }

  const { data: existingContribution } = await supabase
    .from('charity_contributions')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (!existingContribution) {
    const { error: charityError } = await supabase
    .from('charity_contributions')
    .insert({
      user_id: userId,
      charity_id: charityId,
      percentage: contributionPercentage,
    })
    .select()
    .single();

    if (charityError) {
      throw new Error('Failed to set charity preference');
    }
  }

  const { data: existingSubscription } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  let subscription = existingSubscription;

  if (!subscription) {
    const { data: createdSubscription, error: subError } = await supabase
      .from('subscriptions')
      .insert({
        user_id: userId,
        plan: 'monthly',
        status: 'inactive',
        stripe_customer_id: null,
        stripe_subscription_id: null,
        current_period_end: new Date().toISOString(),
      })
      .select()
      .single();

    if (subError || !createdSubscription) {
      throw new Error('Failed to create subscription row');
    }

    subscription = createdSubscription;
  }

  if (!user || !subscription) {
    throw new Error('Failed to complete registration');
  }

  return { user, subscription };
}

export async function getMe(userId: string): Promise<{ user: User; subscription: Subscription }> {
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error('User not found');
  }

  const { data: subscription, error: subError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (subError) {
    throw new Error('Subscription not found');
  }

  return { user, subscription };
}
