import api from '../lib/axios';

export const getUpcomingDraw = async () => {
  const res = await api.get('/draws/upcoming');
  return res.data.data;
};

export const getAllDraws = async () => {
  const res = await api.get('/draws');
  return res.data.data;
};

export const getDrawById = async (id: string) => {
  const res = await api.get(`/draws/${id}`);
  return res.data.data;
};
