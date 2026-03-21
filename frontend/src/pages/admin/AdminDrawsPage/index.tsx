import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/layout';
import { Badge, Button, Modal, Spinner } from '../../../components/ui';
import { CreateDrawModal } from '../../../components/admin/CreateDrawModal';
import { useAdminDraws, useAdminUsers, useConfigureDrawType, usePublishDraw, useSimulateDraw } from '../../../hooks/useAdmin';
import { containerVariants, itemVariants, slideUpVariants } from '../../../lib/animations';
import { ROUTES } from '../../../lib/constants';
import { formatCurrency, formatMonth } from '../../../lib/utils';
import { useToastStore } from '../../../stores/toastStore';
import styles from './AdminDrawsPage.module.css';

gsap.registerPlugin(ScrollTrigger);

type DrawType = 'random' | 'algorithmic';
type AlgorithmMode = 'most_common' | 'least_common';

type ProjectedWinner = {
  id: string;
  fullName: string;
  scores: number[];
  matchCount: number;
};

const processingSteps = ['Calculating winners...', 'Updating prize pools...', 'Sending notifications...'];

const generateRandomDrawNumbers = (): number[] => {
  const numbers = new Set<number>();
  while (numbers.size < 5) {
    numbers.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(numbers);
};

export const AdminDrawsPage = () => {
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const { data: adminDraws = [] } = useAdminDraws();
  const { data: adminUsers = [] } = useAdminUsers();
  const simulateDrawMutation = useSimulateDraw();
  const publishDrawMutation = usePublishDraw();
  const configureDrawTypeMutation = useConfigureDrawType();

  const [drawType, setDrawType] = useState<DrawType>('random');
  const [algorithmMode, setAlgorithmMode] = useState<AlgorithmMode>('most_common');
  const [simulationResults, setSimulationResults] = useState<number[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [showCreateDrawModal, setShowCreateDrawModal] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [processingStepIndex, setProcessingStepIndex] = useState(0);
  const [drawStatus, setDrawStatus] = useState<'pending' | 'published'>('pending');

  const prizePoolRef = useRef<HTMLParagraphElement>(null);

  const currentDraw = adminDraws[0];
  const currentDrawId = currentDraw?.id;
  const publishedDraws = adminDraws.filter((draw: { status: string }) => draw.status === 'published');

  const projectedWinners = useMemo<ProjectedWinner[]>(() => {
    if (simulationResults.length === 0) return [];

    return adminUsers.filter((user: { id: string; fullName: string; scores: number[] }) => {
      const matches = user.scores.filter((score) => simulationResults.includes(score));
      return matches.length >= 3;
    }).map((user: { id: string; fullName: string; scores: number[] }) => {
      const matchCount = user.scores.filter((score) => simulationResults.includes(score)).length;
      return {
        id: user.id,
        fullName: user.fullName,
        scores: user.scores,
        matchCount,
      };
    });
  }, [adminUsers, simulationResults]);

  const winnerCounts = useMemo(() => {
    return {
      five: projectedWinners.filter((winner: ProjectedWinner) => winner.matchCount >= 5).length,
      four: projectedWinners.filter((winner: ProjectedWinner) => winner.matchCount === 4).length,
      three: projectedWinners.filter((winner: ProjectedWinner) => winner.matchCount === 3).length,
    };
  }, [projectedWinners]);

  useEffect(() => {
    if (!currentDraw) {
      return;
    }

    if (!prizePoolRef.current) return;

    const count = { value: 0 };
    gsap.to(count, {
      value: currentDraw.totalPool,
      duration: 1.6,
      ease: 'power3.out',
      scrollTrigger: {
        trigger: prizePoolRef.current,
        start: 'top 85%',
        once: true,
      },
      onUpdate: () => {
        if (prizePoolRef.current) {
          prizePoolRef.current.textContent = `£${Math.round(count.value).toLocaleString()}`;
        }
      },
    });
  }, [currentDraw]);

  useEffect(() => {
    if (!currentDraw) {
      return;
    }

    const currentDrawType = (currentDraw.draw_type ?? currentDraw.drawType) as DrawType | undefined;
    const currentAlgorithmMode = (currentDraw.algorithm_mode ?? currentDraw.algorithmMode) as AlgorithmMode | undefined;
    const targetAlgorithmMode = drawType === 'algorithmic' ? algorithmMode : undefined;

    // Avoid an update/refetch loop by skipping no-op draw config mutations.
    if (currentDrawType === drawType && currentAlgorithmMode === targetAlgorithmMode) {
      return;
    }

    configureDrawTypeMutation.mutate({
      drawId: currentDraw.id,
      drawType,
      algorithmMode: targetAlgorithmMode,
    });
  }, [configureDrawTypeMutation, currentDraw, drawType, algorithmMode]);

  useEffect(() => {
    if (!isPublishing) return;

    setProcessingStepIndex(0);
    const stepTimer = window.setInterval(() => {
      setProcessingStepIndex((prev) => Math.min(prev + 1, processingSteps.length - 1));
    }, 900);

    const publishTimer = window.setTimeout(async () => {
      window.clearInterval(stepTimer);
      if (currentDrawId && simulationResults.length > 0) {
        try {
          await publishDrawMutation.mutateAsync({ drawId: currentDrawId, winningNumbers: simulationResults });
          setDrawStatus('published');
        } catch (error) {
          // Error is handled by the mutation onError callback
        }
      }
      setIsPublishing(false);
      setShowPublishModal(false);
    }, 3000);

    return () => {
      window.clearInterval(stepTimer);
      window.clearTimeout(publishTimer);
    };
  }, [currentDrawId, isPublishing, publishDrawMutation, simulationResults]);

  const countdown = useMemo(() => {
    const diff = Math.max(0, new Date('2026-04-30T23:59:59').getTime() - Date.now());
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    return { days, hours };
  }, []);

  const handleClosePublishingModal = useCallback(() => {
    setIsPublishing(false);
  }, []);

  const runSimulation = () => {
    setIsSimulating(true);
    simulateDrawMutation
      .mutateAsync({
        drawType,
        algorithmMode: drawType === 'algorithmic' ? algorithmMode : undefined,
      })
      .then((result: { winningNumbers?: number[] }) => {
        setSimulationResults(result.winningNumbers ?? generateRandomDrawNumbers());
      })
      .catch(() => {
        setSimulationResults(generateRandomDrawNumbers());
        addToast({ type: 'error', message: 'Simulation failed' });
      })
      .finally(() => {
        setIsSimulating(false);
      });
  };

  const openPublish = () => {
    if (!currentDraw) {
      addToast({ type: 'warning', message: 'Please create a draw first' });
      return;
    }

    if (simulationResults.length === 0) {
      addToast({ type: 'warning', message: 'Please run a simulation first' });
      return;
    }

    setShowPublishModal(true);
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Draw manager"
        subtitle="Configure, simulate, and publish monthly prize draws."
        actions={
          <Button variant="secondary" size="sm" onClick={() => setShowCreateDrawModal(true)}>
            Create Draw
          </Button>
        }
      />

      <section className={styles.controlCard}>
        <div className={styles.controlCardHeader}>
          <div className={styles.headerTop}>
            <h3>{currentDraw ? `${formatMonth(currentDraw.month)} Draw` : 'Upcoming Draw'}</h3>
            <div className={styles.headerBadges}>
              <Badge variant="info" size="sm">Draw</Badge>
              <Badge variant={drawStatus === 'pending' ? 'warning' : 'success'} size="sm">
                {drawStatus === 'pending' ? 'Pending' : 'Published'}
              </Badge>
            </div>
          </div>
          <p>{countdown.days} days · {countdown.hours} hours remaining</p>
        </div>

        <div className={styles.controlCardBody}>
          <div className={styles.controlGrid}>
            <div>
              <section className={styles.block}>
                <h4>Draw type</h4>
                <p>Choose the method used to generate winning numbers.</p>
                <div className={styles.drawTypeCards}>
                  <button
                    type="button"
                    className={`${styles.typeCard} ${drawType === 'random' ? styles.typeCardActive : ''}`}
                    onClick={() => setDrawType('random')}
                  >
                    <strong>Random draw</strong>
                    <span>Cryptographically secure random selection</span>
                  </button>
                  <button
                    type="button"
                    className={`${styles.typeCard} ${drawType === 'algorithmic' ? styles.typeCardActive : ''}`}
                    onClick={() => setDrawType('algorithmic')}
                  >
                    <strong>Algorithmic draw</strong>
                    <span>Weighted by score frequency across members</span>
                  </button>
                </div>

                <AnimatePresence>
                  {drawType === 'algorithmic' ? (
                    <motion.div
                      className={styles.algoToggle}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                    >
                      <button
                        type="button"
                        className={`${styles.modeBtn} ${algorithmMode === 'most_common' ? styles.modeBtnActive : ''}`}
                        onClick={() => setAlgorithmMode('most_common')}
                      >
                        Favour most common
                      </button>
                      <button
                        type="button"
                        className={`${styles.modeBtn} ${algorithmMode === 'least_common' ? styles.modeBtnActive : ''}`}
                        onClick={() => setAlgorithmMode('least_common')}
                      >
                        Favour least common
                      </button>
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </section>

              <section className={styles.block}>
                <h4>Prize pool</h4>
                <p className={styles.poolTotal} ref={prizePoolRef}>£0</p>
                <p className={styles.muted}>Based on 3,420 active subscribers</p>
                <div className={styles.poolRows}>
                  {[40, 35, 25].map((percent, index) => (
                    <div key={percent} className={styles.poolRow}>
                      <div className={styles.poolMeta}>
                        <span>{index === 0 ? '5-match' : index === 1 ? '4-match' : '3-match'}</span>
                        <span>{formatCurrency(Math.round(((currentDraw?.totalPool ?? 0) * percent) / 100) * 100)}</span>
                      </div>
                      <div className={styles.poolTrack}>
                        <motion.div className={styles.poolFill} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} style={{ transformOrigin: 'left center', width: `${percent}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>

            <aside className={styles.actionCard}>
              <h4>Run simulation</h4>
              <p>Preview draw results without publishing. Safe to run multiple times.</p>
              <Button variant="secondary" size="md" fullWidth onClick={runSimulation} loading={isSimulating}>
                {isSimulating ? 'Running simulation...' : 'Run simulation'}
              </Button>

              <div className={styles.orDivider}>or</div>

              <h4>Publish draw</h4>
              <p>This action is permanent and will notify all winners by email.</p>
              <Button variant="primary" size="md" fullWidth onClick={openPublish}>
                Publish draw results
              </Button>
            </aside>
          </div>
        </div>
      </section>

      <AnimatePresence>
        {simulationResults.length > 0 ? (
          <motion.section className={styles.simResults} variants={slideUpVariants} initial="initial" animate="animate" exit="initial">
            <div className={styles.simHeader}>
              <h3>Simulation results</h3>
              <div className={styles.simHeaderActions}>
                <Badge variant="warning" size="sm">Not published</Badge>
                <Button variant="ghost" size="sm" onClick={runSimulation}>Re-run</Button>
              </div>
            </div>

            <div className={styles.simBalls}>
              {simulationResults.map((num, index) => (
                <motion.div
                  key={`${num}-${index}`}
                  className={styles.simBall}
                  initial={{ opacity: 0, scale: 0.6, rotate: -20 }}
                  animate={{ opacity: 1, scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 240, damping: 18, delay: index * 0.3 }}
                >
                  {num}
                </motion.div>
              ))}
            </div>

            <h4>Projected winners based on these numbers:</h4>
            {projectedWinners.length === 0 ? (
              <div className={styles.noWinners}>
                <p>No members match 3+ numbers with these results.</p>
                <p>Consider re-running the simulation.</p>
              </div>
            ) : (
              <table className={styles.projectedTable}>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Match count</th>
                    <th>Tier</th>
                    <th>Projected prize</th>
                  </tr>
                </thead>
                <tbody>
                  {projectedWinners.map((winner: ProjectedWinner) => (
                    <tr key={winner.id}>
                      <td>{winner.fullName}</td>
                      <td>{winner.matchCount}</td>
                      <td>{winner.matchCount >= 5 ? '5-match' : winner.matchCount === 4 ? '4-match' : '3-match'}</td>
                      <td>{winner.matchCount >= 5 ? '£3,200' : winner.matchCount === 4 ? '£1,050' : '£142'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            <motion.div className={styles.summaryBadges} variants={containerVariants} initial="initial" animate="animate">
              <motion.span variants={itemVariants}>5-match winners: {winnerCounts.five}</motion.span>
              <motion.span variants={itemVariants}>4-match: {winnerCounts.four}</motion.span>
              <motion.span variants={itemVariants}>3-match: {winnerCounts.three}</motion.span>
            </motion.div>
          </motion.section>
        ) : null}
      </AnimatePresence>

      <section>
        <div className={styles.pastHeader}>
          <h3>Past draws</h3>
          <Badge variant="neutral" size="sm">{publishedDraws.length} draws</Badge>
        </div>
        <table className={styles.pastTable}>
          <thead>
            <tr>
              <th>Month</th>
              <th>Draw type</th>
              <th>Winners</th>
              <th>Total pool</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {publishedDraws.map((draw: { id: string; month: string; drawType: string; totalPool: number }) => (
              <tr key={draw.id}>
                <td>{formatMonth(draw.month)}</td>
                <td><Badge variant="info" size="sm">{draw.drawType}</Badge></td>
                <td>16</td>
                <td>{formatCurrency(draw.totalPool * 100)}</td>
                <td><Badge variant="success" size="sm">Published</Badge></td>
                <td>
                  <Button variant="ghost" size="sm" onClick={() => navigate(ROUTES.DRAWS)}>View results</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <Modal
        isOpen={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        title="Confirm draw publication"
        size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setShowPublishModal(false)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              loading={isPublishing}
              disabled={isPublishing}
              onClick={() => {
                setShowPublishModal(false);
                setIsPublishing(true);
              }}
            >
              Publish draw
            </Button>
          </>
        }
      >
        <div className={styles.publishContent}>
          <div className={styles.publishWarning}>This action cannot be undone. Winners will be notified immediately.</div>
          <p>Winning numbers:</p>
          <div className={styles.publishNumbers}>
            {simulationResults.map((num) => <span key={`publish-${num}`} className={styles.publishBall}>{num}</span>)}
          </div>
          <p>This will notify {(currentDraw?.activeMembers ?? 0).toLocaleString()} members by email.</p>
        </div>
      </Modal>

      <Modal isOpen={isPublishing} onClose={handleClosePublishingModal} title="Publishing draw" size="sm">
        <div className={styles.processingModal}>
          <Spinner size="md" color="accent" />
          {processingSteps.map((step, index) => (
            <p key={step} className={index <= processingStepIndex ? styles.stepActive : styles.stepInactive}>{step}</p>
          ))}
        </div>
      </Modal>

      <CreateDrawModal isOpen={showCreateDrawModal} onClose={() => setShowCreateDrawModal(false)} />
    </div>
  );
};
