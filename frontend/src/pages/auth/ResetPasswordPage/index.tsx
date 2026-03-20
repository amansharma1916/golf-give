import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '../../../components/layout';
import { Button, Input } from '../../../components/ui';
import { containerVariants, itemVariants } from '../../../lib/animations';
import { ROUTES } from '../../../lib/constants';
import styles from './ResetPasswordPage.module.css';

type ResetStage = 'request' | 'sent';

const isEmailValid = (value: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

export const ResetPasswordPage = () => {
  const navigate = useNavigate();

  const [stage, setStage] = useState<ResetStage>('request');
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validateEmail = (value: string) => {
    if (!value.trim()) {
      return 'Email is required.';
    }

    if (!isEmailValid(value)) {
      return 'Please enter a valid email address.';
    }

    return null;
  };

  const submitRequest = () => {
    const message = validateEmail(email);

    if (message) {
      setError(message);
      return;
    }

    setError(null);
    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      setStage('sent');
    }, 1200);
  };

  return (
    <AuthLayout>
      <div className={styles.page}>
        <AnimatePresence mode="wait">
          {stage === 'request' ? (
            <motion.div
              key="request"
              variants={containerVariants}
              initial="initial"
              animate="animate"
              exit={{ opacity: 0, x: -20 }}
            >
              <motion.div variants={itemVariants}>
                <Link to={ROUTES.LOGIN} className={styles.backLink}>
                  <span aria-hidden="true">←</span>
                  Back to log in
                </Link>
              </motion.div>

              <motion.h1 className={styles.heading} variants={itemVariants}>
                Reset your password
              </motion.h1>
              <motion.p className={styles.subtext} variants={itemVariants}>
                Enter your email and we&apos;ll send you a reset link.
              </motion.p>

              <motion.form className={styles.form} variants={containerVariants} initial="initial" animate="animate">
                <motion.div variants={itemVariants}>
                  <Input
                    label="Email address"
                    type="email"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) {
                        setError(null);
                      }
                    }}
                    onBlur={() => setError(validateEmail(email))}
                    error={error ?? undefined}
                    required
                  />
                </motion.div>

                <motion.div variants={itemVariants}>
                  <Button variant="primary" size="lg" fullWidth loading={isSubmitting} onClick={submitRequest}>
                    {isSubmitting ? 'Sending...' : 'Send reset link'}
                  </Button>
                </motion.div>
              </motion.form>
            </motion.div>
          ) : (
            <motion.div
              key="sent"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            >
              <motion.div
                className={styles.successIcon}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              >
                ✓
              </motion.div>
              <h2 className={styles.successHeading}>Check your inbox.</h2>
              <p className={styles.successBody}>
                We&apos;ve sent a reset link to <strong>{email}</strong>. Check your spam folder if you don&apos;t see it
                within a few minutes.
              </p>
              <Button variant="secondary" size="lg" fullWidth onClick={() => navigate(ROUTES.LOGIN)}>
                Back to log in
              </Button>
              <p className={styles.resendRow}>
                Didn&apos;t receive it?{' '}
                <button type="button" className={styles.resendLink} onClick={() => setStage('request')}>
                  Resend email
                </button>
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AuthLayout>
  );
};
