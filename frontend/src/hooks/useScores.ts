import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../lib/queryKeys';
import { addScore, deleteScore, getMyScores, updateScore } from '../services/scores.service';
import { useToastStore } from '../stores/toastStore';

export const useScores = () => {
  return useQuery({
    queryKey: QUERY_KEYS.scores,
    queryFn: getMyScores,
  });
};

export const useAddScore = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: addScore,
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.scores, data);
      addToast({ message: 'Score added successfully', type: 'success' });
    },
    onError: () => {
      addToast({ message: 'Failed to add score. Try again.', type: 'error' });
    },
  });
};

export const useUpdateScore = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: { score: number; playedAt: string } }) => updateScore(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.scores });
      addToast({ message: 'Score updated', type: 'success' });
    },
    onError: () => {
      addToast({ message: 'Failed to update score.', type: 'error' });
    },
  });
};

export const useDeleteScore = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: deleteScore,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.scores });
      addToast({ message: 'Score deleted', type: 'warning' });
    },
    onError: () => {
      addToast({ message: 'Failed to delete score.', type: 'error' });
    },
  });
};
