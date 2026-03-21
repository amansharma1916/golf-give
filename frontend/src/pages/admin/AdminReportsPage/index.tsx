import { useEffect, useMemo, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import ScrollTrigger from 'gsap/ScrollTrigger';
import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  Tooltip,
} from 'chart.js';
import { Bar, Doughnut, Line } from 'react-chartjs-2';
import { PageHeader } from '../../../components/layout';
import { Badge, Button } from '../../../components/ui';
import { useAdminCharityStats, useAdminReports } from '../../../hooks/useAdmin';
import { containerVariants, fadeInVariants, itemVariants } from '../../../lib/animations';
import { useToastStore } from '../../../stores/toastStore';
import styles from './AdminReportsPage.module.css';

gsap.registerPlugin(ScrollTrigger);

ChartJS.register(ArcElement, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Tooltip, Legend, Filler);

ChartJS.defaults.font.family = 'var(--font-sans)';
ChartJS.defaults.color = '#6b6b6b';

const months = ['Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr'];

const activityFeed = [
  { time: '2 hours ago', text: 'James Whitfield submitted prize proof for March draw', badge: 'proof', type: 'info' },
  { time: '5 hours ago', text: '142 new scores entered ahead of April draw', badge: 'scores', type: 'neutral' },
  { time: '1 day ago', text: "Emma Clarke's verification approved - £2,099 payout pending", badge: 'verified', type: 'success' },
  { time: '2 days ago', text: 'March 2026 draw published - 16 winners across 3 tiers', badge: 'draw', type: 'success' },
  { time: '3 days ago', text: '8 new members subscribed (monthly plan)', badge: 'signup', type: 'neutral' },
  { time: '5 days ago', text: 'Golf Foundation charity contribution processed - £312.00', badge: 'charity', type: 'teal' },
  { time: '1 week ago', text: 'Tom Richards subscription cancelled', badge: 'cancel', type: 'warning' },
  { time: '1 week ago', text: 'January draw payout completed - £142.50 sent to James Whitfield', badge: 'paid', type: 'success' },
  { time: '2 weeks ago', text: 'Mind on the Fairway added to charity directory', badge: 'charity', type: 'neutral' },
  { time: '3 weeks ago', text: 'February draw published - 23 winners', badge: 'draw', type: 'success' },
] as const;

const dotColorByType: Record<(typeof activityFeed)[number]['type'], string> = {
  success: 'var(--color-success)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
  teal: 'color-mix(in srgb, var(--color-success) 70%, var(--color-info))',
  neutral: 'var(--color-border-strong)',
};

const gradientClasses = [styles.metricOne, styles.metricTwo, styles.metricThree, styles.metricFour];

export const AdminReportsPage = () => {
  const addToast = useToastStore((state) => state.addToast);
  const { data: reports } = useAdminReports();
  const { data: charityStatsData = [] } = useAdminCharityStats();
  const [chartsVisible, setChartsVisible] = useState(false);

  const revenueRef = useRef<HTMLSpanElement>(null);
  const subscribersRef = useRef<HTMLSpanElement>(null);
  const impactRef = useRef<HTMLSpanElement>(null);
  const poolRef = useRef<HTMLSpanElement>(null);

  const totalMonthly = (reports?.monthlyRevenue ?? 0) + (reports?.yearlyRevenue ?? 0);
  const totalDonationsMonth = charityStatsData.reduce(
    (sum: number, item: { monthlyAmount?: number }) => sum + (item.monthlyAmount ?? 0),
    0,
  );

  useEffect(() => {
    const rows = [
      { ref: revenueRef, value: totalMonthly, currency: true },
      { ref: subscribersRef, value: reports?.activeSubscribers ?? 0, currency: false },
      { ref: impactRef, value: reports?.totalCharityAllTime ?? 0, currency: true },
      { ref: poolRef, value: reports?.totalPrizePoolAllTime ?? 0, currency: true },
    ];

    rows.forEach(({ ref, value, currency }) => {
      if (!ref.current) return;
      const count = { value: 0 };
      gsap.to(count, {
        value,
        duration: 1.7,
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
  }, [reports, totalMonthly]);

  const lineData = useMemo(() => ({
    labels: months,
    datasets: [
      {
        label: 'Monthly revenue',
        data: [24200, 25100, 26300, 27100, 28000, 28640],
        borderColor: 'var(--color-info)',
        pointRadius: 3,
        pointBackgroundColor: 'var(--color-info)',
        tension: 0.4,
      },
      {
        label: 'Yearly revenue',
        data: [9800, 10200, 10900, 11400, 12100, 12480],
        borderColor: 'color-mix(in srgb, var(--color-primary) 58%, var(--color-info))',
        borderDash: [6, 4],
        pointRadius: 3,
        pointBackgroundColor: 'color-mix(in srgb, var(--color-primary) 58%, var(--color-info))',
        tension: 0.4,
      },
    ],
  }), []);

  const barData = useMemo(() => ({
    labels: months,
    datasets: [
      {
        label: 'Active subscribers',
        data: [2200, 2510, 2780, 2940, 3050, 3102],
        backgroundColor: 'color-mix(in srgb, var(--color-accent) 80%, transparent)',
        borderRadius: 12,
      },
    ],
  }), []);

  const charityColors = [
    'var(--color-accent)',
    'color-mix(in srgb, var(--color-primary) 58%, var(--color-info))',
    'color-mix(in srgb, var(--color-success) 68%, var(--color-info))',
    'var(--color-info)',
    'color-mix(in srgb, var(--color-warning) 70%, var(--color-error))',
  ];

  const doughnutData = useMemo(() => ({
    labels: charityStatsData.map((item: { charityName?: string; name?: string }) => item.charityName ?? item.name ?? 'Charity'),
    datasets: [
      {
        data: charityStatsData.map((item: { monthlyAmount?: number }) => item.monthlyAmount ?? 0),
        backgroundColor: charityColors,
        borderWidth: 0,
      },
    ],
  }), [charityStatsData]);

  return (
    <div className={styles.page}>
      <PageHeader
        title="Reports"
        subtitle="Platform-wide analytics, revenue overview, and draw statistics."
        actions={
          <Button variant="secondary" size="sm" onClick={() => addToast({ type: 'info', message: 'Exporting...' })}>
            Export report
          </Button>
        }
      />

      <motion.section className={styles.metricsGrid} variants={containerVariants} initial="initial" animate="animate">
        {[
          {
            label: 'Total revenue',
            ref: revenueRef,
            trend: '+18% vs last month',
            sub: 'Monthly £28,640 · Yearly £12,480',
          },
          {
            label: 'Active subscribers',
            ref: subscribersRef,
            trend: '+142 this month',
            sub: 'of 3,420 total members',
          },
          {
            label: 'Total charity impact',
            ref: impactRef,
            trend: 'Across 24 charities',
            sub: 'Avg 10% of all subscriptions',
          },
          {
            label: 'Prize pool distributed',
            ref: poolRef,
            trend: 'Across 18 draws',
            sub: 'Jackpot rolled over 3 times',
          },
        ].map((metric, index) => (
          <motion.article key={metric.label} className={`${styles.metricCard} ${gradientClasses[index]}`} variants={itemVariants}>
            <span className={styles.metricLabel}>{metric.label}</span>
            <span ref={metric.ref} className={styles.metricValue}>0</span>
            <p className={styles.metricTrend}>{metric.trend}</p>
            <p className={styles.metricSub}>{metric.sub}</p>
          </motion.article>
        ))}
      </motion.section>

      <motion.section className={styles.chartsRow} variants={fadeInVariants} initial="initial" whileInView="animate" onViewportEnter={() => setChartsVisible(true)} viewport={{ once: true }}>
        <article className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Revenue over time</h3>
          <div className={styles.chartContainer}>
            {chartsVisible ? (
              <Line
                data={lineData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom' } },
                  scales: {
                    y: { grid: { color: 'rgba(0,0,0,0.08)' } },
                    x: { grid: { color: 'rgba(0,0,0,0.05)' } },
                  },
                }}
              />
            ) : null}
          </div>
        </article>

        <article className={styles.chartCard}>
          <h3 className={styles.chartTitle}>Subscriber growth</h3>
          <div className={styles.chartContainer}>
            {chartsVisible ? (
              <Bar
                data={barData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    y: { grid: { color: 'rgba(0,0,0,0.08)' } },
                    x: { grid: { display: false } },
                  },
                }}
              />
            ) : null}
          </div>
        </article>
      </motion.section>

      <article className={styles.chartCard}>
        <h3 className={styles.chartTitle}>Charity contributions this month</h3>
        <div className={styles.charitySection}>
          <div className={styles.donutContainer}>
            {chartsVisible ? <Doughnut data={doughnutData} options={{ responsive: true, maintainAspectRatio: false, cutout: '65%', plugins: { legend: { display: false } } }} /> : null}
          </div>

          <div className={styles.charityLegend}>
            {charityStatsData.map((charity: { charityId: string; charityName?: string; name?: string; monthlyAmount?: number; memberCount?: number }, index: number) => {
              const percent = totalDonationsMonth > 0 ? Math.round(((charity.monthlyAmount ?? 0) / totalDonationsMonth) * 100) : 0;
              return (
                <div key={charity.charityId} className={styles.legendRow}>
                  <div className={styles.legendMeta}>
                    <span className={styles.legendName}><span className={styles.legendDot} style={{ background: charityColors[index] }} />{charity.charityName ?? charity.name ?? 'Charity'}</span>
                    <span>£{(charity.monthlyAmount ?? 0).toFixed(0)} · {charity.memberCount ?? 0}</span>
                  </div>
                  <div className={styles.legendBar}>
                    <motion.div className={styles.legendBarFill} style={{ width: `${percent}%`, background: charityColors[index] }} initial={{ scaleX: 0 }} whileInView={{ scaleX: 1 }} viewport={{ once: true }} />
                  </div>
                </div>
              );
            })}
            <p className={styles.totalRow}>Total this month: £{totalDonationsMonth.toFixed(0)}</p>
          </div>
        </div>
      </article>

      <section>
        <h3 className={styles.sectionTitle}>Draw history stats</h3>
        <motion.div className={styles.drawStats} variants={containerVariants} initial="initial" whileInView="animate" viewport={{ once: true }}>
          {[
            ['Total draws completed', '18'],
            ['Total winners', '127'],
            ['Jackpot rolled over', '3 times'],
            ['Avg prize per winner', `£${Math.round(284500 / 127)}`],
            ['Most matches in one draw', '5 (Feb 2026)'],
            ['Avg members per draw', '2,856'],
          ].map(([label, value]) => (
            <motion.article key={label} className={styles.miniStatCard} variants={itemVariants} whileHover={{ y: -2 }}>
              <p className={styles.miniStatValue}>{value}</p>
              <p className={styles.miniStatLabel}>{label}</p>
            </motion.article>
          ))}
        </motion.div>
      </section>

      <section>
        <h3 className={styles.sectionTitle}>Recent platform activity</h3>
        <div className={styles.activityFeed}>
          <div className={styles.activityLine} />
          <motion.div variants={containerVariants} initial="initial" whileInView="animate" viewport={{ once: true, margin: '-40px' }}>
            {activityFeed.map((item) => (
              <motion.article key={`${item.time}-${item.badge}`} className={styles.activityItem} variants={itemVariants}>
                <span className={styles.activityDot} style={{ background: dotColorByType[item.type] }} />
                <div className={styles.activityContent}>
                  <p className={styles.activityText}>{item.text}</p>
                  <p className={styles.activityTime}>{item.time}</p>
                  <Badge variant={item.type === 'warning' ? 'warning' : item.type === 'success' ? 'success' : 'neutral'} size="sm">{item.badge}</Badge>
                </div>
              </motion.article>
            ))}
          </motion.div>
        </div>
      </section>
    </div>
  );
};
