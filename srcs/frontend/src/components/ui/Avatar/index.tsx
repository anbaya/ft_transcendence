import * as RadixAvatar from '@radix-ui/react-avatar';
import { cn } from '@/utils/cn';

export interface AvatarProps {
  src?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'avatar-sm',
  md: 'avatar-md',
  lg: 'avatar-lg',
  xl: 'avatar-xl',
};

export function Avatar({ src, fallback, size = 'md', className }: AvatarProps) {
  return (
    <RadixAvatar.Root className={cn('avatar', sizeClasses[size], className)}>
      <RadixAvatar.Image className="avatar-img" src={src} alt="Avatar" />
      <RadixAvatar.Fallback className="avatar-fall" delayMs={src ? 600 : 0}>
        {fallback}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
