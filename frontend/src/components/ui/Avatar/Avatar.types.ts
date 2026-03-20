export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  name: string;
  imageUrl?: string;
  size?: AvatarSize;
}
