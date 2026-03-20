import api from '../lib/axios';
import type { ApiResponse } from '../types/api.types';

type BackendCharity = {
  id: string;
  name: string;
  description: string | null;
};

export type CharityOption = {
  id: string;
  name: string;
  description: string;
};

export const fetchCharityOptions = async (): Promise<CharityOption[]> => {
  const { data } = await api.get<ApiResponse<BackendCharity[]>>('/charities');

  if (!data.success) {
    throw new Error(data.error.message);
  }

  return data.data.map((charity) => ({
    id: charity.id,
    name: charity.name,
    description: charity.description ?? '',
  }));
};
