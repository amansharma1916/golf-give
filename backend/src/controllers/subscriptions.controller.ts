import { Request, Response } from 'express';
import {
  getSubscription,
  mockCheckout,
  mockCancel,
} from '../services/subscriptions.service';
import { checkoutSchema } from '../validators/subscriptions.validators';
import { ApiResponse, Subscription } from '../types';

export async function getStatus(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      const response: ApiResponse<null> = {
        success: false,
        error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' },
      };
      res.status(401).json(response);
      return;
    }

    const subscription = await getSubscription(req.user.id);

    const response: ApiResponse<Subscription> = {
      success: true,
      data: subscription,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get subscription';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(500).json(response);
  }
}

export async function checkout(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      const response: ApiResponse<null> = {
        success: false,
        error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' },
      };
      res.status(401).json(response);
      return;
    }

    const validatedData = checkoutSchema.parse(req.body);
    const subscription = await mockCheckout(req.user.id, validatedData.plan);

    const response: ApiResponse<Subscription> = {
      success: true,
      data: subscription,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Checkout failed';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(400).json(response);
  }
}

export async function cancel(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      const response: ApiResponse<null> = {
        success: false,
        error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' },
      };
      res.status(401).json(response);
      return;
    }

    await mockCancel(req.user.id);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: 'Subscription cancelled' },
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Cancellation failed';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(400).json(response);
  }
}

export async function webhookStripe(_req: Request, res: Response): Promise<void> {
  const response: ApiResponse<{ received: boolean }> = {
    success: true,
    data: { received: true },
  };
  res.json(response);
}
