import { cn, getInitials } from '../../../lib/utils';
import styles from './Avatar.module.css';
import type { AvatarProps } from './Avatar.types';

const AVATAR_COLORS = [
  'var(--color-accent)',
  'var(--color-primary)',
  'var(--color-success)',
  'var(--color-info)',
  'var(--color-warning)',
] as const;

const getAvatarColor = (name: string): string => {
  const hash = Array.from(name).reduce((sum, char) => sum + char.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
};

export const Avatar = ({ name, imageUrl, size = 'md' }: AvatarProps) => {
  if (imageUrl) {
    return (
      <div className={cn(styles.avatar, styles[size])} aria-label={name}>
        <img src={imageUrl} alt={name} className={styles.img} />
      </div>
    );
  }

  return (
    <div className={cn(styles.avatar, styles[size])} style={{ backgroundColor: getAvatarColor(name) }} aria-label={name}>
      {getInitials(name)}
    </div>
  );
};
