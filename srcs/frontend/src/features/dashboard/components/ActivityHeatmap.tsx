import { useMemo } from 'react';
import { cn } from '@/utils/cn';
import { useTaskStore } from '@/stores/taskStore';

const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const hours = ['9AM', '11AM', '1PM', '3PM', '5PM'];

const levelColors = [
  'bg-slate-100',        // 0 — no activity
  'bg-indigo-100',       // 1 — low
  'bg-indigo-300',       // 2 — medium
  'bg-secondary',        // 3 — high
];

// Helper to determine the hour bucket index (0..4)
const getHourBucket = (hour: number): number => {
  if (hour < 10) return 0; // 9AM block (before 10:00)
  if (hour < 12) return 1; // 11AM block (10:00 - 11:59)
  if (hour < 14) return 2; // 1PM block (12:00 - 13:59)
  if (hour < 16) return 3; // 3PM block (14:00 - 15:59)
  return 4;                // 5PM block (16:00 and later)
};

export function ActivityHeatmap() {
  const myTasks = useTaskStore((state) => state.myTasks); 

  // Compute dynamic 5x5 activity matrix for the current week (Mon-Fri)
  const activityMatrix = useMemo(() => {
    const matrix: number[][] = Array.from({ length: 5 }, () => Array(5).fill(0));

    const now = new Date();
    const currentDay = now.getDay(); // 0 is Sunday, 1 is Monday...
    const diffToMonday = (currentDay === 0 ? -6 : 1) - currentDay;
    const monday = new Date(now);
    monday.setDate(now.getDate() + diffToMonday);
    monday.setHours(0, 0, 0, 0);

    const sunday = new Date(monday);
    sunday.setDate(monday.getDate() + 6);
    sunday.setHours(23, 59, 59, 999);

    // Aggregate user task activity events
    myTasks.forEach((task) => {
      const dates = [new Date(task.created_at)];
      if (task.updated_at && task.updated_at !== task.created_at) {
        dates.push(new Date(task.updated_at));
      }

      dates.forEach((date) => {
        if (date >= monday && date <= sunday) {
          const dayIndex = date.getDay() - 1; // 0 for Mon, 4 for Fri
          if (dayIndex >= 0 && dayIndex < 5) {
            const hourBucket = getHourBucket(date.getHours());
            matrix[dayIndex][hourBucket] = Math.min(matrix[dayIndex][hourBucket] + 1, 3);
          }
        }
      });
    });

    return matrix;
  }, [myTasks]);

  return (
    <div className="rounded-lg border border-border bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h3 className="text-sm font-semibold text-primary">This Week</h3>
        <div className="flex items-center gap-1.5 text-[10px] text-muted">
          <span>Less</span>
          {levelColors.map((color, i) => (
            <span key={i} className={cn('h-3 w-3 rounded-sm', color)} />
          ))}
          <span>More</span>
        </div>
      </div>

      <div className="p-5">
        {/* Column Labels (hours) */}
        <div className="grid grid-cols-[48px_repeat(5,1fr)] gap-1.5 mb-1.5">
          <span /> {/* empty corner */}
          {hours.map((h) => (
            <span key={h} className="text-center text-[10px] text-muted font-medium">{h}</span>
          ))}
        </div>

        {/* Rows (days) */}
        {days.map((day, dayIdx) => (
          <div key={day} className="grid grid-cols-[48px_repeat(5,1fr)] gap-1.5 mb-1.5">
            <span className="text-xs text-muted font-medium flex items-center">{day}</span>
            {activityMatrix[dayIdx].map((level, hourIdx) => (
              <div
                key={hourIdx}
                className={cn(
                  'aspect-square rounded-sm transition-colors',
                  levelColors[level]
                )}
                title={`${day} ${hours[hourIdx]}: ${level === 0 ? 'No' : level === 1 ? 'Low' : level === 2 ? 'Medium' : 'High'} activity`}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

