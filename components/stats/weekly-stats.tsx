import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts';

interface WeeklyStatsProps {
  data: Array<{
    date: string;
    workHours: number;
    completedTime: number;
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
            <BarChart 
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <XAxis 
                dataKey="date"
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
                tickFormatter={(value) => `${value}h`}
              />
              <Tooltip
                formatter={(value: number, name: string) => {
                  const label = name === 'completedTime' ? 'Productive Time' : 'Work Hours';
                  return [`${value.toFixed(1)}h`, label];
                }}
                labelStyle={{ color: 'var(--foreground)' }}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)'
                }}
              />
              <Legend 
                formatter={(value) => (value === 'completedTime' ? 'Productive Time' : 'Work Hours')}
              />
              <Bar
                dataKey="completedTime"
                fill="hsl(var(--chart-2))"
                radius={[4, 4, 0, 0]}
                name="completedTime"
              />
              <Bar
                dataKey="workHours"
                fill="hsl(var(--primary))"
                radius={[4, 4, 0, 0]}
                name="workHours"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">Total Productive Time</p>
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