import { describe, expect, it } from 'vitest';
import { generateAlgorithmicNumbers } from '../../../src/draw-engine/algorithm';

function countMatches(numbers: number[], values: Set<number>): number {
  return numbers.reduce((count, number) => (values.has(number) ? count + 1 : count), 0);
}

describe('generateAlgorithmicNumbers', () => {
  it('returns 5 unique values in stableford range', () => {
    const snapshots = [
      [4, 8, 12, 16, 20],
      [8, 12, 16, 20, 24],
      [12, 16, 20, 24, 28],
    ];

    const numbers = generateAlgorithmicNumbers(snapshots, 'most_frequent');

    expect(numbers).toHaveLength(5);
    expect(new Set(numbers).size).toBe(5);
    for (const number of numbers) {
      expect(number).toBeGreaterThanOrEqual(1);
      expect(number).toBeLessThanOrEqual(45);
    }
  });

  it('falls back to valid output when no snapshots are provided', () => {
    const numbers = generateAlgorithmicNumbers([], 'most_frequent');

    expect(numbers).toHaveLength(5);
    expect(new Set(numbers).size).toBe(5);
  });

  it('biases toward frequent numbers in most_frequent mode', () => {
    const highFrequency = [11, 22, 33, 44, 5];
    const lowFrequency = [2, 3, 4, 6, 7];
    const snapshots = [
      ...Array.from({ length: 100 }, () => highFrequency),
      ...Array.from({ length: 5 }, () => lowFrequency),
    ];

    const iterations = 400;
    let highHits = 0;
    let lowHits = 0;
    for (let index = 0; index < iterations; index += 1) {
      const numbers = generateAlgorithmicNumbers(snapshots, 'most_frequent');
      highHits += countMatches(numbers, new Set(highFrequency));
      lowHits += countMatches(numbers, new Set(lowFrequency));
    }

    expect(highHits).toBeGreaterThan(lowHits);
  });

  it('biases toward rare numbers in least_frequent mode', () => {
    const highFrequency = [9, 10, 11, 12, 13];
    const lowFrequency = [31, 32, 33, 34, 35];
    const snapshots = [
      ...Array.from({ length: 120 }, () => highFrequency),
      ...Array.from({ length: 3 }, () => lowFrequency),
    ];

    const iterations = 400;
    let highHits = 0;
    let lowHits = 0;
    for (let index = 0; index < iterations; index += 1) {
      const numbers = generateAlgorithmicNumbers(snapshots, 'least_frequent');
      highHits += countMatches(numbers, new Set(highFrequency));
      lowHits += countMatches(numbers, new Set(lowFrequency));
    }

    expect(lowHits).toBeGreaterThan(highHits);
  });
});
