import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { PageHeader } from '../../../components/layout';
import { Badge, Button, Input } from '../../../components/ui';
import { useCharities, useUpdateMyCharity } from '../../../hooks/useCharities';
import { containerVariants, itemVariants, slideUpVariants } from '../../../lib/animations';
import { formatCurrency } from '../../../lib/utils';
import { useToastStore } from '../../../stores/toastStore';
import styles from './MyCharityPage.module.css';

const ringSize = 80;
const ringStroke = 8;
const ringRadius = (ringSize - ringStroke) / 2;
const ringCircumference = 2 * Math.PI * ringRadius;

export const MyCharityPage = () => {
  const addToast = useToastStore((state) => state.addToast);
  const { data: charitiesData = [] } = useCharities();
  const updateMyCharityMutation = useUpdateMyCharity();
  const charities = useMemo(
    () =>
      charitiesData.map((charity) => ({
        id: charity.id,
        name: charity.name,
        category: charity.isFeatured ? 'Featured' : 'Community',
        description: charity.description,
        imageUrl: charity.imageUrl,
        websiteUrl: charity.websiteUrl,
      })),
    [charitiesData],
  );

  const initialCharityId = charities[0]?.id ?? '';
  const [selectedCharityId, setSelectedCharityId] = useState(initialCharityId);
  const [savedCharityId, setSavedCharityId] = useState(initialCharityId);
  const [searchQuery, setSearchQuery] = useState('');
  const [percentage, setPercentage] = useState(10);
  const [donationPreset, setDonationPreset] = useState<number | null>(10);
  const [customDonation, setCustomDonation] = useState('');

  const selectedCharity =
    charities.find((charity) => charity.id === savedCharityId) ?? {
      id: '',
      name: 'Charity',
      category: 'Community',
      description: '',
      imageUrl: '',
      websiteUrl: '#',
    };

  useEffect(() => {
    if (!selectedCharityId && charities[0]?.id) {
      setSelectedCharityId(charities[0].id);
      setSavedCharityId(charities[0].id);
    }
  }, [charities, selectedCharityId]);

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

  const charityStats = {
    totalAllTime: 0,
    memberCount: 0,
  };
  const monthlyBase = 9.99;
  const monthlyAmount = Number(((monthlyBase * percentage) / 100).toFixed(2));
  const totalContributed = Number(monthlyAmount.toFixed(2));
  const ringProgress = ringCircumference - (percentage / 100) * ringCircumference;

  const handleSaveCharity = async () => {
    try {
      await updateMyCharityMutation.mutateAsync({
        charityId: selectedCharityId,
        contributionPercentage: percentage,
      });
      setSavedCharityId(selectedCharityId);
    } catch {
      addToast({ type: 'error', message: 'Failed to update charity' });
    }
  };

  const handleUpdateContribution = async () => {
    try {
      await updateMyCharityMutation.mutateAsync({
        charityId: savedCharityId,
        contributionPercentage: percentage,
      });
      addToast({ type: 'success', message: 'Contribution updated' });
    } catch {
      addToast({ type: 'error', message: 'Failed to update contribution' });
    }
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
