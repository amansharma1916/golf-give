import { Request, Response } from 'express';
import {
  getUserPayouts,
  uploadProof,
  getAllPayouts,
  verifyProof,
  markPaid,
} from '../services/winners.service';
import { uploadProofSchema, verifyProofSchema } from '../validators/winners.validators';
import { ApiResponse, Payout } from '../types';

export async function me(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      const response: ApiResponse<null> = {
        success: false,
        error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' },
      };
      res.status(401).json(response);
      return;
    }

    const payouts = await getUserPayouts(req.user.id);

    const response: ApiResponse<Payout[]> = {
      success: true,
      data: payouts,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get payouts';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(500).json(response);
  }
}

export async function proof(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      const response: ApiResponse<null> = {
        success: false,
        error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' },
      };
      res.status(401).json(response);
      return;
    }

    const validatedData = uploadProofSchema.parse(req.body);
    const { id } = req.params;
    const payout = await uploadProof(id, req.user.id, validatedData.proofUrl);

    const response: ApiResponse<Payout> = {
      success: true,
      data: payout,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to upload proof';
    const statusCode = message.includes('unauthorized') ? 403 : 400;
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(statusCode).json(response);
  }
}

export async function all(_req: Request, res: Response): Promise<void> {
  try {
    const payouts = await getAllPayouts();

    const response: ApiResponse<Payout[]> = {
      success: true,
      data: payouts,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get payouts';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(500).json(response);
  }
}

export async function verify(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = verifyProofSchema.parse(req.body);
    const { id } = req.params;
    const payout = await verifyProof(id, validatedData.approved, validatedData.adminNote);

    const response: ApiResponse<Payout> = {
      success: true,
      data: payout,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to verify proof';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(400).json(response);
  }
}

export async function paid(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const payout = await markPaid(id);

    const response: ApiResponse<Payout> = {
      success: true,
      data: payout,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to mark as paid';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(400).json(response);
  }
}
