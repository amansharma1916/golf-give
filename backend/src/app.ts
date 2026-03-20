import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import { env } from './lib/env';
import { errorHandlerMiddleware } from './middleware/errorHandler.middleware';
import { ApiResponse } from './types';
import authRoutes from './routes/auth.routes';
import subscriptionsRoutes from './routes/subscriptions.routes';
import scoresRoutes from './routes/scores.routes';
import charitiesRoutes from './routes/charities.routes';
import drawsRoutes from './routes/draws.routes';
import winnersRoutes from './routes/winners.routes';
import adminRoutes from './routes/admin.routes';

const app: Express = express();

app.use(express.json());
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
  })
);

app.get('/api/health', (_req: Request, res: Response) => {
  const response: ApiResponse<{ status: string }> = {
    success: true,
    data: { status: 'OK' },
  };
  res.json(response);
});

app.use('/api/auth', authRoutes);
app.use('/api/subscriptions', subscriptionsRoutes);
app.use('/api/scores', scoresRoutes);
app.use('/api/charities', charitiesRoutes);
app.use('/api/draws', drawsRoutes);
app.use('/api/winners', winnersRoutes);
app.use('/api/admin', adminRoutes);

app.use(errorHandlerMiddleware);

export default app;
