import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import { PageHeader } from '../../../components/layout';
import { Avatar, Badge, Button, Input, Modal } from '../../../components/ui';
import { useAdminUsers, useUpdateUserScores } from '../../../hooks/useAdmin';
import { containerVariants, itemVariants } from '../../../lib/animations';
import { cn, formatDate, formatMonth } from '../../../lib/utils';
import { useToastStore } from '../../../stores/toastStore';
import styles from './AdminUsersPage.module.css';

gsap.registerPlugin(ScrollTrigger);

type UserStatusFilter = 'all' | 'active' | 'lapsed' | 'cancelled';

type EditableUser = {
  id: string;
  fullName: string;
  email: string;
  createdAt: string;
  scores: number[];
  totalWinnings: number;
  subscription: {
    plan: 'monthly' | 'yearly';
    status: 'active' | 'lapsed' | 'cancelled' | 'inactive';
    currentPeriodEnd: string;
  };
};

const getScoreClass = (score: number): string => {
  if (score >= 35) return styles.scoreGood;
  if (score >= 28) return styles.scoreInfo;
  if (score >= 20) return styles.scoreWarn;
  return styles.scoreBad;
};

const statusBadgeVariant = (status: string): 'success' | 'warning' | 'error' | 'neutral' => {
  if (status === 'active') return 'success';
  if (status === 'lapsed') return 'warning';
  if (status === 'cancelled') return 'error';
  return 'neutral';
};

const EyeIcon = () => <span aria-hidden="true">👁</span>;
const EditIcon = () => <span aria-hidden="true">✎</span>;

export const AdminUsersPage = () => {
  const addToast = useToastStore((state) => state.addToast);
  const { data: usersData = [] } = useAdminUsers();
  const updateUserScoresMutation = useUpdateUserScores();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatusFilter>('all');
  const [selectedUser, setSelectedUser] = useState<EditableUser | null>(null);
  const [editingUser, setEditingUser] = useState<EditableUser | null>(null);
  const [draftScores, setDraftScores] = useState<string[]>([]);

  const totalRef = useRef<HTMLSpanElement>(null);
  const activeRef = useRef<HTMLSpanElement>(null);
  const lapsedRef = useRef<HTMLSpanElement>(null);
  const cancelledRef = useRef<HTMLSpanElement>(null);

  const users: EditableUser[] = usersData.map((user: EditableUser) => user);

  const statusCounts = useMemo(() => {
    return {
      total: 3420,
      active: 3102,
      lapsed: 198,
      cancelled: 120,
    };
  }, []);

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchSearch =
        user.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = statusFilter === 'all' || user.subscription.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [searchQuery, statusFilter, users]);

  useEffect(() => {
    const counters = [
      { ref: totalRef, value: statusCounts.total },
      { ref: activeRef, value: statusCounts.active },
      { ref: lapsedRef, value: statusCounts.lapsed },
      { ref: cancelledRef, value: statusCounts.cancelled },
    ];

    counters.forEach(({ ref, value }) => {
      if (!ref.current) return;
      const count = { value: 0 };
      gsap.to(count, {
        value,
        duration: 1.6,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: ref.current,
          start: 'top 85%',
          once: true,
        },
        onUpdate: () => {
          if (ref.current) {
            ref.current.textContent = Math.round(count.value).toLocaleString();
          }
        },
      });
    });
  }, [statusCounts]);

  const openEdit = (user: EditableUser) => {
    setEditingUser(user);
    const next = Array.from({ length: 5 }, (_, idx) => String(user.scores[idx] ?? ''));
    setDraftScores(next);
  };

  const saveScores = async () => {
    if (!editingUser) return;

    try {
      const payload = draftScores
        .map((score) => Number(score))
        .filter((score) => Number.isFinite(score) && score > 0)
        .map((score) => ({ score, playedAt: new Date().toISOString().slice(0, 10) }));

      await updateUserScoresMutation.mutateAsync({ userId: editingUser.id, scores: payload });
      setEditingUser(null);
    } catch {
      addToast({ type: 'error', message: 'Failed to update scores' });
    }
  };

  return (
    <div className={styles.page}>
      <PageHeader
        title="Users"
        subtitle="Manage subscribers, view scores, and monitor subscription status."
        actions={<Badge variant="neutral">3,420 members</Badge>}
      />

      <section className={styles.statsBar}>
        <article className={styles.statCard}><p>Total users</p><span ref={totalRef}>0</span></article>
        <article className={cn(styles.statCard, styles.statSuccess)}><p>Active subscribers</p><span ref={activeRef}>0</span></article>
        <article className={cn(styles.statCard, styles.statWarning)}><p>Lapsed</p><span ref={lapsedRef}>0</span></article>
        <article className={cn(styles.statCard, styles.statError)}><p>Cancelled</p><span ref={cancelledRef}>0</span></article>
      </section>

      <section>
        <div className={styles.filterBar}>
          <div className={styles.searchWrap}>
            <Input
              name="userSearch"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search by name or email..."
            />
          </div>

          <div className={styles.statusTabs}>
            {(['all', 'active', 'lapsed', 'cancelled'] as UserStatusFilter[]).map((status) => (
              <button
                type="button"
                key={status}
                className={cn(styles.statusBtn, statusFilter === status && styles.statusBtnActive)}
                onClick={() => setStatusFilter(status)}
              >
                {status === 'all' ? 'All' : status[0].toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => addToast({ type: 'info', message: 'CSV export started.' })}
          >
            Export CSV
          </Button>
        </div>

        <p className={styles.resultsCount}>Showing {filteredUsers.length} of {users.length} members</p>

        {filteredUsers.length === 0 ? (
          <div className={styles.empty}>No users match your filters.</div>
        ) : (
          <>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead className={styles.tableHeader}>
                  <tr>
                    <th className={styles.th}>User</th>
                    <th className={styles.th}>Plan</th>
                    <th className={styles.th}>Status</th>
                    <th className={styles.th}>Scores</th>
                    <th className={styles.th}>Winnings</th>
                    <th className={styles.th}>Joined</th>
                    <th className={styles.th}>Actions</th>
                  </tr>
                </thead>
                <AnimatePresence mode="wait">
                  <motion.tbody key={`${statusFilter}-${searchQuery}`} initial="initial" animate="animate" variants={containerVariants}>
                    {filteredUsers.map((user) => (
                      <motion.tr key={user.id} className={styles.tr} variants={itemVariants}>
                        <td className={styles.td}>
                          <div className={styles.userCell}>
                            <Avatar name={user.fullName} size="sm" />
                            <div>
                              <p className={styles.userName}>{user.fullName}</p>
                              <p className={styles.userEmail}>{user.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className={styles.td}>
                          <Badge variant="info" size="sm">{user.subscription.plan === 'monthly' ? 'Monthly' : 'Yearly'}</Badge>
                        </td>
                        <td className={styles.td}>
                          <Badge variant={statusBadgeVariant(user.subscription.status)} size="sm">
                            {user.subscription.status[0].toUpperCase() + user.subscription.status.slice(1)}
                          </Badge>
                        </td>
                        <td className={styles.td}>
                          <div className={styles.scoreWrap}>
                            {user.scores.slice(0, 5).map((score, index) => (
                              <span key={`${user.id}-${index}`} className={cn(styles.scoreChip, getScoreClass(score))}>{score}</span>
                            ))}
                            {user.scores.length > 5 ? <span className={styles.moreScores}>+{user.scores.length - 5} more</span> : null}
                          </div>
                        </td>
                        <td className={styles.td}>{user.totalWinnings > 0 ? `£${user.totalWinnings.toFixed(2)}` : '—'}</td>
                        <td className={styles.td}>{formatDate(user.createdAt)}</td>
                        <td className={styles.td}>
                          <div className={styles.actions}>
                            <button className={styles.actionBtn} onClick={() => setSelectedUser(user)} aria-label="View user"><EyeIcon /></button>
                            <button className={styles.actionBtn} onClick={() => openEdit(user)} aria-label="Edit scores"><EditIcon /></button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </motion.tbody>
                </AnimatePresence>
              </table>
            </div>

            <div className={styles.mobileList}>
              {filteredUsers.map((user) => (
                <div key={`${user.id}-mobile`} className={styles.mobileUserCard}>
                  <div className={styles.mobileTop}>
                    <Avatar name={user.fullName} size="sm" />
                    <div>
                      <p className={styles.userName}>{user.fullName}</p>
                      <p className={styles.userEmail}>{user.email}</p>
                    </div>
                  </div>
                  <div className={styles.mobileMeta}>
                    <Badge variant="info" size="sm">{user.subscription.plan}</Badge>
                    <Badge variant={statusBadgeVariant(user.subscription.status)} size="sm">{user.subscription.status}</Badge>
                  </div>
                  <div className={styles.scoreWrap}>
                    {user.scores.slice(0, 5).map((score, index) => (
                      <span key={`${user.id}-m-${index}`} className={cn(styles.scoreChip, getScoreClass(score))}>{score}</span>
                    ))}
                  </div>
                  <div className={styles.mobileActions}>
                    <Button variant="secondary" size="sm" onClick={() => setSelectedUser(user)}>View</Button>
                    <Button variant="ghost" size="sm" onClick={() => openEdit(user)}>Edit scores</Button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </section>

      <Modal
        isOpen={Boolean(selectedUser)}
        onClose={() => setSelectedUser(null)}
        title={selectedUser?.fullName}
        size="lg"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setSelectedUser(null)}>Close</Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                if (!selectedUser) return;
                const user = selectedUser;
                setSelectedUser(null);
                openEdit(user);
              }}
            >
              Edit scores
            </Button>
          </>
        }
      >
        {selectedUser ? (
          <div className={styles.userDetailGrid}>
            <div>
              <div className={styles.detailProfile}>
                <Avatar name={selectedUser.fullName} size="lg" />
                <div>
                  <p className={styles.userName}>{selectedUser.fullName}</p>
                  <p className={styles.userEmail}>{selectedUser.email}</p>
                  <p className={styles.detailMuted}>Member since {formatDate(selectedUser.createdAt)}</p>
                </div>
              </div>
              <div className={styles.subscriptionCard}>
                <Badge variant="info" size="sm">{selectedUser.subscription.plan}</Badge>
                <Badge variant={statusBadgeVariant(selectedUser.subscription.status)} size="sm">{selectedUser.subscription.status}</Badge>
                <p>{selectedUser.subscription.status === 'active' ? 'Renews' : 'Expired'} {formatDate(selectedUser.subscription.currentPeriodEnd)}</p>
                <p>£{selectedUser.subscription.plan === 'monthly' ? '9.99' : '89.99'} / month</p>
              </div>
              <div className={styles.scoreSection}>
                <h4>Scores</h4>
                <div className={styles.scoreWrap}>
                  {selectedUser.scores.length > 0 ? selectedUser.scores.slice(0, 5).map((score, idx) => (
                    <span key={`${selectedUser.id}-detail-${idx}`} className={cn(styles.scoreChip, getScoreClass(score))}>{score}</span>
                  )) : <span className={styles.detailMuted}>No scores entered</span>}
                </div>
                <p className={styles.detailMuted}>Last updated {formatMonth('2026-03-01')}</p>
              </div>
            </div>
            <div className={styles.statsCol}>
              <p className={styles.statTitle}>Total winnings</p>
              <p className={styles.totalWinnings}>£{selectedUser.totalWinnings.toFixed(2)}</p>
              <p className={styles.detailMuted}>Draws entered: 18</p>
              <p className={styles.detailMuted}>Win rate: 14%</p>
              <p className={styles.detailMuted}>Charity: Golf Foundation · 10%</p>
            </div>
          </div>
        ) : null}
      </Modal>

      <Modal
        isOpen={Boolean(editingUser)}
        onClose={() => setEditingUser(null)}
        title={editingUser ? `Edit scores — ${editingUser.fullName}` : 'Edit scores'}
        size="md"
        footer={
          <>
            <Button variant="ghost" size="sm" onClick={() => setEditingUser(null)}>Cancel</Button>
            <Button variant="primary" size="sm" onClick={saveScores}>Save scores</Button>
          </>
        }
      >
        <div className={styles.editForm}>
          {draftScores.map((score, index) => {
            const value = Number(score || '0');
            return (
              <div key={`score-${index}`} className={styles.editRow}>
                <label htmlFor={`score-${index}`}>Score {index + 1}</label>
                <div className={styles.inputWithPreview}>
                  <input
                    id={`score-${index}`}
                    type="number"
                    min={1}
                    max={45}
                    value={score}
                    placeholder="Not entered"
                    onChange={(event) => {
                      const next = [...draftScores];
                      next[index] = event.target.value;
                      setDraftScores(next);
                    }}
                  />
                  {score ? <span className={cn(styles.scoreChip, getScoreClass(value))}>{value}</span> : null}
                </div>
              </div>
            );
          })}
          <div className={styles.infoCard}>Changes made here are reflected in the next draw.</div>
        </div>
      </Modal>
    </div>
  );
};
