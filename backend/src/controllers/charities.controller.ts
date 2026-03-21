import { Request, Response } from 'express';
import {
  listCharities,
  getFeaturedCharities,
  getCharity,
  createCharity,
  updateCharity,
  deleteCharity,
  updateUserCharityPreference,
} from '../services/charities.service';
import { createCharitySchema, updateCharitySchema } from '../validators/charities.validators';
import { ApiResponse, Charity } from '../types';

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const { search, category } = req.query;
    const charities = await listCharities(search as string, category as string);

    const response: ApiResponse<Charity[]> = {
      success: true,
      data: charities,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch charities';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(500).json(response);
  }
}

export async function featured(_req: Request, res: Response): Promise<void> {
  try {
    const charities = await getFeaturedCharities();

    const response: ApiResponse<Charity[]> = {
      success: true,
      data: charities,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch featured charities';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(500).json(response);
  }
}

export async function get(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const charity = await getCharity(id);

    const response: ApiResponse<Charity> = {
      success: true,
      data: charity,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Charity not found';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(404).json(response);
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = createCharitySchema.parse(req.body);
    const charity = await createCharity(validatedData);

    const response: ApiResponse<Charity> = {
      success: true,
      data: charity,
    };
    res.status(201).json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create charity';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(400).json(response);
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = updateCharitySchema.parse(req.body);
    const { id } = req.params;
    const charity = await updateCharity(id, validatedData);

    const response: ApiResponse<Charity> = {
      success: true,
      data: charity,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update charity';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(400).json(response);
  }
}

export async function remove(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    await deleteCharity(id);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: 'Charity deleted' },
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete charity';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(400).json(response);
  }
}

export async function updateMyCharity(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user?.id) {
      const response: ApiResponse<null> = {
        success: false,
        error: { message: 'User not authenticated', code: 'UNAUTHENTICATED' },
      };
      res.status(401).json(response);
      return;
    }

    const { charityId, contributionPercentage } = req.body as {
      charityId: string;
      contributionPercentage: number;
    };

    await updateUserCharityPreference(req.user.id, charityId, contributionPercentage);

    const response: ApiResponse<{ message: string }> = {
      success: true,
      data: { message: 'Charity preference updated' },
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update charity preference';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(400).json(response);
  }
}
