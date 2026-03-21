import api from '../lib/axios';

export const getMyWinnings = async () => {
  const res = await api.get('/winners/me');
  return res.data.data;
};

export const uploadProof = async (
  winningId: string,
  file: File
): Promise<void> => {
  const formData = new FormData();
  formData.append('proof', file);
  await api.post(`/winners/${winningId}/upload-proof`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};
