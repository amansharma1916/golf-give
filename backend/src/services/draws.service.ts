import { supabase } from '../lib/supabase';
import { Draw, DrawEntry } from '../types';
import { simulateDraw } from '../draw-engine/simulate';
import { calculatePrizePool } from '../draw-engine/prize';
import { TAX_WITHHOLDING_RATE, PLANS, type PlanId } from '../lib/constants';

export async function listDraws(status?: string): Promise<Draw[]> {
  let query = supabase.from('draws').select('*');

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query.order('month', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch draws');
  }

  return data || [];
}

export async function getUpcomingDraw(): Promise<Draw | null> {
  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .eq('status', 'pending')
    .order('month', { ascending: true })
    .limit(1)
    .single();

  if (error || !data) {
    return null;
  }

  return data;
}

export async function createDraw(
  month: string,
  drawType: 'random' | 'algorithmic',
  algorithmMode?: 'most_common' | 'least_common'
): Promise<Draw> {
  // Validate month format YYYY-MM
  if (!/^\d{4}-\d{2}$/.test(month)) {
    throw new Error('Invalid month format. Use YYYY-MM');
  }

  // Store as first day of month for DATE columns (YYYY-MM-01).
  const normalizedMonth = `${month}-01`;

  // Check if draw for this month already exists
  const { data: existingDraw } = await supabase
    .from('draws')
    .select('*')
    .eq('month', normalizedMonth)
    .single();

  if (existingDraw) {
    throw new Error(`Draw for month ${month} already exists`);
  }

  // Create new draw
  const { data, error } = await supabase
    .from('draws')
    .insert([
      {
        month: normalizedMonth,
        status: 'pending',
        draw_type: drawType,
        winning_numbers: [],
        jackpot_amount: 0,
        rolled_over_amount: 0,
      },
    ])
    .select()
    .single();

  if (error || !data) {
    throw new Error(`Failed to create draw: ${error?.message ?? 'Unknown database error'}`);
  }

  return data;
}

export async function getDraw(drawId: string): Promise<Draw> {
  const { data, error } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single();

  if (error || !data) {
    throw new Error('Draw not found');
  }

  return data;
}

export async function simulateDraw_(drawType: 'random' | 'algorithmic'): Promise<any> {
  if (drawType === 'random') {
    return simulateDraw('random');
  }

  const { data: activeSubscriptions, error: subscriptionsError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active');

  if (subscriptionsError) {
    throw new Error('Failed to fetch active subscribers for simulation');
  }

  const userIds = (activeSubscriptions || []).map((subscription) => subscription.user_id);

  if (userIds.length === 0) {
    return simulateDraw('algorithmic');
  }

  const { data: scoreRows, error: scoresError } = await supabase
    .from('scores')
    .select('user_id, score, played_at')
    .in('user_id', userIds)
    .order('played_at', { ascending: false });

  if (scoresError) {
    throw new Error('Failed to fetch scores for simulation');
  }

  const groupedScores = new Map<string, number[]>();

  for (const row of scoreRows || []) {
    const existing = groupedScores.get(row.user_id) || [];
    if (existing.length < 5) {
      existing.push(row.score);
      groupedScores.set(row.user_id, existing);
    }
  }

  const scoreSnapshots = Array.from(groupedScores.values()).filter((scores) => scores.length > 0);
  const result = simulateDraw('algorithmic', scoreSnapshots, 'most_frequent');
  return result;
}

/**
 * Calculate jackpot rollover from previous month
 * If previous month had no 5-match winners, rollover their 5-match pool to this month
 */
async function calculateJackpotRollover(currentMonth: string): Promise<number> {
  try {
    // Calculate previous month
    const [year, month] = currentMonth.split('-').map(Number);
    const prevMonth = month === 1 ? year - 1 : year;
    const prevMonthNum = month === 1 ? 12 : month - 1;
    const previousMonthStr = `${prevMonth}-${String(prevMonthNum).padStart(2, '0')}`;

    // Get previous draw
    const { data: previousDraw } = await supabase
      .from('draws')
      .select('*,draw_entries(match_count)')
      .eq('month', previousMonthStr)
      .eq('status', 'published')
      .single();

    if (!previousDraw) {
      return 0; // No previous draw to rollover from
    }

    const entries = previousDraw.draw_entries || [];
    const hasFiveMatches = entries.some((entry: { match_count: number }) => entry.match_count === 5);

    if (hasFiveMatches) {
      return 0; // Previous month had 5-match winners, no rollover
    }

    // Get previous month's 5-match pool and get the prize amount from prize_pools
    const { data: prizePool } = await supabase
      .from('prize_pools')
      .select('total_pool')
      .eq('draw_id', previousDraw.id)
      .eq('tier', 'five_match')
      .single();

    if (!prizePool) {
      return 0;
    }

    return prizePool.total_pool || 0;
  } catch (error) {
    // If anything goes wrong, just return 0
    console.error('Error calculating jackpot rollover:', error);
    return 0;
  }
}

export async function publishDraw(
  drawId: string,
  winningNumbers: number[]
): Promise<Draw> {
  // Get draw
  const { data: draw, error: drawError } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .single();

  if (drawError || !draw) {
    throw new Error('Draw not found');
  }

  // Get active subscribers and their subscription plans
  const { data: subscriptions, error: subError } = await supabase
    .from('subscriptions')
    .select('user_id, plan')
    .eq('status', 'active');

  if (subError || !subscriptions) {
    throw new Error('Failed to fetch subscribers');
  }

  const subscriberIds = subscriptions.map((s) => s.user_id);

  // Create draw entries and calculate matches
  // Fetch all scores in a single batch query for performance
  const { data: allScores } = await supabase
    .from('scores')
    .select('user_id, score')
    .in('user_id', subscriberIds)
    .order('played_at', { ascending: false });

  // Group scores by user_id, keeping only last 5 scores per user
  const userScoresMap = new Map<string, number[]>();
  if (allScores) {
    for (const score of allScores) {
      if (!userScoresMap.has(score.user_id)) {
        userScoresMap.set(score.user_id, []);
      }
      const userScores = userScoresMap.get(score.user_id)!;
      if (userScores.length < 5) {
        userScores.push(score.score);
      }
    }
  }

  // Calculate matches for each user
  let fiveMatchCount = 0,
    fourMatchCount = 0,
    threeMatchCount = 0;
  const entiesToInsert: any[] = [];

  for (const userId of subscriberIds) {
    const scores = userScoresMap.get(userId) || [];
    if (scores.length === 0) continue;

    const scoreSet = new Set(scores);
    const matches = winningNumbers.filter((n) => scoreSet.has(n)).length;

    if (matches >= 3) {
      if (matches === 5) fiveMatchCount++;
      else if (matches === 4) fourMatchCount++;
      else if (matches === 3) threeMatchCount++;

      entiesToInsert.push({
        draw_id: drawId,
        user_id: userId,
        score_snapshot: scores,
        match_count: matches,
        is_winner: true,
      });
    }
  }

  // Batch insert draw entries
  let entriesData: DrawEntry[] = [];
  if (entiesToInsert.length > 0) {
    const { data: entries, error: entriesError } = await supabase
      .from('draw_entries')
      .insert(entiesToInsert)
      .select();

    if (entriesError) {
      throw new Error(`Failed to create draw entries: ${entriesError.message}`);
    }

    entriesData = entries || [];
  }

  // Calculate average subscription amount from actual plans
  let totalAmount = 0;
  for (const sub of subscriptions) {
    const planInfo = PLANS[sub.plan as PlanId];
    if (planInfo) {
      totalAmount += planInfo.amount / 100; // Convert from cents to pounds
    }
  }
  const averageSubscriptionAmount = subscriptions.length > 0 ? totalAmount / subscriptions.length : 9.99;
  
  const prizeCalc = calculatePrizePool(
    subscriberIds.length,
    averageSubscriptionAmount,
    fiveMatchCount,
    fourMatchCount,
    threeMatchCount
  );

  // Calculate jackpot rollover from previous month
  const rolledOverAmount = await calculateJackpotRollover(draw.month);
  
  // Adjust five_match pool with rollover
  if (rolledOverAmount > 0) {
    prizeCalc.five_match.pool += rolledOverAmount;
    if (prizeCalc.five_match.winners > 0) {
      prizeCalc.five_match.prizePerWinner = prizeCalc.five_match.pool / prizeCalc.five_match.winners;
    }
  }

  // Batch insert prize pools
  const poolsToInsert = [
    {
      draw_id: drawId,
      tier: 'five_match',
      pool_percentage: prizeCalc.five_match.percentage,
      total_pool: prizeCalc.five_match.pool,
      winner_count: prizeCalc.five_match.winners,
      prize_per_winner: prizeCalc.five_match.prizePerWinner,
    },
    {
      draw_id: drawId,
      tier: 'four_match',
      pool_percentage: prizeCalc.four_match.percentage,
      total_pool: prizeCalc.four_match.pool,
      winner_count: prizeCalc.four_match.winners,
      prize_per_winner: prizeCalc.four_match.prizePerWinner,
    },
    {
      draw_id: drawId,
      tier: 'three_match',
      pool_percentage: prizeCalc.three_match.percentage,
      total_pool: prizeCalc.three_match.pool,
      winner_count: prizeCalc.three_match.winners,
      prize_per_winner: prizeCalc.three_match.prizePerWinner,
    },
  ];

  const { error: poolsError } = await supabase
    .from('prize_pools')
    .insert(poolsToInsert);

  if (poolsError) {
    throw new Error(`Failed to create prize pools: ${poolsError.message}`);
  }

  // Batch insert payouts for winners
  const payoutsToInsert = entriesData.map((entry) => {
    let tier: 'five_match' | 'four_match' | 'three_match';
    if (entry.match_count === 5) tier = 'five_match';
    else if (entry.match_count === 4) tier = 'four_match';
    else tier = 'three_match';

    const grossAmount = prizeCalc[tier].prizePerWinner;
    const taxAmount = Math.round((grossAmount * TAX_WITHHOLDING_RATE) / 100);
    const netAmount = grossAmount - taxAmount;

    return {
      draw_entry_id: entry.id,
      user_id: entry.user_id,
      amount: netAmount, // Legacy field - keep for compatibility
      gross_amount: grossAmount,
      net_amount: netAmount,
      tax_amount: taxAmount,
      tax_rate: TAX_WITHHOLDING_RATE,
      status: 'pending',
    };
  });

  if (payoutsToInsert.length > 0) {
    const { error: payoutsError } = await supabase
      .from('payouts')
      .insert(payoutsToInsert);

    if (payoutsError) {
      throw new Error(`Failed to create payouts: ${payoutsError.message}`);
    }
  }

  // Update draw
  const { data: updatedDraw, error: updateError } = await supabase
    .from('draws')
    .update({
      status: 'published',
      winning_numbers: winningNumbers,
      rolled_over_amount: rolledOverAmount,
      jackpot_amount: prizeCalc.five_match.pool,
    })
    .eq('id', drawId)
    .select()
    .single();

  if (updateError || !updatedDraw) {
    throw new Error('Failed to publish draw');
  }

  return updatedDraw;
}

export async function configureDraw(
  drawId: string,
  drawType: 'random' | 'algorithmic'
): Promise<Draw> {
  const { data, error } = await supabase
    .from('draws')
    .update({ draw_type: drawType })
    .eq('id', drawId)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to configure draw');
  }

  return data;
}
