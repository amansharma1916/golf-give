import { PRIZE_POOL_CONFIG } from '../lib/constants';

export interface PrizeCalculation {
  five_match: {
    percentage: number;
    pool: number;
    prizePerWinner: number;
    winners: number;
  };
  four_match: {
    percentage: number;
    pool: number;
    prizePerWinner: number;
    winners: number;
  };
  three_match: {
    percentage: number;
    pool: number;
    prizePerWinner: number;
    winners: number;
  };
  totalPool: number;
}

export function calculatePrizePool(
  subscriberCount: number,
  subscriptionAmount: number,
  fiveMatchWinners: number,
  fourMatchWinners: number,
  threeMatchWinners: number
): PrizeCalculation {
  const totalPool = subscriberCount * subscriptionAmount;

  const fiveMatchPool = (totalPool * PRIZE_POOL_CONFIG.five_match) / 100;
  const fourMatchPool = (totalPool * PRIZE_POOL_CONFIG.four_match) / 100;
  const threeMatchPool = (totalPool * PRIZE_POOL_CONFIG.three_match) / 100;

  return {
    five_match: {
      percentage: PRIZE_POOL_CONFIG.five_match,
      pool: fiveMatchPool,
      prizePerWinner: fiveMatchWinners > 0 ? fiveMatchPool / fiveMatchWinners : 0,
      winners: fiveMatchWinners,
    },
    four_match: {
      percentage: PRIZE_POOL_CONFIG.four_match,
      pool: fourMatchPool,
      prizePerWinner: fourMatchWinners > 0 ? fourMatchPool / fourMatchWinners : 0,
      winners: fourMatchWinners,
    },
    three_match: {
      percentage: PRIZE_POOL_CONFIG.three_match,
      pool: threeMatchPool,
      prizePerWinner: threeMatchWinners > 0 ? threeMatchPool / threeMatchWinners : 0,
      winners: threeMatchWinners,
    },
    totalPool,
  };
}
