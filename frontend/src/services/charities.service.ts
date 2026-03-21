import api from '../lib/axios';
import type { Charity } from '../types';

export const getAllCharities = async (): Promise<Charity[]> => {
  const res = await api.get('/charities');
  return res.data.data;
};

export const getFeaturedCharities = async (): Promise<Charity[]> => {
  const res = await api.get('/charities/featured');
  return res.data.data;
};

export const getCharityById = async (id: string): Promise<Charity> => {
  const res = await api.get(`/charities/${id}`);
  return res.data.data;
};

export const updateMyCharity = async (payload: {
  charityId: string;
  contributionPercentage: number;
}): Promise<void> => {
  await api.post('/charities/my-charity', payload);
};
