import React from 'react';
import { cn } from '@/utils/cn';

export type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: BadgeVariant;
}

export const Badge = React.forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = 'default', ...props }, ref) => {
    const variants = {
      default: 'bg-slate-100 text-slate-700',
      success: 'bg-green-50 text-green-700', // #F0FDF4 bg, #16A34A text
      error: 'bg-red-50 text-red-700', // #FEF2F2 bg, #DC2626 text
      warning: 'bg-amber-50 text-amber-700', // #FFFBEB bg, #D97706 text
      info: 'bg-blue-50 text-blue-700', // #EFF6FF bg, #2563EB text
    };

    return (
      <div
        ref={ref}
        className={cn(
          'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium h-5 transition-colors',
          variants[variant],
          className
        )}
        {...props}
      />
    );
  }
);

Badge.displayName = 'Badge';
