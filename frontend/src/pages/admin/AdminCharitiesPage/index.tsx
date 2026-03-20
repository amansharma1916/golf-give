import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { PageHeader } from '../../../components/layout';
import { Badge, Button, Input, Modal } from '../../../components/ui';
import { containerVariants, itemVariants } from '../../../lib/animations';
import { formatDate } from '../../../lib/utils';
import { useToastStore } from '../../../stores/toastStore';
import styles from './AdminCharitiesPage.module.css';

gsap.registerPlugin(ScrollTrigger);

const CATEGORIES = ['Youth & Education', 'Mental Health', 'Veterans', 'Environment', 'Community Sport', 'Medical Research'] as const;

type Category = (typeof CATEGORIES)[number];

interface CharityRecord {
  id: string;
  name: string;
  category: Category;
  description: string;
  imageUrl: string;
  websiteUrl: string;
  isFeatured: boolean;
  isActive: boolean;
  createdAt: string;
  supporters: number;
  contributed: number;
}

const initialCharities: CharityRecord[] = [
  {
    id: '1',
    name: 'Golf Foundation',
    category: 'Youth & Education',
    description: 'Helping young people discover golf through schools, clubs and youth programs around the UK.',
    imageUrl: 'https://placehold.co/240x240/1a1a2e/e94560?text=Golf+Foundation',
    websiteUrl: 'https://golf-foundation.org.uk',
    isFeatured: true,
    isActive: true,
    createdAt: '2024-05-10T00:00:00Z',
    supporters: 312,
    contributed: 48200,
  },
  {
    id: '2',
    name: 'Veterans Golf Society',
    category: 'Veterans',
    description: 'Programs for veterans using golf to build community, routine and confidence.',
    imageUrl: 'https://placehold.co/240x240/1a1a2e/e94560?text=Veterans',
    websiteUrl: 'https://example.com',
    isFeatured: false,
    isActive: true,
    createdAt: '2024-08-20T00:00:00Z',
    supporters: 218,
    contributed: 32100,
  },
  {
    id: '3',
    name: 'Caddy Scholarship Fund',
    category: 'Youth & Education',
    description: 'Scholarships and education support for caddies and their families.',
    imageUrl: 'https://placehold.co/240x240/1a1a2e/e94560?text=Caddy+Fund',
    websiteUrl: 'https://example.com',
    isFeatured: false,
    isActive: true,
    createdAt: '2025-01-15T00:00:00Z',
    supporters: 189,
    contributed: 27600,
  },
  {
    id: '5',
    name: 'Mind on the Fairway',
    category: 'Mental Health',
    description: 'Golf-led wellbeing sessions for people facing anxiety, depression and loneliness.',
    imageUrl: 'https://placehold.co/240x240/1a1a2e/e94560?text=Mind+Fairway',
    websiteUrl: 'https://example.com',
    isFeatured: true,
    isActive: false,
    createdAt: '2025-03-02T00:00:00Z',
    supporters: 167,
    contributed: 22800,
  },
];

const PencilIcon = () => <span aria-hidden="true">✎</span>;
const StarIcon = ({ filled }: { filled: boolean }) => <span aria-hidden="true">{filled ? '★' : '☆'}</span>;

export const AdminCharitiesPage = () => {
  const addToast = useToastStore((state) => state.addToast);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [charities, setCharities] = useState(initialCharities);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCharityId, setEditingCharityId] = useState<string | null>(null);

  const [form, setForm] = useState({
    name: '',
    category: CATEGORIES[0] as Category,
    description: '',
    websiteUrl: '',
    imageUrl: '',
    isFeatured: false,
    isActive: true,
  });

  const [errors, setErrors] = useState<{ name?: string; category?: string; description?: string }>({});

  const totalRef = useRef<HTMLSpanElement>(null);
  const contributedRef = useRef<HTMLSpanElement>(null);
  const supportersRef = useRef<HTMLSpanElement>(null);
  const averageRef = useRef<HTMLSpanElement>(null);

  const filtered = useMemo(() => {
    return charities.filter((charity) => {
      const matchSearch =
        charity.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        charity.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchActive = !activeOnly || charity.isActive;
      return matchSearch && matchActive;
    });
  }, [activeOnly, charities, searchQuery]);

  useEffect(() => {
    const totalContributed = 284500;
    const avg = Math.round(totalContributed / 24);
    const rows = [
      { ref: totalRef, value: 24 },
      { ref: contributedRef, value: totalContributed },
      { ref: supportersRef, value: 3420 },
      { ref: averageRef, value: avg },
    ];

    rows.forEach(({ ref, value }) => {
      if (!ref.current) return;
      const counter = { value: 0 };
      gsap.to(counter, {
        value,
        duration: 1.5,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          once: true,
        },
        onUpdate: () => {
          if (!ref.current) return;
          const rounded = Math.round(counter.value);
          ref.current.textContent = ref === contributedRef || ref === averageRef ? `£${rounded.toLocaleString()}` : rounded.toLocaleString();
        },
      });
    });
  }, []);

  const openAddModal = () => {
    setEditingCharityId(null);
    setForm({
      name: '',
      category: CATEGORIES[0],
      description: '',
      websiteUrl: '',
      imageUrl: '',
      isFeatured: false,
      isActive: true,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const openEditModal = (charity: CharityRecord) => {
    setEditingCharityId(charity.id);
    setForm({
      name: charity.name,
      category: charity.category,
      description: charity.description,
      websiteUrl: charity.websiteUrl,
      imageUrl: charity.imageUrl,
      isFeatured: charity.isFeatured,
      isActive: charity.isActive,
    });
    setErrors({});
    setIsModalOpen(true);
  };

  const validateForm = () => {
    const nextErrors: { name?: string; category?: string; description?: string } = {};
    if (!form.name.trim()) nextErrors.name = 'Name is required';
    if (!form.category) nextErrors.category = 'Category is required';
    if (form.description.trim().length < 20) nextErrors.description = 'Description must be at least 20 characters';
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const saveForm = () => {
    if (!validateForm()) return;

    if (editingCharityId) {
      setCharities((prev) =>
        prev.map((charity) =>
          charity.id === editingCharityId
            ? { ...charity, ...form }
            : charity,
        ),
      );
      addToast({ type: 'success', message: 'Charity updated successfully' });
    } else {
      const newItem: CharityRecord = {
        id: `new-${Date.now()}`,
        name: form.name,
        category: form.category,
        description: form.description,
        websiteUrl: form.websiteUrl,
        imageUrl: form.imageUrl,
        isFeatured: form.isFeatured,
        isActive: form.isActive,
        createdAt: new Date().toISOString(),
        supporters: 0,
        contributed: 0,
      };
      setCharities((prev) => [newItem, ...prev]);
      addToast({ type: 'success', message: 'Charity added successfully' });
    }

    setIsModalOpen(false);
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Charities"
        subtitle="Manage listed charities, set featured status, and monitor contributions."
        actions={<Button variant="primary" size="sm" onClick={openAddModal}>Add charity</Button>}
      />

      <section className={styles.statsGrid}>
        <article className={styles.statCard}><p>Total charities</p><span ref={totalRef}>0</span></article>
        <article className={styles.statCard}><p>Total contributed</p><span ref={contributedRef}>£0</span></article>
        <article className={styles.statCard}><p>Active supporters</p><span ref={supportersRef}>0</span></article>
        <article className={styles.statCard}><p>Avg per charity</p><span ref={averageRef}>£0</span></article>
      </section>

      <section>
        <div className={styles.controls}>
          <Input
            name="charityAdminSearch"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search charities..."
          />
          <label className={styles.checkboxRow}>
            <input type="checkbox" checked={activeOnly} onChange={(event) => setActiveOnly(event.target.checked)} />
            Active only
          </label>
        </div>

        <motion.div className={styles.charityList} variants={containerVariants} initial="initial" animate="animate">
          {filtered.map((charity) => (
            <motion.article
              key={charity.id}
              className={`${styles.charityRow} ${charity.isFeatured ? styles.featuredCard : ''} ${!charity.isActive ? styles.inactiveCard : ''}`}
              variants={itemVariants}
              whileHover={{ y: -2 }}
            >
              <img src={charity.imageUrl} alt={charity.name} className={styles.charityImage} />

              <div className={styles.charityMid}>
                <div className={styles.midTop}>
                  <h4>{charity.name}</h4>
                  <Badge variant="info" size="sm">{charity.category}</Badge>
                  <button
                    type="button"
                    className={styles.iconButton}
                    onClick={() => {
                      setCharities((prev) => prev.map((row) => row.id === charity.id ? { ...row, isFeatured: !row.isFeatured } : row));
                      addToast({ type: 'success', message: `${charity.name} ${charity.isFeatured ? 'unfeatured' : 'featured'}` });
                    }}
                  >
                    <StarIcon filled={charity.isFeatured} />
                  </button>
                </div>
                <p className={styles.description}>{charity.description}</p>
                <p className={styles.meta}>
                  {charity.supporters} supporters · £{charity.contributed.toLocaleString()} contributed · Added {formatDate(charity.createdAt)}
                </p>
              </div>

              <div className={styles.charityActions}>
                <button type="button" className={styles.actionBtn} onClick={() => openEditModal(charity)} aria-label="Edit charity"><PencilIcon /></button>
                <button
                  type="button"
                  className={styles.actionBtn}
                  onClick={() => {
                    setCharities((prev) => prev.map((row) => row.id === charity.id ? { ...row, isFeatured: !row.isFeatured } : row));
                    addToast({ type: 'success', message: 'Featured status updated' });
                  }}
                  aria-label="Toggle featured"
                >
                  <StarIcon filled={charity.isFeatured} />
                </button>
                <label className={styles.inlineToggle}>
                  <input
                    type="checkbox"
                    checked={charity.isActive}
                    onChange={(event) => {
                      setCharities((prev) => prev.map((row) => row.id === charity.id ? { ...row, isActive: event.target.checked } : row));
                    }}
                  />
                  <span>{charity.isActive ? 'Active' : 'Inactive'}</span>
                </label>
              </div>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingCharityId ? `Edit ${form.name}` : 'Add charity'}
        size="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={saveForm}>Save charity</Button>
          </>
        }
      >
        <motion.div className={styles.formGrid} variants={containerVariants} initial="initial" animate="animate">
          <motion.div variants={itemVariants} className={styles.fieldCol}>
            <Input
              label="Name"
              name="name"
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              error={errors.name}
            />
          </motion.div>

          <motion.div variants={itemVariants} className={styles.fieldCol}>
            <label className={styles.label}>Category</label>
            <select
              className={styles.select}
              value={form.category}
              onChange={(event) => setForm((prev) => ({ ...prev, category: event.target.value as Category }))}
            >
              {CATEGORIES.map((category) => <option key={category} value={category}>{category}</option>)}
            </select>
            {errors.category ? <span className={styles.error}>{errors.category}</span> : null}
          </motion.div>

          <motion.div variants={itemVariants} className={styles.fieldColFull}>
            <label className={styles.label}>Description</label>
            <textarea
              rows={4}
              className={styles.textarea}
              value={form.description}
              onChange={(event) => setForm((prev) => ({ ...prev, description: event.target.value }))}
            />
            {errors.description ? <span className={styles.error}>{errors.description}</span> : null}
          </motion.div>

          <motion.div variants={itemVariants} className={styles.fieldCol}>
            <Input
              label="Website URL"
              name="websiteUrl"
              value={form.websiteUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, websiteUrl: event.target.value }))}
            />
          </motion.div>

          <motion.div variants={itemVariants} className={styles.fieldCol}>
            <Input
              label="Image URL"
              name="imageUrl"
              value={form.imageUrl}
              onChange={(event) => setForm((prev) => ({ ...prev, imageUrl: event.target.value }))}
            />
            {form.imageUrl.startsWith('http') ? <img src={form.imageUrl} alt="Preview" className={styles.imagePreview} /> : null}
          </motion.div>

          <motion.div variants={itemVariants} className={styles.toggleRow}>
            <span>Featured</span>
            <button type="button" className={`${styles.toggleSwitch} ${form.isFeatured ? styles.toggleOn : styles.toggleOff}`} onClick={() => setForm((prev) => ({ ...prev, isFeatured: !prev.isFeatured }))}>
              <motion.span className={styles.toggleThumb} layout />
            </button>
          </motion.div>

          <motion.div variants={itemVariants} className={styles.toggleRow}>
            <span>Active</span>
            <button type="button" className={`${styles.toggleSwitch} ${form.isActive ? styles.toggleOn : styles.toggleOff}`} onClick={() => setForm((prev) => ({ ...prev, isActive: !prev.isActive }))}>
              <motion.span className={styles.toggleThumb} layout />
            </button>
          </motion.div>
        </motion.div>
      </Modal>
    </div>
  );
};
