import { describe, expect, it } from 'vitest';
import { calculatePrizePool } from '../../../src/draw-engine/prize';

describe('calculatePrizePool', () => {
  it('splits pool using 40/35/25 percentages', () => {
    const result = calculatePrizePool(100, 10, 1, 1, 1);

    expect(result.totalPool).toBe(1000);
    expect(result.five_match.pool).toBe(400);
    expect(result.four_match.pool).toBe(350);
    expect(result.three_match.pool).toBe(250);
  });

  it('splits prize equally within each tier', () => {
    const result = calculatePrizePool(50, 10, 2, 5, 10);

    expect(result.five_match.prizePerWinner).toBe(100);
    expect(result.four_match.prizePerWinner).toBe(35);
    expect(result.three_match.prizePerWinner).toBe(12.5);
  });

  it('returns zero prize per winner when a tier has no winners', () => {
    const result = calculatePrizePool(30, 10, 0, 3, 0);

    expect(result.five_match.prizePerWinner).toBe(0);
    expect(result.three_match.prizePerWinner).toBe(0);
    expect(result.four_match.prizePerWinner).toBeGreaterThan(0);
  });
});
