import React from 'react';
import { cn } from '@/utils/cn';

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, ...props }, ref) => {
    return (
      <div className="field-wrapper">
        {label && <label className="field-label">{label}</label>}
        <input
          ref={ref}
          className={cn('field h-10', error && 'field-error', className)}
          {...props}
        />
        {error && <span className="text-xs text-error mt-1">{error}</span>}
      </div>
    );
  }
);

Input.displayName = 'Input';
