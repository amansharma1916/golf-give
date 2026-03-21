import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { QUERY_KEYS } from '../lib/queryKeys';
import {
  getMySubscription,
  mockCancel,
  mockCheckout,
  switchPlan,
} from '../services/subscriptions.service';
import { useToastStore } from '../stores/toastStore';
import { useUserStore } from '../stores/userStore';

export const useSubscription = () => {
  return useQuery({
    queryKey: QUERY_KEYS.subscription,
    queryFn: getMySubscription,
  });
};

export const useMockCheckout = () => {
  const queryClient = useQueryClient();
  const setSubscription = useUserStore((s) => s.setSubscription);
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: mockCheckout,
    onSuccess: (data) => {
      setSubscription(data);
      queryClient.setQueryData(QUERY_KEYS.subscription, data);
      addToast({
        message: 'Welcome to GolfGive! Your subscription is active.',
        type: 'success',
      });
    },
    onError: () => {
      addToast({
        message: 'Subscription activation failed. Try again.',
        type: 'error',
      });
    },
  });
};

export const useMockCancel = () => {
  const queryClient = useQueryClient();
  const setSubscription = useUserStore((s) => s.setSubscription);
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: mockCancel,
    onSuccess: () => {
      setSubscription(null);
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.subscription });
      addToast({
        message: 'Subscription cancelled.',
        type: 'warning',
      });
    },
    onError: () => {
      addToast({
        message: 'Cancellation failed. Try again.',
        type: 'error',
      });
    },
  });
};

export const useSwitchPlan = () => {
  const queryClient = useQueryClient();
  const addToast = useToastStore((s) => s.addToast);

  return useMutation({
    mutationFn: switchPlan,
    onSuccess: (data) => {
      queryClient.setQueryData(QUERY_KEYS.subscription, data);
      addToast({
        message: 'Plan updated successfully',
        type: 'success',
      });
    },
    onError: () => {
      addToast({
        message: 'Failed to update plan',
        type: 'error',
      });
    },
  });
};
