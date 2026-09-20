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
    // Base classes
    const baseStyles =
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

    // Variant classes
    const variants = {
      primary: 'bg-primary text-white hover:bg-slate-800', // Deep ink
      accent: 'bg-secondary text-white hover:bg-indigo-600', // Indigo highlight
      secondary:
        'bg-transparent border border-border text-primary hover:bg-slate-100', // Outline
      ghost: 'bg-transparent text-muted hover:text-primary hover:bg-slate-100', // No border
      destructive: 'bg-error text-white hover:bg-red-700', // Red
    };

    // Size classes
    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-10 px-4 text-sm',
      lg: 'h-12 px-6 text-base',
      icon: 'h-10 w-10',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
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
