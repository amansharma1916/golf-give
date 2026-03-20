import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button, Input, Tabs } from '../../../components/ui';
import { containerVariants, fadeInVariants, itemVariants, pageVariants } from '../../../lib/animations';
import { ROUTES } from '../../../lib/constants';
import { formatCurrency } from '../../../lib/utils';
import styles from './CharitiesPage.module.css';

interface CharityCardData {
  id: string;
  name: string;
  category: string;
  description: string;
  imageUrl: string;
  totalRaised: number;
  memberCount: number;
  isFeatured: boolean;
  websiteUrl: string;
}

type CategoryColor = {
  bg: string;
  text: string;
};

const CATEGORIES = [
  'All',
  'Youth & Education',
  'Mental Health',
  'Veterans',
  'Environment',
  'Community Sport',
  'Medical Research',
] as const;

type Category = (typeof CATEGORIES)[number];

const CHARITIES: CharityCardData[] = [
  {
    id: '1',
    name: 'Golf Foundation',
    category: 'Youth & Education',
    description:
      'Getting more young people into golf across the UK. The Golf Foundation works with schools and clubs to create affordable pathways into the sport for children from all backgrounds.',
    imageUrl: 'https://placehold.co/600x360/1a1a2e/e94560?text=Golf+Foundation',
    totalRaised: 48200,
    memberCount: 312,
    isFeatured: true,
    websiteUrl: 'https://golf-foundation.org.uk',
  },
  {
    id: '2',
    name: 'Veterans Golf Society',
    category: 'Veterans',
    description:
      'Supporting veterans through the mental health benefits of golf. We provide free memberships and coaching to veterans dealing with PTSD, isolation, and physical rehabilitation.',
    imageUrl: 'https://placehold.co/600x360/1a1a2e/e94560?text=Veterans+Golf',
    totalRaised: 32100,
    memberCount: 218,
    isFeatured: true,
    websiteUrl: 'https://example.com',
  },
  {
    id: '3',
    name: 'Caddy Scholarship Fund',
    category: 'Youth & Education',
    description:
      'Providing education scholarships for caddies and their families. We believe that working on the course should open doors, not close them.',
    imageUrl: 'https://placehold.co/600x360/1a1a2e/e94560?text=Caddy+Fund',
    totalRaised: 27600,
    memberCount: 189,
    isFeatured: false,
    websiteUrl: 'https://example.com',
  },
  {
    id: '4',
    name: 'Greenkeepers Welfare Trust',
    category: 'Community Sport',
    description:
      'Supporting the welfare of greenkeepers and golf course staff across the UK. Financial assistance, mental health support, and career development for those who maintain our courses.',
    imageUrl: 'https://placehold.co/600x360/1a1a2e/e94560?text=Greenkeepers',
    totalRaised: 19400,
    memberCount: 143,
    isFeatured: false,
    websiteUrl: 'https://example.com',
  },
  {
    id: '5',
    name: 'Mind on the Fairway',
    category: 'Mental Health',
    description:
      'Using golf as a vehicle for mental health recovery. We run free weekly sessions at golf clubs across the UK for people experiencing depression, anxiety, and loneliness.',
    imageUrl: 'https://placehold.co/600x360/1a1a2e/e94560?text=Mind+Fairway',
    totalRaised: 22800,
    memberCount: 167,
    isFeatured: true,
    websiteUrl: 'https://example.com',
  },
  {
    id: '6',
    name: 'Links to Nature',
    category: 'Environment',
    description:
      'Transforming golf courses into biodiversity havens. We work with clubs to rewild rough areas, plant native species, and create habitats for wildlife on course margins.',
    imageUrl: 'https://placehold.co/600x360/1a1a2e/e94560?text=Links+Nature',
    totalRaised: 15300,
    memberCount: 98,
    isFeatured: false,
    websiteUrl: 'https://example.com',
  },
  {
    id: '7',
    name: 'Junior Tour Bursary',
    category: 'Youth & Education',
    description:
      'Funding talented junior golfers from low-income backgrounds to compete in regional and national junior tours. Every young talent deserves a fair shot at the game.',
    imageUrl: 'https://placehold.co/600x360/1a1a2e/e94560?text=Junior+Tour',
    totalRaised: 31700,
    memberCount: 204,
    isFeatured: false,
    websiteUrl: 'https://example.com',
  },
  {
    id: '8',
    name: 'Swing for Research',
    category: 'Medical Research',
    description:
      'Raising funds for cancer research through golf events and subscriptions. Every pound raised goes directly to UK-based oncology research teams.',
    imageUrl: 'https://placehold.co/600x360/1a1a2e/e94560?text=Swing+Research',
    totalRaised: 41900,
    memberCount: 276,
    isFeatured: false,
    websiteUrl: 'https://example.com',
  },
];

const HERO_STATS = [
  { value: '£284,500+', label: 'Total raised' },
  { value: '3,420', label: 'Active supporters' },
  { value: '24', label: 'Charities supported' },
] as const;

const getCategoryColor = (category: string): CategoryColor => {
  switch (category) {
    case 'Youth & Education':
      return {
        bg: 'color-mix(in srgb, var(--color-info) 18%, var(--color-bg))',
        text: 'color-mix(in srgb, var(--color-info) 82%, var(--color-text))',
      };
    case 'Mental Health':
      return {
        bg: 'color-mix(in srgb, var(--color-accent) 16%, var(--color-bg))',
        text: 'color-mix(in srgb, var(--color-accent) 90%, var(--color-text))',
      };
    case 'Veterans':
      return {
        bg: 'color-mix(in srgb, var(--color-error) 16%, var(--color-bg))',
        text: 'color-mix(in srgb, var(--color-error) 84%, var(--color-text))',
      };
    case 'Environment':
      return {
        bg: 'color-mix(in srgb, var(--color-success) 18%, var(--color-bg))',
        text: 'color-mix(in srgb, var(--color-success) 82%, var(--color-text))',
      };
    case 'Community Sport':
      return {
        bg: 'color-mix(in srgb, var(--color-warning) 20%, var(--color-bg))',
        text: 'color-mix(in srgb, var(--color-warning) 82%, var(--color-text))',
      };
    case 'Medical Research':
      return {
        bg: 'color-mix(in srgb, var(--color-primary) 18%, var(--color-bg))',
        text: 'color-mix(in srgb, var(--color-primary) 85%, var(--color-text))',
      };
    default:
      return {
        bg: 'var(--color-bg-raised)',
        text: 'var(--color-text-muted)',
      };
  }
};

const SEARCH_ICON = (
  <span className={styles.searchIcon} aria-hidden="true">
    ⌕
  </span>
);

export const CharitiesPage = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<Category>('All');

  const filteredCharities = useMemo(() => {
    return CHARITIES.filter((charity) => {
      const matchesSearch =
        charity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        charity.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || charity.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  const featuredCharities = useMemo(() => CHARITIES.filter((charity) => charity.isFeatured), []);

  const hasActiveFilters = activeCategory !== 'All' || searchQuery.trim() !== '';

  const clearFilters = () => {
    setSearchQuery('');
    setActiveCategory('All');
  };

  return (
    <main>
      <section className={styles.pageHero}>
        <div className={styles.heroBg} />
        <motion.div className={styles.heroContent} variants={pageVariants} initial="initial" animate="animate">
          <p className={styles.pageHeroEyebrow}>Our charities</p>
          <h1 className={styles.pageHeroTitle}>Every subscription makes a difference.</h1>
          <p className={styles.pageHeroSubtitle}>
            Browse the charities supported by our members. Choose one at signup and your contribution goes there every
            month.
          </p>

          <motion.div
            className={styles.heroStats}
            variants={containerVariants}
            initial="initial"
            animate="animate"
            transition={{ delayChildren: 0.5, staggerChildren: 0.1 }}
          >
            {HERO_STATS.map((stat) => (
              <motion.div key={stat.label} className={styles.heroStatPill} variants={itemVariants}>
                <span className={styles.heroStatValue}>{stat.value}</span>
                <span className={styles.heroStatLabel}>{stat.label}</span>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
      </section>

      <section className={styles.filterBar}>
        <div className={styles.filterInner}>
          <div className={styles.searchWrapper}>
            <Input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search charities..."
              leftIcon={SEARCH_ICON}
              name="charitySearch"
            />
          </div>
          <div className={styles.filterTabs}>
            <Tabs
              tabs={CATEGORIES.map((category) => ({ id: category, label: category }))}
              activeTab={activeCategory}
              onChange={(id) => setActiveCategory(id as Category)}
            />
          </div>
        </div>
      </section>

      <div className={styles.resultCount}>
        {hasActiveFilters ? (
          <>
            <span>
              Showing {filteredCharities.length} results{searchQuery.trim() ? ` for "${searchQuery}"` : ''}
            </span>
            <button type="button" className={styles.clearFilters} onClick={clearFilters}>
              Clear filters
            </button>
          </>
        ) : (
          <span>Showing {filteredCharities.length} charities</span>
        )}
      </div>

      {!hasActiveFilters ? (
        <section className={styles.featured}>
          <div className={styles.featuredInner}>
            <p className={styles.sectionLabel}>Featured this month</p>
            <motion.div
              className={styles.featuredGrid}
              variants={containerVariants}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true, margin: '-80px' }}
            >
              {featuredCharities.map((charity) => {
                const categoryColor = getCategoryColor(charity.category);

                return (
                  <motion.article
                    key={charity.id}
                    className={styles.featuredCard}
                    variants={itemVariants}
                    whileHover={{ y: -5 }}
                    onClick={() => navigate(ROUTES.CHARITY(charity.id))}
                  >
                    <motion.div layoutId={`charity-card-${charity.id}`} className={styles.featuredImageWrapper}>
                      <img src={charity.imageUrl} alt={charity.name} className={styles.featuredImage} />
                      <div className={styles.featuredImageOverlay} />
                      <div className={styles.featuredImageContent}>
                        <span
                          className={styles.categoryBadge}
                          style={{ background: categoryColor.bg, color: categoryColor.text }}
                        >
                          {charity.category}
                        </span>
                        <h3 className={styles.featuredName}>{charity.name}</h3>
                      </div>
                    </motion.div>
                    <div className={styles.featuredBody}>
                      <p className={styles.charityDesc}>{charity.description}</p>
                      <div className={styles.raisedRow}>
                        <span className={styles.raisedLabel}>Raised to date</span>
                        <span className={styles.raisedAmount}>{formatCurrency(charity.totalRaised * 100)}</span>
                      </div>
                      <Link
                        to={ROUTES.CHARITY(charity.id)}
                        className={styles.viewLink}
                        onClick={(event) => event.stopPropagation()}
                      >
                        View charity →
                      </Link>
                    </div>
                  </motion.article>
                );
              })}
            </motion.div>
          </div>
        </section>
      ) : null}

      <section className={styles.allCharities}>
        <div className={styles.allCharitiesInner}>
          <p className={styles.sectionLabel}>{hasActiveFilters ? 'Search results' : 'All charities'}</p>

          <AnimatePresence mode="wait">
            {filteredCharities.length > 0 ? (
              <motion.div
                key={`${activeCategory}-${searchQuery}`}
                className={styles.charitiesGrid}
                variants={containerVariants}
                initial="initial"
                animate="animate"
                exit="initial"
                transition={{ duration: 0.2 }}
              >
                {filteredCharities.map((charity) => {
                  const categoryColor = getCategoryColor(charity.category);

                  return (
                    <motion.article key={charity.id} className={styles.charityCard} variants={itemVariants} whileHover={{ y: -3 }}>
                      <img src={charity.imageUrl} alt={charity.name} className={styles.charityImage} />
                      <div className={styles.charityBody}>
                        <span
                          className={styles.charityCategory}
                          style={{ background: categoryColor.bg, color: categoryColor.text }}
                        >
                          {charity.category}
                        </span>
                        <h3 className={styles.charityName}>{charity.name}</h3>
                        <p className={styles.charityDesc}>{charity.description}</p>
                        <div className={styles.charityMeta}>
                          <span className={styles.memberCount}>
                            <span aria-hidden="true">👤</span>
                            {charity.memberCount} supporters
                          </span>
                          <span className={styles.raisedAmount}>{formatCurrency(charity.totalRaised * 100)}</span>
                        </div>
                        <Button
                          variant="secondary"
                          size="md"
                          fullWidth={true}
                          onClick={() => navigate(ROUTES.CHARITY(charity.id))}
                        >
                          View charity
                        </Button>
                      </div>
                    </motion.article>
                  );
                })}
              </motion.div>
            ) : (
              <motion.div
                key="empty-state"
                className={styles.emptyState}
                variants={fadeInVariants}
                initial="initial"
                animate="animate"
                exit="exit"
              >
                <p className={styles.emptyIcon} aria-hidden="true">
                  ◎
                </p>
                <h3 className={styles.emptyTitle}>No charities found</h3>
                <p className={styles.emptyDesc}>Try adjusting your search or clearing the category filter.</p>
                <Button variant="secondary" size="md" onClick={clearFilters}>
                  Clear filters
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>
    </main>
  );
};
