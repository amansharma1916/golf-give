import { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { ApiResponse } from '../types';

export function validateMiddleware(schema: ZodSchema) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error: unknown) {
      let message = 'Validation failed';
      if (error instanceof Error) {
        message = error.message;
      }

      const response: ApiResponse<null> = {
        success: false,
        error: { message, code: 'VALIDATION_ERROR' },
      };
      res.status(400).json(response);
    }
  };
}
