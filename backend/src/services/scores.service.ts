import { supabase } from '../lib/supabase';
import { Score } from '../types';
import { MAX_SCORES_PER_USER } from '../lib/constants';

export async function getUserScores(userId: string): Promise<Score[]> {
  const { data, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(MAX_SCORES_PER_USER);

  if (error) {
    throw new Error('Failed to fetch scores');
  }

  return data || [];
}

export async function addScore(
  userId: string,
  score: number,
  playedAt: string
): Promise<Score> {
  // Get current scores
  const { data: currentScores, error: fetchError } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('played_at', { ascending: false });

  if (fetchError) {
    throw new Error('Failed to fetch current scores');
  }

  // If 5 or more scores exist, delete the oldest
  if (currentScores && currentScores.length >= MAX_SCORES_PER_USER) {
    const oldestScore = currentScores[currentScores.length - 1];
    const { error: deleteError } = await supabase
      .from('scores')
      .delete()
      .eq('id', oldestScore.id);

    if (deleteError) {
      throw new Error('Failed to delete oldest score');
    }
  }

  // Insert new score
  const { data, error } = await supabase
    .from('scores')
    .insert({
      user_id: userId,
      score,
      played_at: playedAt,
    })
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to add score');
  }

  return data;
}

export async function updateScore(
  userId: string,
  scoreId: string,
  score?: number,
  playedAt?: string
): Promise<Score> {
  // Verify ownership
  const { data: scoreData, error: fetchError } = await supabase
    .from('scores')
    .select('*')
    .eq('id', scoreId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !scoreData) {
    throw new Error('Score not found or unauthorized');
  }

  const updateData: { score?: number; played_at?: string } = {};
  if (score !== undefined) updateData.score = score;
  if (playedAt !== undefined) updateData.played_at = playedAt;

  const { data, error } = await supabase
    .from('scores')
    .update(updateData)
    .eq('id', scoreId)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to update score');
  }

  return data;
}

export async function deleteScore(userId: string, scoreId: string): Promise<void> {
  // Verify ownership
  const { data: scoreData, error: fetchError } = await supabase
    .from('scores')
    .select('*')
    .eq('id', scoreId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !scoreData) {
    throw new Error('Score not found or unauthorized');
  }

  const { error } = await supabase.from('scores').delete().eq('id', scoreId);

  if (error) {
    throw new Error('Failed to delete score');
  }
}
