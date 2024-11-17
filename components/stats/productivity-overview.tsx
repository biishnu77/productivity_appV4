import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip } from 'recharts';

interface ProductivityOverviewProps {
  data: Array<{
    date: string;
    productivity: number;
  }>;
  timePeriod: 'weekly' | 'monthly';
  onTimePeriodChange: (period: 'weekly' | 'monthly') => void;
}

export function ProductivityOverview({ data, timePeriod, onTimePeriodChange }: ProductivityOverviewProps) {
  const averageProductivity = data.reduce((sum, day) => sum + day.productivity, 0) / data.length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Productivity Overview</CardTitle>
          <p className="text-sm text-muted-foreground mt-1">
            Average: {averageProductivity.toFixed(1)}%
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={timePeriod === 'weekly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimePeriodChange('weekly')}
          >
            Weekly
          </Button>
          <Button
            variant={timePeriod === 'monthly' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onTimePeriodChange('monthly')}
          >
            Monthly
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <XAxis
                dataKey="date"
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
              />
              <YAxis
                axisLine={{ stroke: 'hsl(var(--border))' }}
                tickLine={false}
                domain={[0, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip
                formatter={(value: number) => [`${value.toFixed(1)}%`, 'Productivity']}
                labelStyle={{ color: 'var(--foreground)' }}
                contentStyle={{
                  backgroundColor: 'var(--background)',
                  border: '1px solid var(--border)'
                }}
              />
              <Line
                type="monotone"
                dataKey="productivity"
                stroke="hsl(var(--primary))"
                strokeWidth={2}
                dot={{ r: 4, fill: 'hsl(var(--primary))' }}
                activeDot={{ r: 6, fill: 'hsl(var(--primary))' }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}