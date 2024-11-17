import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sun, Moon, Timer, CheckCircle2, Circle } from 'lucide-react';
import { ProductivityCard } from './productivity-card';

interface ScheduleCardProps {
  sleepData: {
    wake_up_time: string | null;
    sleep_time: string | null;
  } | null;
  totalWorkHours: number;
  remainingTime: string;
  taskStats: {
    completedTime: number;
    pendingTime: number;
  };
  productivity: {
    percentage: number;
    onRefresh: () => void;
    isLoading: boolean;
  };
  formatTime: (time: string | null) => string;
  formatMinutes: (minutes: number) => string;
}

export function ScheduleCard({
  sleepData,
  totalWorkHours,
  remainingTime,
  taskStats,
  productivity,
  formatTime,
  formatMinutes,
}: ScheduleCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Schedule</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sun className="h-5 w-5 text-yellow-500" />
            <span>Wake-up Time</span>
          </div>
          <span className="font-semibold">
            {sleepData ? formatTime(sleepData.wake_up_time) : '--:--'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Moon className="h-5 w-5 text-blue-500" />
            <span>Sleep Time</span>
          </div>
          <span className="font-semibold">
            {sleepData ? formatTime(sleepData.sleep_time) : '--:--'}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-orange-500" />
            <span>Total Work Hours</span>
          </div>
          <span className="font-semibold">{totalWorkHours}h</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-purple-500" />
            <span>Remaining Time</span>
          </div>
          <span className="font-mono font-semibold">{remainingTime}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-500" />
            <span>Completed Tasks</span>
          </div>
          <span className="font-semibold">{formatMinutes(taskStats.completedTime)}</span>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Circle className="h-5 w-5 text-yellow-500" />
            <span>Pending Tasks</span>
          </div>
          <span className="font-semibold">{formatMinutes(taskStats.pendingTime)}</span>
        </div>
        <ProductivityCard
          percentage={productivity.percentage}
          onRefresh={productivity.onRefresh}
          isLoading={productivity.isLoading}
        />
      </CardContent>
    </Card>
  );
}