import type { ReactNode, MouseEventHandler } from 'react';

export type CardPadding = 'sm' | 'md' | 'lg';

export interface CardProps {
  children: ReactNode;
  padding?: CardPadding;
  hoverable?: boolean;
  onClick?: MouseEventHandler<HTMLDivElement>;
  className?: string;
}
