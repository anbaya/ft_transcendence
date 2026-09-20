import type { LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: string;
    direction: 'up' | 'down';
    label: string;
  };
  progress?: number; // 0–100
}

export function MetricCard({ title, value, icon: Icon, trend, progress }: MetricCardProps) {
  return (
    <div className="rounded-lg border border-border bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-muted">{title}</span>
        <div className="flex h-9 w-9 items-center justify-center rounded-md bg-indigo-50 text-secondary">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3">
        <span className="text-3xl font-bold tracking-tight text-primary">{value}</span>
      </div>

      {progress !== undefined && (
        <div className="mt-3">
          <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-secondary transition-all duration-500 ease-out"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
        </div>
      )}

      {trend && (
        <div className="mt-3 flex items-center gap-1.5">
          <div
            className={cn(
              'flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-xs font-semibold',
              trend.direction === 'up'
                ? 'bg-green-50 text-green-600'
                : 'bg-red-50 text-red-600'
            )}
          >
            {trend.direction === 'up' ? (
              <TrendingUp className="h-3 w-3" />
            ) : (
              <TrendingDown className="h-3 w-3" />
            )}
            {trend.value}
          </div>
          <span className="text-xs text-muted">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
