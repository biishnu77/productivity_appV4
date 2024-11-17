import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

interface WeeklyStatsProps {
  data: Array<{
    date: string;
    workHours: number;
  }>;
  totalTime: number;
  dailyAverage: number;
  formatMinutes: (minutes: number) => string;
}

export function WeeklyStats({ data, totalTime, dailyAverage, formatMinutes }: WeeklyStatsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date"
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}h`, 'Work Hours']}
                labelStyle={{ color: 'var(--foreground)' }}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)'
                }}
              />
              <Bar
                dataKey="workHours"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Time</p>
            <p className="text-2xl font-bold">{formatMinutes(totalTime)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Daily Average</p>
            <p className="text-2xl font-bold">{formatMinutes(dailyAverage)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}