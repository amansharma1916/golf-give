import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../../components/ui';
import { ROUTES } from '../../../lib/constants';
import { containerVariants, itemVariants, pageVariants, slideUpVariants } from '../../../lib/animations';
import styles from './HowItWorksPage.module.css';

type StepSide = 'left' | 'right';

type DetailedStep = {
  step: string;
  title: string;
  subtitle: string;
  description: string;
  highlight: string;
  side: StepSide;
};

type FaqItem = {
  question: string;
  answer: string;
};

const DETAILED_STEPS: DetailedStep[] = [
  {
    step: '01',
    title: 'Choose your plan',
    subtitle: 'Monthly or yearly subscription',
    description:
      'Pick the plan that works for you. Monthly gives you flexibility. Yearly saves you £29.89 and locks in your rate. Either way, a minimum of 10% of your subscription goes directly to your chosen charity — you can increase this at any time.',
    highlight: 'From £9.99 / month',
    side: 'left',
  },
  {
    step: '02',
    title: 'Select your charity',
    subtitle: 'You choose where your contribution goes',
    description:
      'Browse our directory of vetted charities. Pick the one that matters most to you. Your chosen charity receives your contribution every month automatically. You can change your charity at any time from your dashboard.',
    highlight: '24 charities to choose from',
    side: 'right',
  },
  {
    step: '03',
    title: 'Log your golf scores',
    subtitle: 'Stableford format, 1 to 45',
    description:
      'After each round, log your Stableford score in your dashboard. We keep your last 5 scores. When you add a 6th, the oldest is automatically removed. Your 5 active scores are your draw numbers each month.',
    highlight: 'Up to 5 scores at a time',
    side: 'left',
  },
  {
    step: '04',
    title: 'The monthly draw',
    subtitle: 'Five numbers drawn every month',
    description:
      "On the last day of each month, five numbers between 1 and 45 are drawn. We compare the winning numbers against every active subscriber's 5 scores. Match 3, 4, or all 5 to win your share of the prize pool.",
    highlight: 'Last day of every month',
    side: 'right',
  },
  {
    step: '05',
    title: 'Win cash prizes',
    subtitle: 'Three tiers of winning',
    description:
      'Match 3 numbers and you win a share of 25% of the prize pool. Match 4 and you win a share of 35%. Match all 5 and you win a share of the jackpot — 40% of the pool. If nobody matches all 5, the jackpot rolls over to next month.',
    highlight: 'Jackpot rolls over if unclaimed',
    side: 'left',
  },
  {
    step: '06',
    title: 'Verify and get paid',
    subtitle: 'Simple winner verification',
    description:
      'Winners are notified by email. Upload a screenshot of your scores from your golf club or app as proof. Once verified by our team, your winnings are transferred to your account. Straightforward, transparent, fast.',
    highlight: 'Paid within 5 working days',
    side: 'right',
  },
];

const FAQS: FaqItem[] = [
  {
    question: 'How are the winning numbers chosen?',
    answer:
      'Each month we use either a standard random draw or a weighted algorithm based on score frequency across all members. The draw type is set by our admin team and shown on the draws page.',
  },
  {
    question: 'What if multiple people match 5 numbers?',
    answer:
      'The jackpot prize is split equally between all 5-match winners. The same applies to 4-match and 3-match tiers.',
  },
  {
    question: 'What happens to the jackpot if nobody wins?',
    answer:
      "If no member matches all 5 numbers in a given month, the jackpot rolls over and is added to the following month's 5-match pool — making it even bigger.",
  },
  {
    question: 'Can I change my charity?',
    answer:
      'Yes. You can change your selected charity at any time from your dashboard. The change takes effect from the next subscription cycle.',
  },
  {
    question: 'Can I increase my charity contribution?',
    answer:
      'Absolutely. The minimum is 10% of your subscription fee but you can increase it up to 100% — meaning your entire subscription goes to your charity.',
  },
  {
    question: 'What is Stableford scoring?',
    answer:
      'Stableford is a golf scoring system where points are awarded based on your score relative to par on each hole. A typical round produces a score between 20 and 45 points. It is the most widely used format in recreational golf.',
  },
];

const EASE_OUT: [number, number, number, number] = [0.22, 1, 0.36, 1];

export const HowItWorksPage = () => {
  const navigate = useNavigate();
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  return (
    <main>
      <section className={styles.pageHero}>
        <div className={styles.pageHeroBg} />
        <motion.div className={styles.pageHeroInner} variants={pageVariants} initial="initial" animate="animate">
          <p className={styles.pageHeroEyebrow}>How it works</p>
          <h1 className={styles.pageHeroTitle}>Everything you need to know.</h1>
          <p className={styles.pageHeroSubtitle}>Six simple steps from signing up to collecting your winnings.</p>
        </motion.div>
      </section>

      <section className={styles.steps}>
        <div className={styles.stepsInner}>
          {DETAILED_STEPS.map((step, index) => {
            const isReversed = step.side === 'right';
            const textInitialX = step.side === 'left' ? -30 : 30;
            const visualInitialX = step.side === 'left' ? 30 : -30;

            return (
              <div key={step.step}>
                <div className={`${styles.stepRow} ${isReversed ? styles.stepRowReversed : ''}`}>
                  <motion.div
                    className={styles.stepText}
                    initial={{ opacity: 0, x: textInitialX }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, ease: EASE_OUT }}
                  >
                    <span className={styles.stepBadge}>{step.step}</span>
                    <h2 className={styles.stepTitle}>{step.title}</h2>
                    <p className={styles.stepSubtitle}>{step.subtitle}</p>
                    <p className={styles.stepDesc}>{step.description}</p>
                  </motion.div>

                  <motion.div
                    className={styles.stepVisual}
                    initial={{ opacity: 0, x: visualInitialX }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, margin: '-80px' }}
                    transition={{ duration: 0.5, delay: 0.15, ease: EASE_OUT }}
                  >
                    <div className={styles.stepCard}>
                      <span className={styles.stepCardDecor} aria-hidden="true">
                        {step.step}
                      </span>
                      <p className={styles.stepHighlight}>{step.highlight}</p>
                    </div>
                  </motion.div>
                </div>

                {index < DETAILED_STEPS.length - 1 ? (
                  <div className={styles.stepConnector} aria-hidden="true">
                    <div className={styles.connectorLine} />
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.faq}>
        <div className={styles.faqInner}>
          <header className={styles.faqHeader}>
            <p className={styles.sectionEyebrow}>FAQ</p>
            <h2 className={styles.sectionHeading}>Common questions.</h2>
          </header>

          <motion.div
            className={styles.faqList}
            variants={containerVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
          >
            {FAQS.map((faq, index) => {
              const isOpen = openFaqIndex === index;

              return (
                <motion.div key={faq.question} variants={itemVariants} className={styles.faqItem}>
                  <button
                    type="button"
                    className={styles.faqQuestionRow}
                    onClick={() => setOpenFaqIndex((prev) => (prev === index ? null : index))}
                    aria-expanded={isOpen}
                  >
                    <span className={styles.faqQuestion}>{faq.question}</span>
                    <motion.span
                      className={styles.faqIcon}
                      animate={{ rotate: isOpen ? 45 : 0 }}
                      transition={{ duration: 0.2, ease: EASE_OUT }}
                    >
                      +
                    </motion.span>
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen ? (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE_OUT }}
                        className={styles.faqAnswerWrap}
                      >
                        <p className={styles.faqAnswer}>{faq.answer}</p>
                      </motion.div>
                    ) : null}
                  </AnimatePresence>
                </motion.div>
              );
            })}
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
          <h2 className={styles.finalCtaHeading}>Ready to start playing?</h2>
          <p className={styles.finalCtaSubtitle}>Join thousands of golfers already playing for purpose.</p>
          <div className={styles.finalCtaButtons}>
            <Button variant="primary" size="lg" onClick={() => navigate(ROUTES.SIGNUP)}>
              Get started
            </Button>
            <Link to={ROUTES.PRICING} className={styles.ghostWhite}>
              View pricing
            </Link>
          </div>
        </motion.div>
      </section>
    </main>
  );
};
