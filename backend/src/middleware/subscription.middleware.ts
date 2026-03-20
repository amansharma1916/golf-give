import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { ApiResponse } from '../types';

export async function subscriptionMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      const response: ApiResponse<null> = {
        success: false,
        error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' },
      };
      res.status(401).json(response);
      return;
    }

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !subscription) {
      const response: ApiResponse<null> = {
        success: false,
        error: { message: 'No active subscription found', code: 'NO_SUBSCRIPTION' },
      };
      res.status(403).json(response);
      return;
    }

    if (subscription.status !== 'active') {
      const response: ApiResponse<null> = {
        success: false,
        error: { message: 'Subscription not active', code: 'SUBSCRIPTION_INACTIVE' },
      };
      res.status(403).json(response);
      return;
    }

    next();
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: { message: 'Subscription check failed', code: 'SUBSCRIPTION_CHECK_ERROR' },
    };
    res.status(500).json(response);
    return;
  }
}
