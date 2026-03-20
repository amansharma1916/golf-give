import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../../../components/layout';
import { Badge, Button, Input } from '../../../components/ui';
import { containerVariants, itemVariants, slideUpVariants } from '../../../lib/animations';
import { MOCK_CHARITY_CONTRIBUTION, MOCK_CHARITY_STATS } from '../../../lib/mockData';
import { formatCurrency } from '../../../lib/utils';
import { useToastStore } from '../../../stores/toastStore';
import styles from './MyCharityPage.module.css';

const charities = [
  {
    id: '1',
    name: 'Golf Foundation',
    category: 'Youth & Education',
    description:
      'Getting more young people into golf across the UK through school and club partnerships that make participation easier and more inclusive.',
    imageUrl: 'https://placehold.co/900x520/1a1a2e/e94560?text=Golf+Foundation',
    websiteUrl: 'https://golf-foundation.org.uk',
  },
  {
    id: '2',
    name: 'Veterans Golf Society',
    category: 'Veterans',
    description: 'Supporting veteran wellbeing through golf access, social sessions and tailored support programs.',
    imageUrl: 'https://placehold.co/900x520/1a1a2e/e94560?text=Veterans+Golf',
    websiteUrl: 'https://example.com',
  },
  {
    id: '3',
    name: 'Caddy Scholarship Fund',
    category: 'Education',
    description: 'Funding educational scholarships for caddies and their families with long-term support pathways.',
    imageUrl: 'https://placehold.co/900x520/1a1a2e/e94560?text=Caddy+Scholarship',
    websiteUrl: 'https://example.com',
  },
  {
    id: '4',
    name: 'Greenkeepers Welfare Trust',
    category: 'Community',
    description: 'Practical and financial support for greenkeepers and golf course staff across the UK.',
    imageUrl: 'https://placehold.co/900x520/1a1a2e/e94560?text=Greenkeepers',
    websiteUrl: 'https://example.com',
  },
  {
    id: '5',
    name: 'Mind on the Fairway',
    category: 'Mental Health',
    description: 'Weekly golf-based sessions focused on confidence, routine and mental wellbeing recovery.',
    imageUrl: 'https://placehold.co/900x520/1a1a2e/e94560?text=Mind+on+Fairway',
    websiteUrl: 'https://example.com',
  },
  {
    id: '6',
    name: 'Links to Nature',
    category: 'Environment',
    description: 'Helping clubs build biodiversity and long-term ecological impact around golf courses.',
    imageUrl: 'https://placehold.co/900x520/1a1a2e/e94560?text=Links+to+Nature',
    websiteUrl: 'https://example.com',
  },
];

const ringSize = 80;
const ringStroke = 8;
const ringRadius = (ringSize - ringStroke) / 2;
const ringCircumference = 2 * Math.PI * ringRadius;

export const MyCharityPage = () => {
  const addToast = useToastStore((state) => state.addToast);
  const [selectedCharityId, setSelectedCharityId] = useState(MOCK_CHARITY_CONTRIBUTION.charityId);
  const [savedCharityId, setSavedCharityId] = useState(MOCK_CHARITY_CONTRIBUTION.charityId);
  const [searchQuery, setSearchQuery] = useState('');
  const [percentage, setPercentage] = useState(MOCK_CHARITY_CONTRIBUTION.percentage);
  const [donationPreset, setDonationPreset] = useState<number | null>(10);
  const [customDonation, setCustomDonation] = useState('');

  const selectedCharity = charities.find((charity) => charity.id === savedCharityId) ?? charities[0];

  const filteredCharities = useMemo(() => {
    return charities.filter((charity) => {
      const query = searchQuery.toLowerCase();
      return (
        charity.name.toLowerCase().includes(query) ||
        charity.description.toLowerCase().includes(query) ||
        charity.category.toLowerCase().includes(query)
      );
    });
  }, [searchQuery]);

  const charityStats = MOCK_CHARITY_STATS.find((item) => item.charityId === selectedCharity.id);
  const monthlyBase = 9.99;
  const monthlyAmount = Number(((monthlyBase * percentage) / 100).toFixed(2));
  const totalContributed = Number((MOCK_CHARITY_CONTRIBUTION.totalContributed + monthlyAmount).toFixed(2));
  const ringProgress = ringCircumference - (percentage / 100) * ringCircumference;

  const handleSaveCharity = () => {
    window.setTimeout(() => {
      setSavedCharityId(selectedCharityId);
      addToast({ type: 'success', message: 'Charity updated successfully' });
    }, 800);
  };

  const handleUpdateContribution = () => {
    window.setTimeout(() => {
      addToast({ type: 'success', message: 'Contribution updated' });
    }, 600);
  };

  const handleDonate = () => {
    const base = donationPreset ?? 0;
    const customValue = Number(customDonation || '0');
    const amount = customValue > 0 ? customValue : base;

    if (!amount || amount <= 0) {
      addToast({ type: 'warning', message: 'Please choose or enter a donation amount.' });
      return;
    }

    window.setTimeout(() => {
      addToast({ type: 'success', message: `Donation of £${amount.toFixed(2)} sent to ${selectedCharity.name}!` });
      setCustomDonation('');
      setDonationPreset(10);
    }, 800);
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="My charity"
        subtitle="Your chosen charity receives a portion of your subscription every month."
      />

      <section className={styles.layout}>
        <div className={styles.leftCol}>
          <motion.article className={styles.charityCard} variants={slideUpVariants} initial="initial" animate="animate">
            <div className={styles.charityImageWrapper}>
              <img src={selectedCharity.imageUrl} alt={selectedCharity.name} className={styles.charityImage} />
              <div className={styles.charityImageOverlay} />
              <div className={styles.charityImageContent}>
                <h3>{selectedCharity.name}</h3>
                <Badge variant="info" size="sm">{selectedCharity.category}</Badge>
              </div>
            </div>
            <div className={styles.charityBody}>
              <p className={styles.description}>{selectedCharity.description}</p>
              <p className={styles.totalRaised}>
                {formatCurrency((charityStats?.totalAllTime ?? 0) * 100)} raised by GolfGive members
              </p>
              <p className={styles.memberCount}>{(charityStats?.memberCount ?? 0).toLocaleString()} GolfGive members support this charity</p>
              <a href={selectedCharity.websiteUrl} className={styles.externalLink} target="_blank" rel="noreferrer">
                Visit website →
              </a>
            </div>
          </motion.article>

          <section className={styles.changeSection}>
            <h3>Switch to a different charity</h3>
            <p>Changes take effect from your next subscription cycle.</p>

            <Input
              name="charitySearch"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search charities..."
            />

            <motion.div className={styles.charityGrid} variants={containerVariants} initial="initial" animate="animate">
              {filteredCharities.slice(0, 6).map((charity) => {
                const selected = selectedCharityId === charity.id;

                return (
                  <motion.button
                    key={charity.id}
                    type="button"
                    className={`${styles.charityOption} ${selected ? styles.charityOptionSelected : ''}`}
                    onClick={() => setSelectedCharityId(charity.id)}
                    variants={itemVariants}
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                  >
                    <div>
                      <h4>{charity.name}</h4>
                      <p>{charity.category}</p>
                    </div>
                    {selected ? <span className={styles.checkmark}>✓</span> : null}
                  </motion.button>
                );
              })}
            </motion.div>

            <Button
              variant="primary"
              size="md"
              disabled={selectedCharityId === savedCharityId}
              onClick={handleSaveCharity}
            >
              Save charity change
            </Button>
          </section>
        </div>

        <aside className={styles.settingsCard}>
          <section className={styles.ringSection}>
            <div className={styles.ringWrap}>
              <svg width={ringSize} height={ringSize} viewBox={`0 0 ${ringSize} ${ringSize}`}>
                <circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  className={styles.ringTrack}
                  strokeWidth={ringStroke}
                  fill="none"
                />
                <motion.circle
                  cx={ringSize / 2}
                  cy={ringSize / 2}
                  r={ringRadius}
                  className={styles.ringProgress}
                  strokeWidth={ringStroke}
                  strokeLinecap="round"
                  fill="none"
                  strokeDasharray={ringCircumference}
                  initial={{ strokeDashoffset: ringCircumference }}
                  animate={{ strokeDashoffset: ringProgress }}
                  transition={{ duration: 0.7 }}
                />
              </svg>
              <span className={styles.ringValue}>{percentage}%</span>
            </div>

            <div>
              <p className={styles.muted}>of your subscription</p>
              <p className={styles.monthlyAmount}>£{monthlyAmount.toFixed(2)} / month</p>
              <p className={styles.muted}>£{totalContributed.toFixed(2)} contributed total</p>
            </div>
          </section>

          <section className={styles.sliderSection}>
            <motion.div
              key={percentage}
              className={styles.percentValue}
              animate={{ scale: [1, 1.12, 1] }}
              transition={{ type: 'spring', stiffness: 280, damping: 16 }}
            >
              {percentage}%
            </motion.div>
            <input
              className={styles.slider}
              type="range"
              min={10}
              max={100}
              step={5}
              value={percentage}
              onChange={(event) => setPercentage(Number(event.target.value))}
              style={{
                background: `linear-gradient(to right, var(--color-accent) 0%, var(--color-accent) ${percentage}%, var(--color-bg-raised) ${percentage}%, var(--color-bg-raised) 100%)`,
              }}
            />
            <Button variant="primary" size="md" fullWidth onClick={handleUpdateContribution}>
              Update contribution
            </Button>
          </section>

          <div className={styles.divider} />

          <section>
            <h4>Make a one-time donation</h4>
            <p className={styles.muted}>Donate directly to your charity independent of your subscription.</p>

            <div className={styles.amountPresets}>
              {[5, 10, 25, 50].map((amount) => {
                const active = donationPreset === amount;
                return (
                  <motion.button
                    type="button"
                    key={amount}
                    className={`${styles.presetBtn} ${active ? styles.presetBtnActive : ''}`}
                    onClick={() => {
                      setDonationPreset(amount);
                      setCustomDonation('');
                    }}
                    whileTap={{ scale: 0.95 }}
                  >
                    £{amount}
                  </motion.button>
                );
              })}
            </div>

            <label className={styles.customLabel}>Or enter custom amount</label>
            <div className={styles.customInputWrap}>
              <span>£</span>
              <input
                value={customDonation}
                onChange={(event) => {
                  setCustomDonation(event.target.value);
                  setDonationPreset(null);
                }}
                placeholder="0.00"
              />
            </div>

            <Button variant="primary" size="md" fullWidth onClick={handleDonate}>
              Donate now
            </Button>
          </section>
        </aside>
      </section>
    </div>
  );
};
