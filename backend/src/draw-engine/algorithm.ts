import { DRAW_WINNING_NUMBERS_COUNT, STABLEFORD_MAX, STABLEFORD_MIN } from '../lib/constants';
import { generateRandomNumbers } from './random';

export type AlgorithmicWeightMode = 'most_frequent' | 'least_frequent';

export function generateAlgorithmicNumbers(
  scoreSnapshots: ReadonlyArray<ReadonlyArray<number>>,
  mode: AlgorithmicWeightMode = 'most_frequent'
): number[] {
  if (scoreSnapshots.length === 0) {
    return generateRandomNumbers();
  }

  const frequencies = new Map<number, number>();

  for (let number = STABLEFORD_MIN; number <= STABLEFORD_MAX; number += 1) {
    frequencies.set(number, 0);
  }

  for (const snapshot of scoreSnapshots) {
    for (const score of snapshot) {
      if (score >= STABLEFORD_MIN && score <= STABLEFORD_MAX) {
        frequencies.set(score, (frequencies.get(score) || 0) + 1);
      }
    }
  }

  const entries = Array.from(frequencies.entries());
  const weightedEntries = entries.map(([number, frequency]) => {
    const weight = mode === 'most_frequent' ? frequency + 1 : 1 / (frequency + 1);
    return { number, weight };
  });

  const selectedNumbers = new Set<number>();

  while (selectedNumbers.size < DRAW_WINNING_NUMBERS_COUNT) {
    const candidatePool = weightedEntries.filter((entry) => !selectedNumbers.has(entry.number));
    const totalWeight = candidatePool.reduce((sum, entry) => sum + entry.weight, 0);

    if (totalWeight <= 0) {
      break;
    }

    const picked = Math.random() * totalWeight;
    let running = 0;

    for (const entry of candidatePool) {
      running += entry.weight;
      if (picked <= running) {
        selectedNumbers.add(entry.number);
        break;
      }
    }
  }

  if (selectedNumbers.size < DRAW_WINNING_NUMBERS_COUNT) {
    return generateRandomNumbers();
  }

  return Array.from(selectedNumbers).sort((a, b) => a - b);
}
