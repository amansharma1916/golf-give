import { Request, Response } from 'express';
import { getAdminUsers, editUser, getAdminReports } from '../services/admin.service';
import { ApiResponse, User } from '../types';

export async function users(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getAdminUsers();

    const response: ApiResponse<typeof data> = {
      success: true,
      data,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get users';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(500).json(response);
  }
}

export async function update(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const user = await editUser(id, req.body);

    const response: ApiResponse<User> = {
      success: true,
      data: user,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(400).json(response);
  }
}

export async function reports(_req: Request, res: Response): Promise<void> {
  try {
    const data = await getAdminReports();

    const response: ApiResponse<typeof data> = {
      success: true,
      data,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get reports';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(500).json(response);
  }
}
