import { Request, Response, NextFunction } from 'express';
import { supabase } from '../lib/supabase';
import { ApiResponse } from '../types';

export async function authMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const response: ApiResponse<null> = {
        success: false,
        error: { message: 'Missing or invalid Authorization header', code: 'MISSING_TOKEN' },
      };
      res.status(401).json(response);
      return;
    }

    const token = authHeader.slice(7);

    const { data, error } = await supabase.auth.getUser(token);

    if (error || !data.user) {
      const response: ApiResponse<null> = {
        success: false,
        error: { message: 'Invalid or expired token', code: 'INVALID_TOKEN' },
      };
      res.status(401).json(response);
      return;
    }

    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (userError || !userData) {
      req.user = {
        id: data.user.id,
        email: data.user.email ?? '',
        is_admin: false,
      };
      next();
      return;
    }

    req.user = {
      id: userData.id,
      email: userData.email,
      is_admin: userData.is_admin,
    };

    next();
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      error: { message: 'Authentication failed', code: 'AUTH_ERROR' },
    };
    res.status(500).json(response);
    return;
  }
}
