import React from 'react';
import { cn } from '@/utils/cn';

export const Skeleton = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn('animate-pulse rounded-md bg-slate-100', className)}
      {...props}
    />
  );
});

Skeleton.displayName = 'Skeleton';
