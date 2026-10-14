import { useEffect } from 'react';
import { CheckCircle2, ListTodo, TrendingUp } from 'lucide-react';
import { MetricCard } from '@/features/dashboard/components/MetricCard';
import { TaskFeed } from '@/features/dashboard/components/TaskFeed';
import { ActivityHeatmap } from '@/features/dashboard/components/ActivityHeatmap';
import { ActiveProjectsWidget } from '@/features/dashboard/components/ActiveProjectsWidget';
import { useAuthStore } from '@/stores/authStore';
import { useTaskStore } from '@/stores/taskStore';

export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);
  const { myTasks, fetchMyTasks } = useTaskStore();

  useEffect(() => {
    fetchMyTasks();
  }, []);

  const displayName = user?.first_name || user?.email?.split('@')[0] || 'there';

  // Determine greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Simple, clean metrics
  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter((t) => t.status === 'Done').length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const subText = pendingTasks > 0
    ? `You have ${pendingTasks} pending ${pendingTasks === 1 ? 'task' : 'tasks'} remaining.`
    : "You're all caught up!";

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-primary">
          {greeting}, {displayName}.
        </h1>
        <p className="text-sm text-muted mt-1">{subText}</p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Pending Tasks"
          value={pendingTasks}
          icon={ListTodo}
        />
        <MetricCard
          title="Completed Tasks"
          value={completedTasks}
          icon={CheckCircle2}
        />
        <MetricCard
          title="Completion Rate"
          value={`${completionRate}%`}
          icon={TrendingUp}
        />
      </div>

      {/* Content Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column (2 spans): Feed + Heatmap */}
        <div className="space-y-6 lg:col-span-2">
          <TaskFeed />
          <ActivityHeatmap />
        </div>

        {/* Right Column (1 span): Active Projects */}
        <div className="space-y-6">
          <ActiveProjectsWidget />
        </div>
      </div>
    </div>
  );
}
