import { useEffect, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SubscribeLayout } from '../../../components/layout';
import { Badge, Button, Card, Spinner } from '../../../components/ui';
import { useCharityById } from '../../../hooks/useCharities';
import { useMockCheckout } from '../../../hooks/useSubscription';
import { containerVariants, itemVariants, pageTransition, pageVariants } from '../../../lib/animations';
import { PLANS, ROUTES, type PlanId } from '../../../lib/constants';
import { useUserStore as userStore } from '../../../stores/userStore';
import styles from './SubscribePage.module.css';

type ProcessingStage = 'idle' | 'processing' | 'success';

type ProcessingStep = {
  id: number;
  label: string;
};

type TrustItem = {
  label: string;
  path: string;
};

const PROCESSING_STEPS: ProcessingStep[] = [
  { id: 1, label: 'Verifying your account' },
  { id: 2, label: 'Setting up your subscription' },
  { id: 3, label: 'Connecting your charity' },
];

const BENEFITS: string[] = [
  'Monthly prize draw entry',
  'Score tracking dashboard',
  'Charity contributions automated',
  'Email draw result notifications',
];

const TRUST_ITEMS: TrustItem[] = [
  {
    label: 'Secure',
    path: 'M8 1.5a3 3 0 0 0-3 3V7H4a1 1 0 0 0-1 1v6.5a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V8a1 1 0 0 0-1-1h-1V4.5a3 3 0 0 0-3-3Zm-1.5 5.5V4.5a1.5 1.5 0 1 1 3 0V7h-3Z',
  },
  {
    label: 'Cancel anytime',
    path: 'M8 2a6 6 0 1 0 5.66 8H12a4.5 4.5 0 1 1-1.07-4.63L9 7h5V2l-1.6 1.6A5.97 5.97 0 0 0 8 2Z',
  },
  {
    label: 'Instant access',
    path: 'M8.6 1.5 3 9h3.3L5.6 14.5 13 7.2H9.8L8.6 1.5Z',
  },
  {
    label: 'Real charity impact',
    path: 'M8 14.7 2.9 9.6a3.1 3.1 0 1 1 4.4-4.4L8 5.9l.7-.7a3.1 3.1 0 1 1 4.4 4.4L8 14.7Z',
  },
];

const formatMoney = (value: number) => {
  return `£${value.toFixed(2)}`;
};

const isPlanId = (value: string): value is PlanId => {
  return value in PLANS;
};

export const SubscribePage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const planId = (searchParams.get('plan') || 'monthly') as PlanId;
  const charityId = searchParams.get('charity') || '1';
  const [selectedPlan, setSelectedPlan] = useState<PlanId>(planId);
  const [processingStage, setProcessingStage] = useState<ProcessingStage>('idle');
  const [visibleSteps, setVisibleSteps] = useState(0);
  const { mutateAsync: checkout, isPending } = useMockCheckout();

  const subscription = userStore((state) => state.subscription);
  const isAuthenticated = userStore((state) => state.isAuthenticated);
  const { data: selectedCharity } = useCharityById(charityId);

  const safePlan = isPlanId(selectedPlan) ? selectedPlan : 'monthly';
  const planConfig = PLANS[safePlan];
  const planAmount = planConfig.amount / 100;
  const charityContribution = planAmount * 0.1;
  const charityName = selectedCharity?.name ?? 'Selected charity';

  useEffect(() => {
    if (!isAuthenticated) {
      navigate(ROUTES.SIGNUP, { replace: true });
      return;
    }

    if (subscription?.status === 'active') {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate, subscription]);

  useEffect(() => {
    if (isPlanId(planId)) {
      setSelectedPlan(planId);
    } else {
      setSelectedPlan('monthly');
    }
  }, [planId]);

  useEffect(() => {
    if (processingStage !== 'processing') {
      setVisibleSteps(0);
      return;
    }

    const timers = PROCESSING_STEPS.map((_, index) => {
      return window.setTimeout(() => {
        setVisibleSteps(index + 1);
      }, index * 600);
    });

    return () => {
      timers.forEach((timer) => window.clearTimeout(timer));
    };
  }, [processingStage]);

  useEffect(() => {
    if (processingStage !== 'success') {
      return;
    }

    const redirectTimer = window.setTimeout(() => {
      navigate(ROUTES.DASHBOARD);
    }, 1500);

    return () => {
      window.clearTimeout(redirectTimer);
    };
  }, [navigate, processingStage]);

  const handleConfirm = async () => {
    if (processingStage !== 'idle') {
      return;
    }

    setProcessingStage('processing');

    try {
      await checkout(safePlan);
      setProcessingStage('success');
    } catch {
      setProcessingStage('idle');
    }
  };

  const confirmButtonText = useMemo(() => {
    if (processingStage === 'processing') {
      return (
        <span className={styles.buttonState}>
          <Spinner size="sm" color="white" />
          Activating your account...
        </span>
      );
    }

    if (processingStage === 'success') {
      return '✓ Activated! Taking you to your dashboard...';
    }

    return 'Confirm subscription';
  }, [processingStage]);

  return (
    <SubscribeLayout>
      <div className={styles.page}>
        <motion.header className={styles.pageHeader} variants={pageVariants} initial="initial" animate="animate" transition={pageTransition}>
          <h1 className={styles.heading}>Complete your subscription</h1>
          <p className={styles.subtext}>You&apos;re one step away from joining 3,420+ members.</p>
        </motion.header>

        <div className={styles.layout}>
          <section className={styles.main}>
            <div>
              <h2 className={styles.sectionHeading}>Choose your plan</h2>
              <div className={styles.planCards}>
                {(['monthly', 'yearly'] as PlanId[]).map((plan) => {
                  const isSelected = safePlan === plan;
                  const isYearly = plan === 'yearly';
                  const borderColor = isSelected ? 'var(--color-accent)' : 'var(--color-border)';

                  return (
                    <motion.div
                      key={plan}
                      role="button"
                      tabIndex={0}
                      className={`${styles.planCard} ${isSelected ? styles.planCardSelected : styles.planCardUnselected}`}
                      animate={{ borderColor }}
                      transition={{ duration: 0.2 }}
                      onClick={() => setSelectedPlan(plan)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          setSelectedPlan(plan);
                        }
                      }}
                    >
                      {isYearly ? <span className={styles.popularBadge}>Most popular</span> : null}

                      <span className={`${styles.radioCircle} ${isSelected ? styles.radioCircleSelected : ''}`}>
                        <AnimatePresence>
                          {isSelected ? (
                            <motion.span
                              className={styles.radioFill}
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              exit={{ scale: 0 }}
                              transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                            />
                          ) : null}
                        </AnimatePresence>
                      </span>

                      <div className={styles.planInfo}>
                        <p className={styles.planName}>{PLANS[plan].label}</p>
                        <p className={styles.planBilling}>Billed every {plan === 'monthly' ? 'month' : 'year'} · Cancel anytime</p>
                      </div>

                      <div className={styles.planPrice}>
                        <strong className={styles.planAmount}>{plan === 'monthly' ? '£9.99' : '£89.99'}</strong>
                        <span className={styles.planInterval}>{plan === 'monthly' ? '/ month' : '/ year'}</span>
                        {isYearly ? <span className={styles.planSaving}>Save £29.89 vs monthly</span> : null}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            <div>
              <h2 className={styles.sectionHeading}>Order summary</h2>
              <Card className={styles.summaryCard} padding="lg">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={safePlan}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 4 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>GolfGive {safePlan === 'monthly' ? 'Monthly' : 'Yearly'}</span>
                      <span className={styles.summaryValue}>{formatMoney(planAmount)}</span>
                    </div>

                    <div className={styles.summaryRow}>
                      <span className={styles.summaryLabel}>
                        Charity contribution (10%)
                        <span className={styles.charityBadge}>
                          <Badge variant="info" size="sm">
                            {charityName}
                          </Badge>
                        </span>
                      </span>
                      <span className={styles.summaryValue}>{formatMoney(charityContribution)}</span>
                    </div>

                    <div className={styles.summaryDivider} />

                    <div className={`${styles.summaryRow} ${styles.summaryRowTotal}`}>
                      <span className={styles.summaryValue}>Total today</span>
                      <span className={`${styles.summaryValue} ${styles.summaryValueTotal}`}>{formatMoney(planAmount)}</span>
                    </div>

                    <p className={styles.renewalNote}>
                      Renews {safePlan === 'monthly' ? 'monthly' : 'yearly'}. Cancel anytime from your dashboard.
                    </p>
                  </motion.div>
                </AnimatePresence>
              </Card>
            </div>
          </section>

          <aside className={styles.sidebar}>
            <Card className={styles.confirmCard} padding="lg">
              <AnimatePresence mode="wait">
                {processingStage === 'idle' ? (
                  <motion.div key="idle" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <h2 className={styles.confirmHeading}>Ready to start?</h2>
                    <p className={styles.confirmSubtext}>
                      Click below to activate your {safePlan} subscription instantly. No card details needed for demo.
                    </p>

                    <div className={styles.demoNotice}>
                      <p className={styles.demoNoticeLabel}>Demo mode</p>
                      <p className={styles.demoNoticeText}>
                        Payment processing is simulated. Your subscription will be activated instantly.
                      </p>
                    </div>

                    <p className={styles.includedHeading}>What&apos;s included</p>
                    <motion.ul className={styles.benefitsList} variants={containerVariants} initial="initial" animate="animate">
                      {BENEFITS.map((benefit) => (
                        <motion.li key={benefit} variants={itemVariants} className={styles.benefitRow}>
                          <span className={styles.benefitCheck} aria-hidden="true">
                            ✓
                          </span>
                          <span className={styles.benefitText}>{benefit}</span>
                        </motion.li>
                      ))}
                    </motion.ul>

                    <div className={styles.confirmDivider} />

                    <Button
                      variant="primary"
                      size="lg"
                      fullWidth
                      onClick={handleConfirm}
                      disabled={isPending || processingStage !== 'idle'}
                    >
                      {confirmButtonText}
                    </Button>

                    <p className={styles.confirmNote}>Cancel anytime · No hidden fees · Instant access</p>
                  </motion.div>
                ) : null}

                {processingStage === 'processing' ? (
                  <motion.div key="processing" className={styles.processingContent} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <Spinner size="lg" color="accent" />
                    <h3 className={styles.processingTitle}>Activating your subscription...</h3>

                    <div className={styles.processingSteps}>
                      <AnimatePresence>
                        {PROCESSING_STEPS.slice(0, visibleSteps).map((step, index) => {
                          const completed = visibleSteps > index + 1;

                          return (
                            <motion.div
                              key={step.id}
                              className={styles.processingStep}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ duration: 0.3 }}
                            >
                              <AnimatePresence mode="wait" initial={false}>
                                {completed ? (
                                  <motion.span
                                    key="done"
                                    className={styles.processingCheck}
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    exit={{ scale: 0 }}
                                    transition={{ type: 'spring', stiffness: 380, damping: 28 }}
                                  >
                                    ✓
                                  </motion.span>
                                ) : (
                                  <motion.span
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                  >
                                    <Spinner size="sm" color="accent" />
                                  </motion.span>
                                )}
                              </AnimatePresence>
                              <span className={styles.processingStepText}>{step.label}</span>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  </motion.div>
                ) : null}

                {processingStage === 'success' ? (
                  <motion.div key="success" className={styles.successContent} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
                    <motion.div
                      className={styles.successIcon}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                    >
                      ✓
                    </motion.div>
                    <h3 className={styles.successTitle}>You&apos;re all set!</h3>
                    <p className={styles.successSubtext}>
                      Your {safePlan} subscription is now active. Taking you to your dashboard...
                    </p>
                    <div className={styles.progressBar}>
                      <motion.div
                        className={styles.progressFill}
                        initial={{ scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        style={{ originX: 0 }}
                        transition={{ duration: 1.5, ease: 'linear' }}
                      />
                    </div>
                    <p className={styles.redirectText}>Redirecting...</p>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </Card>

            <motion.div className={styles.trustGrid} variants={containerVariants} initial="initial" animate="animate">
              {TRUST_ITEMS.map((item) => (
                <motion.div key={item.label} className={styles.trustItem} variants={itemVariants}>
                  <span className={styles.trustIcon} aria-hidden="true">
                    <svg viewBox="0 0 16 16" className={styles.trustSvg}>
                      <path d={item.path} fill="currentColor" />
                    </svg>
                  </span>
                  <p className={styles.trustText}>{item.label}</p>
                </motion.div>
              ))}
            </motion.div>
          </aside>
        </div>
      </div>
    </SubscribeLayout>
  );
};
