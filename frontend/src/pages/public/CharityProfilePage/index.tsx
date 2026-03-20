import { useMemo, useState } from 'react';
import { Badge, Button, Modal } from '../../../components/ui';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { containerVariants, itemVariants, pageVariants, slideUpVariants } from '../../../lib/animations';
import { ROUTES } from '../../../lib/constants';
import { formatCurrency, formatDate } from '../../../lib/utils';
import styles from './CharityProfilePage.module.css';

type ImpactStat = {
  label: string;
  value: string;
};

type UpcomingEvent = {
  id: string;
  title: string;
  date: string;
  location: string;
  description: string;
  spotsLeft: number;
};

type CharityDetail = {
  id: string;
  name: string;
  category: string;
  tagline: string;
  description: string;
  imageUrl: string;
  galleryImages: string[];
  websiteUrl: string;
  totalRaised: number;
  memberCount: number;
  isFeatured: boolean;
  foundedYear: number;
  impactStats: ImpactStat[];
  upcomingEvents: UpcomingEvent[];
};

const CHARITY_DETAIL: CharityDetail = {
  id: '1',
  name: 'Golf Foundation',
  category: 'Youth & Education',
  tagline: 'Opening golf to every young person in the UK.',
  description: `The Golf Foundation has been at the heart of junior golf development in the UK since 1952. We work with schools, golf clubs, and local authorities to create accessible pathways into the sport for young people from all backgrounds and abilities.

Our flagship Tri-Golf programme has introduced over 2 million children to the sport through schools. Our Golf Tracer programme provides subsidised coaching, equipment, and club membership to talented juniors from low-income families.

We believe golf builds life skills — patience, integrity, resilience, and respect — that extend far beyond the course. Your subscription helps us reach more young people who deserve those opportunities.`,
  imageUrl: 'https://placehold.co/1200x500/1a1a2e/e94560?text=Golf+Foundation',
  galleryImages: [
    'https://placehold.co/600x400/1a1a2e/ffffff?text=Programme+1',
    'https://placehold.co/600x400/16213e/ffffff?text=Programme+2',
    'https://placehold.co/600x400/0f3460/ffffff?text=Programme+3',
  ],
  websiteUrl: 'https://golf-foundation.org.uk',
  totalRaised: 48200,
  memberCount: 312,
  isFeatured: true,
  foundedYear: 1952,
  impactStats: [
    { label: 'Children reached', value: '2M+' },
    { label: 'Golf clubs partnered', value: '1,200' },
    { label: 'Scholarships awarded', value: '840' },
    { label: 'Years operating', value: '72' },
  ],
  upcomingEvents: [
    {
      id: 'e1',
      title: 'Charity Golf Day — St Andrews',
      date: '2026-05-15',
      location: 'St Andrews Links, Fife',
      description:
        'Join us for a charity scramble format golf day at the historic St Andrews Links. All proceeds support our junior development programmes.',
      spotsLeft: 12,
    },
    {
      id: 'e2',
      title: 'Junior Open Day — London',
      date: '2026-06-08',
      location: 'Wentworth Club, Surrey',
      description:
        'A free open day for young people aged 8-18 to try golf for the first time. Equipment and coaching provided.',
      spotsLeft: 28,
    },
    {
      id: 'e3',
      title: 'Annual Golf Foundation Dinner',
      date: '2026-07-22',
      location: 'The Savoy, London',
      description:
        'Our flagship annual fundraising dinner. Special guest speakers, live auction, and three-course meal. Black tie event.',
      spotsLeft: 6,
    },
  ],
};

const getEventBadgeVariant = (spotsLeft: number): 'success' | 'warning' | 'error' => {
  if (spotsLeft > 10) {
    return 'success';
  }

  if (spotsLeft > 0) {
    return 'warning';
  }

  return 'error';
};

const getEventBadgeText = (spotsLeft: number): string => {
  if (spotsLeft <= 0) {
    return 'Full';
  }

  return `${spotsLeft} spots left`;
};

const formatEventParts = (dateString: string): { day: string; month: string } => {
  const date = new Date(dateString);

  return {
    day: new Intl.DateTimeFormat('en-GB', { day: '2-digit' }).format(date),
    month: new Intl.DateTimeFormat('en-GB', { month: 'short' }).format(date),
  };
};

export const CharityProfilePage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const charity = CHARITY_DETAIL;
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  const descriptionParagraphs = useMemo(() => {
    return charity.description.split(/\n\n/).filter(Boolean);
  }, [charity.description]);

  return (
    <main data-charity-id={id ?? charity.id}>
      <section className={styles.hero}>
        <motion.img
          layoutId={`charity-card-${charity.id}`}
          src={charity.imageUrl}
          alt={charity.name}
          className={styles.heroImage}
          initial={{ scale: 1.04 }}
          animate={{ scale: 1 }}
          transition={{ duration: 0.6 }}
        />
        <div className={styles.heroOverlay} />
        <motion.div className={styles.heroContent} variants={pageVariants} initial="initial" animate="animate">
          <p className={styles.categoryBadge}>{charity.category}</p>
          <h1 className={styles.heroName}>{charity.name}</h1>
          <p className={styles.heroTagline}>{charity.tagline}</p>
        </motion.div>
      </section>

      <section className={styles.content}>
        <div className={styles.main}>
          <motion.section
            className={styles.about}
            variants={slideUpVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-80px' }}
          >
            <h2 className={styles.sectionTitle}>About {charity.name}</h2>
            {descriptionParagraphs.map((paragraph) => (
              <p key={paragraph.slice(0, 40)} className={styles.aboutParagraph}>
                {paragraph}
              </p>
            ))}
          </motion.section>

          {charity.galleryImages.length > 0 ? (
            <section className={styles.gallery}>
              <h2 className={styles.sectionTitle}>Gallery</h2>
              <div className={styles.galleryGrid}>
                {charity.galleryImages.map((imageUrl) => (
                  <motion.button
                    key={imageUrl}
                    type="button"
                    className={styles.galleryItem}
                    whileHover={{ scale: 1.02 }}
                    onClick={() => setLightboxImage(imageUrl)}
                  >
                    <img src={imageUrl} alt={`${charity.name} programme`} className={styles.galleryImage} />
                  </motion.button>
                ))}
              </div>
            </section>
          ) : null}

          <section className={styles.events}>
            <h2 className={styles.sectionTitle}>Upcoming events</h2>
            <motion.div
              variants={containerVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-80px' }}
            >
              {charity.upcomingEvents.map((event) => {
                const eventParts = formatEventParts(event.date);

                return (
                  <motion.article key={event.id} variants={itemVariants} whileHover={{ x: 4 }} className={styles.eventCard}>
                    <div className={styles.eventDate}>
                      <span className={styles.eventDay}>{eventParts.day}</span>
                      <span className={styles.eventMonth}>{eventParts.month}</span>
                    </div>

                    <div className={styles.eventDetails}>
                      <h3 className={styles.eventTitle}>{event.title}</h3>
                      <p className={styles.eventLocation}>
                        <span aria-hidden="true">⌖</span>
                        {event.location}
                      </p>
                      <p className={styles.eventDesc}>{event.description}</p>
                      <div className={styles.eventFooter}>
                        <Badge variant={getEventBadgeVariant(event.spotsLeft)} size="sm">
                          {getEventBadgeText(event.spotsLeft)}
                        </Badge>
                        <span className={styles.eventFullDate}>{formatDate(event.date)}</span>
                      </div>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          </section>
        </div>

        <aside className={styles.sidebar}>
          <motion.div
            className={styles.statsCard}
            variants={slideUpVariants}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, margin: '-60px' }}
          >
            <h3 className={styles.cardTitle}>Impact to date</h3>

            <div className={styles.impactGrid}>
              {charity.impactStats.map((stat) => (
                <div key={stat.label} className={styles.impactItem}>
                  <span className={styles.impactValue}>{stat.value}</span>
                  <span className={styles.impactLabel}>{stat.label}</span>
                </div>
              ))}
            </div>

            <div className={styles.totalRaised}>
              <p className={styles.totalLabel}>Raised by GolfGive members</p>
              <p className={styles.totalValue}>{formatCurrency(charity.totalRaised * 100)}</p>
            </div>

            <div className={styles.memberRow}>
              <p className={styles.totalLabel}>GolfGive members supporting</p>
              <p className={styles.memberValue}>{charity.memberCount} members</p>
            </div>
          </motion.div>

          <motion.div
            className={styles.ctaCard}
            whileHover={{ boxShadow: `0 0 0 calc(var(--space-1) / 2) color-mix(in srgb, var(--color-accent) 40%, transparent)` }}
            transition={{ duration: 0.2 }}
          >
            <h3 className={styles.ctaTitle}>Support this charity</h3>
            <p className={styles.ctaBody}>
              Subscribe to GolfGive and choose {charity.name} as your charity. A minimum of 10% of your subscription
              goes directly to them.
            </p>
            <Button
              variant="primary"
              size="md"
              fullWidth={true}
              onClick={() => navigate(`${ROUTES.SUBSCRIBE}?charity=${charity.id}`)}
            >
              Subscribe and support
            </Button>
            <p className={styles.ctaNote}>
              Already a member?{' '}
              <Link to={ROUTES.MY_CHARITY} className={styles.ctaNoteLink}>
                Change your charity in your dashboard.
              </Link>
            </p>
          </motion.div>

          <div className={styles.websiteCard}>
            <a href={charity.websiteUrl} target="_blank" rel="noreferrer" className={styles.websiteLink}>
              <span aria-hidden="true">↗</span>
              Visit {charity.name} website →
            </a>
          </div>
        </aside>
      </section>

      <section className={styles.finalCta}>
        <motion.div
          className={styles.finalCtaInner}
          variants={slideUpVariants}
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, margin: '-80px' }}
        >
          <h2 className={styles.finalCtaHeading}>Play golf. Support {charity.name}.</h2>
          <p className={styles.finalCtaSubtitle}>
            Your monthly subscription funds this charity while giving you the chance to win cash prizes every month.
          </p>
          <Button
            variant="primary"
            size="lg"
            onClick={() => navigate(`${ROUTES.SUBSCRIBE}?charity=${charity.id}`)}
          >
            Subscribe and support
          </Button>
        </motion.div>
      </section>

      <AnimatePresence>
        {lightboxImage ? (
          <Modal isOpen={true} onClose={() => setLightboxImage(null)} title={charity.name} size="lg">
            <img src={lightboxImage} alt={`${charity.name} gallery`} className={styles.lightboxImage} />
          </Modal>
        ) : null}
      </AnimatePresence>
    </main>
  );
};
