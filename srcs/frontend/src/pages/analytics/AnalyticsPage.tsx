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

// Mock Data for things not provided by the API yet
const TREND_DATA = [
  { name: 'Mon', completed: 12 },
  { name: 'Tue', completed: 19 },
  { name: 'Wed', completed: 15 },
  { name: 'Thu', completed: 22 },
  { name: 'Fri', completed: 28 },
  { name: 'Sat', completed: 14 },
  { name: 'Sun', completed: 8 },
];

const ACTIVITY_FEED = [
  { id: 1, user: 'Anoir', action: 'completed', task: 'Fix nav', time: '2h ago', avatar: 'https://i.pravatar.cc/150?u=anoir' },
  { id: 2, user: 'Douaa', action: 'created', task: 'New task', time: '3h ago', avatar: 'https://i.pravatar.cc/150?u=douaa' },
  { id: 3, user: 'Mohammed', action: 'commented on', task: 'API Integration', time: '5h ago', avatar: 'https://i.pravatar.cc/150?u=mohammed' },
  { id: 4, user: 'Fatima', action: 'moved', task: 'Design System', time: '1d ago', avatar: 'https://i.pravatar.cc/150?u=fatima' },
];

export default function AnalyticsPage() {
  const { projects, fetchProjects } = useProjectStore();
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

  // On mount: fetch all projects (needed for selector dropdown)
  useEffect(() => {
    if (projects.length === 0) {
      fetchProjects();
    }
  }, []);

  // When projects load, auto-select the first one
  useEffect(() => {
    if (projects.length > 0 && !selectedProjectId) {
      setSelectedProjectId(String(projects[0].id));
    }
  }, [projects]);

  // When a project is selected, fetch its analytics
  useEffect(() => {
    if (selectedProjectId) {
      fetchAnalytics(selectedProjectId);
    } else {
      clearAnalytics();
    }
  }, [selectedProjectId]);

  const completionRate = analytics
    ? analytics.tasks.total > 0
      ? Math.round((analytics.tasks.completed / analytics.tasks.total) * 100)
      : 0
    : 0;

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

      {isServiceUnavailable && !isLoading && (
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 mb-6">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-500" />
          <span>
            <strong>Task statistics are temporarily unavailable.</strong>{' '}
            The task service is unreachable. Project info is shown below.
          </span>
        </div>
      )}

      {error && !isLoading && !isServiceUnavailable && (
        <ErrorState
          title="Failed to load analytics"
          message={error}
          onRetry={() => selectedProjectId && fetchAnalytics(selectedProjectId)}
        />
      )}

      {!isLoading && !error && !analytics && projects.length === 0 && (
        <EmptyState
          icon={BarChart2}
          title="No projects found"
          description="Create a project first to view its analytics."
        />
      )}

      {!isLoading && analytics && analytics.tasks.total === 0 && !isServiceUnavailable && (
        <EmptyState
          icon={BarChart2}
          title="No tasks yet"
          description={`${analytics.project_name} has no tasks. Add tasks to see analytics.`}
        />
      )}

      {!isLoading && analytics && (analytics.tasks.total > 0 || isServiceUnavailable) && (
        <>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
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
            
            <Card>
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
            
            <Card>
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
            
            <Card>
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

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Task Completion Trend <span className="text-sm font-normal text-slate-400 ml-2">(Sample data)</span></CardTitle>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={TREND_DATA} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
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

          <div className="grid gap-4 md:grid-cols-2">
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

            <Card>
              <CardHeader>
                <CardTitle>Activity Feed <span className="text-sm font-normal text-slate-400 ml-2">(Sample data)</span></CardTitle>
                <CardDescription>Recent actions across your projects.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {ACTIVITY_FEED.map((activity) => (
                    <div key={activity.id} className="flex items-start gap-4">
                      <Avatar src={activity.avatar} fallback={activity.user.charAt(0)} size="sm" />
                      <div className="space-y-1 flex-1">
                        <p className="text-sm leading-none">
                          <span className="font-medium text-slate-900">{activity.user}</span>{' '}
                          <span className="text-slate-500">{activity.action}</span>{' '}
                          <span className="font-medium text-slate-900">"{activity.task}"</span>
                        </p>
                        <p className="text-xs text-slate-500">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
