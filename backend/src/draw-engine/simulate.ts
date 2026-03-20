import { generateRandomNumbers } from './random';
import { generateAlgorithmicNumbers } from './algorithm';

export interface SimulateDrawResult {
  winningNumbers: number[];
  matchCounts: Record<number, number>;
}

export function simulateDraw(drawType: 'random' | 'algorithmic'): SimulateDrawResult {
  const winningNumbers =
    drawType === 'random' ? generateRandomNumbers() : generateAlgorithmicNumbers();

  // Calculate sample matches (in real implementation, would query scores)
  const matchCounts = {
    five_match: 0,
    four_match: 0,
    three_match: 0,
  };

  return {
    winningNumbers,
    matchCounts,
  };
}
