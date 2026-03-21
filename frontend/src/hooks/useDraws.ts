import { useQuery } from '@tanstack/react-query';
import { QUERY_KEYS } from '../lib/queryKeys';
import { getAllDraws, getDrawById, getUpcomingDraw } from '../services/draws.service';

export const useDraws = () => {
  return useQuery({
    queryKey: QUERY_KEYS.draws,
    queryFn: getAllDraws,
  });
};

export const useUpcomingDraw = () => {
  return useQuery({
    queryKey: QUERY_KEYS.upcomingDraw,
    queryFn: getUpcomingDraw,
  });
};

export const useDrawById = (id: string) => {
  return useQuery({
    queryKey: QUERY_KEYS.drawById(id),
    queryFn: () => getDrawById(id),
    enabled: !!id,
  });
};
