import { useMemo, useRef } from 'react';
import { AnimatePresence, motion, useInView } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link, useNavigate } from 'react-router-dom';
import { PublicLayout } from '../../../components/layout';
import { Avatar, Badge, Button, Card } from '../../../components/ui';
import { useFeaturedCharities } from '../../../hooks/useCharities';
import * as animations from '../../../lib/animations';
import { ROUTES } from '../../../lib/constants';
import { formatCurrency } from '../../../lib/utils';
import styles from './HomePage.module.css';

gsap.registerPlugin(ScrollTrigger);

type Stat = {
  label: string;
  value: number;
  prefix: string;
};

type HowItWorksStep = {
  step: string;
  title: string;
  description: string;
};

type Charity = {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
  totalRaised: number;
};

type Testimonial = {
  id: string;
  name: string;
  role: string;
  quote: string;
  initials: string;
};

type PrizeTier = {
  id: string;
  name: string;
  barLabel: string;
  percentage: number;
  description: string;
  color: string;
};

const STATS: Stat[] = [
  { label: 'Total raised for charity', value: 284500, prefix: '£' },
  { label: 'Active members', value: 3420, prefix: '' },
  { label: 'Prize draws completed', value: 18, prefix: '' },
  { label: 'Charities supported', value: 24, prefix: '' },
];

const HOW_IT_WORKS_STEPS: HowItWorksStep[] = [
  {
    step: '01',
    title: 'Subscribe to play',
    description:
      'Choose a monthly or yearly plan. A portion of every subscription goes directly to your chosen charity.',
  },
  {
    step: '02',
    title: 'Enter your golf scores',
    description:
      'Log your last 5 Stableford scores after each round. Your scores become your draw numbers.',
  },
  {
    step: '03',
    title: 'Monthly prize draw',
    description:
      'Every month we draw 5 numbers. Match 3, 4, or all 5 of your scores to win your share of the prize pool.',
  },
  {
    step: '04',
    title: 'Win and give back',
    description:
      'Winners take home real cash prizes. Meanwhile your subscription keeps funding the charity you care about.',
  },
];

const TESTIMONIALS: Testimonial[] = [
  {
    id: '1',
    name: 'James Whitfield',
    role: 'Member since 2024',
    quote:
      'Won £340 in the March draw and knew my subscription was already helping the Golf Foundation. Best of both worlds.',
    initials: 'JW',
  },
  {
    id: '2',
    name: "Sarah O'Brien",
    role: 'Member since 2024',
    quote:
      'I play every week anyway. This just makes it mean something more. The charity connection is what sold me.',
    initials: 'SO',
  },
  {
    id: '3',
    name: 'Mark Patel',
    role: 'Member since 2025',
    quote: 'Matched 4 numbers last month. £180 in my account the same week. The platform is dead simple to use.',
    initials: 'MP',
  },
];

const MONTHLY_POOL = 34180;

const PRIZE_TIERS: PrizeTier[] = [
  {
    id: 'five',
    name: '5 number match',
    barLabel: '5 match - Jackpot',
    percentage: 40,
    description: 'Jackpot - rolls over if unclaimed',
    color: 'var(--color-accent)',
  },
  {
    id: 'four',
    name: '4 number match',
    barLabel: '4 match - Shared',
    percentage: 35,
    description: 'Split between all 4-match winners',
    color: '#7F77DD',
  },
  {
    id: 'three',
    name: '3 number match',
    barLabel: '3 match - Shared',
    percentage: 25,
    description: 'Split between all 3-match winners',
    color: '#1D9E75',
  },
];

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

const formatNumber = (value: number, prefix = ''): string => {
  return `${prefix}${value.toLocaleString('en-GB')}`;
};

export const HomePage = () => {
  const navigate = useNavigate();
  const { data: featuredApi = [] } = useFeaturedCharities();
  const heroRef = useRef<HTMLElement | null>(null);
  const statsSectionRef = useRef<HTMLElement | null>(null);
  const statsValueRefs = useRef<Array<HTMLParagraphElement | null>>([]);
  const prizeSectionRef = useRef<HTMLElement | null>(null);
  const prizeTotalRef = useRef<HTMLParagraphElement | null>(null);

  const heroInView = useInView(heroRef, { margin: '-120px', amount: 0.4 });

  const tierAmounts = useMemo(
    () =>
      PRIZE_TIERS.map((tier) => ({
        ...tier,
        amount: Math.round((MONTHLY_POOL * tier.percentage) / 100),
      })),
    [],
  );

  const featuredCharities = useMemo<Charity[]>(
    () =>
      featuredApi.map((charity) => ({
        id: charity.id,
        name: charity.name,
        description: charity.description,
        imageUrl: charity.imageUrl,
        totalRaised: 0,
      })),
    [featuredApi],
  );

  useGSAP(
    () => {
      STATS.forEach((stat, index) => {
        const statElement = statsValueRefs.current[index];

        if (!statElement) {
          return;
        }

        gsap.to(statElement, {
          textContent: stat.value,
          duration: 2,
          delay: index * 0.15,
          ease: 'power2.out',
          snap: { textContent: 1 },
          scrollTrigger: {
            trigger: statsSectionRef.current,
            start: 'top 80%',
            once: true,
          },
          onUpdate: () => {
            const nextValue = Number(statElement.textContent ?? 0);
            statElement.textContent = formatNumber(nextValue, stat.prefix);
          },
        });
      });
    },
    { scope: statsSectionRef },
  );

  useGSAP(
    () => {
      if (!prizeTotalRef.current) {
        return;
      }

      gsap.to(prizeTotalRef.current, {
        textContent: MONTHLY_POOL,
        duration: 2,
        ease: 'power2.out',
        snap: { textContent: 1 },
        scrollTrigger: {
          trigger: prizeSectionRef.current,
          start: 'top 75%',
          once: true,
        },
        onUpdate: () => {
          if (prizeTotalRef.current) {
            const nextValue = Number(prizeTotalRef.current.textContent ?? 0);
            prizeTotalRef.current.textContent = formatNumber(nextValue, '£');
          }
        },
      });
    },
    { scope: prizeSectionRef },
  );

  return (
    <PublicLayout navbarTransparent={true}>
      <main>
        <section ref={heroRef} className={styles.hero}>
          <div className={styles.heroBg} />
          <div className={styles.heroContent}>
            <motion.div
              className={styles.heroPill}
              variants={animations.fadeInVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.4, delay: 0.1 }}
            >
              <span>Monthly prize draws · Real charity impact</span>
            </motion.div>

            <h1 className={styles.heroHeadline}>
              <motion.span
                className={styles.heroHeadlineLine}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: EASE_OUT }}
              >
                Play golf.
              </motion.span>
              <motion.span
                className={styles.heroHeadlineLine}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.35, ease: EASE_OUT }}
              >
                Win prizes.
              </motion.span>
              <motion.span
                className={styles.heroHeadlineLineAccent}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5, ease: EASE_OUT }}
              >
                Change lives.
              </motion.span>
            </h1>

            <motion.p
              className={styles.heroSubtitle}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6, ease: EASE_OUT }}
            >
              Subscribe, enter your Stableford scores, and compete in monthly prize draws while every subscription
              funds a charity you believe in.
            </motion.p>

            <motion.div
              className={styles.heroCta}
              variants={animations.slideUpVariants}
              initial="initial"
              animate="animate"
              transition={{ duration: 0.5, delay: 0.75, ease: EASE_OUT }}
            >
              <Button variant="primary" size="lg" onClick={() => navigate(ROUTES.SIGNUP)}>
                Start playing
              </Button>
              <Link to={ROUTES.HOW_IT_WORKS} className={styles.ghostWhite}>
                See how it works
              </Link>
            </motion.div>
          </div>

          <AnimatePresence>
            {heroInView ? (
              <motion.div
                className={styles.scrollIndicator}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1, y: [0, 8, 0] }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1.4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
              >
                <span>Scroll</span>
                <span aria-hidden="true">↓</span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </section>

        <section ref={statsSectionRef} className={styles.stats}>
          <div className={styles.statsInner}>
            {STATS.map((stat, index) => (
              <div key={stat.label} className={styles.statItem}>
                <p
                  className={styles.statValue}
                  ref={(element) => {
                    statsValueRefs.current[index] = element;
                  }}
                >
                  {formatNumber(0, stat.prefix)}
                </p>
                <p className={styles.statLabel}>{stat.label}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.howItWorks}>
          <div className={styles.sectionInner}>
            <header className={styles.sectionHeader}>
              <p className={styles.sectionEyebrow}>How it works</p>
              <h2 className={styles.sectionHeading}>Simple by design.</h2>
              <p className={styles.sectionSubtitle}>
                Four steps to playing for prizes while funding causes you care about.
              </p>
            </header>

            <div className={styles.stepsGrid}>
              {HOW_IT_WORKS_STEPS.map((step, index) => (
                <motion.div
                  key={step.step}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-50px' }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  whileHover={{ y: -4 }}
                >
                  <Card padding="lg" className={styles.stepCard}>
                    <span className={styles.stepNumber}>{step.step}</span>
                    <h3 className={styles.stepTitle}>{step.title}</h3>
                    <p className={styles.stepDesc}>{step.description}</p>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        <section ref={prizeSectionRef} className={styles.prizePool}>
          <div className={styles.prizePoolInner}>
            <div>
              <p className={`${styles.sectionEyebrow} ${styles.prizeEyebrow}`}>Monthly draws</p>
              <h2 className={`${styles.sectionHeading} ${styles.prizeHeading}`}>Real prizes. Every month.</h2>
              <p className={styles.prizeSubtitle}>
                Our prize pool grows with every subscription. Three ways to win each month.
              </p>

              <div className={styles.tierList}>
                {tierAmounts.map((tier, index) => (
                  <motion.div
                    key={tier.id}
                    className={styles.tierRow}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: index * 0.12 }}
                  >
                    <span className={styles.tierDot} style={{ backgroundColor: tier.color }} />
                    <div>
                      <p className={styles.tierName}>{tier.name}</p>
                      <p className={styles.tierPct}>{tier.percentage}% of pool</p>
                      <p className={styles.tierDesc}>{tier.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className={styles.poolCard}>
              <p className={styles.poolCardTitle}>This month&apos;s pool</p>
              <p ref={prizeTotalRef} className={styles.poolTotal}>
                £0
              </p>
              <p className={styles.poolSubtitle}>Based on 3,420 active members</p>

              <div className={styles.tierBars}>
                {tierAmounts.map((tier, index) => (
                  <div key={`${tier.id}-bar`} className={styles.tierBarRow}>
                    <div className={styles.tierBarMeta}>
                      <span className={styles.tierBarLabel}>{tier.barLabel}</span>
                      <span className={styles.tierBarAmount}>{formatCurrency(tier.amount * 100)}</span>
                    </div>
                    <div className={styles.tierBarTrack}>
                      <motion.div
                        className={styles.tierBarFill}
                        style={{ backgroundColor: tier.color, width: `${tier.percentage}%`, originX: 0 }}
                        initial={{ scaleX: 0 }}
                        whileInView={{ scaleX: 1 }}
                        viewport={{ once: true, margin: '-80px' }}
                        transition={{ duration: 0.8, delay: index * 0.2, ease: EASE_OUT }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className={styles.charities}>
          <div className={styles.sectionInner}>
            <header className={styles.charitiesHeader}>
              <div>
                <p className={styles.sectionEyebrow}>Our charities</p>
                <h2 className={styles.sectionHeading}>Your subscription, their impact.</h2>
              </div>
              <Link to={ROUTES.CHARITIES} className={styles.charityLink}>
                Browse all charities →
              </Link>
            </header>

            <motion.div
              className={styles.charitiesGrid}
              variants={animations.containerVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-60px' }}
            >
              {featuredCharities.map((charity) => (
                <motion.article
                  key={charity.id}
                  className={styles.charityCard}
                  variants={animations.itemVariants}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.25 }}
                >
                  <img src={charity.imageUrl} alt={charity.name} className={styles.charityImage} loading="lazy" />
                  <div className={styles.charityBody}>
                    <Badge variant="info" size="sm">
                      Featured
                    </Badge>
                    <h3 className={styles.charityName}>{charity.name}</h3>
                    <p className={styles.charityDesc}>{charity.description}</p>
                    <div className={styles.charityRaised}>
                      <span className={styles.charityRaisedLabel}>Total raised</span>
                      <span className={styles.charityRaisedAmount}>{formatCurrency(charity.totalRaised * 100)}</span>
                    </div>
                    <Link to={ROUTES.CHARITY(charity.id)} className={styles.charityLink}>
                      Learn more →
                    </Link>
                  </div>
                </motion.article>
              ))}
            </motion.div>
          </div>
        </section>

        <section className={styles.testimonials}>
          <div className={styles.sectionInner}>
            <header className={styles.sectionHeader}>
              <p className={styles.sectionEyebrow}>Members</p>
              <h2 className={styles.sectionHeading}>From the fairway to the feed.</h2>
            </header>

            <motion.div
              className={styles.testimonialsGrid}
              variants={animations.containerVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-60px' }}
            >
              {TESTIMONIALS.map((testimonial) => (
                <motion.div key={testimonial.id} variants={animations.itemVariants} whileHover={{ y: -4 }}>
                  <Card padding="lg" className={styles.testimonialCard}>
                    <span className={styles.quoteDecor} aria-hidden="true">
                      “
                    </span>
                    <p className={styles.quoteText}>{testimonial.quote}</p>
                    <div className={styles.testimonialAuthor}>
                      <Avatar name={testimonial.name} size="md" />
                      <div>
                        <p className={styles.authorName}>{testimonial.name}</p>
                        <p className={styles.authorRole}>{testimonial.role}</p>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className={styles.finalCta}>
          <motion.div
            className={styles.finalCtaInner}
            variants={animations.slideUpVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
          >
            <h2 className={styles.finalCtaHeading}>Ready to play for purpose?</h2>
            <p className={styles.finalCtaSubtitle}>
              Join 3,420 members already playing, winning, and giving back.
            </p>
            <div className={styles.finalCtaButtons}>
              <Button variant="primary" size="lg" onClick={() => navigate(ROUTES.SIGNUP)}>
                Start playing today
              </Button>
              <Link to={ROUTES.PRICING} className={styles.ghostWhite}>
                View pricing
              </Link>
            </div>
            <p className={styles.finalCtaNote}>Cancel anytime · No hidden fees · Instant access</p>
          </motion.div>
        </section>
      </main>
    </PublicLayout>
  );
};
