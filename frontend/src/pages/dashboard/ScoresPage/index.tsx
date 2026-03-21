import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { PageHeader } from '../../../components/layout';
import { Button, Badge, Input, Modal } from '../../../components/ui';
import {
  containerVariants,
  itemVariants,
  fadeInVariants,
} from '../../../lib/animations';
import { useAddScore, useDeleteScore, useScores, useUpdateScore } from '../../../hooks/useScores';
import { formatDate, cn } from '../../../lib/utils';
import { useToastStore } from '../../../stores/toastStore';
import type { Score } from '../../../types';
import styles from './ScoresPage.module.css';

interface FormData {
  score: string;
  playedAt: string;
}

interface FormErrors {
  score?: string;
  playedAt?: string;
}

const getScoreBallColor = (score: number): { bg: string; text: string } => {
  if (score >= 35) return { bg: '#dcfce7', text: '#15803d' };
  if (score >= 28) return { bg: '#dbeafe', text: '#1d4ed8' };
  if (score >= 20) return { bg: '#fef9c3', text: '#a16207' };
  return { bg: '#fee2e2', text: '#dc2626' };
};

const getScoreQuality = (score: number): string => {
  if (score >= 35) return 'Excellent round';
  if (score >= 28) return 'Good round';
  if (score >= 20) return 'Average round';
  return 'Below average';
};

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <motion.span
    animate={{ rotate: isOpen ? 180 : 0 }}
    transition={{ duration: 0.25 }}
    style={{ display: 'inline-block' }}
  >
    ↓
  </motion.span>
);

const GolfBallIcon = ({ size = 80 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <circle cx="40" cy="40" r="38" stroke="var(--color-border)" strokeWidth="2" />
    <circle cx="30" cy="25" r="2" fill="var(--color-border)" />
    <circle cx="40" cy="20" r="2" fill="var(--color-border)" />
    <circle cx="50" cy="25" r="2" fill="var(--color-border)" />
    <circle cx="25" cy="35" r="2" fill="var(--color-border)" />
    <circle cx="40" cy="32" r="2" fill="var(--color-border)" />
    <circle cx="55" cy="35" r="2" fill="var(--color-border)" />
    <circle cx="30" cy="50" r="2" fill="var(--color-border)" />
    <circle cx="40" cy="55" r="2" fill="var(--color-border)" />
    <circle cx="50" cy="50" r="2" fill="var(--color-border)" />
    <circle cx="20" cy="55" r="2" fill="var(--color-border)" />
    <circle cx="60" cy="55" r="2" fill="var(--color-border)" />
  </svg>
);

export const ScoresPage = () => {
  const { data: scores = [] } = useScores();
  const addScoreMutation = useAddScore();
  const updateScoreMutation = useUpdateScore();
  const deleteScoreMutation = useDeleteScore();
  const [isAddingScore, setIsAddingScore] = useState(false);
  const [editingScoreId, setEditingScoreId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>({ score: '', playedAt: '' });
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [infoSectionOpen, setInfoSectionOpen] = useState(false);
  const addToast = useToastStore((state) => state.addToast);

  // Validation functions
  const validateScore = (scoreStr: string): string | undefined => {
    if (!scoreStr.trim()) return 'Score is required';
    const score = parseInt(scoreStr, 10);
    if (isNaN(score)) return 'Must be a valid number';
    if (score < 1) return 'Score must be at least 1';
    if (score > 45) return 'Score cannot exceed 45';
    return undefined;
  };

  const validatePlayedAt = (dateStr: string): string | undefined => {
    if (!dateStr.trim()) return 'Date is required';
    const date = new Date(dateStr);
    const today = new Date();
    today.setHours(23, 59, 59, 999);
    if (date > today) return 'Date cannot be in the future';
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    if (date < oneYearAgo) return 'Date cannot be more than 1 year ago';
    return undefined;
  };

  // Form handlers
  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: 'score' | 'playedAt',
  ) => {
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddScore = async () => {
    const scoreError = validateScore(formData.score);
    const dateError = validatePlayedAt(formData.playedAt);

    if (scoreError || dateError) {
      setFormErrors({
        score: scoreError,
        playedAt: dateError,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await addScoreMutation.mutateAsync({
        score: parseInt(formData.score, 10),
        playedAt: formData.playedAt,
      });

      setIsAddingScore(false);
      setFormData({ score: '', playedAt: '' });
      setFormErrors({});
    } catch {
      addToast({
        message: 'Failed to add score. Try again.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditScore = (score: Score) => {
    setEditingScoreId(score.id);
    setFormData({ score: score.score.toString(), playedAt: score.playedAt });
  };

  const handleSaveEdit = async () => {
    const scoreError = validateScore(formData.score);
    const dateError = validatePlayedAt(formData.playedAt);

    if (scoreError || dateError) {
      setFormErrors({
        score: scoreError,
        playedAt: dateError,
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!editingScoreId) {
        return;
      }

      await updateScoreMutation.mutateAsync({
        id: editingScoreId,
        payload: {
          score: parseInt(formData.score, 10),
          playedAt: formData.playedAt,
        },
      });

      setEditingScoreId(null);
      setFormData({ score: '', playedAt: '' });
      setFormErrors({});
    } catch {
      addToast({
        message: 'Failed to update score.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteScore = async () => {
    if (!deleteConfirmId) return;

    setIsSubmitting(true);
    try {
      await deleteScoreMutation.mutateAsync(deleteConfirmId);
      setDeleteConfirmId(null);
    } catch {
      addToast({
        message: 'Failed to delete score.',
        type: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditingScoreId(null);
    setFormData({ score: '', playedAt: '' });
    setFormErrors({});
  };

  const getScoreById = (id: string): Score | undefined => {
    return scores.find((s) => s.id === id);
  };

  const scoreToDelete = deleteConfirmId ? getScoreById(deleteConfirmId) : null;
  const scoreColors = scoreToDelete ? getScoreBallColor(scoreToDelete.score) : null;
  const todayDate = new Date().toISOString().split('T')[0];

  return (
    <div>
      <PageHeader
        title="My scores"
        subtitle="Your last 5 Stableford scores are your monthly draw numbers. Adding a 6th score removes the oldest automatically."
        actions={
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddingScore(true)}
          >
            Add score
          </Button>
        }
      />

      <motion.div className={styles.container}>
        {/* Section 1: Score Slots */}
        <motion.section
          className={styles.slotsSection}
          variants={containerVariants}
          initial="initial"
          animate="animate"
        >
          <h3 className={styles.slotsLabel}>Your score slots</h3>
          <div className={styles.slots}>
            {Array.from({ length: 5 }).map((_, index) => {
              const score = scores[index];
              const isFilled = index < scores.length;

              return (
                <motion.div key={index} className={styles.slotWrapper} layout>
                  {index > 0 && <div className={styles.slotConnector} />}
                  <motion.div
                    className={cn(styles.slot, !isFilled && styles.slotEmpty)}
                    style={
                      isFilled
                        ? {
                            backgroundColor: getScoreBallColor(score!.score)
                              .bg,
                            color: getScoreBallColor(score!.score).text,
                          }
                        : {}
                    }
                    onClick={
                      !isFilled ? () => setIsAddingScore(true) : undefined
                    }
                    layout
                    initial={
                      isFilled && index > scores.length - 1
                        ? { scale: 0 }
                        : undefined
                    }
                    animate={isFilled ? { scale: 1 } : undefined}
                    exit={isFilled ? { scale: 0, opacity: 0 } : undefined}
                    transition={
                      isFilled && index > scores.length - 1
                        ? {
                            type: 'spring',
                            stiffness: 300,
                            damping: 20,
                          }
                        : undefined
                    }
                  >
                    {isFilled ? score!.score : '+'}
                  </motion.div>
                  <div className={styles.slotDate}>
                    {isFilled
                      ? formatDate(score!.playedAt)
                      : 'Empty'}
                  </div>
                  {isFilled && index === 4 && scores.length === 5 && (
                    <div className={styles.slotOldestBadge}>OLDEST</div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </motion.section>

        {/* Section 2: Add Score Form */}
        <AnimatePresence initial={false}>
          {isAddingScore && (
            <motion.div
              className={styles.addForm}
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }}
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <h3 className={styles.addFormHeading}>Add a new score</h3>
              <p className={styles.addFormSub}>
                Enter your Stableford score from your latest round.
              </p>

              {scores.length === 5 && (
                <div className={styles.rollingWarning}>
                  <span>⚠</span>
                  <span>
                    Adding this score will remove your oldest score (
                    {formatDate(scores[scores.length - 1]!.playedAt)} —{' '}
                    {scores[scores.length - 1]!.score} pts) from your draw
                    entry.
                  </span>
                </div>
              )}

              <div className={styles.formFields}>
                <div className={styles.scoreInputWrapper}>
                  <Input
                    label="Stableford score"
                    type="number"
                    min="1"
                    max="45"
                    step="1"
                    placeholder="e.g. 34"
                    value={formData.score}
                    onChange={(e) => handleFormChange(e, 'score')}
                    error={formErrors.score}
                    hint="Must be between 1 and 45"
                    required
                  />
                  <AnimatePresence>
                    {formData.score &&
                      !formErrors.score &&
                      parseInt(formData.score, 10) >= 1 &&
                      parseInt(formData.score, 10) <= 45 && (
                        <motion.div
                          className={styles.scorePreview}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          transition={{
                            type: 'spring',
                            stiffness: 300,
                            damping: 20,
                          }}
                        >
                          <div
                            className={styles.previewBall}
                            style={{
                              backgroundColor: getScoreBallColor(
                                parseInt(formData.score, 10),
                              ).bg,
                              color: getScoreBallColor(
                                parseInt(formData.score, 10),
                              ).text,
                            }}
                          >
                            {formData.score}
                          </div>
                        </motion.div>
                      )}
                  </AnimatePresence>
                </div>

                <Input
                  label="Date played"
                  type="date"
                  value={formData.playedAt}
                  onChange={(e) => handleFormChange(e, 'playedAt')}
                  error={formErrors.playedAt}
                  max={todayDate}
                  required
                />
              </div>

              <div className={styles.formActions}>
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() => {
                    setIsAddingScore(false);
                    setFormData({ score: '', playedAt: '' });
                    setFormErrors({});
                  }}
                >
                  Cancel
                </Button>
                <Button
                  variant="primary"
                  size="md"
                  loading={isSubmitting}
                  onClick={handleAddScore}
                >
                  Save score
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Section 3: Scores List */}
        {scores.length > 0 ? (
          <motion.section
            className={styles.listSection}
            variants={itemVariants}
          >
            <div className={styles.listHeader}>
              <h3 className={styles.listTitle}>
                Your scores ({scores.length}/5)
              </h3>
              {scores.length === 5 && (
                <Badge variant="success" size="sm">
                  All slots filled
                </Badge>
              )}
              {scores.length === 0 && (
                <Badge variant="neutral" size="sm">
                  No scores yet
                </Badge>
              )}
            </div>

            <AnimatePresence initial={false}>
              <div className={styles.scoresList}>
                {scores.map((score, index) => (
                  <motion.div
                    key={score.id}
                    className={cn(
                      styles.scoreItem,
                      editingScoreId === score.id && styles.scoreItemEditing,
                    )}
                    layout
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20, height: 0 }}
                    transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  >
                    {editingScoreId === score.id ? (
                      <motion.div
                        className={styles.inlineEditForm}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.25 }}
                      >
                        <div className={styles.inlineFormFields}>
                          <Input
                            label="Score"
                            type="number"
                            min="1"
                            max="45"
                            step="1"
                            value={formData.score}
                            onChange={(e) =>
                              handleFormChange(e, 'score')
                            }
                            error={formErrors.score}
                          />
                          <Input
                            label="Date"
                            type="date"
                            value={formData.playedAt}
                            onChange={(e) =>
                              handleFormChange(e, 'playedAt')
                            }
                            error={formErrors.playedAt}
                            max={todayDate}
                          />
                        </div>
                        <div className={styles.inlineFormActions}>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={cancelEdit}
                          >
                            Cancel
                          </Button>
                          <Button
                            variant="primary"
                            size="sm"
                            loading={isSubmitting}
                            onClick={handleSaveEdit}
                          >
                            Save
                          </Button>
                        </div>
                      </motion.div>
                    ) : (
                      <>
                        <div
                          className={styles.scoreBall}
                          style={{
                            backgroundColor: getScoreBallColor(score.score)
                              .bg,
                            color: getScoreBallColor(score.score).text,
                          }}
                        >
                          {score.score}
                        </div>

                        <div className={styles.scoreMiddle}>
                          <div className={styles.scoreTopRow}>
                            <span className={styles.scoreValue}>
                              {score.score} pts
                            </span>
                            <span className={styles.scoreQuality}>
                              {getScoreQuality(score.score)}
                            </span>
                            {index === 0 && (
                              <span className={styles.latestBadge}>
                                Latest
                              </span>
                            )}
                            {index === 4 && scores.length === 5 && (
                              <span className={styles.oldestBadge}>
                                Will be replaced
                              </span>
                            )}
                          </div>
                          <div className={styles.scoreBottomRow}>
                            <span className={styles.scoreDate}>
                              {formatDate(score.playedAt)}
                            </span>
                            <span className={styles.scoreFormat}>
                              Stableford format
                            </span>
                          </div>
                        </div>

                        <div className={styles.scoreActions}>
                          <button
                            className={cn(
                              styles.actionBtn,
                              styles.actionBtnEdit,
                            )}
                            onClick={() => handleEditScore(score)}
                            type="button"
                            aria-label="Edit score"
                          >
                            ✏️
                          </button>
                          <button
                            className={cn(
                              styles.actionBtn,
                              styles.actionBtnDelete,
                            )}
                            onClick={() => setDeleteConfirmId(score.id)}
                            type="button"
                            aria-label="Delete score"
                          >
                            🗑️
                          </button>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}
              </div>
            </AnimatePresence>
          </motion.section>
        ) : (
          <motion.div
            className={styles.emptyState}
            variants={fadeInVariants}
            initial="initial"
            animate="animate"
          >
            <div className={styles.emptyIcon}>
              <GolfBallIcon size={80} />
            </div>
            <h3 className={styles.emptyTitle}>No scores yet</h3>
            <p className={styles.emptyDesc}>
              Add your first Stableford score to start entering monthly draws.
            </p>
            <Button
              variant="primary"
              size="md"
              onClick={() => setIsAddingScore(true)}
            >
              Add your first score
            </Button>
          </motion.div>
        )}

        {/* Section 4: Delete Confirmation Modal */}
        <Modal
          isOpen={deleteConfirmId !== null}
          onClose={() => setDeleteConfirmId(null)}
          title="Delete this score?"
          size="sm"
          footer={
            <div style={{ display: 'flex', gap: 'var(--space-3)' }}>
              <Button
                variant="ghost"
                size="md"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </Button>
              <Button
                variant="danger"
                size="md"
                loading={isSubmitting}
                onClick={handleDeleteScore}
              >
                Delete score
              </Button>
            </div>
          }
        >
          {scoreToDelete && scoreColors && (
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--space-4)',
                  marginBottom: 'var(--space-4)',
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: 'var(--text-lg)',
                    backgroundColor: scoreColors.bg,
                    color: scoreColors.text,
                  }}
                >
                  {scoreToDelete.score}
                </div>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--color-text)' }}>
                    {scoreToDelete.score} pts on{' '}
                    {formatDate(scoreToDelete.playedAt)}
                  </div>
                  <div style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)' }}>
                    {getScoreQuality(scoreToDelete.score)}
                  </div>
                </div>
              </div>
              <p style={{ fontSize: 'var(--text-sm)', color: 'var(--color-text-muted)', marginTop: 'var(--space-4)', lineHeight: 'var(--leading-relaxed)' }}>
                This will permanently remove this score from your draw entry.
                If you have fewer than 5 scores, you may have fewer draw numbers
                this month.
              </p>
            </div>
          )}
        </Modal>

        {/* Section 5: How Scoring Works */}
        <motion.section
          className={styles.infoSection}
          variants={itemVariants}
        >
          <button
            className={styles.infoToggle}
            onClick={() => setInfoSectionOpen(!infoSectionOpen)}
            type="button"
          >
            How does score entry work? <ChevronIcon isOpen={infoSectionOpen} />
          </button>

          <AnimatePresence initial={false}>
            {infoSectionOpen && (
              <motion.div
                className={styles.infoContent}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <motion.div
                  className={styles.infoRows}
                  variants={containerVariants}
                  initial="initial"
                  animate="animate"
                >
                  <motion.div className={styles.infoRow} variants={itemVariants}>
                    <div
                      className={styles.infoIcon}
                      style={{ backgroundColor: 'var(--color-accent-subtle)' }}
                    >
                      🔄
                    </div>
                    <div>
                      <div className={styles.infoTitle}>Rolling 5-score system</div>
                      <p className={styles.infoDesc}>
                        We always keep your 5 most recent scores. When you add a
                        6th, the oldest is automatically removed. This means your
                        draw numbers always reflect your recent form.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div className={styles.infoRow} variants={itemVariants}>
                    <div
                      className={styles.infoIcon}
                      style={{ backgroundColor: '#dbeafe' }}
                    >
                      ⛳
                    </div>
                    <div>
                      <div className={styles.infoTitle}>Stableford format</div>
                      <p className={styles.infoDesc}>
                        Stableford is a golf scoring system where you earn points
                        based on your score on each hole relative to par. A typical
                        round produces between 20 and 45 points. Higher is better.
                      </p>
                    </div>
                  </motion.div>

                  <motion.div className={styles.infoRow} variants={itemVariants}>
                    <div
                      className={styles.infoIcon}
                      style={{ backgroundColor: '#fef9c3' }}
                    >
                      🎟️
                    </div>
                    <div>
                      <div className={styles.infoTitle}>
                        Your scores are your draw numbers
                      </div>
                      <p className={styles.infoDesc}>
                        Each month, 5 numbers between 1 and 45 are drawn. We
                        compare the winning numbers to your 5 scores. Match 3, 4,
                        or 5 to win a prize.
                      </p>
                    </div>
                  </motion.div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      </motion.div>
    </div>
  );
};
