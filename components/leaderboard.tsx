"use client";

import { useEffect, useState } from 'react';
import { useUserStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy, Medal, Clock } from 'lucide-react';
import { format, startOfWeek } from 'date-fns';

interface LeaderStats {
  user_name: string;
  total_minutes: number;
  daily_average: number;
}

export default function Leaderboard() {
  const [leaders, setLeaders] = useState<LeaderStats[]>([]);
  const { userName } = useUserStore();

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const startDate = format(startOfWeek(new Date()), 'yyyy-MM-dd');
      
      const { data } = await supabase
        .from('pomodoro_sessions')
        .select('user_name, duration, completed_at')
        .gte('completed_at', startDate);

      if (data) {
        const userStats = data.reduce((acc: { [key: string]: number[] }, session) => {
          if (!acc[session.user_name]) {
            acc[session.user_name] = [];
          }
          acc[session.user_name].push(session.duration / 60); // Convert to minutes
          return acc;
        }, {});

        const leaderStats: LeaderStats[] = Object.entries(userStats).map(([user, minutes]) => ({
          user_name: user,
          total_minutes: minutes.reduce((sum, min) => sum + min, 0),
          daily_average: minutes.reduce((sum, min) => sum + min, 0) / 7
        }));

        setLeaders(leaderStats.sort((a, b) => b.total_minutes - a.total_minutes));
      }
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
    }
  };

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  const getRankIcon = (index: number) => {
    switch (index) {
      case 0:
        return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1:
        return <Medal className="h-5 w-5 text-gray-400" />;
      case 2:
        return <Medal className="h-5 w-5 text-amber-600" />;
      default:
        return <Clock className="h-5 w-5 text-muted-foreground" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        {leaders.slice(0, 3).map((leader, index) => (
          <Card key={leader.user_name} className={`${leader.user_name === userName ? 'border-2 border-primary' : ''}`}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {getRankIcon(index)}
                <span className="truncate">{leader.user_name}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div>
                  <p className="text-sm text-muted-foreground">Total Focus Time</p>
                  <p className="text-2xl font-bold">{formatTime(leader.total_minutes)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Daily Average</p>
                  <p className="text-lg font-semibold">{formatTime(leader.daily_average)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {leaders.length > 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Other Participants</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {leaders.slice(3).map((leader, index) => (
                <div
                  key={leader.user_name}
                  className={`flex items-center justify-between p-4 rounded-lg bg-muted/50 
                    ${leader.user_name === userName ? 'border-2 border-primary' : ''}`}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-lg font-semibold text-muted-foreground">
                      #{index + 4}
                    </span>
                    <div>
                      <p className="font-medium">{leader.user_name}</p>
                      <p className="text-sm text-muted-foreground">
                        Daily Avg: {formatTime(leader.daily_average)}
                      </p>
                    </div>
                  </div>
                  <p className="font-semibold">{formatTime(leader.total_minutes)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}