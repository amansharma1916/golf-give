import { useState } from 'react';
import { useToastStore } from '../../../stores/toastStore';
import { Avatar, Badge, Button, Card, Input, Modal, Skeleton, Spinner, Tabs, Toast } from '../../../components/ui';
import type { Tab } from '../../../components/ui/Tabs/Tabs.types';
import styles from './ComponentTestPage.module.css';

const SAMPLE_TABS: Tab[] = [
  { id: 'all', label: 'All Players', count: 32 },
  { id: 'subscribers', label: 'Subscribers', count: 21 },
  { id: 'winners', label: 'Winners', count: 4 },
];

export const ComponentTestPage = () => {
  const [activeTab, setActiveTab] = useState('all');
  const [isModalOpen, setModalOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const addToast = useToastStore((state) => state.addToast);

  return (
    <main className={styles.page}>
      <section className={styles.section}>
        <h1 className={styles.title}>Component Test Page</h1>
        <p className={styles.copy}>Use this route to quickly verify all shared UI primitives.</p>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Button</h2>
        <div className={styles.row}>
          <Button variant="primary" size="md" onClick={() => addToast({ type: 'success', message: 'Primary button clicked' })}>
            Primary
          </Button>
          <Button variant="secondary" size="md">
            Secondary
          </Button>
          <Button variant="ghost" size="md">
            Ghost
          </Button>
          <Button variant="danger" size="md">
            Danger
          </Button>
          <Button variant="primary" size="md" loading>
            Loading
          </Button>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Card, Input, Badge, Spinner</h2>
        <Card padding="lg" className={styles.panel}>
          <Input
            label="Search charities"
            placeholder="Type a charity name"
            value={inputValue}
            onChange={(event) => setInputValue(event.target.value)}
            hint="Try typing and opening the modal"
            leftIcon={<span>🔎</span>}
          />
          <div className={styles.row}>
            <Badge variant="success">Active</Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="error">Failed</Badge>
            <Badge variant="info">Info</Badge>
            <Badge variant="neutral">Neutral</Badge>
            <Spinner size="sm" />
            <Spinner size="md" color="accent" />
            <Spinner size="lg" color="primary" />
          </div>
        </Card>
      </section>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Avatar and Tabs</h2>
        <div className={styles.row}>
          <Avatar name="Alice Walker" size="sm" />
          <Avatar name="Rory McIlroy" size="md" />
          <Avatar name="Charity Captain" size="lg" />
        </div>
        <Tabs tabs={SAMPLE_TABS} activeTab={activeTab} onChange={setActiveTab} />
      </section>

      <section className={styles.section}>
        <h2 className={styles.subtitle}>Skeleton and Modal</h2>
        <div className={styles.panel}>
          <Skeleton height="20px" />
          <Skeleton width="70%" />
          <Skeleton width="40%" />
        </div>
        <div className={styles.row}>
          <Button variant="primary" size="md" onClick={() => setModalOpen(true)}>
            Open Modal
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={() => addToast({ type: 'info', message: 'Toast from test page', duration: 3000 })}
          >
            Show Toast
          </Button>
        </div>
      </section>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Modal Primitive"
        footer={
          <>
            <Button variant="ghost" size="md" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={() => setModalOpen(false)}>
              Confirm
            </Button>
          </>
        }
      >
        <p className={styles.copy}>This verifies portal rendering, escape close, outside click, and body scroll lock.</p>
      </Modal>

      <Toast />
    </main>
  );
};
