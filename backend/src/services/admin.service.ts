import { supabase } from '../lib/supabase';
import { User, Subscription } from '../types';

export async function getAdminUsers(): Promise<{
  users: User[];
  subscriptions: Subscription[];
}> {
  const { data: users, error: usersError } = await supabase
    .from('users')
    .select('*');

  if (usersError) {
    throw new Error('Failed to fetch users');
  }

  const { data: subscriptions, error: subsError } = await supabase
    .from('subscriptions')
    .select('*');

  if (subsError) {
    throw new Error('Failed to fetch subscriptions');
  }

  return {
    users: users || [],
    subscriptions: subscriptions || [],
  };
}

export async function editUser(userId: string, data: Record<string, any>): Promise<User> {
  const updateData: any = {};
  if (data.fullName !== undefined) updateData.full_name = data.fullName;
  if (data.isAdmin !== undefined) updateData.is_admin = data.isAdmin;

  const { data: user, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('id', userId)
    .select()
    .single();

  if (error || !user) {
    throw new Error('Failed to update user');
  }

  return user;
}

export async function getAdminReports(): Promise<any> {
  // Get total users
  const { count: totalUsers } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true });

  // Get active subscriptions
  const { count: activeSubs } = await supabase
    .from('subscriptions')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'active');

  // Get total prize pool
  const { data: prizePools } = await supabase
    .from('prize_pools')
    .select('total_pool');

  const totalPrizePool =
    prizePools?.reduce((sum, p) => sum + parseFloat(p.total_pool || '0'), 0) || 0;

  // Get published draws count
  const { count: drawsPublished } = await supabase
    .from('draws')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'published');

  // Get winners count
  const { count: winnersCreated } = await supabase
    .from('payouts')
    .select('*', { count: 'exact', head: true });

  return {
    totalUsers,
    activeSubscriptions: activeSubs,
    totalPrizePool,
    drawsPublished,
    winnersCreated,
    stats: {
      avgScorePerUser: 0,
      avgSubscriptionValue: activeSubs ? 9.99 : 0,
    },
  };
}
