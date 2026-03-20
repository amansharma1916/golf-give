import { Request, Response } from 'express';
import {
  getUserScores,
  addScore,
  updateScore,
  deleteScore,
} from '../services/scores.service';
import { addScoreSchema, updateScoreSchema } from '../validators/scores.validators';
import { ApiResponse, Score } from '../types';

export async function getScores(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      const response: ApiResponse<null> = {
        success: false,
        error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' },
      };
      res.status(401).json(response);
      return;
    }

    const scores = await getUserScores(req.user.id);

    const response: ApiResponse<Score[]> = {
      success: true,
      data: scores,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get scores';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(500).json(response);
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      const response: ApiResponse<null> = {
        success: false,
        error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' },
      };
      res.status(401).json(response);
      return;
    }

    const validatedData = addScoreSchema.parse(req.body);
    const score = await addScore(req.user.id, validatedData.score, validatedData.playedAt);

    const response: ApiResponse<Score> = {
      success: true,
      data: score,
    };
    res.status(201).json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add score';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(400).json(response);
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      const response: ApiResponse<null> = {
        success: false,
        error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' },
      };
      res.status(401).json(response);
      return;
    }

    const validatedData = updateScoreSchema.parse(req.body);
    const { id } = req.params;
    const score = await updateScore(
      req.user.id,
      id,
      validatedData.score,
      validatedData.playedAt
    );

    const response: ApiResponse<Score> = {
      success: true,
      data: score,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update score';
    const statusCode = message.includes('unauthorized') ? 403 : 400;
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(statusCode).json(response);
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      const response: ApiResponse<null> = {
        success: false,
        error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' },
      };
      res.status(401).json(response);
      return;
    }

    const { id } = req.params;
    await deleteScore(req.user.id, id);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: 'Score deleted' },
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete score';
    const statusCode = message.includes('unauthorized') ? 403 : 400;
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(statusCode).json(response);
  }
}
