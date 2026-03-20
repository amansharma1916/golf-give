import { generateRandomNumbers } from './random';

export function generateAlgorithmicNumbers(): number[] {
  // Weighted draw based on score frequency
  // For MVP, fallback to random
  return generateRandomNumbers();
}
