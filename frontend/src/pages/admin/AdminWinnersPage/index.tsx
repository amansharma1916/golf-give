import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { PageHeader } from '../../../components/layout';
import { Avatar, Badge, Button, Modal, Tabs } from '../../../components/ui';
import { pageVariants } from '../../../lib/animations';
import { MOCK_ADMIN_WINNERS } from '../../../lib/mockData';
import { formatDate, formatMonth } from '../../../lib/utils';
import { useToastStore } from '../../../stores/toastStore';
import styles from './AdminWinnersPage.module.css';

gsap.registerPlugin(ScrollTrigger);

type WinnerStatusTab = 'all' | 'pending' | 'verified' | 'paid';

interface WinnerRecord {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  drawMonth: string;
  matchCount: number;
  tier: string;
  amount: number;
  status: 'pending' | 'verified' | 'paid';
  proofUrl: string | null;
  submittedAt: string;
  adminNote: string | null;
  note?: string;
}

const baseBalls = [34, 28, 31, 25, 38];

export const AdminWinnersPage = () => {
  const addToast = useToastStore((state) => state.addToast);

  const [activeTab, setActiveTab] = useState<WinnerStatusTab>('all');
  const [winners, setWinners] = useState<WinnerRecord[]>(
    MOCK_ADMIN_WINNERS.map((winner) => ({
      ...winner,
      status: winner.status,
    })),
  );
  const [noteFor, setNoteFor] = useState<string | null>(null);
  const [noteValue, setNoteValue] = useState('');
  const [approveTarget, setApproveTarget] = useState<WinnerRecord | null>(null);
  const [rejectTarget, setRejectTarget] = useState<WinnerRecord | null>(null);
  const [paidTarget, setPaidTarget] = useState<WinnerRecord | null>(null);
  const [rejectReason, setRejectReason] = useState('');

  const pendingRef = useRef<HTMLSpanElement>(null);
  const verifiedRef = useRef<HTMLSpanElement>(null);
  const paidMonthRef = useRef<HTMLSpanElement>(null);
  const paidAllRef = useRef<HTMLSpanElement>(null);

  const pendingCount = winners.filter((winner) => winner.status === 'pending').length;
  const verifiedCount = winners.filter((winner) => winner.status === 'verified').length;

  const filteredWinners = useMemo(() => {
    if (activeTab === 'all') return winners;
    return winners.filter((winner) => winner.status === activeTab);
  }, [activeTab, winners]);

  useEffect(() => {
    const counters = [
      { ref: pendingRef, value: pendingCount, currency: false },
      { ref: verifiedRef, value: verifiedCount, currency: false },
      { ref: paidMonthRef, value: 2241, currency: true },
      { ref: paidAllRef, value: 42680, currency: true },
    ];

    counters.forEach(({ ref, value, currency }) => {
      if (!ref.current) return;
      const count = { value: 0 };
      gsap.to(count, {
        value,
        duration: 1.4,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          once: true,
        },
        onUpdate: () => {
          if (!ref.current) return;
          const rounded = Math.round(count.value);
          ref.current.textContent = currency ? `£${rounded.toLocaleString()}` : rounded.toLocaleString();
        },
      });
    });
  }, [pendingCount, verifiedCount]);

  const tabs = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'verified', label: 'Verified' },
    { id: 'paid', label: 'Paid' },
  ];

  const updateWinnerStatus = (id: string, status: WinnerRecord['status']) => {
    setWinners((prev) => prev.map((winner) => (winner.id === id ? { ...winner, status } : winner)));
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Winners"
        subtitle="Review proof submissions, verify winners, and track payouts."
        actions={
          <motion.div animate={pendingCount > 0 ? { scale: [1, 1.06, 1] } : undefined} transition={{ repeat: Infinity, duration: 1.4 }}>
            <Badge variant="warning">{pendingCount} pending</Badge>
          </motion.div>
        }
      />

      <section className={styles.statsBar}>
        <article className={styles.statCard}><p>Pending verification</p><span ref={pendingRef}>0</span></article>
        <article className={styles.statCard}><p>Verified awaiting payment</p><span ref={verifiedRef}>0</span></article>
        <article className={styles.statCard}><p>Paid out this month</p><span ref={paidMonthRef}>£0</span></article>
        <article className={styles.statCard}><p>Total paid all time</p><span ref={paidAllRef}>£0</span></article>
      </section>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={(id) => setActiveTab(id as WinnerStatusTab)} />

      <AnimatePresence mode="wait">
        <motion.section key={activeTab} variants={pageVariants} initial="initial" animate="animate" exit="exit">
          {filteredWinners.map((winner) => (
            <article
              key={winner.id}
              className={`${styles.winnerCard} ${winner.status === 'pending' ? styles.winnerCardPending : ''} ${winner.status === 'verified' ? styles.winnerCardVerified : ''}`}
            >
              <div>
                <div className={styles.userRow}>
                  <Avatar name={winner.userName} size="sm" />
                  <div>
                    <p className={styles.name}>{winner.userName}</p>
                    <p className={styles.email}>{winner.userEmail}</p>
                  </div>
                </div>
                <p className={styles.meta}>Draw: {formatMonth(winner.drawMonth)}</p>
              </div>

              <div>
                <p className={styles.matchLabel}>{winner.matchCount} numbers matched</p>
                <Badge variant="info" size="sm">{winner.tier}</Badge>
                <div className={styles.numberBalls}>
                  {baseBalls.map((num, index) => (
                    <span key={`${winner.id}-${num}`} className={`${styles.numberBall} ${index < winner.matchCount ? styles.numberBallMatch : ''}`}>{num}</span>
                  ))}
                </div>
                <p className={styles.amount}>£{winner.amount.toFixed(2)}</p>
              </div>

              <div>
                {winner.proofUrl ? (
                  <>
                    <Badge variant="success" size="sm">Proof submitted</Badge>
                    <a className={styles.proofLink} href={winner.proofUrl} target="_blank" rel="noreferrer">View proof →</a>
                    <p className={styles.meta}>Submitted {formatDate(winner.submittedAt)}</p>
                  </>
                ) : (
                  <>
                    <Badge variant="neutral" size="sm">No proof yet</Badge>
                    <p className={styles.meta}>Awaiting submission from member</p>
                  </>
                )}
              </div>

              <div className={styles.actionCol}>
                {winner.status === 'pending' ? (
                  <>
                    <Button variant="primary" size="sm" onClick={() => setApproveTarget(winner)}>Approve</Button>
                    <Button variant="danger" size="sm" onClick={() => setRejectTarget(winner)}>Reject</Button>
                  </>
                ) : null}

                {winner.status === 'verified' ? (
                  <>
                    <Button variant="primary" size="sm" onClick={() => setPaidTarget(winner)}>Mark as paid</Button>
                    <Badge variant="success" size="sm">Paid</Badge>
                  </>
                ) : null}

                {winner.status === 'paid' ? (
                  <>
                    <Badge variant="success" size="sm">Paid</Badge>
                    <p className={styles.meta}>Paid date {formatDate(winner.submittedAt)}</p>
                  </>
                ) : null}

                <button
                  type="button"
                  className={styles.noteToggle}
                  onClick={() => {
                    setNoteFor((prev) => (prev === winner.id ? null : winner.id));
                    setNoteValue(winner.adminNote ?? '');
                  }}
                >
                  Add note
                </button>
              </div>

              <AnimatePresence initial={false}>
                {noteFor === winner.id ? (
                  <motion.div className={styles.noteArea} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                    <textarea className={styles.noteTextarea} value={noteValue} onChange={(event) => setNoteValue(event.target.value)} />
                    <div className={styles.noteActions}>
                      <Button variant="ghost" size="sm" onClick={() => setNoteFor(null)}>Cancel</Button>
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setWinners((prev) => prev.map((row) => row.id === winner.id ? { ...row, adminNote: noteValue } : row));
                          setNoteFor(null);
                          addToast({ type: 'success', message: 'Note saved.' });
                        }}
                      >
                        Save note
                      </Button>
                    </div>
                  </motion.div>
                ) : null}
              </AnimatePresence>
            </article>
          ))}
        </motion.section>
      </AnimatePresence>

      <Modal
        isOpen={Boolean(approveTarget)}
        onClose={() => setApproveTarget(null)}
        title="Approve this winner?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setApproveTarget(null)}>Cancel</Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (!approveTarget) return;
                const target = approveTarget;
                window.setTimeout(() => {
                  updateWinnerStatus(target.id, 'verified');
                  setApproveTarget(null);
                  addToast({ type: 'success', message: 'Winner approved. Member will be notified.' });
                }, 800);
              }}
            >
              Approve and notify
            </Button>
          </>
        }
      >
        {approveTarget ? <p>{approveTarget.userName} · £{approveTarget.amount.toFixed(2)} · {approveTarget.matchCount} matches</p> : null}
      </Modal>

      <Modal
        isOpen={Boolean(rejectTarget)}
        onClose={() => setRejectTarget(null)}
        title="Reject this submission?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setRejectTarget(null)}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              disabled={!rejectReason.trim()}
              onClick={() => {
                if (!rejectTarget || !rejectReason.trim()) return;
                updateWinnerStatus(rejectTarget.id, 'pending');
                setRejectReason('');
                setRejectTarget(null);
                addToast({ type: 'warning', message: 'Submission rejected.' });
              }}
            >
              Reject
            </Button>
          </>
        }
      >
        <label className={styles.rejectLabel}>Reason for rejection (required)</label>
        <textarea value={rejectReason} onChange={(event) => setRejectReason(event.target.value)} className={styles.noteTextarea} />
      </Modal>

      <Modal
        isOpen={Boolean(paidTarget)}
        onClose={() => setPaidTarget(null)}
        title="Confirm payment sent?"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setPaidTarget(null)}>Cancel</Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                if (!paidTarget) return;
                const target = paidTarget;
                updateWinnerStatus(target.id, 'paid');
                setPaidTarget(null);
                addToast({ type: 'success', message: `Payment of £${target.amount.toFixed(2)} marked as sent to ${target.userName}.` });
              }}
            >
              Confirm paid
            </Button>
          </>
        }
      >
        {paidTarget ? <p>{paidTarget.userName} · £{paidTarget.amount.toFixed(2)}</p> : null}
      </Modal>
    </div>
  );
};
