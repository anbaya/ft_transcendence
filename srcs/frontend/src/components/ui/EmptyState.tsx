import React from 'react';
import { cn } from '@/utils/cn';
import { Button } from './Button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps extends React.HTMLAttributes<HTMLDivElement> {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  (
    { className, icon: Icon, title, description, actionLabel, onAction, ...props },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          'flex flex-col items-center justify-center p-8 text-center',
          className
        )}
        {...props}
      >
        {Icon && (
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Icon className="h-6 w-6 text-muted" />
          </div>
        )}
        <h3 className="text-base font-medium text-primary mb-1">{title}</h3>
        <p className="text-sm text-muted mb-6 max-w-sm">{description}</p>
        
        {actionLabel && onAction && (
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    );
  }
);

EmptyState.displayName = 'EmptyState';
