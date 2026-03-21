import api from '../lib/axios';
import type { Score } from '../types';

export const getMyScores = async (): Promise<Score[]> => {
  const res = await api.get('/scores');
  return res.data.data;
};

export const addScore = async (payload: {
  score: number;
  playedAt: string;
}): Promise<Score[]> => {
  const res = await api.post('/scores', payload);
  return res.data.data;
};

export const updateScore = async (
  id: string,
  payload: { score: number; playedAt: string }
): Promise<Score> => {
  const res = await api.put(`/scores/${id}`, payload);
  return res.data.data;
};

export const deleteScore = async (id: string): Promise<void> => {
  await api.delete(`/scores/${id}`);
};
