export type SpinnerSize = 'sm' | 'md' | 'lg';

export type SpinnerColor = 'primary' | 'accent' | 'white';

export interface SpinnerProps {
  size?: SpinnerSize;
  color?: SpinnerColor;
}
