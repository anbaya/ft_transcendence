import * as RadixAvatar from '@radix-ui/react-avatar';
import { cn } from '@/utils/cn';

export interface AvatarProps {
  src?: string;
  fallback: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
  lg: 'h-12 w-12 text-base',
  xl: 'h-16 w-16 text-lg',
};

export function Avatar({ src, fallback, size = 'md', className }: AvatarProps) {
  return (
    <RadixAvatar.Root className={cn('relative flex shrink-0 overflow-hidden rounded-full bg-slate-100', sizeClasses[size], className)}>
      <RadixAvatar.Image
        className="aspect-square h-full w-full object-cover"
        src={src}
        alt="Avatar"
      />
      <RadixAvatar.Fallback
        className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-700 font-medium"
        delayMs={600}
      >
        {fallback}
      </RadixAvatar.Fallback>
    </RadixAvatar.Root>
  );
}
