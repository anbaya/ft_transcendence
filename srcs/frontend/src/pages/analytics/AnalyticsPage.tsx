import { useState } from 'react';
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
  ChevronDown
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Progress } from '@/components/ui/Progress';
import { Avatar } from '@/components/ui/Avatar';

// Mock Data
const TREND_DATA = [
  { name: 'Mon', completed: 12 },
  { name: 'Tue', completed: 19 },
  { name: 'Wed', completed: 15 },
  { name: 'Thu', completed: 22 },
  { name: 'Fri', completed: 28 },
  { name: 'Sat', completed: 14 },
  { name: 'Sun', completed: 8 },
];

const STATUS_DATA = [
  { name: 'Done', value: 72, color: '#10b981' }, // emerald-500
  { name: 'In Progress', value: 18, color: '#3b82f6' }, // blue-500
  { name: 'Todo', value: 7, color: '#94a3b8' }, // slate-400
  { name: 'Overdue', value: 3, color: '#ef4444' }, // red-500
];

const ACTIVITY_FEED = [
  { id: 1, user: 'Anoir', action: 'completed', task: 'Fix nav', time: '2h ago', avatar: 'https://i.pravatar.cc/150?u=anoir' },
  { id: 2, user: 'Douaa', action: 'created', task: 'New task', time: '3h ago', avatar: 'https://i.pravatar.cc/150?u=douaa' },
  { id: 3, user: 'Mohammed', action: 'commented on', task: 'API Integration', time: '5h ago', avatar: 'https://i.pravatar.cc/150?u=mohammed' },
  { id: 4, user: 'Fatima', action: 'moved', task: 'Design System', time: '1d ago', avatar: 'https://i.pravatar.cc/150?u=fatima' },
];

const PROJECT_PROGRESS = [
  { id: 1, name: 'Website Redesign', progress: 75, color: 'bg-emerald-500' },
  { id: 2, name: 'Mobile App V2', progress: 67, color: 'bg-blue-500' },
  { id: 3, name: 'Marketing Campaign', progress: 50, color: 'bg-purple-500' },
  { id: 4, name: 'API Migration', progress: 25, color: 'bg-amber-500' },
];

export default function AnalyticsPage() {
  const [dateRange] = useState('Last 30d');
  const [isLoading] = useState(false);
  const [isEmpty] = useState(false);

  // Simulated data loading
  // useEffect(() => {
  //   setIsLoading(true);
  //   setTimeout(() => setIsLoading(false), 1500);
  // }, []);

  if (isLoading) {
    return (
      <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
          <div className="h-9 w-40 bg-slate-200 animate-pulse rounded"></div>
          <div className="h-9 w-32 bg-slate-200 animate-pulse rounded"></div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="pb-2"><div className="h-4 w-24 bg-slate-200 animate-pulse rounded"></div></CardHeader>
              <CardContent><div className="h-8 w-16 bg-slate-200 animate-pulse rounded mt-2"></div></CardContent>
            </Card>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <Card className="col-span-4 h-[350px] animate-pulse bg-slate-50"></Card>
          <Card className="col-span-3 h-[350px] animate-pulse bg-slate-50"></Card>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-6 p-4 md:p-8 pt-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between space-y-2 md:space-y-0">
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">Analytics</h2>
        <div className="flex items-center space-x-2">
          <Button variant="secondary" className="flex items-center gap-2">
            Date Range: {dateRange}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Created</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +12% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">118</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <TrendingUp className="h-3 w-3 mr-1" />
              +18% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue Tasks</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <TrendingDown className="h-3 w-3 mr-1" />
              -25% from last month
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg. Completion Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2 days</div>
            <p className="text-xs text-emerald-500 flex items-center mt-1">
              <TrendingDown className="h-3 w-3 mr-1" />
              -0.4 days from last month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Task Completion Trend</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
            {isEmpty ? (
              <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
                No trend data available for this period.
              </div>
            ) : (
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
            )}
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Tasks by Status</CardTitle>
          </CardHeader>
          <CardContent>
            {isEmpty ? (
              <div className="h-[300px] flex items-center justify-center text-slate-500 text-sm">
                No task status data available.
              </div>
            ) : (
              <>
                <div className="h-[300px] flex items-center justify-center">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={STATUS_DATA}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={90}
                        paddingAngle={2}
                        dataKey="value"
                      >
                        {STATUS_DATA.map((entry, index) => (
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
                  {STATUS_DATA.map((status, index) => (
                    <div key={index} className="flex items-center justify-between text-sm">
                      <div className="flex items-center">
                        <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: status.color }} />
                        <span className="text-slate-600">{status.name}</span>
                      </div>
                      <span className="font-medium">{status.value}%</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Progress and Activity Row */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Project Progress</CardTitle>
            <CardDescription>Completion status across active projects.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {isEmpty ? (
              <div className="text-center text-sm text-slate-500 py-6">No active projects to track.</div>
            ) : (
              PROJECT_PROGRESS.map((project) => (
                <div key={project.id} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{project.name}</span>
                    <span className="text-slate-500">{project.progress}%</span>
                  </div>
                  <Progress value={project.progress} indicatorColor={project.color} />
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Activity Feed</CardTitle>
            <CardDescription>Recent actions across your projects.</CardDescription>
          </CardHeader>
          <CardContent>
            {isEmpty ? (
              <div className="text-center text-sm text-slate-500 py-6">No recent activity.</div>
            ) : (
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
