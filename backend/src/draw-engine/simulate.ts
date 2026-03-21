import { generateRandomNumbers } from './random';
import { AlgorithmicWeightMode, generateAlgorithmicNumbers } from './algorithm';

export interface SimulateDrawResult {
  winningNumbers: number[];
  matchCounts: Record<string, number>;
}

export function simulateDraw(
  drawType: 'random' | 'algorithmic',
  scoreSnapshots: ReadonlyArray<ReadonlyArray<number>> = [],
  mode: AlgorithmicWeightMode = 'most_frequent'
): SimulateDrawResult {
  const winningNumbers =
    drawType === 'random'
      ? generateRandomNumbers()
      : generateAlgorithmicNumbers(scoreSnapshots, mode);

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
