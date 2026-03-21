import { supabase } from '../lib/supabase';
import { User, Subscription } from '../types';

interface EditUserInput {
  fullName?: string;
  isAdmin?: boolean;
  scores?: {
    score: number;
    playedAt: string;
  }[];
}

interface AdminReports {
  totalUsers: number | null;
  activeSubscriptions: number | null;
  totalPrizePool: number;
  drawsPublished: number | null;
  winnersCreated: number | null;
  stats: {
    avgScorePerUser: number;
    avgSubscriptionValue: number;
  };
}

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

export async function editUser(userId: string, data: EditUserInput): Promise<User> {
  const updateData: Partial<Pick<User, 'full_name' | 'is_admin'>> = {};
  if (data.fullName !== undefined) updateData.full_name = data.fullName;
  if (data.isAdmin !== undefined) updateData.is_admin = data.isAdmin;

  if (data.scores !== undefined) {
    const { error: deleteError } = await supabase.from('scores').delete().eq('user_id', userId);

    if (deleteError) {
      throw new Error('Failed to update user scores');
    }

    if (data.scores.length > 0) {
      const rows = data.scores.map((item) => ({
        user_id: userId,
        score: item.score,
        played_at: item.playedAt,
      }));

      const { error: insertError } = await supabase.from('scores').insert(rows);

      if (insertError) {
        throw new Error('Failed to update user scores');
      }
    }
  }

  if (Object.keys(updateData).length > 0) {
    const { error: updateError } = await supabase.from('users').update(updateData).eq('id', userId);

    if (updateError) {
      throw new Error('Failed to update user');
    }
  }

  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (userError || !user) {
    throw new Error('Failed to fetch updated user');
  }

  return user;
}

export async function getAdminReports(): Promise<AdminReports> {
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
