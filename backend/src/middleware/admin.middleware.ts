import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export function adminMiddleware(req: Request, res: Response, next: NextFunction): void {
  if (!req.user || !req.user.is_admin) {
    const response: ApiResponse<null> = {
      success: false,
      error: { message: 'Admin access required', code: 'FORBIDDEN' },
    };
    res.status(403).json(response);
    return;
  }

  next();
}
