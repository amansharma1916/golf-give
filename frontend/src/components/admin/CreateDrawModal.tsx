import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button, Modal } from '../ui';
import { useCreateDraw } from '../../hooks/useAdmin';
import { itemVariants } from '../../lib/animations';
import styles from './CreateDrawModal.module.css';

interface CreateDrawModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type DrawType = 'random' | 'algorithmic';
type AlgorithmMode = 'most_common' | 'least_common';

export const CreateDrawModal: React.FC<CreateDrawModalProps> = ({ isOpen, onClose }) => {
  const [month, setMonth] = useState<string>('');
  const [drawType, setDrawType] = useState<DrawType>('random');
  const [algorithmMode, setAlgorithmMode] = useState<AlgorithmMode>('most_common');
  const [errors, setErrors] = useState<Record<string, string>>({});
  
  const createDrawMutation = useCreateDraw();
  const isLoading = createDrawMutation.isPending;

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!month) {
      newErrors.month = 'Month is required';
    } else if (!/^\d{4}-\d{2}$/.test(month)) {
      newErrors.month = 'Month must be in YYYY-MM format';
    } else {
      // Check if month is not in the past
      const [year, monthNum] = month.split('-').map(Number);
      const selectedDate = new Date(year, monthNum - 1, 1);
      const now = new Date();
      if (selectedDate < now) {
        newErrors.month = 'Cannot create draws for past months';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    try {
      await createDrawMutation.mutateAsync({
        month,
        drawType,
        algorithmMode: drawType === 'algorithmic' ? algorithmMode : undefined,
      });
      
      // Reset form
      setMonth('');
      setDrawType('random');
      setAlgorithmMode('most_common');
      setErrors({});
      onClose();
    } catch (error) {
      // Error is handled by the hook's onError
    }
  };

  const currentYear = new Date().getFullYear();
  const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
  const defaultMonth = `${currentYear}-${currentMonth}`;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create New Draw">
      <form onSubmit={handleSubmit} className={styles.form}>
        <motion.div
          className={styles.formGroup}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <label htmlFor="month" className={styles.label}>
            Draw Month <span className={styles.required}>*</span>
          </label>
          <input
            type="month"
            id="month"
            value={month || defaultMonth}
            onChange={(e) => {
              setMonth(e.target.value);
              setErrors({ ...errors, month: '' });
            }}
            className={`${styles.input} ${errors.month ? styles.inputError : ''}`}
            disabled={isLoading}
          />
          {errors.month && <span className={styles.error}>{errors.month}</span>}
          <span className={styles.hint}>Format: YYYY-MM (e.g., 2026-04)</span>
        </motion.div>

        <motion.div
          className={styles.formGroup}
          variants={itemVariants}
          initial="hidden"
          animate="visible"
        >
          <label className={styles.label}>
            Draw Type <span className={styles.required}>*</span>
          </label>
          <div className={styles.drawTypeOptions}>
            <button
              type="button"
              className={`${styles.typeOption} ${drawType === 'random' ? styles.typeOptionActive : ''}`}
              onClick={() => setDrawType('random')}
              disabled={isLoading}
            >
              <div className={styles.typeOptionTitle}>Random Draw</div>
              <div className={styles.typeOptionDesc}>Cryptographically secure random selection</div>
            </button>
            <button
              type="button"
              className={`${styles.typeOption} ${drawType === 'algorithmic' ? styles.typeOptionActive : ''}`}
              onClick={() => setDrawType('algorithmic')}
              disabled={isLoading}
            >
              <div className={styles.typeOptionTitle}>Algorithmic Draw</div>
              <div className={styles.typeOptionDesc}>Weighted by score frequency</div>
            </button>
          </div>
        </motion.div>

        <AnimatePresence>
          {drawType === 'algorithmic' && (
            <motion.div
              className={styles.formGroup}
              variants={itemVariants}
              initial="hidden"
              animate="visible"
              exit="hidden"
            >
              <label className={styles.label}>
                Algorithm Mode <span className={styles.required}>*</span>
              </label>
              <div className={styles.modeOptions}>
                <button
                  type="button"
                  className={`${styles.modeOption} ${algorithmMode === 'most_common' ? styles.modeOptionActive : ''}`}
                  onClick={() => setAlgorithmMode('most_common')}
                  disabled={isLoading}
                >
                  Favour Most Common Scores
                </button>
                <button
                  type="button"
                  className={`${styles.modeOption} ${algorithmMode === 'least_common' ? styles.modeOptionActive : ''}`}
                  onClick={() => setAlgorithmMode('least_common')}
                  disabled={isLoading}
                >
                  Favour Least Common Scores
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="md"
            type="button"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            type="submit"
            loading={isLoading}
            fullWidth
          >
            {isLoading ? 'Creating Draw...' : 'Create Draw'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
