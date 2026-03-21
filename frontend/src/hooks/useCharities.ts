import { useMutation, useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../lib/queryKeys';
import {
  getAllCharities,
  getCharityById,
  getFeaturedCharities,
  updateMyCharity,
} from '../services/charities.service';
import { useToastStore } from '../stores/toastStore';

export const useCharities = () => {
  return useQuery({
    queryKey: QUERY_KEYS.charities,
    queryFn: getAllCharities,
    staleTime: 5 * 60 * 1000,
  });
};

export const useFeaturedCharities = () => {
  return useQuery({
    queryKey: QUERY_KEYS.featuredCharities,
    queryFn: getFeaturedCharities,
    staleTime: 5 * 60 * 1000,
  });
};

export const useCharityById = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.charityById(id),
    queryFn: () => getCharityById(id),
    enabled: !!id,
  });
};

export const useUpdateMyCharity = () => {
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: updateMyCharity,
    onSuccess: () => {
      addToast({ message: 'Charity updated successfully', type: 'success' });
    },
    onError: () => {
      addToast({ message: 'Failed to update charity', type: 'error' });
    },
  });
};
