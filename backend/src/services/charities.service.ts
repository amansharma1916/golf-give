import { supabase } from '../lib/supabase';
import { Charity } from '../types';

export async function listCharities(search?: string, _category?: string): Promise<Charity[]> {
  let query = supabase
    .from('charities')
    .select('*')
    .eq('is_active', true);

  if (search) {
    query = query.ilike('name', `%${search}%`);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    throw new Error('Failed to fetch charities');
  }

  return data || [];
}

export async function getFeaturedCharities(): Promise<Charity[]> {
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .eq('is_active', true)
    .eq('is_featured', true);

  if (error) {
    throw new Error('Failed to fetch featured charities');
  }

  return data || [];
}

export async function getCharity(charityId: string): Promise<Charity> {
  const { data, error } = await supabase
    .from('charities')
    .select('*')
    .eq('id', charityId)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    throw new Error('Charity not found');
  }

  return data;
}

export async function createCharity(data: {
  name: string;
  description?: string | null;
  imageUrl?: string | null;
  websiteUrl?: string | null;
  isFeatured?: boolean;
}): Promise<Charity> {
  const { data: charity, error } = await supabase
    .from('charities')
    .insert({
      name: data.name,
      description: data.description,
      image_url: data.imageUrl,
      website_url: data.websiteUrl,
      is_featured: data.isFeatured ?? false,
      is_active: true,
    })
    .select()
    .single();

  if (error || !charity) {
    throw new Error('Failed to create charity');
  }

  return charity;
}

export async function updateCharity(
  charityId: string,
  data: {
    name?: string;
    description?: string | null;
    imageUrl?: string | null;
    websiteUrl?: string | null;
    isFeatured?: boolean;
  }
): Promise<Charity> {
  const updateData: {
    name?: string;
    description?: string | null;
    image_url?: string | null;
    website_url?: string | null;
    is_featured?: boolean;
  } = {};
  if (data.name !== undefined) updateData.name = data.name;
  if (data.description !== undefined) updateData.description = data.description;
  if (data.imageUrl !== undefined) updateData.image_url = data.imageUrl;
  if (data.websiteUrl !== undefined) updateData.website_url = data.websiteUrl;
  if (data.isFeatured !== undefined) updateData.is_featured = data.isFeatured;

  const { data: charity, error } = await supabase
    .from('charities')
    .update(updateData)
    .eq('id', charityId)
    .select()
    .single();

  if (error || !charity) {
    throw new Error('Failed to update charity');
  }

  return charity;
}

export async function deleteCharity(charityId: string): Promise<void> {
  const { error } = await supabase
    .from('charities')
    .update({ is_active: false })
    .eq('id', charityId);

  if (error) {
    throw new Error('Failed to delete charity');
  }
}

export async function updateUserCharityPreference(
  userId: string,
  charityId: string,
  contributionPercentage: number
): Promise<void> {
  const { data: charity, error: charityError } = await supabase
    .from('charities')
    .select('id')
    .eq('id', charityId)
    .eq('is_active', true)
    .maybeSingle();

  if (charityError || !charity) {
    throw new Error('Selected charity was not found');
  }

  const { data: existingContribution, error: existingError } = await supabase
    .from('charity_contributions')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();

  if (existingError) {
    throw new Error('Failed to fetch charity preference');
  }

  if (existingContribution) {
    const { error: updateError } = await supabase
      .from('charity_contributions')
      .update({
        charity_id: charityId,
        percentage: contributionPercentage,
      })
      .eq('id', existingContribution.id);

    if (updateError) {
      throw new Error('Failed to update charity preference');
    }

    return;
  }

  const { error: insertError } = await supabase.from('charity_contributions').insert({
    user_id: userId,
    charity_id: charityId,
    percentage: contributionPercentage,
  });

  if (insertError) {
    throw new Error('Failed to update charity preference');
  }
}
