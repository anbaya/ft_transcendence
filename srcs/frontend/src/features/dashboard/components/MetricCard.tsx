import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

export type MetricVariant = 
  | 'default' 
  | 'indigo' 
  | 'blue' 
  | 'purple' 
  | 'emerald' 
  | 'amber' 
  | 'rose' 
  | 'primary' 
  | 'success' 
  | 'warning' 
  | 'error';

interface MetricCardProps {
  title: string;
  value: string | number;
  Icon: LucideIcon;
  variant?: MetricVariant;
}

const variantStyles: Record<MetricVariant, { card: string; icon: string }> = {
  blue: { card: 'metric-card-blue', icon: 'metric-card-icon-blue' },
  emerald: { card: 'metric-card-emerald', icon: 'metric-card-icon-emerald' },
  purple: { card: 'metric-card-purple', icon: 'metric-card-icon-purple' },
  indigo: { card: 'metric-card-indigo', icon: 'metric-card-icon-indigo' },
  amber: { card: 'metric-card-amber', icon: 'metric-card-icon-amber' },
  rose: { card: 'metric-card-rose', icon: 'metric-card-icon-rose' },
  primary: { card: 'metric-card-primary', icon: 'metric-card-icon-primary' },
  success: { card: 'metric-card-success', icon: 'metric-card-icon-success' },
  warning: { card: 'metric-card-warning', icon: 'metric-card-icon-warning' },
  error: { card: 'metric-card-error', icon: 'metric-card-icon-error' },
  default: { card: 'metric-card-default', icon: 'metric-card-icon-default' },
};

export function MetricCard({ title, value, Icon, variant = 'default' }: MetricCardProps) {
  const styles = variantStyles[variant] || variantStyles.default;

  return (
    <div className={cn('metric-card', styles.card)}>
      {/* Card Header: Circular icon pill on left + Title */}
      <div className="relative z-10 flex items-center gap-2.5">
        <div className={cn('metric-card-icon', styles.icon)}>
          <Icon className="h-4 w-4" />
        </div>
        <span className="text-sm font-medium text-slate-700">{title}</span>
      </div>

      {/* Card Value */}
      <div className="relative z-10 mt-3.5">
        <span className="text-3xl font-extrabold tracking-tight text-slate-900">{value}</span>
      </div>

      {/* Decorative Wave/Bar Silhouettes */}
      {variant === 'blue' && (
        <svg className="absolute bottom-0 right-0 w-36 h-20 pointer-events-none select-none opacity-60" viewBox="0 0 160 80" fill="none">
          <path d="M0 80 C 45 45, 90 70, 160 25 L 160 80 Z" fill="#93c5fd" opacity="0.45" />
          <path d="M25 80 C 70 35, 110 55, 160 10 L 160 80 Z" fill="#60a5fa" opacity="0.55" />
        </svg>
      )}

      {(variant === 'emerald' || variant === 'success') && (
        <svg className="absolute bottom-0 right-0 w-36 h-20 pointer-events-none select-none opacity-60" viewBox="0 0 160 80" fill="none">
          <path d="M0 80 C 45 45, 90 70, 160 25 L 160 80 Z" fill="#a7f3d0" opacity="0.45" />
          <path d="M25 80 C 70 35, 110 55, 160 10 L 160 80 Z" fill="#34d399" opacity="0.55" />
        </svg>
      )}

      {(variant === 'purple' || variant === 'indigo' || variant === 'primary') && (
        <div className="absolute bottom-2.5 right-4 flex items-end gap-1.5 pointer-events-none select-none opacity-30">
          <div className="w-2.5 h-6 rounded-t-sm bg-purple-400" />
          <div className="w-2.5 h-10 rounded-t-sm bg-purple-500" />
          <div className="w-2.5 h-14 rounded-t-sm bg-purple-500" />
          <div className="w-2.5 h-18 rounded-t-sm bg-purple-600" />
        </div>
      )}
    </div>
  );
}
