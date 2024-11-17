import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trophy, Crown, Clock, Calendar } from 'lucide-react';
import { format, startOfWeek, endOfWeek, subWeeks } from 'date-fns';
import { toast } from 'sonner';
import { WeeklyStats } from './leaderboard/weekly-stats';
import { formatDurations, calculateDailyAverage } from '@/lib/utils';

interface WeeklyPerformance {
  user_name: string;
  total_seconds: number;
  position: number;
  week_start: string;
  week_end: string;
}

interface WeeklyWinners {
  weekStart: string;
  weekEnd: string;
  winners: WeeklyPerformance[];
}

export default function Leaderboard() {
  const [currentWeekLeaders, setCurrentWeekLeaders] = useState<WeeklyPerformance[]>([]);
  const [previousWeeks, setPreviousWeeks] = useState<WeeklyWinners[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWeeklyData();
    // Refresh data every 5 minutes
    const interval = setInterval(fetchWeeklyData, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const calculateWeeklyStats = (data: any[], weekStart: Date, weekEnd: Date) => {
    const userStats = new Map<string, number>();
    
    data?.forEach((session) => {
      const current = userStats.get(session.user_name) || 0;
      userStats.set(session.user_name, current + session.duration); // duration is in seconds from DB
    });

    return Array.from(userStats.entries())
      .map(([user_name, total_seconds]) => ({
        user_name,
        total_seconds,
        week_start: format(weekStart, 'MMM d'),
        week_end: format(weekEnd, 'MMM d'),
      }))
      .sort((a, b) => b.total_seconds - a.total_seconds)
      .map((stats, index) => ({
        ...stats,
        position: index + 1,
      }));
  };

  const fetchWeeklyData = async () => {
    try {
      // Current week
      const currentWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 });
      const currentWeekEnd = endOfWeek(new Date(), { weekStartsOn: 1 });

      const { data: currentData, error: currentError } = await supabase
        .from('pomodoro_sessions')
        .select('user_name, duration')
        .gte('completed_at', currentWeekStart.toISOString())
        .lte('completed_at', currentWeekEnd.toISOString());

      if (currentError) throw currentError;

      const currentWeekStats = calculateWeeklyStats(
        currentData,
        currentWeekStart,
        currentWeekEnd
      );
      setCurrentWeekLeaders(currentWeekStats);

      // Previous weeks
      const previousWeeksData = [];
      for (let i = 1; i <= 4; i++) {
        const weekStart = startOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });
        const weekEnd = endOfWeek(subWeeks(new Date(), i), { weekStartsOn: 1 });

        const { data: weekData, error: weekError } = await supabase
          .from('pomodoro_sessions')
          .select('user_name, duration')
          .gte('completed_at', weekStart.toISOString())
          .lte('completed_at', weekEnd.toISOString());

        if (weekError) throw weekError;

        const weekStats = calculateWeeklyStats(weekData, weekStart, weekEnd);
        if (weekStats.length > 0) {
          previousWeeksData.push({
            weekStart: format(weekStart, 'MMM d'),
            weekEnd: format(weekEnd, 'MMM d'),
            winners: weekStats.slice(0, 3) // Get top 3 winners
          });
        }
      }

      setPreviousWeeks(previousWeeksData);
    } catch (error) {
      toast.error('Failed to fetch leaderboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="current" className="space-y-4">
        <TabsList>
          <TabsTrigger value="current" className="flex items-center gap-2">
            <Trophy className="h-4 w-4" />
            This Week
          </TabsTrigger>
          <TabsTrigger value="previous" className="flex items-center gap-2">
            <Crown className="h-4 w-4" />
            Hall of Fame
          </TabsTrigger>
        </TabsList>

        <TabsContent value="current">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-500" />
                This Week's Leaderboard
                <span className="text-sm font-normal text-muted-foreground ml-2">
                  (Week of {currentWeekLeaders[0]?.week_start} - {currentWeekLeaders[0]?.week_end})
                </span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {currentWeekLeaders.map((leader) => (
                  <div
                    key={leader.user_name}
                    className="flex items-center justify-between py-3 border-b last:border-0"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`font-bold ${
                        leader.position === 1 ? 'text-yellow-500' :
                        leader.position === 2 ? 'text-gray-400' :
                        leader.position === 3 ? 'text-amber-600' :
                        'text-muted-foreground'
                      }`}>
                        {leader.position === 1 ? '👑' : 
                         leader.position === 2 ? '🥈' :
                         leader.position === 3 ? '🥉' :
                         `#${leader.position}`}
                      </div>
                      <div>
                        <div className="font-medium">{leader.user_name}</div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Total: {formatDurations(leader.total_seconds)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Daily avg: {calculateDailyAverage(leader.total_seconds)}
                          </div>
                        </div>
                      </div>
                    </div>
                    {leader.position === 1 && (
                      <div className="text-yellow-500 text-sm font-medium animate-pulse">
                        Current Leader 🏆
                      </div>
                    )}
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="previous">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Previous Weeks Top 3
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px] pr-4">
                {previousWeeks.map((week, weekIndex) => (
                  <div key={weekIndex} className="mb-6 last:mb-0">
                    <h3 className="text-sm font-medium mb-3">
                      Week of {week.weekStart} - {week.weekEnd}
                    </h3>
                    <div className="space-y-4">
                      {week.winners.map((winner) => (
                        <div
                          key={`${winner.user_name}-${weekIndex}`}
                          className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <div className={`font-bold ${
                              winner.position === 1 ? 'text-yellow-500' :
                              winner.position === 2 ? 'text-gray-400' :
                              'text-amber-600'
                            }`}>
                              {winner.position === 1 ? '👑' : 
                               winner.position === 2 ? '🥈' : '🥉'}
                            </div>
                            <div>
                              <div className="font-medium">{winner.user_name}</div>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-1">
                                  <Clock className="h-3 w-3" />
                                  Total: {formatDurations(winner.total_seconds)}
                                </div>
                                <div className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Daily avg: {calculateDailyAverage(winner.total_seconds)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}