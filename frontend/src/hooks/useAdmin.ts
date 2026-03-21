import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../lib/queryKeys';
import {
  configureDrawType,
  createCharity,
  createDraw,
  deleteCharity,
  getAdminDisputes,
  getAdminDraws,
  getAdminReports,
  getAdminUsers,
  getAdminWinners,
  getCharityStats,
  getOpenDisputes,
  markWinnerPaid,
  publishDraw,
  resolveDispute,
  simulateDraw,
  updateCharity,
  updateUserScores,
  verifyWinner,
} from '../services/admin.service';
import { useToastStore } from '../stores/toastStore';

export const useAdminUsers = () =>
  useQuery({
    queryKey: QUERY_KEYS.adminUsers,
    queryFn: getAdminUsers,
  });

export const useUpdateUserScores = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ userId, scores }: { userId: string; scores: { score: number; playedAt: string }[] }) =>
      updateUserScores(userId, scores),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminUsers });
      addToast({ message: 'Scores updated successfully', type: 'success' });
    },
    onError: () => {
      addToast({ message: 'Failed to update scores', type: 'error' });
    },
  });
};

export const useAdminDraws = () =>
  useQuery({
    queryKey: QUERY_KEYS.adminDraws,
    queryFn: getAdminDraws,
  });

export const useCreateDraw = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: (params: {
      month: string;
      drawType: 'random' | 'algorithmic';
      algorithmMode?: 'most_common' | 'least_common';
    }) => createDraw(params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminDraws });
      addToast({ message: 'Draw created successfully', type: 'success' });
    },
    onError: () => {
      addToast({ message: 'Failed to create draw', type: 'error' });
    },
  });
};

export const useSimulateDraw = () => {
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: simulateDraw,
    onSuccess: () => {
      addToast({ message: 'Simulation complete', type: 'success' });
    },
    onError: () => {
      addToast({ message: 'Simulation failed', type: 'error' });
    },
  });
};

export const usePublishDraw = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ drawId, winningNumbers }: { drawId: string; winningNumbers: number[] }) =>
      publishDraw(drawId, winningNumbers),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminDraws });
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.draws });
      addToast({
        message: 'Draw published successfully!',
        type: 'success',
      });
    },
    onError: () => {
      addToast({ message: 'Failed to publish draw', type: 'error' });
    },
  });
};

export const useConfigureDrawType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      drawId,
      drawType,
      algorithmMode,
    }: {
      drawId: string;
      drawType: 'random' | 'algorithmic';
      algorithmMode?: 'most_common' | 'least_common';
    }) => configureDrawType(drawId, drawType, algorithmMode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminDraws });
    },
  });
};

export const useAdminWinners = () =>
  useQuery({
    queryKey: QUERY_KEYS.adminWinners,
    queryFn: getAdminWinners,
  });

export const useVerifyWinner = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, approved, adminNote }: { id: string; approved: boolean; adminNote?: string }) =>
      verifyWinner(id, approved, adminNote),
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminWinners });
      addToast({
        message: vars.approved ? 'Winner approved. Member will be notified.' : 'Submission rejected.',
        type: vars.approved ? 'success' : 'warning',
      });
    },
    onError: () => {
      addToast({ message: 'Action failed. Try again.', type: 'error' });
    },
  });
};

export const useMarkWinnerPaid = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: markWinnerPaid,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminWinners });
      addToast({ message: 'Payment marked as sent', type: 'success' });
    },
    onError: () => {
      addToast({ message: 'Failed to mark paid', type: 'error' });
    },
  });
};

export const useAdminReports = () =>
  useQuery({
    queryKey: QUERY_KEYS.adminReports,
    queryFn: getAdminReports,
  });

export const useAdminCharityStats = () =>
  useQuery({
    queryKey: QUERY_KEYS.charities,
    queryFn: getCharityStats,
  });

export const useCreateCharity = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: createCharity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.charities });
      addToast({ message: 'Charity added successfully', type: 'success' });
    },
    onError: () => {
      addToast({ message: 'Failed to add charity', type: 'error' });
    },
  });
};

export const useUpdateCharity = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Parameters<typeof updateCharity>[1] }) =>
      updateCharity(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.charities });
      addToast({ message: 'Charity updated', type: 'success' });
    },
    onError: () => {
      addToast({ message: 'Failed to update charity', type: 'error' });
    },
  });
};

export const useDeleteCharity = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: deleteCharity,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.charities });
      addToast({ message: 'Charity removed', type: 'warning' });
    },
    onError: () => {
      addToast({ message: 'Failed to remove charity', type: 'error' });
    },
  });
};

// Dispute Hooks

export const useAdminDisputes = () =>
  useQuery({
    queryKey: QUERY_KEYS.adminWinners,
    queryFn: getAdminDisputes,
  });

export const useOpenDisputes = () =>
  useQuery({
    queryKey: ['disputes', 'open'],
    queryFn: getOpenDisputes,
  });

export const useResolveDispute = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: ({
      disputeId,
      status,
      adminResponse,
    }: {
      disputeId: string;
      status: 'investigating' | 'resolved' | 'rejected';
      adminResponse: string;
    }) => resolveDispute(disputeId, status, adminResponse),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['disputes'] });
      queryClient.invalidateQueries({ queryKey: ['disputes', 'open'] });
      addToast({ message: 'Dispute resolved successfully', type: 'success' });
    },
    onError: () => {
      addToast({ message: 'Failed to resolve dispute', type: 'error' });
    },
  });
};
