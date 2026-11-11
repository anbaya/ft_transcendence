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
  }, [user?.id]);

  const displayName = user?.first_name || user?.email?.split('@')[0] || 'there';

  // Determine greeting based on time of day
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  // Simple, clean metrics
  const totalTasks = myTasks.length;
  const completedTasks = myTasks.filter((t) => t.status === 'COMPLETED').length;
  const pendingTasks = totalTasks - completedTasks;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const highPriorityTasks = myTasks.filter(
    (t) => t.status !== 'COMPLETED' && t.priority === 'HIGH'
  ).length;

  const subText = pendingTasks > 0
    ? `You have ${pendingTasks} ${pendingTasks === 1 ? 'task' : 'tasks'} remaining today.${highPriorityTasks > 0 ? ` ${highPriorityTasks} ${highPriorityTasks === 1 ? 'is' : 'are'} high priority.` : ''}`
    : "You're all caught up for today!";

  const statusText = completionRate >= 70
    ? "You're on track to finish this week ahead of schedule."
    : completionRate >= 30
    ? "Keep pushing forward to hit your weekly goals."
    : "Plan your day and start checking off high-priority tasks.";

  return (
    <div className="space-y-6">
      {/* Welcome Hero Banner with landscape */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-100/70 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-purple-50/20 p-6 sm:p-7 shadow-xs">
        {/* Background Scenic Landscape */}
        <div 
          className="absolute inset-y-0 right-0 w-full sm:w-2/3 pointer-events-none select-none bg-cover bg-right bg-no-repeat opacity-90"
          style={{ backgroundImage: `url('/dashboard-banner.jpg')` }}
        >
          {/* Subtle gradient blend from card background into image */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-50/95 via-blue-50/40 to-transparent" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="max-w-xl">
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-primary flex items-center gap-2">
              <span>{greeting}, {displayName}.</span>
            </h1>
            <p className="text-sm font-medium text-slate-700 mt-2">
              {subText}
            </p>
            <p className="text-xs text-muted mt-1">
              {statusText}
            </p>
          </div>

          <span className="text-xs text-slate-500 font-medium hidden md:inline-block shrink-0 mt-1">
            Small steps. Big results.
          </span>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Pending Tasks"
          value={pendingTasks}
          Icon={ListTodo}
          variant="blue"
        />
        <MetricCard
          title="Completed Tasks"
          value={completedTasks}
          Icon={CheckCircle2}
          variant="emerald"
        />
        <MetricCard
          title="Completion Rate"
          value={`${completionRate}%`}
          Icon={TrendingUp}
          variant="purple"
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
