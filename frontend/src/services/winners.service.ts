import api from '../lib/axios';

const fileToDataUrl = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result;
      if (typeof result !== 'string') {
        reject(new Error('Failed to read proof file'));
        return;
      }
      resolve(result);
    };
    reader.onerror = () => reject(new Error('Failed to read proof file'));
    reader.readAsDataURL(file);
  });

export const getMyWinnings = async () => {
  const res = await api.get('/winners/me');
  return res.data.data;
};

export const uploadProof = async (
  winningId: string,
  file: File
): Promise<void> => {
  const proofUrl = await fileToDataUrl(file);
  await api.post(`/winners/${winningId}/upload-proof`, { proofUrl });
};
