import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { useUserStore } from '../../../stores/userStore';
import { Button, Badge } from '../../../components/ui';
import {
  containerVariants,
  itemVariants,
  slideUpVariants,
} from '../../../lib/animations';
import {
  ROUTES,
} from '../../../lib/constants';
import {
  formatCurrency,
  formatDate,
  formatMonth,
} from '../../../lib/utils';
import {
  MOCK_MEMBER_USER,
  MOCK_SUBSCRIPTION,
  MOCK_SCORES,
  MOCK_CHARITY_CONTRIBUTION,
  MOCK_RECENT_DRAWS,
  MOCK_DASHBOARD_STATS,
} from '../../../lib/mockData';
import styles from './DashboardHomePage.module.css';

gsap.registerPlugin(ScrollTrigger, useGSAP);

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
};

const calculateTimeLeft = (): TimeLeft => {
  const target = new Date('2026-04-30T23:59:59').getTime();
  const now = Date.now();
  const diff = Math.max(0, target - now);

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
  };
};

const getScoreBallColor = (score: number): { bg: string; text: string } => {
  if (score >= 35) return { bg: '#dcfce7', text: '#15803d' };
  if (score >= 25) return { bg: '#dbeafe', text: '#1d4ed8' };
  return { bg: '#fef9c3', text: '#a16207' };
};

const getScoreBadgeVariant = (
  score: number,
): 'success' | 'info' | 'warning' | 'neutral' => {
  if (score >= 35) return 'success';
  if (score >= 28) return 'info';
  if (score >= 20) return 'warning';
  return 'neutral';
};

const getScoreBadgeLabel = (score: number): string => {
  if (score >= 35) return 'Great';
  if (score >= 28) return 'Good';
  if (score >= 20) return 'Fair';
  return 'Low';
};

const DashboardHomeWidget = ({
  children,
}: {
  children: React.ReactNode;
}) => (
  <motion.div variants={itemVariants}>
    {children}
  </motion.div>
);

export const DashboardHomePage = () => {
  const user = useUserStore((state) => state.user) || MOCK_MEMBER_USER;
  const subscription =
    useUserStore((state) => state.subscription) || MOCK_SUBSCRIPTION;

  const [timeLeft, setTimeLeft] = useState<TimeLeft>(calculateTimeLeft());
  const secondsRef = useRef<HTMLSpanElement>(null);
  const poolCountRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      if (secondsRef.current) {
        gsap.fromTo(
          secondsRef.current,
          { y: -8, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.25, ease: 'power2.out' },
        );
      }
    },
    { dependencies: [timeLeft.seconds] },
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useGSAP(
    () => {
      if (poolCountRef.current) {
        const counter = { value: 0 };
        gsap.to(counter, {
          value: 34180,
          duration: 1.5,
          ease: 'power2.out',
          onUpdate: () => {
            if (poolCountRef.current) {
              poolCountRef.current.textContent = `£${Math.round(counter.value).toLocaleString()}`;
            }
          },
          scrollTrigger: {
            trigger: poolCountRef.current,
            start: 'top 80%',
            once: true,
          },
        });
      }
    },
    { scope: poolCountRef },
  );

  const daysInMonth = new Date(2026, 3, 0).getDate();
  const currentDay = new Date().getDate();
  const monthProgress = Math.min((currentDay / daysInMonth) * 100, 100);
  const daysLeft = Math.max(30 - currentDay, 0);

  const firstName = user.fullName.split(' ')[0];
  const planLabel =
    subscription.plan === 'monthly' ? 'Monthly' : 'Yearly';
  const renewal = formatDate(subscription.currentPeriodEnd);

  const activeMembers = 3245;
  const poolAmount = 34180;
  const tier5Match = Math.round((poolAmount * 0.4) * 100);
  const tier4Match = Math.round((poolAmount * 0.35) * 100);
  const tier3Match = Math.round((poolAmount * 0.25) * 100);

  return (
    <motion.div
      className={styles.container}
      variants={containerVariants}
      initial="initial"
      animate="animate"
    >
        <DashboardHomeWidget>
          <motion.div className={styles.welcomeBanner} variants={slideUpVariants}>
            <div className={styles.welcomeLeft}>
              <h1 className={styles.welcomeGreeting}>
                {getGreeting()}, {firstName} 👋
              </h1>
              <p className={styles.welcomeSub}>
                Your next draw is in {MOCK_DASHBOARD_STATS.nextDrawDays} days.
                You have {MOCK_SCORES.length} scores entered.
              </p>
            </div>

            <div className={styles.welcomeRight}>
              <div className={styles.statusPill}>
                <motion.div
                  className={styles.statusDot}
                  animate={{ scale: [1, 1.3, 1], opacity: [1, 0.6, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
                <span className={styles.statusText}>Active subscription</span>
              </div>
              <p className={styles.planText}>
                {planLabel} plan · Renews {renewal}
              </p>
            </div>
          </motion.div>
        </DashboardHomeWidget>

        <DashboardHomeWidget>
          <motion.div className={styles.drawWidget}>
            <div className={styles.drawHeader}>
              <div>
                <div className={styles.drawLabel}>Next draw</div>
                <div className={styles.drawDate}>
                  {formatMonth('2026-04-01')}
                </div>
              </div>
              <Badge variant="info">Draw #{MOCK_DASHBOARD_STATS.drawsEntered + 1}</Badge>
            </div>

            <div className={styles.countdown}>
              <motion.div
                className={styles.countdownUnit}
                key={`days-${timeLeft.days}`}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={timeLeft.days}
                    initial={{ y: -6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 6, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={styles.countdownNumber}
                  >
                    {timeLeft.days}
                  </motion.span>
                </AnimatePresence>
                <div className={styles.countdownLabel}>Days</div>
              </motion.div>

              <div className={styles.countdownSeparator}>:</div>

              <motion.div
                className={styles.countdownUnit}
                key={`hours-${timeLeft.hours}`}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={timeLeft.hours}
                    initial={{ y: -6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 6, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={styles.countdownNumber}
                  >
                    {String(timeLeft.hours).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
                <div className={styles.countdownLabel}>Hours</div>
              </motion.div>

              <div className={styles.countdownSeparator}>:</div>

              <motion.div
                className={styles.countdownUnit}
                key={`minutes-${timeLeft.minutes}`}
              >
                <AnimatePresence mode="wait">
                  <motion.span
                    key={timeLeft.minutes}
                    initial={{ y: -6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 6, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={styles.countdownNumber}
                  >
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
                <div className={styles.countdownLabel}>Minutes</div>
              </motion.div>

              <div className={styles.countdownSeparator}>:</div>

              <motion.div className={styles.countdownUnit}>
                <AnimatePresence mode="wait">
                  <motion.span
                    ref={secondsRef}
                    key={timeLeft.seconds}
                    initial={{ y: -6, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    exit={{ y: 6, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className={styles.countdownNumber}
                  >
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </motion.span>
                </AnimatePresence>
                <div className={styles.countdownLabel}>Seconds</div>
              </motion.div>
            </div>

            <div className={styles.progressSection}>
              <div className={styles.progressLabel}>
                <span>Month progress</span>
                <span>{Math.round(monthProgress)}%</span>
              </div>
              <div className={styles.progressTrack}>
                <motion.div
                  className={styles.progressFill}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.3,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  style={{ originX: 0, width: `${monthProgress}%` }}
                />
              </div>
            </div>

            <p className={styles.drawNote}>
              {daysLeft} days to enter your latest score before the draw.{' '}
              <Link to={ROUTES.SCORES} className={styles.drawLink}>
                Enter scores →
              </Link>
            </p>
          </motion.div>
        </DashboardHomeWidget>

        <DashboardHomeWidget>
          <motion.div className={styles.poolWidget}>
            <div className={styles.poolLabel}>Prize pool</div>
            <div className={styles.poolMonth}>{formatMonth('2026-04-01')}</div>
            <motion.div
              ref={poolCountRef}
              className={styles.poolAmount}
            >
              £0
            </motion.div>
            <p className={styles.poolMembers}>
              Based on {activeMembers.toLocaleString()} active members
            </p>

            <div className={styles.poolTiers}>
              <motion.div
                className={styles.poolTierRow}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                style={{ originX: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0,
                }}
              >
                <div className={styles.poolTierMeta}>
                  <span className={styles.poolTierLabel}>5 match</span>
                  <span className={styles.poolTierAmount}>
                    {formatCurrency(tier5Match)}
                  </span>
                </div>
                <div className={styles.poolTierTrack}>
                  <motion.div
                    className={styles.poolTierFill}
                    style={{
                      background: 'var(--color-accent)',
                    }}
                  />
                </div>
              </motion.div>

              <motion.div
                className={styles.poolTierRow}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                style={{ originX: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.15,
                }}
              >
                <div className={styles.poolTierMeta}>
                  <span className={styles.poolTierLabel}>4 match</span>
                  <span className={styles.poolTierAmount}>
                    {formatCurrency(tier4Match)}
                  </span>
                </div>
                <div className={styles.poolTierTrack}>
                  <motion.div
                    className={styles.poolTierFill}
                    style={{
                      background: '#7F77DD',
                    }}
                  />
                </div>
              </motion.div>

              <motion.div
                className={styles.poolTierRow}
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                style={{ originX: 0 }}
                transition={{
                  duration: 0.7,
                  delay: 0.3,
                }}
              >
                <div className={styles.poolTierMeta}>
                  <span className={styles.poolTierLabel}>3 match</span>
                  <span className={styles.poolTierAmount}>
                    {formatCurrency(tier3Match)}
                  </span>
                </div>
                <div className={styles.poolTierTrack}>
                  <motion.div
                    className={styles.poolTierFill}
                    style={{
                      background: '#1D9E75',
                    }}
                  />
                </div>
              </motion.div>
            </div>

            <p className={styles.poolFooter}>Jackpot rolls over if unclaimed</p>
          </motion.div>
        </DashboardHomeWidget>

        <DashboardHomeWidget>
          <motion.div className={styles.scoresWidget}>
            <div className={styles.widgetHeader}>
              <h3 className={styles.widgetTitle}>My scores</h3>
              <Link to={ROUTES.SCORES} className={styles.widgetLink}>
                Edit scores →
              </Link>
            </div>

            <div className={styles.scoresList}>
              {MOCK_SCORES.map((score) => {
                const colors = getScoreBallColor(score.score);
                const badgeVariant = getScoreBadgeVariant(score.score);
                const badgeLabel = getScoreBadgeLabel(score.score);

                return (
                  <div key={score.id} className={styles.scoreRow}>
                    <div
                      className={styles.scoreBall}
                      style={{
                        backgroundColor: colors.bg,
                        color: colors.text,
                      }}
                    >
                      {score.score}
                    </div>
                    <div className={styles.scoreInfo}>
                      <div className={styles.scoreType}>Stableford</div>
                      <div className={styles.scoreDate}>
                        {formatDate(score.createdAt)}
                      </div>
                    </div>
                    <Badge variant={badgeVariant} size="sm">
                      {badgeLabel}
                    </Badge>
                  </div>
                );
              })}
            </div>

            <div className={styles.scoresFooter}>
              {MOCK_SCORES.length < 5 ? (
                <span>
                  Add {5 - MOCK_SCORES.length} more score
                  {MOCK_SCORES.length !== 4 ? 's' : ''} for maximum draw
                  entries
                </span>
              ) : (
                <span style={{ color: 'var(--color-success)' }}>
                  ✓ All 5 score slots filled · You're fully entered
                </span>
              )}
            </div>
          </motion.div>
        </DashboardHomeWidget>

        <DashboardHomeWidget>
          <motion.div className={styles.charityWidget}>
            <div className={styles.widgetHeader}>
              <h3 className={styles.widgetTitle}>My charity</h3>
              <Link to={ROUTES.MY_CHARITY} className={styles.widgetLink}>
                Change →
              </Link>
            </div>

            <div className={styles.charityInfo}>
              <div
                className={styles.charityAvatar}
                style={{
                  backgroundColor: 'var(--color-accent-subtle)',
                  color: 'var(--color-accent)',
                }}
              >
                {MOCK_CHARITY_CONTRIBUTION.charityName[0]}
              </div>
              <div>
                <div className={styles.charityName}>
                  {MOCK_CHARITY_CONTRIBUTION.charityName}
                </div>
                <Badge variant="info" size="sm">
                  Sports
                </Badge>
              </div>
            </div>

            <div className={styles.contributionSection}>
              <div className={styles.ringWrapper}>
                <svg width="80" height="80" viewBox="0 0 80 80">
                  <circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="var(--color-bg-raised)"
                    strokeWidth="6"
                  />
                  <motion.circle
                    cx="40"
                    cy="40"
                    r="32"
                    fill="none"
                    stroke="var(--color-accent)"
                    strokeWidth="6"
                    strokeDasharray={2 * Math.PI * 32}
                    initial={{
                      strokeDashoffset: 2 * Math.PI * 32,
                    }}
                    animate={{
                      strokeDashoffset: 2 * Math.PI * 32 * (1 - MOCK_CHARITY_CONTRIBUTION.percentage / 100),
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.3,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    strokeLinecap="round"
                  />
                </svg>
                <div className={styles.ringText}>
                  {MOCK_CHARITY_CONTRIBUTION.percentage}%
                </div>
              </div>

              <div className={styles.contributionInfo}>
                <div className={styles.contributionLabel}>
                  of subscription to charity
                </div>
                <div className={styles.contributionAmount}>
                  {formatCurrency(MOCK_CHARITY_CONTRIBUTION.monthlyAmount)} /
                  month
                </div>
                <div className={styles.contributionTotal}>
                  Total contributed:{' '}
                  {formatCurrency(MOCK_CHARITY_CONTRIBUTION.totalContributed)}
                </div>
              </div>
            </div>
          </motion.div>
        </DashboardHomeWidget>

        <DashboardHomeWidget>
          <motion.div className={styles.actionsWidget}>
            <h3 className={styles.widgetTitle}>Quick actions</h3>
            <div className={styles.actionsList}>
              <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  leftIcon={<span>✏️</span>}
                  onClick={() => window.location.href = ROUTES.SCORES}
                >
                  Enter a score
                </Button>
              </motion.div>
              <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  leftIcon={<span>🏆</span>}
                  onClick={() => window.location.href = ROUTES.DRAWS}
                >
                  View draw results
                </Button>
              </motion.div>
              <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  leftIcon={<span>❤️</span>}
                  onClick={() => window.location.href = ROUTES.MY_CHARITY}
                >
                  Change my charity
                </Button>
              </motion.div>
              <motion.div whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                  leftIcon={<span>⚙️</span>}
                  onClick={() => window.location.href = ROUTES.SUBSCRIPTION}
                >
                  Manage subscription
                </Button>
              </motion.div>
            </div>
          </motion.div>
        </DashboardHomeWidget>

        <DashboardHomeWidget>
          <motion.div className={styles.statsRow}>
            <motion.div
              className={styles.statCard}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.statTop}>
                <div
                  className={styles.statIcon}
                  style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                  }}
                >
                  🏆
                </div>
                <div className={styles.statValue}>
                  {formatCurrency(MOCK_DASHBOARD_STATS.totalWinnings)}
                </div>
              </div>
              <div className={styles.statLabel}>Total winnings</div>
              <div
                className={styles.statTrend}
                style={{ color: 'var(--color-success)' }}
              >
                +{formatCurrency(MOCK_DASHBOARD_STATS.totalWinnings)} this season
              </div>
            </motion.div>

            <motion.div
              className={styles.statCard}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.statTop}>
                <div
                  className={styles.statIcon}
                  style={{
                    backgroundColor: '#dbeafe',
                    color: '#1d4ed8',
                  }}
                >
                  📅
                </div>
                <div className={styles.statValue}>
                  {MOCK_DASHBOARD_STATS.drawsEntered}
                </div>
              </div>
              <div className={styles.statLabel}>Draws entered</div>
              <div
                className={styles.statTrend}
                style={{ color: 'var(--color-text-subtle)' }}
              >
                Since joining
              </div>
            </motion.div>

            <motion.div
              className={styles.statCard}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.statTop}>
                <div
                  className={styles.statIcon}
                  style={{
                    backgroundColor: '#fef9c3',
                    color: '#a16207',
                  }}
                >
                  🔥
                </div>
                <div className={styles.statValue}>
                  {MOCK_DASHBOARD_STATS.currentStreak}
                </div>
              </div>
              <div className={styles.statLabel}>Current streak</div>
              <div
                className={styles.statTrend}
                style={{ color: 'var(--color-warning)' }}
              >
                Keep it going!
              </div>
            </motion.div>

            <motion.div
              className={styles.statCard}
              whileHover={{ y: -2 }}
              transition={{ duration: 0.2 }}
            >
              <div className={styles.statTop}>
                <div
                  className={styles.statIcon}
                  style={{
                    backgroundColor: '#fce7f3',
                    color: '#be185d',
                  }}
                >
                  💖
                </div>
                <div className={styles.statValue}>
                  {formatCurrency(MOCK_CHARITY_CONTRIBUTION.totalContributed)}
                </div>
              </div>
              <div className={styles.statLabel}>Charity given</div>
              <div
                className={styles.statTrend}
                style={{ color: 'var(--color-text-subtle)' }}
              >
                To Golf Foundation
              </div>
            </motion.div>
          </motion.div>
        </DashboardHomeWidget>

        <DashboardHomeWidget>
          <motion.div className={styles.drawsWidget}>
            <div className={styles.widgetHeader}>
              <h3 className={styles.widgetTitle}>Recent draws</h3>
              <Link to={ROUTES.DRAWS} className={styles.widgetLink}>
                View all →
              </Link>
            </div>

            {MOCK_RECENT_DRAWS.slice(0, 3).map((draw) => {
              const matchingNumbers = draw.winningNumbers.filter((n) =>
                draw.myNumbers.includes(n),
              );

              return (
                <div key={draw.id} className={styles.drawRow}>
                  <div className={styles.drawMeta}>
                    <div className={styles.drawMonth}>
                      {formatMonth(draw.month)}
                    </div>
                  </div>

                  <div className={styles.drawNumbers}>
                    <div className={styles.drawNumbersLabel}>
                      Draw numbers:
                    </div>
                    <div className={styles.drawNumbersRow}>
                      {draw.winningNumbers.map((num) => (
                        <div
                          key={`win-${num}`}
                          className={styles.numberPill}
                          style={{
                            backgroundColor:
                              matchingNumbers.includes(num)
                                ? 'var(--color-accent)'
                                : 'var(--color-bg-raised)',
                            color:
                              matchingNumbers.includes(num)
                                ? 'white'
                                : 'var(--color-text-muted)',
                          }}
                        >
                          {num}
                        </div>
                      ))}
                    </div>

                    <div className={styles.drawNumbersLabel}>My numbers:</div>
                    <div className={styles.drawNumbersRow}>
                      {draw.myNumbers.map((num) => (
                        <div
                          key={`my-${num}`}
                          className={styles.numberPill}
                          style={{
                            backgroundColor:
                              matchingNumbers.includes(num)
                                ? 'var(--color-accent)'
                                : 'var(--color-bg-raised)',
                            color:
                              matchingNumbers.includes(num)
                                ? 'white'
                                : 'var(--color-text-muted)',
                          }}
                        >
                          {num}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className={styles.drawResult}>
                    {draw.isWinner ? (
                      <Badge variant="success">
                        Won {formatCurrency(draw.prizeAmount || 0)}
                      </Badge>
                    ) : draw.matchCount > 0 ? (
                      <Badge variant="neutral">{draw.matchCount} matched</Badge>
                    ) : (
                      <Badge variant="neutral">No match</Badge>
                    )}
                  </div>
                </div>
              );
            })}
          </motion.div>
        </DashboardHomeWidget>

        <DashboardHomeWidget>
          <motion.div className={styles.supportWidget}>
            <h3
              className={styles.widgetTitle}
              style={{ color: 'var(--color-accent)' }}
            >
              Need help?
            </h3>
            <p className={styles.supportText}>
              Check our FAQ or contact support if you have any questions about
              your subscription or draw results.
            </p>
            <div style={{ marginTop: 'var(--space-5)' }}>
              <Link to={ROUTES.HOW_IT_WORKS}>
                <Button
                  variant="secondary"
                  size="md"
                  fullWidth
                >
                  View FAQ
                </Button>
              </Link>
            </div>
          </motion.div>
        </DashboardHomeWidget>
      </motion.div>
  );
};
