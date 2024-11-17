import { Clock, Calendar } from 'lucide-react';
import { formatDurations, calculateDailyAverage } from '@/lib/utils';

interface WeeklyStatsProps {
  weekStart: string;
  weekEnd: string;
  totalSeconds: number;
  position: number;
}

export function WeeklyStats({ weekStart, weekEnd, totalSeconds, position }: WeeklyStatsProps) {
  return (
    <div className="flex flex-col space-y-1">
      <div className="text-sm text-muted-foreground">
        Week of {weekStart} - {weekEnd}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 text-sm">
          <Clock className="h-4 w-4" />
          <span>Total: {formatDurations(totalSeconds)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="h-4 w-4" />
          <span>Daily avg: {calculateDailyAverage(totalSeconds)}</span>
        </div>
      </div>
      {position === 1 && (
        <div className="text-xs text-yellow-500 font-medium">
          🏆 Weekly Winner!
        </div>
      )}
    </div>
  );
}