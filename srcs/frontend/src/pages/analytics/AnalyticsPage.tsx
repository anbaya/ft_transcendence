import { useEffect } from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  TrendingUp, 
  TrendingDown, 
  CheckCircle2, 
  AlertCircle, 
  ListTodo, 
  Clock, 
  BarChart2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Progress } from '@/components/ui/Progress';
import { Avatar } from '@/components/ui/Avatar';
import { Skeleton } from '@/components/ui/Skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { ErrorState } from '@/components/ui/ErrorState';
import { useProjectStore } from '@/stores/projectStore';
import { useAnalyticsStore } from '@/stores/analyticsStore';
import { useTaskStore } from '@/stores/taskStore';

const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function AnalyticsPage() {
  // Global state stores
  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchProjectTasks } = useTaskStore();
  const {
    data: analytics,
    isLoading,
    error,
    isServiceUnavailable,
    fetchAnalytics,
    selectedProjectId,
    setSelectedProjectId,
    clearAnalytics,
  } = useAnalyticsStore();

  // 1. On mount: fetch all user projects for the dropdown selector
  useEffect(() => {
    fetchProjects();
  }, []);

  // 2. Auto-select the first project once projects list is available
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(String(projects[0].id));
    }
  }, [projects]);

  // 3. Fetch analytics and tasks whenever the user switches the selected project
  useEffect(() => {
    if (selectedProjectId) {
      fetchAnalytics(selectedProjectId);
      fetchProjectTasks(Number(selectedProjectId));
    } else {
      clearAnalytics();
    }
  }, [selectedProjectId]);

  // Compute live 7-day completion trend (Mon-Sun) from the project tasks
  const counts: Record<string, number> = { Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0, Sun: 0 };
  
  tasks.forEach((task) => {
    if (task.status === 'COMPLETED') {
      const date = new Date(task.updated_at || task.created_at);
      const dayIndex = (date.getDay() + 6) % 7; // Convert to Mon=0 ... Sun=6
      const dayName = daysOfWeek[dayIndex];
      if (dayName) counts[dayName] = (counts[dayName] || 0) + 1;
    }
  });

  const trendData = daysOfWeek.map((name) => ({
    name,
    completed: counts[name] || 0,
  }));

  // Compute the 5 most recent task actions for the project's Activity Feed
  const recentActivities = [...tasks]
    .sort((a, b) => new Date(b.updated_at || b.created_at).getTime() - new Date(a.updated_at || a.created_at).getTime())
    .slice(0, 5)
    .map((task) => {
      const isDone = task.status === 'COMPLETED';
      const isInProgress = task.status === 'IN_PROGRESS';
      const action = isDone ? 'completed' : isInProgress ? 'updated' : 'created';
      return {
        id: task.id,
        task: task.title,
        action,
        status: task.status.replace('_', ' '),
        time: new Date(task.updated_at || task.created_at).toLocaleDateString(),
      };
    });

  // Overall task completion percentage (returns 0 if data isn't loaded or total is 0)
  const completionRate = analytics && analytics.tasks.total > 0
    ? Math.round((analytics.tasks.completed / analytics.tasks.total) * 100)
    : 0;

  // Format task counts by status for the Donut/Pie chart (filters out 0-task statuses)
  const statusChartData = analytics
    ? [
        { name: 'Completed', value: analytics.tasks.completed, color: '#10b981' },
        { name: 'In Progress', value: analytics.tasks.in_progress, color: '#3b82f6' },
        { name: 'Todo', value: analytics.tasks.todo, color: '#94a3b8' },
        { name: 'Overdue', value: analytics.tasks.overdue, color: '#ef4444' },
      ].filter((d) => d.value > 0)
    : [];

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      {/* Page Header & Project Selector Dropdown */}
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Analytics</h2>

        <div className="flex items-center gap-2">
          <label htmlFor="project-selector" className="text-sm font-medium text-slate-600 shrink-0">
            Project:
          </label>
          <select
            id="project-selector"
            className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-sm text-slate-900 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/40 cursor-pointer"
            value={selectedProjectId ?? ''}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            disabled={projects.length === 0}
          >
            {projects.length === 0 && (
              <option value="" disabled>Loading projects...</option>
            )}
            {projects.map((p) => (
              <option key={p.id} value={String(p.id)}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Loading State: Pulsing skeleton cards */}
      {isLoading && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <Skeleton className="h-4 w-24" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-8 w-16 mt-2" />
                <Skeleton className="h-3 w-32 mt-2" />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Warning State: Task microservice is unreachable */}
      {isServiceUnavailable && !isLoading && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 mb-6">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
          <span>
            <strong>Task statistics are temporarily unavailable.</strong>{' '}
            The task service is unreachable. Project info is shown below.
          </span>
        </div>
      )}

      {/* Error State: Failed network request with retry option */}
      {error && !isLoading && !isServiceUnavailable && (
        <ErrorState
          title="Failed to load analytics"
          message={error}
          onRetry={() => selectedProjectId && fetchAnalytics(selectedProjectId)}
        />
      )}

      {/* Empty State: No projects created yet */}
      {!isLoading && !error && !analytics && projects.length === 0 && (
        <EmptyState
          icon={BarChart2}
          title="No projects found"
          description="Create a project first to view its analytics."
        />
      )}

      {/* Empty State: Project has 0 tasks */}
      {!isLoading && analytics && analytics.tasks.total === 0 && !isServiceUnavailable && (
        <EmptyState
          icon={BarChart2}
          title="No tasks yet"
          description={`${analytics.project_name} has no tasks. Add tasks to see analytics.`}
        />
      )}

      {/* Main Content: Displayed when analytics data is loaded */}
      {!isLoading && analytics && (analytics.tasks.total > 0 || isServiceUnavailable) && (
        <>
          {/* Top Row: 4 Key Metric Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card variant="indigo">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
                <ListTodo className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isServiceUnavailable ? '—' : analytics.tasks.total}</div>
                {!isServiceUnavailable && (
                  <p className="text-xs text-slate-500 flex items-center mt-1">
                    {analytics.tasks.todo} to do &middot; {analytics.tasks.in_progress} in progress
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card variant="emerald">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
                <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isServiceUnavailable ? '—' : analytics.tasks.completed}</div>
                {!isServiceUnavailable && (
                  <p className={`text-xs flex items-center mt-1 ${completionRate >= 50 ? 'text-emerald-500' : 'text-amber-500'}`}>
                    {completionRate >= 50 ? <TrendingUp className="h-3 w-3 mr-1" /> : <TrendingDown className="h-3 w-3 mr-1" />}
                    {completionRate}% completion rate
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card variant={analytics.tasks.overdue > 0 ? "rose" : "amber"}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
                <AlertCircle className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{isServiceUnavailable ? '—' : analytics.tasks.overdue}</div>
                {!isServiceUnavailable && (
                  <p className={`text-xs flex items-center mt-1 ${analytics.tasks.overdue > 0 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {analytics.tasks.overdue > 0 ? <TrendingDown className="h-3 w-3 mr-1" /> : <TrendingUp className="h-3 w-3 mr-1" />}
                    {analytics.tasks.overdue > 0 ? 'Action required' : 'All tasks on track'}
                  </p>
                )}
              </CardContent>
            </Card>
            
            <Card variant="purple">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Team Members</CardTitle>
                <Clock className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.members_count}</div>
                <p className="text-xs text-slate-500 flex items-center mt-1">
                  Status: {analytics.status} &middot; Priority: {analytics.priority}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Middle Row: Trend Line Chart & Status Donut Chart */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* 7-Day Completion Trend */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Task Completion Trend</CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trendData} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                      <Tooltip 
                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="completed" 
                        stroke="#3b82f6" 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Task Status Distribution (Donut Chart) */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Tasks by Status</CardTitle>
              </CardHeader>
              <CardContent>
                {isServiceUnavailable ? (
                  <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
                    Status breakdown unavailable.
                  </div>
                ) : statusChartData.length === 0 ? (
                  <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
                    No task status data available.
                  </div>
                ) : (
                  <>
                    <div className="h-[300px] flex items-center justify-center">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={statusChartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={90}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {statusChartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip 
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            itemStyle={{ color: '#1e293b', fontWeight: 500 }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mt-2">
                      {statusChartData.map((status, index) => (
                        <div key={index} className="flex items-center justify-between text-sm">
                          <div className="flex items-center">
                            <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: status.color }} />
                            <span className="text-slate-600">{status.name}</span>
                          </div>
                          <span className="font-medium">{Math.round((status.value / analytics.tasks.total) * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Bottom Row: Project Progress & Recent Activity Feed */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Overall Project Progress Bar */}
            <Card>
              <CardHeader>
                <CardTitle>Project Progress</CardTitle>
                <CardDescription>Completion status for the selected project.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{analytics.project_name}</span>
                    <span className="text-slate-500">{isServiceUnavailable ? '—' : `${completionRate}%`}</span>
                  </div>
                  {!isServiceUnavailable && (
                    <>
                      <Progress value={completionRate} indicatorColor="bg-emerald-500" />
                      <p className="text-xs text-muted-foreground mt-2">
                        {analytics.tasks.completed} of {analytics.tasks.total} tasks completed
                      </p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Recent Task Activity Feed */}
            <Card>
              <CardHeader>
                <CardTitle>Activity Feed</CardTitle>
                <CardDescription>Recent task actions in this project.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {recentActivities.length === 0 ? (
                    <div className="py-8 text-center text-sm text-slate-500">
                      No task activity recorded yet for this project.
                    </div>
                  ) : (
                    recentActivities.map((activity) => (
                      <div key={activity.id} className="flex items-start gap-4">
                        <Avatar fallback={activity.task.charAt(0).toUpperCase()} size="sm" />
                        <div className="space-y-1 flex-1">
                          <p className="text-sm leading-none">
                            <span className="font-medium text-slate-900">Task</span>{' '}
                            <span className="text-slate-500">{activity.action}</span>{' '}
                            <span className="font-medium text-slate-900">"{activity.task}"</span>
                          </p>
                          <p className="text-xs text-slate-500">{activity.time} &middot; {activity.status}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
