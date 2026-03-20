import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { PageHeader } from '../../../components/layout';
import { Badge, Button, Spinner, Tabs } from '../../../components/ui';
import { containerVariants, itemVariants, pageVariants } from '../../../lib/animations';
import { MOCK_WINNINGS } from '../../../lib/mockData';
import { cn, formatMonth } from '../../../lib/utils';
import { useToastStore } from '../../../stores/toastStore';
import styles from './WinningsPage.module.css';

gsap.registerPlugin(ScrollTrigger);

type WinningsTab = 'overview' | 'history' | 'pending';
type HistoryFilter = 'all' | 'paid' | 'pending' | 'verified';
type HistorySort = 'newest' | 'largest' | 'oldest';

const formatPounds = (amount: number): string => {
  return `£${amount.toFixed(2)}`;
};

const dayDiff = (deadline: string): number => {
  const now = Date.now();
  const target = new Date(deadline).getTime();
  return Math.max(0, Math.ceil((target - now) / (1000 * 60 * 60 * 24)));
};

const getTierLabel = (tier: 'three_match' | 'four_match' | 'five_match'): string => {
  if (tier === 'five_match') return '5-match jackpot';
  if (tier === 'four_match') return '4-match';
  return '3-match';
};

const UploadIcon = () => (
  <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
    <path d="M12 16V7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
    <path d="m8.7 10.2 3.3-3.3 3.3 3.3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
    <rect x="3" y="16" width="18" height="5" rx="2" stroke="currentColor" strokeWidth="1.4" />
  </svg>
);

export const WinningsPage = () => {
  const [activeTab, setActiveTab] = useState<WinningsTab>('overview');
  const [filter, setFilter] = useState<HistoryFilter>('all');
  const [sortBy, setSortBy] = useState<HistorySort>('newest');
  const [isDragOver, setIsDragOver] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [showNextSteps, setShowNextSteps] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  const earningsRef = useRef<HTMLHeadingElement>(null);
  const paidOutRef = useRef<HTMLSpanElement>(null);
  const pendingRef = useRef<HTMLSpanElement>(null);
  const winRateRef = useRef<HTMLSpanElement>(null);
  const bestMatchRef = useRef<HTMLSpanElement>(null);

  const winnings = MOCK_WINNINGS;
  const paidWinnings = winnings.filter((w) => w.status === 'paid');
  const pendingWinnings = winnings.filter((w) => w.status === 'pending');

  const totalPaid = paidWinnings.reduce((sum, entry) => sum + entry.amount, 0);
  const totalPending = pendingWinnings.reduce((sum, entry) => sum + entry.amount, 0);
  const largestWin = paidWinnings.reduce((max, entry) => Math.max(max, entry.amount), 0);
  const averagePrize = paidWinnings.length ? totalPaid / paidWinnings.length : 0;
  const bestMatch = winnings.reduce((max, entry) => Math.max(max, entry.matchCount), 0);
  const winRate = winnings.length ? Math.round((winnings.length / 18) * 100) : 0;

  const filteredHistory = useMemo(() => {
    const source = winnings.filter((item) => {
      if (filter === 'all') return true;
      if (filter === 'verified') return item.status === 'pending';
      return item.status === filter;
    });

    const sorted = [...source].sort((a, b) => {
      if (sortBy === 'largest') {
        return b.amount - a.amount;
      }

      if (sortBy === 'oldest') {
        return new Date(a.drawMonth).getTime() - new Date(b.drawMonth).getTime();
      }

      return new Date(b.drawMonth).getTime() - new Date(a.drawMonth).getTime();
    });

    return sorted;
  }, [filter, sortBy, winnings]);

  useEffect(() => {
    const refs = [
      { ref: paidOutRef, value: totalPaid, format: (v: number) => formatPounds(v) },
      { ref: pendingRef, value: totalPending, format: (v: number) => formatPounds(v) },
      { ref: winRateRef, value: winRate, format: (v: number) => `${Math.round(v)}%` },
      { ref: bestMatchRef, value: bestMatch, format: (v: number) => `${Math.round(v)}` },
    ];

    refs.forEach(({ ref, value, format }) => {
      if (!ref.current) return;

      const counter = { value: 0 };
      gsap.to(counter, {
        value,
        duration: 1.8,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          once: true,
        },
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = format(counter.value);
          }
        },
      });
    });

    if (!earningsRef.current) return;

    const heroCounter = { value: 0 };
    gsap.to(heroCounter, {
      value: totalPaid,
      duration: 2,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: earningsRef.current,
        start: 'top 80%',
        once: true,
      },
      onUpdate: () => {
        if (earningsRef.current) {
          earningsRef.current.textContent = formatPounds(heroCounter.value);
        }
      },
    });
  }, [bestMatch, totalPaid, totalPending, winRate]);

  useEffect(() => {
    if (!isUploading) return;

    const progressValue = { value: 0 };
    const tween = gsap.to(progressValue, {
      value: 90,
      duration: 1.4,
      ease: 'power2.out',
      onUpdate: () => setUploadProgress(Math.round(progressValue.value)),
    });

    const timer = window.setTimeout(() => {
      setUploadProgress(100);
      setIsUploading(false);
      setIsSuccess(true);
      addToast({
        type: 'success',
        message: "Proof submitted! We'll verify within 2-3 working days.",
      });
    }, 1700);

    return () => {
      tween.kill();
      window.clearTimeout(timer);
    };
  }, [addToast, isUploading]);

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'history', label: 'Win history', count: winnings.length },
    { id: 'pending', label: 'Pending claims', count: pendingWinnings.length },
  ];

  const handleFile = (selected: File | null) => {
    if (!selected) return;

    if (selected.size > 10 * 1024 * 1024) {
      addToast({ type: 'error', message: 'File is larger than 10MB.' });
      return;
    }

    setFile(selected);
    setIsSuccess(false);
  };

  const submitProof = () => {
    if (!file) {
      addToast({ type: 'warning', message: 'Please choose a proof file first.' });
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="My winnings"
        subtitle="Your prize history, pending claims and payment status."
        actions={pendingWinnings.length > 0 ? <Badge variant="warning">Action required</Badge> : undefined}
      />

      <div className={cn(styles.tabsWrap, pendingWinnings.length > 0 && styles.pendingDot)}>
        <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as WinningsTab)} />
      </div>

      <AnimatePresence mode="wait">
        {activeTab === 'overview' ? (
          <motion.section
            key="overview"
            className={styles.panel}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <motion.article className={styles.earningsHero} variants={containerVariants} initial="initial" animate="animate">
              <div className={styles.earningsLeft}>
                <p className={styles.earningsLabel}>Total prize earnings</p>
                <h3 ref={earningsRef} className={styles.earningsValue}>£0.00</h3>
                <p className={styles.earningsSub}>{winnings.length} prizes won across 18 draws</p>
              </div>
              <div className={styles.pills}>
                <motion.div variants={itemVariants} transition={{ delay: 0.3 }} className={styles.pill}>
                  <span>Largest win</span>
                  <strong>{formatPounds(largestWin)}</strong>
                </motion.div>
                <motion.div variants={itemVariants} transition={{ delay: 0.38 }} className={styles.pill}>
                  <span>Win rate</span>
                  <strong>{winRate}%</strong>
                </motion.div>
                <motion.div variants={itemVariants} transition={{ delay: 0.46 }} className={styles.pill}>
                  <span>Avg. prize</span>
                  <strong>{formatPounds(averagePrize)}</strong>
                </motion.div>
              </div>
            </motion.article>

            <div className={styles.timeline}>
              {winnings.map((win, index) => (
                <motion.button
                  key={win.id}
                  type="button"
                  className={styles.timelineNodeWrap}
                  onClick={() => setActiveTab('history')}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true, margin: '-80px' }}
                  transition={{ type: 'spring', stiffness: 260, damping: 20, delay: index * 0.08 }}
                  whileHover={{ scale: 1.04 }}
                >
                  <span className={styles.timelineDate}>{formatMonth(win.drawMonth)}</span>
                  <div className={styles.timelineNode}>{win.matchCount}</div>
                  <span className={styles.timelineAmount}>{formatPounds(win.amount)}</span>
                  <Badge variant={win.status === 'paid' ? 'success' : 'warning'} size="sm">
                    {getTierLabel(win.tier)}
                  </Badge>
                  {index < winnings.length - 1 && <div className={styles.timelineLine} />}
                </motion.button>
              ))}
            </div>

            <motion.div className={styles.quickStats} variants={containerVariants} initial="initial" whileInView="animate" viewport={{ once: true }}>
              <motion.article className={styles.statCard} variants={itemVariants}>
                <p>Total paid out</p>
                <span ref={paidOutRef}>£0.00</span>
              </motion.article>
              <motion.article className={cn(styles.statCard, pendingWinnings.length > 0 && styles.warningStat)} variants={itemVariants}>
                <p>Pending claims</p>
                <span ref={pendingRef}>£0.00</span>
              </motion.article>
              <motion.article className={styles.statCard} variants={itemVariants}>
                <p>Win rate</p>
                <span ref={winRateRef}>0%</span>
              </motion.article>
              <motion.article className={styles.statCard} variants={itemVariants}>
                <p>Best match count</p>
                <span ref={bestMatchRef}>0</span>
              </motion.article>
            </motion.div>
          </motion.section>
        ) : null}

        {activeTab === 'history' ? (
          <motion.section
            key={`history-${filter}`}
            className={styles.panel}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <div className={styles.historyControls}>
              <div className={styles.filterPills}>
                {(['all', 'paid', 'pending', 'verified'] as HistoryFilter[]).map((pill) => (
                  <button
                    key={pill}
                    type="button"
                    className={cn(styles.filterBtn, filter === pill && styles.filterBtnActive)}
                    onClick={() => setFilter(pill)}
                  >
                    {pill === 'all' ? 'All' : pill[0].toUpperCase() + pill.slice(1)}
                  </button>
                ))}
              </div>
              <select
                className={styles.sortSelect}
                value={sortBy}
                onChange={(event) => setSortBy(event.target.value as HistorySort)}
              >
                <option value="newest">Newest</option>
                <option value="largest">Largest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={`${filter}-${sortBy}`}
                className={styles.historyList}
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="initial"
              >
                {filteredHistory.map((entry) => (
                  <motion.article
                    key={entry.id}
                    className={cn(styles.historyItem, entry.status === 'pending' && styles.historyPending)}
                    variants={itemVariants}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                  >
                    <div>
                      <h4>{formatMonth(entry.drawMonth)}</h4>
                      <p>{getTierLabel(entry.tier)}</p>
                    </div>
                    <div>
                      <p>{entry.matchCount} numbers matched</p>
                      <div className={styles.miniBalls}>
                        {entry.myNumbers.map((num) => {
                          const isMatch = entry.winningNumbers.includes(num);
                          return (
                            <span key={`${entry.id}-${num}`} className={cn(styles.miniBall, isMatch && styles.miniBallMatch)}>
                              {num}
                            </span>
                          );
                        })}
                      </div>
                    </div>
                    <div>
                      <strong>{formatPounds(entry.amount)}</strong>
                    </div>
                    <div className={styles.historyAction}>
                      {entry.status === 'pending' ? (
                        <Button variant="primary" size="sm" onClick={() => setActiveTab('pending')}>
                          Upload proof
                        </Button>
                      ) : (
                        <Badge variant="success">Paid {entry.paidAt ? formatMonth(entry.paidAt) : ''}</Badge>
                      )}
                    </div>
                  </motion.article>
                ))}
              </motion.div>
            </AnimatePresence>
          </motion.section>
        ) : null}

        {activeTab === 'pending' ? (
          <motion.section
            key="pending"
            className={styles.panel}
            variants={pageVariants}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {pendingWinnings.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>✓</div>
                <h3>All prizes paid out</h3>
                <p>You have no pending claims right now.</p>
              </div>
            ) : (
              <>
                <article className={styles.urgencyBanner}>
                  <h4>Action required</h4>
                  <p>Upload proof before deadline to receive payment.</p>
                </article>

                {pendingWinnings.map((pending) => {
                  const daysRemaining = pending.deadline ? dayDiff(pending.deadline) : 0;
                  const countdownClass =
                    daysRemaining <= 3 ? styles.deadlineDanger : daysRemaining <= 7 ? styles.deadlineWarning : styles.deadlineNormal;

                  return (
                    <article key={pending.id} className={styles.pendingClaimCard}>
                      <div className={styles.claimTop}>
                        <div>
                          <h3>{formatMonth(pending.drawMonth)}</h3>
                          <p>{pending.matchCount} numbers matched</p>
                          <div className={styles.claimNumbers}>
                            {pending.myNumbers.map((num) => {
                              const isMatch = pending.winningNumbers.includes(num);
                              return (
                                <span key={`${pending.id}-claim-${num}`} className={cn(styles.claimBall, isMatch && styles.claimBallMatch)}>
                                  {num}
                                </span>
                              );
                            })}
                          </div>
                        </div>
                        <div className={styles.claimAmountCol}>
                          <strong>{formatPounds(pending.amount)}</strong>
                          <span className={cn(styles.deadline, countdownClass)}>{daysRemaining} days remaining</span>
                        </div>
                      </div>

                      <motion.div className={styles.claimSteps} variants={containerVariants} initial="initial" whileInView="animate" viewport={{ once: true }}>
                        <motion.div variants={itemVariants} className={cn(styles.step, styles.stepDone)}>1. Screenshot scores</motion.div>
                        <motion.div variants={itemVariants} className={cn(styles.step, styles.stepCurrent)}>2. Upload proof</motion.div>
                        <motion.div variants={itemVariants} className={cn(styles.step, styles.stepUpcoming)}>3. Receive payment</motion.div>
                      </motion.div>

                      <div
                        className={cn(styles.uploadZone, isDragOver && styles.uploadZoneDrag)}
                        onDragOver={(event) => {
                          event.preventDefault();
                          setIsDragOver(true);
                        }}
                        onDragLeave={() => setIsDragOver(false)}
                        onDrop={(event) => {
                          event.preventDefault();
                          setIsDragOver(false);
                          handleFile(event.dataTransfer.files[0] ?? null);
                        }}
                      >
                        {!isSuccess ? (
                          <>
                            <motion.div
                              className={styles.uploadIcon}
                              animate={{ y: [0, -6, 0] }}
                              transition={{ duration: 1.2, repeat: Infinity }}
                            >
                              <UploadIcon />
                            </motion.div>
                            <h4>Drag and drop your proof here</h4>
                            <p>or</p>
                            <label className={styles.browseBtn}>
                              Browse files
                              <input
                                type="file"
                                hidden
                                accept="image/png,image/jpeg,application/pdf"
                                onChange={(event) => handleFile(event.target.files?.[0] ?? null)}
                              />
                            </label>
                            <small>JPG, PNG, PDF · Max 10MB</small>
                            {file ? (
                              <div className={styles.selectedFile}>
                                {file.type.startsWith('image/') ? (
                                  <img src={URL.createObjectURL(file)} alt={file.name} className={styles.previewImage} />
                                ) : (
                                  <span>{file.name}</span>
                                )}
                                <button type="button" className={styles.removeFileBtn} onClick={() => setFile(null)}>
                                  Remove
                                </button>
                              </div>
                            ) : null}

                            {isUploading ? (
                              <div className={styles.uploadingState}>
                                <Spinner size="sm" color="accent" />
                                <p>Uploading {uploadProgress}%</p>
                                <div className={styles.progressTrack}>
                                  <motion.div className={styles.progressFill} style={{ scaleX: uploadProgress / 100 }} />
                                </div>
                              </div>
                            ) : (
                              <Button variant="primary" size="md" fullWidth onClick={submitProof}>
                                Submit proof
                              </Button>
                            )}
                          </>
                        ) : (
                          <motion.div
                            className={styles.successState}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ type: 'spring', stiffness: 280, damping: 22 }}
                          >
                            <div className={styles.successIcon}>✓</div>
                            <h4>Proof submitted!</h4>
                            <Badge variant="info">Under review</Badge>
                            <button type="button" className={styles.nextStepsBtn} onClick={() => setShowNextSteps((prev) => !prev)}>
                              What happens next?
                            </button>
                            <AnimatePresence initial={false}>
                              {showNextSteps ? (
                                <motion.div
                                  initial={{ opacity: 0, height: 0 }}
                                  animate={{ opacity: 1, height: 'auto' }}
                                  exit={{ opacity: 0, height: 0 }}
                                  className={styles.nextSteps}
                                >
                                  <p>1. We verify your submission within 2-3 working days.</p>
                                  <p>2. Approved claims move to payout queue.</p>
                                  <p>3. Payment appears in your history as Paid.</p>
                                </motion.div>
                              ) : null}
                            </AnimatePresence>
                          </motion.div>
                        )}
                      </div>
                    </article>
                  );
                })}
              </>
            )}
          </motion.section>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
