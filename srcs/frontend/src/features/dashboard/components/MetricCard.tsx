import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  Icon: LucideIcon;
}

export function MetricCard({ title, value, Icon }: MetricCardProps) {
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
    </div>
  );
}
