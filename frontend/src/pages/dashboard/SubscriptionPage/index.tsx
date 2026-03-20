import { useCallback, useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { PageHeader } from '../../../components/layout';
import { Badge, Button, Modal, Spinner } from '../../../components/ui';
import { slideUpVariants } from '../../../lib/animations';
import { PLANS, ROUTES, type PlanId } from '../../../lib/constants';
import { MOCK_MEMBER_USER, MOCK_SUBSCRIPTION } from '../../../lib/mockData';
import { formatDate } from '../../../lib/utils';
import { useToastStore } from '../../../stores/toastStore';
import { useUserStore } from '../../../stores/userStore';
import styles from './SubscriptionPage.module.css';

const ChevronIcon = ({ isOpen }: { isOpen: boolean }) => (
  <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
    ▾
  </motion.span>
);

const summaryItems = [
  { label: 'Draws entered', value: '18 draws' },
  { label: 'Total won', value: '£839.34' },
];

export const SubscriptionPage = () => {
  const navigate = useNavigate();
  const addToast = useToastStore((state) => state.addToast);
  const user = useUserStore((state) => state.user);
  const subscription = useUserStore((state) => state.subscription);
  const setSubscription = useUserStore((state) => state.setSubscription);

  const activeUser = user ?? MOCK_MEMBER_USER;
  const activeSubscription = subscription ?? MOCK_SUBSCRIPTION;

  const [selectedPlan, setSelectedPlan] = useState<PlanId>(activeSubscription.plan);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);
  const [isCancelOpen, setIsCancelOpen] = useState(false);

  const renewalDate = formatDate(activeSubscription.currentPeriodEnd);
  const isPlanChanged = selectedPlan !== activeSubscription.plan;

  const billingProgress = useMemo(() => {
    const end = new Date(activeSubscription.currentPeriodEnd).getTime();
    const start = end - (activeSubscription.plan === 'monthly' ? 30 : 365) * 24 * 60 * 60 * 1000;
    const now = Date.now();
    const elapsed = Math.max(0, Math.min(now - start, end - start));
    const total = Math.max(1, end - start);
    return Math.round((elapsed / total) * 100);
  }, [activeSubscription.currentPeriodEnd, activeSubscription.plan]);

  const daysLeft = Math.max(0, Math.ceil((new Date(activeSubscription.currentPeriodEnd).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));

  const handleCloseModal = useCallback(() => {
    setIsUpdatingPlan(false);
  }, []);

  const handleUpdatePlan = async () => {
    if (!isPlanChanged) return;

    setIsUpdatingPlan(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    setSubscription({
      ...activeSubscription,
      plan: selectedPlan,
    });
    addToast({ type: 'success', message: `Plan updated to ${PLANS[selectedPlan].label} successfully!` });
    setIsUpdatingPlan(false);
  };

  const keepSubscription = () => setIsCancelOpen(false);

  const cancelSubscription = async () => {
    setIsUpdatingPlan(true);
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    setSubscription({
      ...activeSubscription,
      status: 'cancelled',
    });
    setIsCancelOpen(false);
    addToast({
      type: 'warning',
      message: `Subscription cancelled. Access ends ${formatDate(activeSubscription.currentPeriodEnd)}`,
    });
    setIsUpdatingPlan(false);
    await new Promise((resolve) => window.setTimeout(resolve, 1000));
    navigate(ROUTES.PRICING);
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="My subscription"
        subtitle="Manage your plan, billing, and account access."
      />

      <section className={styles.layout}>
        <div className={styles.leftCol}>
          <motion.article className={styles.planHeroCard} variants={slideUpVariants} initial="initial" animate="animate">
            <div className={styles.topRow}>
              <span className={styles.planLabel}>Current plan</span>
              <span className={styles.activePill}>
                <span className={styles.activeDot} />
                Active
              </span>
            </div>

            <h3 className={styles.planName}>{activeSubscription.plan === 'monthly' ? 'Monthly plan' : 'Yearly plan'}</h3>
            <p className={styles.planPrice}>{activeSubscription.plan === 'monthly' ? '£9.99 / month' : '£89.99 / year'}</p>

            <p className={styles.renewRow}>Renews on {renewalDate}</p>

            <div className={styles.billingProgress}>
              <div className={styles.progressTop}>
                <span>Billing period</span>
                <span>{daysLeft} days remaining</span>
              </div>
              <div className={styles.progressTrack}>
                <motion.div
                  className={styles.progressFill}
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.8 }}
                  style={{ transformOrigin: 'left center', width: `${billingProgress}%` }}
                />
              </div>
            </div>

            <p className={styles.subSince}>Subscribed since {formatDate(activeUser.createdAt)}</p>
          </motion.article>

          <section className={styles.changeSection}>
            <h3>Change your plan</h3>
            <div className={styles.planOptions}>
              {(['monthly', 'yearly'] as PlanId[]).map((plan) => {
                const selected = selectedPlan === plan;
                return (
                  <button
                    key={plan}
                    type="button"
                    className={`${styles.planOption} ${selected ? styles.planOptionSelected : ''}`}
                    onClick={() => setSelectedPlan(plan)}
                  >
                    <span className={styles.radioDot}>{selected ? '●' : '○'}</span>
                    <div>
                      <p className={styles.optionName}>{PLANS[plan].label} {plan === 'monthly' ? '£9.99/mo' : '£89.99/yr'}</p>
                      <p className={styles.optionSub}>{selected ? 'Current selection' : 'Switch to this plan'}</p>
                    </div>
                    {plan === 'yearly' ? <Badge variant="info" size="sm">Save £29.89</Badge> : null}
                  </button>
                );
              })}
            </div>

            <Button variant="primary" size="md" disabled={!isPlanChanged} onClick={handleUpdatePlan}>
              Update plan
            </Button>

            <div className={styles.cancelSection}>
              <button type="button" className={styles.cancelTrigger} onClick={() => setIsCancelOpen((prev) => !prev)}>
                <span>Cancel subscription</span>
                <ChevronIcon isOpen={isCancelOpen} />
              </button>

              <AnimatePresence initial={false}>
                {isCancelOpen ? (
                  <motion.div
                    className={styles.cancelBody}
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                  >
                    <div className={styles.cancelWarning}>
                      <h4>Are you sure you want to cancel?</h4>
                      <ul className={styles.cancelList}>
                        <li className={styles.cancelListItem}>Access to monthly prize draws</li>
                        <li className={styles.cancelListItem}>Score tracking dashboard</li>
                        <li className={styles.cancelListItem}>Charity contributions will stop</li>
                        <li className={styles.cancelListItem}>Draw history access</li>
                      </ul>
                      <Button variant="secondary" size="md" fullWidth onClick={keepSubscription}>
                        Keep my subscription
                      </Button>
                      <Button variant="danger" size="md" fullWidth onClick={cancelSubscription}>
                        Yes, cancel subscription
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </div>
          </section>
        </div>

        <aside className={styles.sideCard}>
          <div className={styles.summaryRow}>
            <span className={styles.summaryLabel}>Member since</span>
            <span className={styles.summaryValue}>{formatDate(activeUser.createdAt)}</span>
          </div>
          {summaryItems.map((item) => (
            <div key={item.label} className={styles.summaryRow}>
              <span className={styles.summaryLabel}>{item.label}</span>
              <span className={styles.summaryValue}>{item.value}</span>
            </div>
          ))}

          <div className={styles.quickActions}>
            <h4>Quick actions</h4>
            <Link to={ROUTES.DRAWS} className={styles.quickLink}>View draw history →</Link>
            <Link to={ROUTES.WINNINGS} className={styles.quickLink}>My winnings →</Link>
            <Link to={ROUTES.MY_CHARITY} className={styles.quickLink}>Change charity →</Link>
            <Link to={ROUTES.SCORES} className={styles.quickLink}>Update scores →</Link>
          </div>

          <div className={styles.helpCard}>
            <h5>Questions about your plan?</h5>
            <Link to={ROUTES.HOW_IT_WORKS}>How it works →</Link>
          </div>
        </aside>
      </section>

      <Modal isOpen={isUpdatingPlan} onClose={handleCloseModal} title="Updating plan" size="sm">
        <div className={styles.processingModal}>
          <Spinner size="md" color="accent" />
          <p>Updating your plan...</p>
        </div>
      </Modal>
    </div>
  );
};
