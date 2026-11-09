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
  | 'red' 
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

const cardVariants: Record<MetricVariant, string> = {
  default: '',
  indigo:  'metric-card-indigo',
  blue:    'metric-card-blue',
  purple:  'metric-card-purple',
  emerald: 'metric-card-emerald',
  amber:   'metric-card-amber',
  rose:    'metric-card-rose',
  red:     'metric-card-rose',
  primary: 'metric-card-indigo',
  success: 'metric-card-emerald',
  warning: 'metric-card-amber',
  error:   'metric-card-rose',
};

const iconVariants: Record<MetricVariant, string> = {
  default: '',
  indigo:  'metric-card-icon-indigo',
  blue:    'metric-card-icon-blue',
  purple:  'metric-card-icon-purple',
  emerald: 'metric-card-icon-emerald',
  amber:   'metric-card-icon-amber',
  rose:    'metric-card-icon-rose',
  red:     'metric-card-icon-rose',
  primary: 'metric-card-icon-indigo',
  success: 'metric-card-icon-emerald',
  warning: 'metric-card-icon-amber',
  error:   'metric-card-icon-rose',
};

export function MetricCard({ title, value, Icon, variant = 'default' }: MetricCardProps) {
  return (
    <div className={cn('metric-card', cardVariants[variant])}>
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{title}</span>
        <div className={cn('metric-card-icon', iconVariants[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-3">
        <span className="text-3xl font-bold tracking-tight text-primary">{value}</span>
      </div>
    </div>
  );
}
