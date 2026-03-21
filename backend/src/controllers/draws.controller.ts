import { Request, Response } from 'express';
import {
  listDraws,
  getUpcomingDraw,
  getDraw,
  simulateDraw_,
  publishDraw,
  configureDraw,
  createDraw,
} from '../services/draws.service';
import {
  simulateDrawSchema,
  publishDrawSchema,
  configureDrawSchema,
  createDrawSchema,
} from '../validators/draws.validators';
import { ApiResponse, Draw } from '../types';

export async function list(req: Request, res: Response): Promise<void> {
  try {
    const { status } = req.query;
    const draws = await listDraws(status as string);

    const response: ApiResponse<Draw[]> = {
      success: true,
      data: draws,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch draws';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(500).json(response);
  }
}

export async function upcoming(_req: Request, res: Response): Promise<void> {
  try {
    const draw = await getUpcomingDraw();

    const response: ApiResponse<Draw | null> = {
      success: true,
      data: draw,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch upcoming draw';
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
    const draw = await getDraw(id);

    const response: ApiResponse<Draw> = {
      success: true,
      data: draw,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Draw not found';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(404).json(response);
  }
}

export async function simulate(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = simulateDrawSchema.parse(req.body);
    const result = await simulateDraw_(validatedData.drawType);

    const response: ApiResponse<any> = {
      success: true,
      data: result,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to simulate draw';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(400).json(response);
  }
}

export async function publish(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = publishDrawSchema.parse(req.body);
    const { id } = req.params;
    const draw = await publishDraw(id, validatedData.winningNumbers);

    const response: ApiResponse<Draw> = {
      success: true,
      data: draw,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to publish draw';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(400).json(response);
  }
}

export async function configure(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = configureDrawSchema.parse(req.body);
    const { id } = req.params;
    const draw = await configureDraw(id, validatedData.drawType);

    const response: ApiResponse<Draw> = {
      success: true,
      data: draw,
    };
    res.json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to configure draw';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(400).json(response);
  }
}

export async function create(req: Request, res: Response): Promise<void> {
  try {
    const validatedData = createDrawSchema.parse(req.body);
    const draw = await createDraw(validatedData.month, validatedData.drawType, validatedData.algorithmMode);

    const response: ApiResponse<Draw> = {
      success: true,
      data: draw,
    };
    res.status(201).json(response);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create draw';
    const response: ApiResponse<null> = {
      success: false,
      error: { message },
    };
    res.status(400).json(response);
  }
}
