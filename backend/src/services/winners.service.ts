import { supabase } from '../lib/supabase';
import { Payout } from '../types';

export async function getUserPayouts(userId: string): Promise<Payout[]> {
  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch payouts');
  }

  return data || [];
}

export async function uploadProof(
  payoutId: string,
  userId: string,
  proofUrl: string
): Promise<Payout> {
  // Verify ownership
  const { data: payout, error: fetchError } = await supabase
    .from('payouts')
    .select('*')
    .eq('id', payoutId)
    .eq('user_id', userId)
    .single();

  if (fetchError || !payout) {
    throw new Error('Payout not found or unauthorized');
  }

  const { data, error } = await supabase
    .from('payouts')
    .update({ proof_url: proofUrl })
    .eq('id', payoutId)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to upload proof');
  }

  return data;
}

export async function getAllPayouts(): Promise<Payout[]> {
  const { data, error } = await supabase
    .from('payouts')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch payouts');
  }

  return data || [];
}

export async function verifyProof(
  payoutId: string,
  approved: boolean,
  adminNote?: string
): Promise<Payout> {
  const status = approved ? 'verified' : 'pending';

  const { data, error } = await supabase
    .from('payouts')
    .update({ status, admin_note: adminNote })
    .eq('id', payoutId)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to verify proof');
  }

  return data;
}

export async function markPaid(payoutId: string): Promise<Payout> {
  const { data, error } = await supabase
    .from('payouts')
    .update({ status: 'paid' })
    .eq('id', payoutId)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to mark as paid');
  }

  return data;
}
