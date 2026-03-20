import { supabase } from '../lib/supabase';
import { Subscription } from '../types';
import { PlanId } from '../lib/constants';

export async function getSubscription(userId: string): Promise<Subscription> {
  const { data, error } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    throw new Error('Subscription not found');
  }

  return data;
}

export async function mockCheckout(userId: string, plan: PlanId): Promise<Subscription> {
  const planData = plan === 'monthly' ? 30 : 365;
  const currentPeriodEnd = new Date();
  currentPeriodEnd.setDate(currentPeriodEnd.getDate() + planData);

  // Try to get existing subscription, update if present
  const { data: existing } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (existing) {
    const { data: updated, error } = await supabase
      .from('subscriptions')
      .update({
        plan,
        status: 'active',
        stripe_customer_id: `demo_customer_${userId}`,
        stripe_subscription_id: `demo_sub_${userId}_${Date.now()}`,
        current_period_end: currentPeriodEnd.toISOString(),
      })
      .eq('id', existing.id)
      .select()
      .single();

    if (error || !updated) {
      throw new Error('Failed to update subscription');
    }

    return updated;
  }

  // Create new subscription if doesn't exist
  const { data, error } = await supabase
    .from('subscriptions')
    .insert({
      user_id: userId,
      plan,
      status: 'active',
      stripe_customer_id: `demo_customer_${userId}`,
      stripe_subscription_id: `demo_sub_${userId}_${Date.now()}`,
      current_period_end: currentPeriodEnd.toISOString(),
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to create subscription');
  }

  return data;
}

export async function mockCancel(userId: string): Promise<Subscription> {
  const { data: subscription, error: getError } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (getError || !subscription) {
    throw new Error('Subscription not found');
  }

  const { data, error } = await supabase
    .from('subscriptions')
    .update({ status: 'cancelled' })
    .eq('id', subscription.id)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to cancel subscription');
  }

  return data;
}
