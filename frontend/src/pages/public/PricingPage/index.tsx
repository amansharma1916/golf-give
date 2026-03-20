import { useState } from 'react';
import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui';
import { containerVariants, fadeInVariants, itemVariants, pageVariants, slideUpVariants } from '../../../lib/animations';
import { PLANS, ROUTES, type PlanId } from '../../../lib/constants';
import styles from './PricingPage.module.css';

type PlanOption = {
  id: PlanId;
  name: string;
  amount: string;
  intervalLabel: string;
  description: string;
  savingText?: string;
};

type PrizeTier = {
  label: string;
  share: string;
  name: string;
  color: string;
  description: string;
};

type TrustPoint = {
  label: string;
  description: string;
};

const INCLUDED_FEATURES: string[] = [
  'Monthly prize draw entry',
  'Up to 5 Stableford scores tracked',
  'Charity contribution (min 10%)',
  'Full draw results history',
  'Winner verification dashboard',
  'Email notifications for draw results',
  'Cancel anytime',
];

const PLAN_OPTIONS: PlanOption[] = [
  {
    id: PLANS.monthly.id,
    name: PLANS.monthly.label,
    amount: '£9.99',
    intervalLabel: '/ month',
    description: 'Full access. Cancel anytime.',
  },
  {
    id: PLANS.yearly.id,
    name: PLANS.yearly.label,
    amount: '£89.99',
    intervalLabel: '/ year',
    savingText: '£29.89 cheaper than monthly',
    description: 'Best value. Lock in your rate.',
  },
];

const PRIZE_TIERS: PrizeTier[] = [
  {
    label: '5 number match',
    share: '40%',
    name: 'Jackpot',
    color: 'var(--color-accent)',
    description: 'Rolls over if unclaimed',
  },
  {
    label: '4 number match',
    share: '35%',
    name: 'Major prize',
    color: 'var(--color-info)',
    description: 'Split between winners',
  },
  {
    label: '3 number match',
    share: '25%',
    name: 'Standard prize',
    color: 'var(--color-success)',
    description: 'Split between winners',
  },
];

const TRUST_POINTS: TrustPoint[] = [
  {
    label: 'Cancel anytime',
    description: 'No lock-in contracts',
  },
  {
    label: 'Instant access',
    description: 'Dashboard live immediately after subscribing',
  },
  {
    label: 'Transparent draws',
    description: 'All draw results publicly posted',
  },
  {
    label: 'Verified payouts',
    description: 'Winners confirmed before transfer',
  },
  {
    label: 'Real charity impact',
    description: 'Contributions tracked and reported',
  },
];

export const PricingPage = () => {
  const navigate = useNavigate();
  const [selectedPlan, setSelectedPlan] = useState<PlanId>('monthly');

  const handleGetStarted = (plan: PlanId) => {
    navigate(`${ROUTES.SUBSCRIBE}?plan=${plan}`);
  };

  return (
    <main>
      <section className={styles.pageHero}>
        <div className={styles.pageHeroBg} />
        <motion.div className={styles.pageHeroInner} variants={pageVariants} initial="initial" animate="animate">
          <p className={styles.pageHeroEyebrow}>Pricing</p>
          <h1 className={styles.pageHeroTitle}>Simple, transparent pricing.</h1>
          <p className={styles.pageHeroSubtitle}>One subscription. Prize draws. Charity impact. No surprises.</p>
        </motion.div>
      </section>

      <section className={styles.plansSection}>
        <div className={styles.plansInner}>
          <div className={styles.toggleWrapper}>
            <LayoutGroup>
              <div className={styles.toggle} role="radiogroup" aria-label="Select billing cycle">
                {(Object.keys(PLANS) as PlanId[]).map((planId) => {
                  const isActive = selectedPlan === planId;

                  return (
                    <button
                      key={planId}
                      type="button"
                      role="radio"
                      aria-checked={isActive}
                      onClick={() => setSelectedPlan(planId)}
                      className={`${styles.toggleOption} ${isActive ? styles.toggleActive : styles.toggleInactive}`}
                    >
                      {isActive ? (
                        <motion.div
                          layoutId="planToggleIndicator"
                          className={styles.toggleSlider}
                          transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                        />
                      ) : null}
                      <span className={styles.toggleText}>{PLANS[planId].label}</span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>

            <AnimatePresence mode="wait">
              {selectedPlan === 'yearly' ? (
                <motion.p
                  key="yearly-saving"
                  className={styles.savingBadge}
                  variants={fadeInVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                >
                  Save £29.89 per year
                </motion.p>
              ) : null}
            </AnimatePresence>
          </div>

          <motion.div
            className={styles.plansGrid}
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
          >
            <LayoutGroup>
              {PLAN_OPTIONS.map((plan) => {
                const isSelected = selectedPlan === plan.id;

                return (
                  <motion.div
                    key={plan.id}
                    variants={itemVariants}
                    className={`${styles.planCard} ${isSelected ? styles.planCardHighlighted : ''}`}
                  >
                    {plan.id === 'yearly' ? <span className={styles.popularBadge}>Most popular</span> : null}
                    {isSelected ? (
                      <motion.div
                        layoutId="activePlanBorder"
                        className={styles.selectedPlanBorder}
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    ) : null}

                    <p className={styles.planName}>{plan.name}</p>
                    <p className={styles.planPrice}>
                      <span className={styles.planAmount}>{plan.amount}</span>
                      <span className={styles.planInterval}>{plan.intervalLabel}</span>
                    </p>
                    {plan.savingText ? <p className={styles.planSaving}>{plan.savingText}</p> : null}
                    <p className={styles.planDesc}>{plan.description}</p>

                    <div className={styles.planDivider} />

                    <ul className={styles.featureList}>
                      {INCLUDED_FEATURES.map((feature) => (
                        <li key={`${plan.id}-${feature}`} className={styles.featureItem}>
                          <span className={styles.featureCheck} aria-hidden="true">
                            ✓
                          </span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>

                    <Button
                      variant={isSelected ? 'primary' : 'secondary'}
                      size="lg"
                      fullWidth={true}
                      onClick={() => handleGetStarted(plan.id)}
                    >
                      Get started
                    </Button>
                  </motion.div>
                );
              })}
            </LayoutGroup>
          </motion.div>
        </div>
      </section>

      <section className={styles.prizeTiers}>
        <div className={styles.prizeInner}>
          <header className={styles.sectionHeader}>
            <p className={styles.sectionEyebrow}>Prize pool</p>
            <h2 className={styles.sectionHeading}>How winnings are distributed.</h2>
            <p className={styles.sectionSubtitle}>
              Every subscription contributes to the monthly prize pool. Here&apos;s how it&apos;s split.
            </p>
          </header>

          <motion.div
            className={styles.tierRows}
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
          >
            {PRIZE_TIERS.map((tier) => (
              <motion.div key={tier.label} className={styles.tierRow} variants={itemVariants}>
                <div className={styles.tierLeft}>
                  <span className={styles.tierDot} style={{ background: tier.color }} aria-hidden="true" />
                  <div>
                    <p className={styles.tierName}>{tier.name}</p>
                    <p className={styles.tierMatch}>
                      {tier.label} · {tier.description}
                    </p>
                  </div>
                </div>
                <p className={styles.tierPctBadge}>{tier.share}</p>
              </motion.div>
            ))}
          </motion.div>

          <p className={styles.rolloverNote}>
            If no member matches all 5 numbers, the jackpot rolls over to the following month&apos;s draw — growing until
            someone wins.
          </p>
        </div>
      </section>

      <section className={styles.trust}>
        <div className={styles.trustInner}>
          <motion.div
            className={styles.trustGrid}
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
          >
            {TRUST_POINTS.map((point) => (
              <motion.div key={point.label} variants={itemVariants} className={styles.trustItem}>
                <span className={styles.trustIcon} aria-hidden="true">
                  ✓
                </span>
                <p className={styles.trustLabel}>{point.label}</p>
                <p className={styles.trustDesc}>{point.description}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      <section className={styles.finalCta}>
        <motion.div
          className={styles.finalCtaInner}
          variants={slideUpVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
        >
          <h2 className={styles.finalCtaHeading}>No risk. Real rewards.</h2>
          <p className={styles.finalCtaSubtitle}>Start with monthly, upgrade to yearly whenever you&apos;re ready.</p>
          <div className={styles.finalCtaButtons}>
            <Button variant="primary" size="lg" onClick={() => handleGetStarted(selectedPlan)}>
              Subscribe now
            </Button>
            <Link to={ROUTES.HOW_IT_WORKS} className={styles.ghostWhite}>
              How it works
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
};
