import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SpinnerProps extends React.SVGProps<SVGSVGElement> {
  size?: 'sm' | 'md' | 'lg';
  variant?: 'primary' | 'muted' | 'white';
}

export const Spinner = React.forwardRef<SVGSVGElement, SpinnerProps>(
  ({ className, size = 'md', variant = 'muted', ...props }, ref) => {
    const sizes = {
      sm: 'h-4 w-4',
      md: 'h-6 w-6',
      lg: 'h-10 w-10',
    };

    const variants = {
      primary: 'text-secondary', // Indigo
      muted: 'text-muted', // Slate 500
      white: 'text-white',
    };

    return (
      <Loader2
        ref={ref}
        className={cn('animate-spin', sizes[size], variants[variant], className)}
        {...props}
      />
    );
  }
);

Spinner.displayName = 'Spinner';
