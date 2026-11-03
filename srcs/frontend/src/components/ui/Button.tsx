import React from 'react';
import { cn } from '@/utils/cn';
import { Loader2 } from 'lucide-react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'accent' | 'secondary' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      children,
      disabled,
      ...props
    },
    ref
  ) => {
    const variants = {
      primary:     'btn-primary',
      accent:      'btn-accent',
      secondary:   'btn-secondary',
      ghost:       'btn-ghost',
      destructive: 'btn-destructive',
    };

    const sizes = {
      sm:   'btn-sm',
      md:   'btn-md',
      lg:   'btn-lg',
      icon: 'btn-icon',
    };

    return (
      <button
        ref={ref}
        className={cn('btn', variants[variant], sizes[size], className)}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
