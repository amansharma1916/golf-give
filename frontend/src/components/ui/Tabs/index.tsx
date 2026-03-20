import { cn } from '../../../lib/utils';
import styles from './Tabs.module.css';
import type { TabsProps } from './Tabs.types';

export const Tabs = ({ tabs, activeTab, onChange }: TabsProps) => {
  return (
    <div className={styles.tabs} role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          role="tab"
          aria-selected={tab.id === activeTab}
          className={cn(styles.tab, tab.id === activeTab && styles.active)}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
          {typeof tab.count === 'number' && <span className={styles.count}>{tab.count}</span>}
        </button>
      ))}
    </div>
  );
};
