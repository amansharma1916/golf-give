import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import { Link } from 'react-router-dom';
import { PageHeader } from '../../../components/layout';
import { Tabs, Badge, Modal, Button } from '../../../components/ui';
import { useDraws } from '../../../hooks/useDraws';
import { useScores } from '../../../hooks/useScores';
import { useWinnings } from '../../../hooks/useWinnings';
import { pageVariants } from '../../../lib/animations';
import { ROUTES } from '../../../lib/constants';
import { formatCurrency, formatMonth, cn } from '../../../lib/utils';
import styles from './DrawsPage.module.css';

type DrawResult = {
  id: string;
  month: string;
  drawType: 'random' | 'algorithmic';
  winningNumbers: number[];
  totalPool: number;
  activeMembers: number;
  rolledOverAmount: number;
  myEntry: {
    scoreSnapshot: number[];
    matchCount: number;
    isWinner: boolean;
    prizeAmount: number | null;
    payoutStatus: 'pending' | 'verified' | 'paid' | null;
  };
  winners: {
    fiveMatch: number;
    fourMatch: number;
    threeMatch: number;
  };
};

const DiceIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
    <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="1.5" />
    <circle cx="7.5" cy="7.5" r="1" fill="currentColor" />
    <circle cx="12" cy="12" r="1" fill="currentColor" />
    <circle cx="16.5" cy="16.5" r="1" fill="currentColor" />
    <circle cx="7.5" cy="16.5" r="1" fill="currentColor" />
    <circle cx="16.5" cy="7.5" r="1" fill="currentColor" />
  </svg>
);

const ChartIcon = () => (
  <svg viewBox="0 0 24 24" width="24" height="24" fill="none" aria-hidden="true">
    <path d="M3 3v18h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    <path d="M7 16v-4M12 16v-7M17 16v-2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const CountdownTimer = () => {
  const [countdown, setCountdown] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateCountdown = () => {
      const targetDate = new Date('2026-04-30T23:59:59').getTime();
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference > 0) {
        setCountdown({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      }
    };

    calculateCountdown();
    const interval = setInterval(calculateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const units = [
    { label: 'Days', value: countdown.days },
    { label: 'Hours', value: countdown.hours },
    { label: 'Minutes', value: countdown.minutes },
    { label: 'Seconds', value: countdown.seconds },
  ];

  return (
    <div className={styles.heroCountdown}>
      {units.map((unit, index) => (
        <div key={unit.label}>
          <motion.div className={styles.heroCountUnit} key={`${unit.label}-${Math.floor(countdown.seconds / 10)}`}>
            <motion.div className={styles.heroCountNumber} key={unit.value}>
              {String(unit.value).padStart(2, '0')}
            </motion.div>
            <div className={styles.heroCountLabel}>{unit.label}</div>
          </motion.div>
          {index < units.length - 1 && <div className={styles.heroSeparator}>:</div>}
        </div>
      ))}
    </div>
  );
};

const UpcomingDrawSection = ({ userScores }: { userScores: number[] }) => {
  const poolAmount = 34180;
  const activeMembers = 3420;

  const tiers = [
    { label: '5 match', amount: Math.round(poolAmount * 0.4), color: '#E94560' },
    { label: '4 match', amount: Math.round(poolAmount * 0.35), color: '#7F77DD' },
    { label: '3 match', amount: Math.round(poolAmount * 0.25), color: '#1D9E75' },
  ];

  return (
    <div>
      <motion.div className={styles.upcomingHero} variants={pageVariants}>
        <div className={styles.heroTopRow}>
          <div>
            <div className={styles.heroLabel}>Next draw</div>
            <h3 className={styles.heroTitle}>April 2026</h3>
          </div>
          <div className={styles.drawBadge}>#19</div>
        </div>

        <CountdownTimer />

        <div className={styles.heroDivider} />

        <div className={styles.heroBottom}>
          <div>
            <div className={styles.heroPoolLabel}>Current prize pool</div>
            <div className={styles.heroPoolAmount}>{formatCurrency(poolAmount * 100)}</div>
            <div className={styles.heroPoolMembers}>Based on {activeMembers.toLocaleString()} active members</div>
            <div className={styles.heroTierRows}>
              {tiers.map((tier) => (
                <div key={tier.label} className={styles.heroTierRow}>
                  <div className={styles.heroTierDot} style={{ background: tier.color }} />
                  <span className={styles.heroTierText}>{tier.label}</span>
                  <span className={styles.heroTierAmount}>{formatCurrency(tier.amount * 100)}</span>
                </div>
              ))}
            </div>
          </div>

          <div>
            {userScores.length === 5 ? (
              <div>
                <div style={{ marginBottom: 'var(--space-4)' }}>
                  <Badge variant="success" size="sm">
                    Fully entered
                  </Badge>
                </div>
                <div className={styles.myEntryLabel}>Your 5 draw numbers:</div>
                <div className={styles.myNumberPills}>
                  {userScores.map((score, index) => (
                    <motion.div
                      key={`${score}-${index}`}
                      className={styles.myNumberPill}
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{
                        type: 'spring',
                        stiffness: 300,
                        damping: 20,
                        delay: index * 0.08,
                      }}
                    >
                      {score}
                    </motion.div>
                  ))}
                </div>
                <div className={styles.myNumberNote}>
                  These numbers will be compared against the draw on 30 April 2026.
                </div>
              </div>
            ) : (
              <div>
                <div className={styles.myEntryWarning}>
                  You have {userScores.length}/5 scores entered.
                  <br />
                  Add more scores to maximise your draw entry.
                  <br />
                  <Link to={ROUTES.SCORES} className={styles.myEntryLink}>
                    Add scores →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      <motion.div className={styles.drawTypeCards} variants={pageVariants}>
        <div className={styles.drawTypeCard}>
          <div className={styles.drawTypeIcon}>
            <DiceIcon />
          </div>
          <div>
            <h4 className={styles.drawTypeTitle}>Random draw</h4>
            <p className={styles.drawTypeDesc}>
              5 numbers between 1 and 45 are selected using a cryptographically secure random number generator.
            </p>
          </div>
        </div>

        <div className={styles.drawTypeCard}>
          <div className={styles.drawTypeIcon}>
            <ChartIcon />
          </div>
          <div>
            <h4 className={styles.drawTypeTitle}>Algorithmic draw</h4>
            <p className={styles.drawTypeDesc}>
              Numbers are weighted based on score frequency across all members. More common scores have higher probability.
            </p>
          </div>
        </div>
      </motion.div>

      <motion.div className={styles.drawTypeNote} variants={pageVariants}>
        The draw type for April 2026 will be announced on the day of the draw.
      </motion.div>
    </div>
  );
};

const DrawDetailPanel = ({
  draw,
  isRevealPlaying,
  revealedNumbers,
  showMyNumbers,
  onReplayReveal,
}: {
  draw: DrawResult;
  isRevealPlaying: boolean;
  revealedNumbers: number[];
  showMyNumbers: boolean;
  onReplayReveal: () => void;
}) => {
  const poolAmountByTier = {
    fiveMatch: Math.round(draw.totalPool * 0.4),
    fourMatch: Math.round(draw.totalPool * 0.35),
    threeMatch: Math.round(draw.totalPool * 0.25),
  };

  return (
    <div className={styles.detailPanel}>
      <div className={styles.detailHeader}>
        <h3 className={styles.detailTitle}>{formatMonth(draw.month)}</h3>
        <div className={styles.detailMeta}>
          <span>Draw #{draw.id.includes('march') ? '17' : draw.id.includes('feb') ? '16' : draw.id.includes('jan') ? '15' : '14'}</span>
          <Badge variant={draw.drawType === 'random' ? 'neutral' : 'info'} size="sm">
            {draw.drawType === 'random' ? 'Random' : 'Algorithmic'}
          </Badge>
          <span>{draw.activeMembers.toLocaleString()} members entered</span>
        </div>
      </div>

      {draw.myEntry.isWinner && (
        <motion.div className={styles.winnerBanner} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ type: 'spring', stiffness: 200, damping: 20 }}>
          <div className={styles.winnerBannerLeft}>
            <div style={{ fontSize: '24px' }}>🏆</div>
            <div>
              <div className={styles.winnerBannerTitle}>You won this draw!</div>
              <div className={styles.winnerBannerSub}>{draw.myEntry.matchCount} numbers matched</div>
            </div>
          </div>
          <div className={styles.winnerBannerRight}>
            <div className={styles.winnerPrize}>{formatCurrency((draw.myEntry.prizeAmount ?? 0) * 100)}</div>
            <Badge variant={draw.myEntry.payoutStatus === 'paid' ? 'success' : 'warning'} size="sm">
              {draw.myEntry.payoutStatus === 'paid' ? 'Paid' : 'Pending'}
            </Badge>
          </div>
        </motion.div>
      )}

      <div className={styles.numbersSection}>
        <div className={styles.numbersSectionTitle}>
          <span>Winning numbers</span>
          <button className={styles.replayBtn} onClick={onReplayReveal} disabled={isRevealPlaying}>
            <motion.span whileHover={{ rotate: -20 }}>↺</motion.span> Replay
          </button>
        </div>

        <div className={styles.revealBalls}>
          <AnimatePresence>
            {draw.winningNumbers.map((num, index) => (
              <div key={`${draw.id}-placeholder-${index}`}>
                {index < revealedNumbers.length ? (
                  <motion.div
                    key={`${draw.id}-${num}-${index}`}
                    className={cn(styles.revealBall, styles.revealBallActive)}
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: 'spring',
                      stiffness: 260,
                      damping: 20,
                    }}
                  >
                    {num}
                  </motion.div>
                ) : (
                  <motion.div
                    key={`${draw.id}-placeholder-${index}`}
                    className={cn(styles.revealBall, styles.revealBallPlaceholder)}
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                    }}
                  />
                )}
              </div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {showMyNumbers && (
        <motion.div className={styles.myNumbersSection} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className={styles.myNumbersHeader}>
            <h4 className={styles.myNumbersTitle}>Your numbers</h4>
            <Badge
              variant={
                draw.myEntry.matchCount === 5
                  ? 'success'
                  : draw.myEntry.matchCount >= 3
                  ? 'success'
                  : draw.myEntry.matchCount >= 1
                  ? 'neutral'
                  : 'neutral'
              }
              size="sm"
            >
              {draw.myEntry.matchCount === 5
                ? '5 matched — Jackpot!'
                : draw.myEntry.matchCount === 4
                ? '4 matched — Major prize'
                : draw.myEntry.matchCount === 3
                ? '3 matched — Prize winner'
                : draw.myEntry.matchCount === 2
                ? '2 matched'
                : draw.myEntry.matchCount === 1
                ? '1 matched'
                : 'No match this draw'}
            </Badge>
          </div>

          <div className={styles.myBalls}>
            {draw.myEntry.scoreSnapshot.map((score, index) => {
              const isMatch = draw.winningNumbers.includes(score);
              return (
                <motion.div
                  key={`${draw.id}-my-${score}-${index}`}
                  className={cn(styles.myBall, isMatch ? styles.myBallMatch : styles.myBallDefault)}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    type: 'spring',
                    stiffness: 260,
                    damping: 20,
                    delay: revealedNumbers.length * 0.6 + 0.4 + index * 0.08,
                  }}
                >
                  {score}
                  {isMatch && <div className={styles.matchCheckmark}>✓</div>}
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      <div className={styles.prizeBreakdown}>
        <h4 className={styles.breakdownTitle}>Prize pool breakdown</h4>
        <div className={styles.breakdownTotal}>
          <div className={styles.breakdownAmount}>{formatCurrency(draw.totalPool * 100)}</div>
          <div className={styles.breakdownLabel}>Total prize pool</div>
        </div>

        <div className={styles.tierRows}>
          {[
            { label: '5-match (Jackpot)', key: 'fiveMatch', amount: poolAmountByTier.fiveMatch, winners: draw.winners.fiveMatch, color: '#E94560' },
            { label: '4-match', key: 'fourMatch', amount: poolAmountByTier.fourMatch, winners: draw.winners.fourMatch, color: '#7F77DD' },
            { label: '3-match', key: 'threeMatch', amount: poolAmountByTier.threeMatch, winners: draw.winners.threeMatch, color: '#1D9E75' },
          ].map(({ label, key, amount, winners, color }) => (
            <div key={key} className={styles.tierRow}>
              <div className={styles.tierMeta}>
                <div className={styles.tierLabel}>
                  <div className={styles.tierDot} style={{ background: color }} />
                  {label}
                </div>
                <div className={styles.tierWinners}>({winners} winners)</div>
              </div>
              <div className={styles.tierBarTrack}>
                <motion.div
                  className={styles.tierBarFill}
                  style={{ background: color, width: '0%' }}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  key={draw.id}
                />
              </div>
              <div className={styles.tierAmount}>{formatCurrency(amount * 100)}</div>
            </div>
          ))}
        </div>

        {draw.rolledOverAmount > 0 && (
          <div className={styles.rolloverNote}>
            Includes {formatCurrency(draw.rolledOverAmount * 100)} jackpot rollover from previous month
          </div>
        )}
      </div>

      {draw.myEntry.isWinner && draw.myEntry.payoutStatus === 'pending' && (
        <div className={styles.claimCard}>
          <div className={styles.claimText}>Upload proof to claim your prize</div>
          <Link to={ROUTES.WINNINGS}>
            <Button variant="primary" size="sm">
              Upload proof
            </Button>
          </Link>
        </div>
      )}

      {draw.myEntry.isWinner && draw.myEntry.payoutStatus === 'paid' && (
        <div style={{ marginTop: 'var(--space-6)', fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
          Prize of {formatCurrency((draw.myEntry.prizeAmount ?? 0) * 100)} was paid out —{' '}
          <Link to={ROUTES.WINNINGS} style={{ color: 'var(--color-accent)' }}>
            view in your winnings history →
          </Link>
        </div>
      )}
    </div>
  );
};

const PastResultsSection = ({ draws }: { draws: DrawResult[] }) => {
  const [selectedDraw, setSelectedDraw] = useState<DrawResult | null>(null);
  const [mobileDetailOpen, setMobileDetailOpen] = useState(false);
  const [isRevealPlaying, setIsRevealPlaying] = useState(false);
  const [revealedNumbers, setRevealedNumbers] = useState<number[]>([]);
  const [showMyNumbers, setShowMyNumbers] = useState(false);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const revealTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const runReveal = (draw: DrawResult) => {
    if (timelineRef.current) {
      timelineRef.current.kill();
    }
    if (revealTimeoutRef.current) {
      clearTimeout(revealTimeoutRef.current);
      revealTimeoutRef.current = null;
    }

    setRevealedNumbers([]);
    setShowMyNumbers(false);
    setIsRevealPlaying(true);

    const tl = gsap.timeline();
    timelineRef.current = tl;

    draw.winningNumbers.forEach((num, i) => {
      tl.call(
        () => {
          setRevealedNumbers((prev) => [...prev, num]);
        },
        [],
        i * 0.6
      );
    });

    tl.call(
      () => {
        setIsRevealPlaying(false);
        revealTimeoutRef.current = setTimeout(() => {
          setShowMyNumbers(true);
        }, 400);
      },
      [],
      draw.winningNumbers.length * 0.6
    );
  };

  useEffect(() => {
    setSelectedDraw(draws[0] ?? null);
  }, [draws]);

  useEffect(() => {
    if (!selectedDraw) return;

    runReveal(selectedDraw);

    return () => {
      if (timelineRef.current) {
        timelineRef.current.kill();
      }
      if (revealTimeoutRef.current) {
        clearTimeout(revealTimeoutRef.current);
        revealTimeoutRef.current = null;
      }
    };
  }, [selectedDraw?.id]);

  const handleReplayReveal = () => {
    if (!selectedDraw) return;

    runReveal(selectedDraw);
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth < 900);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 900);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <div>
      <div className={styles.resultsLayout}>
        <div className={styles.resultsListCol}>
          <div className={styles.resultsList}>
            {draws.map((draw: DrawResult) => (
              <motion.div
                key={draw.id}
                className={cn(styles.resultsListItem, selectedDraw?.id === draw.id && styles.resultsListItemSelected, selectedDraw?.id !== draw.id && styles.resultsListItemUnselected)}
                onClick={() => {
                  setSelectedDraw(draw);
                  if (isMobile) {
                    setMobileDetailOpen(true);
                  }
                }}
                whileHover={{ x: 3 }}
              >
                <div className={styles.listItemTop}>
                  <div className={styles.listItemMonth}>{formatMonth(draw.month)}</div>
                  <Badge
                    variant={draw.myEntry.isWinner ? 'success' : draw.myEntry.matchCount >= 2 ? 'neutral' : 'neutral'}
                    size="sm"
                  >
                    {draw.myEntry.isWinner ? 'Won' : draw.myEntry.matchCount >= 2 ? `${draw.myEntry.matchCount} matched` : 'No match'}
                  </Badge>
                </div>

                <div className={styles.listItemMiniNumbers}>
                  {draw.winningNumbers.map((num: number) => (
                    <div
                      key={`${draw.id}-mini-${num}`}
                      className={cn(styles.miniPill, draw.myEntry.scoreSnapshot.includes(num) ? styles.miniPillMatch : styles.miniPillDefault)}
                    >
                      {num}
                    </div>
                  ))}
                </div>

                <div className={styles.listItemBottom}>
                  {draw.myEntry.isWinner && (
                    <div className={styles.listItemPrize}>{formatCurrency((draw.myEntry.prizeAmount ?? 0) * 100)}</div>
                  )}
                  <div className={styles.listItemDrawType}>{draw.drawType === 'random' ? 'Random' : 'Algorithmic'}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {!isMobile && (
          <div className={styles.detailCol}>
            {selectedDraw ? (
              <DrawDetailPanel
                draw={selectedDraw}
                isRevealPlaying={isRevealPlaying}
                revealedNumbers={revealedNumbers}
                showMyNumbers={showMyNumbers}
                onReplayReveal={handleReplayReveal}
              />
            ) : (
              <div className={styles.detailPanel}>
                <p style={{ color: 'var(--color-text-muted)' }}>Select a draw from the list to see the full results.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {isMobile && selectedDraw && (
        <Modal
          isOpen={mobileDetailOpen}
          onClose={() => {
            setMobileDetailOpen(false);
            setSelectedDraw(null);
          }}
          title={`${formatMonth(selectedDraw.month)} Draw Results`}
          size="lg"
        >
          <DrawDetailPanel
            draw={selectedDraw}
            isRevealPlaying={isRevealPlaying}
            revealedNumbers={revealedNumbers}
            showMyNumbers={showMyNumbers}
            onReplayReveal={handleReplayReveal}
          />
        </Modal>
      )}
    </div>
  );
};

export const DrawsPage = () => {
  const { data: draws = [] } = useDraws();
  const { data: scores = [] } = useScores();
  const { data: winnings = [] } = useWinnings();
  const [activeTab, setActiveTab] = useState<'upcoming' | 'results'>('upcoming');

  const myScores = scores.slice(0, 5).map((score) => score.score);

  const normalizedDraws: DrawResult[] = draws.map(
    (draw: {
      id: string;
      month: string;
      drawType: 'random' | 'algorithmic';
      winningNumbers: number[];
      jackpotAmount: number;
      rolledOverAmount: number;
    }) => {
      const matchCount = draw.winningNumbers.filter((num) => myScores.includes(num)).length;
      const winningRecord = winnings.find((entry: { drawMonth?: string }) => entry.drawMonth === draw.month);

      return {
        id: draw.id,
        month: draw.month,
        drawType: draw.drawType,
        winningNumbers: draw.winningNumbers,
        totalPool: draw.jackpotAmount + draw.rolledOverAmount,
        activeMembers: 0,
        rolledOverAmount: draw.rolledOverAmount,
        winners: {
          fiveMatch: 0,
          fourMatch: 0,
          threeMatch: 0,
        },
        myEntry: {
          scoreSnapshot: myScores,
          matchCount,
          isWinner: matchCount >= 3,
          prizeAmount: winningRecord?.amount ?? null,
          payoutStatus: winningRecord?.status ?? null,
        },
      };
    },
  );

  return (
    <>
      <PageHeader
        title="Draw results"
        subtitle="Monthly prize draws based on your Stableford scores. Match 3, 4, or 5 numbers to win."
      />

      <Tabs
        tabs={[
          { id: 'upcoming', label: 'Upcoming draw' },
          { id: 'results', label: 'Past results', count: normalizedDraws.length },
        ]}
        activeTab={activeTab}
        onChange={(tab) => setActiveTab(tab as 'upcoming' | 'results')}
      />

      <AnimatePresence mode="wait">
        {activeTab === 'upcoming' ? (
          <motion.div key="upcoming" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <UpcomingDrawSection userScores={myScores} />
          </motion.div>
        ) : (
          <motion.div key="results" variants={pageVariants} initial="initial" animate="animate" exit="exit">
            <PastResultsSection draws={normalizedDraws} />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
