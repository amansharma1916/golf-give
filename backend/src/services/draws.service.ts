import { supabase } from '../lib/supabase';
import { Draw, DrawEntry } from '../types';
import { simulateDraw } from '../draw-engine/simulate';
import { calculatePrizePool } from '../draw-engine/prize';

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
  const result = simulateDraw(drawType);
  return result;
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

  // Get active subscribers and their scores
  const { data: subscriptions, error: subError } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('status', 'active');

  if (subError || !subscriptions) {
    throw new Error('Failed to fetch subscribers');
  }

  const subscriberIds = subscriptions.map((s) => s.user_id);

  // Create draw entries and calculate matches
  let fiveMatchCount = 0,
    fourMatchCount = 0,
    threeMatchCount = 0;
  const drawEntries: DrawEntry[] = [];

  for (const userId of subscriberIds) {
    const { data: scores } = await supabase
      .from('scores')
      .select('score')
      .eq('user_id', userId)
      .order('played_at', { ascending: false })
      .limit(5);

    if (!scores || scores.length === 0) continue;

    const scoreSet = new Set(scores.map((s) => s.score));
    const matches = winningNumbers.filter((n) => scoreSet.has(n)).length;

    if (matches >= 3) {
      if (matches === 5) fiveMatchCount++;
      else if (matches === 4) fourMatchCount++;
      else if (matches === 3) threeMatchCount++;

      const { data: entry } = await supabase
        .from('draw_entries')
        .insert({
          draw_id: drawId,
          user_id: userId,
          score_snapshot: scores.map((s) => s.score),
          match_count: matches,
          is_winner: true,
        })
        .select()
        .single();

      if (entry) drawEntries.push(entry);
    }
  }

  // Calculate prize pool (using mock subscription amount for demo)
  const mockSubscriptionAmount = 9.99;
  const prizeCalc = calculatePrizePool(
    subscriberIds.length,
    mockSubscriptionAmount,
    fiveMatchCount,
    fourMatchCount,
    threeMatchCount
  );

  // Create prize pools
  const prizeTiers = ['five_match', 'four_match', 'three_match'] as const;
  for (const tier of prizeTiers) {
    const tierData = prizeCalc[tier];
    await supabase
      .from('prize_pools')
      .insert({
        draw_id: drawId,
        tier,
        pool_percentage: tierData.percentage,
        total_pool: tierData.pool,
        winner_count: tierData.winners,
        prize_per_winner: tierData.prizePerWinner,
      });
  }

  // Create payouts for winners
  for (const entry of drawEntries) {
    let tier: 'five_match' | 'four_match' | 'three_match';
    if (entry.match_count === 5) tier = 'five_match';
    else if (entry.match_count === 4) tier = 'four_match';
    else tier = 'three_match';

    const amount = prizeCalc[tier].prizePerWinner;

    await supabase
      .from('payouts')
      .insert({
        draw_entry_id: entry.id,
        user_id: entry.user_id,
        amount,
        status: 'pending',
      });
  }

  // Update draw
  const { data: updatedDraw, error: updateError } = await supabase
    .from('draws')
    .update({
      status: 'published',
      winning_numbers: winningNumbers,
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
