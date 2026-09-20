import { cn } from '@/utils/cn';

// Generate mock activity data for the current week (Mon–Fri)
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const hours = ['9AM', '11AM', '1PM', '3PM', '5PM'];

// Activity levels: 0 = none, 1 = low, 2 = medium, 3 = high
const mockActivity: number[][] = [
  [1, 2, 3, 2, 1], // Mon
  [0, 1, 2, 3, 2], // Tue
  [2, 3, 3, 1, 0], // Wed
  [1, 1, 2, 2, 3], // Thu
  [0, 0, 1, 1, 0], // Fri (today, partial)
];

const levelColors = [
  'bg-slate-100',        // 0 — no activity
  'bg-indigo-100',       // 1 — low
  'bg-indigo-300',       // 2 — medium
  'bg-secondary',        // 3 — high
];

export function ActivityHeatmap() {
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
            {mockActivity[dayIdx].map((level, hourIdx) => (
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
