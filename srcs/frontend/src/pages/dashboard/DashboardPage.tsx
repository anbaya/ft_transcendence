import { CheckCircle2, ListTodo, TrendingUp } from 'lucide-react';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { TaskFeed } from '@/features/dashboard/components/TaskFeed';
import { ActivityHeatmap } from '@/features/dashboard/components/ActivityHeatmap';
import { ActiveProjectsWidget } from '@/features/dashboard/components/ActiveProjectsWidget';
import { useAuthStore } from '@/stores/authStore';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const displayName = user?.name?.split(' ')[0] || 'there';

  // Determine greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          {greeting}, {displayName}.
        </h1>
        <p className="text-sm text-muted mt-1">
          You have 7 tasks remaining today.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Today's Tasks"
          value={7}
          icon={ListTodo}
          trend={{ value: '14%', direction: 'up', label: 'vs last week' }}
        />
        <MetricCard
          title="This Week Total"
          value={31}
          icon={CheckCircle2}
          trend={{ value: '8%', direction: 'up', label: 'vs last week' }}
        />
        <MetricCard
          title="Completion Rate"
          value="78%"
          icon={TrendingUp}
          progress={78}
        />
      </div>

      {/* Main Content — 2 Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        {/* Left Column: Task Feed (takes more space) */}
        <div className="lg:col-span-3">
          <TaskFeed />
        </div>

        {/* Right Column: Activity + Projects */}
        <div className="space-y-6 lg:col-span-2">
          <ActivityHeatmap />
          <ActiveProjectsWidget />
        </div>
      </div>
    </div>
  );
}
