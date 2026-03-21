import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../lib/queryKeys';
import { getMyWinnings, uploadProof } from '../services/winners.service';
import { useToastStore } from '../stores/toastStore';

export const useWinnings = () => {
  return useQuery({
    queryKey: QUERY_KEYS.winnings,
    queryFn: getMyWinnings,
  });
};

export const useUploadProof = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, file }: { id: string; file: File }) => uploadProof(id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.winnings });
      addToast({
        message: "Proof submitted! We'll verify within 2-3 working days.",
        type: 'success',
      });
    },
    onError: () => {
      addToast({
        message: 'Upload failed. Please try again.',
        type: 'error',
      });
    },
  });
};
