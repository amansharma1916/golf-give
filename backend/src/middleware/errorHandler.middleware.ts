import { Request, Response, NextFunction } from 'express';
import { ApiResponse } from '../types';

export function errorHandlerMiddleware(
  err: Error | any,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  console.error(`[${new Date().toISOString()}] Error:`, err.message);

  const statusCode = err.statusCode || 500;
  const response: ApiResponse<null> = {
    success: false,
    error: {
      message: err.message || 'Internal server error',
      code: err.code || 'INTERNAL_ERROR',
    },
  };

  res.status(statusCode).json(response);
}
