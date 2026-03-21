import { supabase } from '../lib/supabase';
import { Payout, WinnerDispute } from '../types';

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

// Dispute Management Functions

export async function createDispute(
  payoutId: string,
  userId: string,
  reason: string
): Promise<WinnerDispute> {
  // Verify the payout belongs to the user
  const { data: payout } = await supabase
    .from('payouts')
    .select('*')
    .eq('id', payoutId)
    .eq('user_id', userId)
    .single();

  if (!payout) {
    throw new Error('Payout not found or unauthorized');
  }

  // Check if a dispute already exists for this payout
  const { data: existingDispute } = await supabase
    .from('winner_disputes')
    .select('*')
    .eq('payout_id', payoutId)
    .eq('status', 'open')
    .single();

  if (existingDispute) {
    throw new Error('An open dispute already exists for this payout');
  }

  // Create new dispute
  const { data, error } = await supabase
    .from('winner_disputes')
    .insert([
      {
        payout_id: payoutId,
        user_id: userId,
        reason,
        status: 'open',
      },
    ])
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to create dispute');
  }

  return data;
}

export async function getUserDisputes(userId: string): Promise<WinnerDispute[]> {
  const { data, error } = await supabase
    .from('winner_disputes')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch disputes');
  }

  return data || [];
}

export async function getAllDisputes(): Promise<WinnerDispute[]> {
  const { data, error } = await supabase
    .from('winner_disputes')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch disputes');
  }

  return data || [];
}

export async function getOpenDisputes(): Promise<WinnerDispute[]> {
  const { data, error } = await supabase
    .from('winner_disputes')
    .select('*')
    .eq('status', 'open')
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error('Failed to fetch open disputes');
  }

  return data || [];
}

export async function resolveDispute(
  disputeId: string,
  status: 'investigating' | 'resolved' | 'rejected',
  adminResponse: string
): Promise<WinnerDispute> {
  const { data, error } = await supabase
    .from('winner_disputes')
    .update({
      status,
      admin_response: adminResponse,
      resolved_at: status !== 'investigating' ? new Date().toISOString() : null,
      updated_at: new Date().toISOString(),
    })
    .eq('id', disputeId)
    .select()
    .single();

  if (error || !data) {
    throw new Error('Failed to resolve dispute');
  }

  return data;
}
