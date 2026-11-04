import React from 'react';
import { cn } from '@/utils/cn';

export type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'badge-default',
      success: 'badge-success',
      error:   'badge-error',
      warning: 'badge-warning',
      info:    'badge-info',
    };

    return (
      <div
        ref={ref}
        className={cn('badge', variants[variant], className)}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
