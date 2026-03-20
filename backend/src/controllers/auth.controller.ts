import { Request, Response } from 'express';
import { registerUser, getMe, signupWithPassword } from '../services/auth.service';
import { registerSchema, signupSchema } from '../validators/auth.validators';
import { ApiResponse } from '../types';

export async function signup(req: Request, res: Response): Promise<void> {
  try {
    const { email, password } = signupSchema.parse(req.body);

    const result = await signupWithPassword(email, password);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };
    res.status(201).json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Signup failed';
    const lowerMessage = message.toLowerCase();
    const statusCode = lowerMessage.includes('already') || lowerMessage.includes('exists') ? 409 : 400;
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(statusCode).json(response);
  }
}

export async function register(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = registerSchema.parse(req.body);
    const email = req.user?.email;
    const userId = req.user?.id;

    if (!userId || !email) {
      const response: ApiResponse<null> = {
        success: false,
        error: { message: 'User identity required', code: 'MISSING_USER_IDENTITY' },
      };
      res.status(400).json(response);
      return;
    }

    const result = await registerUser(
      userId,
      email,
      validatedData.fullName,
      validatedData.charityId,
      validatedData.contributionPercentage
    );

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };
    res.status(201).json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Registration failed';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(400).json(response);
  }
}

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

    const result = await getMe(req.user.id);

    const response: ApiResponse<typeof result> = {
      success: true,
      data: result,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get user data';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(500).json(response);
  }
}
