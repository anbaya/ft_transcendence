import * as RadixAvatar from '@radix-ui/react-avatar';
import { cn } from '@/utils/cn';

export interface AvatarProps {
  src?: string;
  userId?: number | string | null;
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

export function Avatar({ src, userId, fallback, size = 'md', className }: AvatarProps) {
  const imageSrc = src || (userId ? `/api/auth/users/${userId}/avatar/` : undefined);

  return (
    <RadixAvatar.Root className={cn('avatar', sizeClasses[size], className)}>
      <RadixAvatar.Image className="avatar-img" src={imageSrc} alt="Avatar" />
      <RadixAvatar.Fallback className="avatar-fall" delayMs={0}>
        {fallback}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
