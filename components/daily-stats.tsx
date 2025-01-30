import { useState, useEffect, useCallback } from 'react';
import { useUserStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { format, startOfWeek, startOfMonth, addDays, differenceInSeconds, parse, differenceInHours, differenceInDays } from 'date-fns';
import { Loader2 } from 'lucide-react';
import { WeeklyStats } from './stats/weekly-stats';
import { ScheduleCard } from './stats/schedule-card';
import { ProductivityOverview } from './stats/productivity-overview';

interface TimeData {
  date: string;
  workHours: number;
  completedTime: number;
  productivity: number;
}

interface TaskStats {
  date: string;
  completedTime: number;
  pendingTime: number;
}

interface SleepData {
  wake_up_time: string;
  sleep_time: string;
  date: string;
}

export default function DailyStats() {
  const [timeData, setTimeData] = useState<TimeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sleepData, setSleepData] = useState<SleepData | null>(null);
  const [taskStats, setTaskStats] = useState<TaskStats[]>([]);
  const [timePeriod, setTimePeriod] = useState<'weekly' | 'monthly'>('weekly');
  const [totalWorkHours, setTotalWorkHours] = useState(0);
  const [productivityPercentage, setProductivityPercentage] = useState(0);
  const [remainingTime, setRemainingTime] = useState('');
  const { userName } = useUserStore();

  const calculateDailyProductivity = (completedTime: number, workHours: number): number => {
    if (workHours === 0) return 0;
    const completedHours = completedTime / 60;
    return (completedHours / workHours) * 100;
  };

  const fetchStats = async () => {
    const startDate = timePeriod === 'weekly' ? 
      startOfWeek(new Date()) : 
      startOfMonth(new Date());

    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_name', userName)
      .gte('created_at', format(startDate, 'yyyy-MM-dd'))
      .order('created_at', { ascending: true });

    const { data: sleepSchedule } = await supabase
      .from('user_preferences')
      .select('wake_up_time, sleep_time, date')
      .eq('user_name', userName)
      .gte('date', format(startDate, 'yyyy-MM-dd'))
      .order('date', { ascending: true });

    if (tasks && sleepSchedule) {
      const sleepScheduleMap = sleepSchedule.reduce((acc, schedule) => {
        acc[schedule.date] = {
          wake_up_time: schedule.wake_up_time,
          sleep_time: schedule.sleep_time
        };
        return acc;
      }, {} as Record<string, { wake_up_time: string; sleep_time: string }>);

      const tasksByDate = tasks.reduce((acc, task) => {
        const date = format(new Date(task.created_at), 'yyyy-MM-dd');
        if (!acc[date]) {
          acc[date] = {
            completedTime: 0,
            totalTasks: 0
          };
        }
        if (task.completed) {
          acc[date].completedTime += task.duration;
        }
        acc[date].totalTasks += 1;
        return acc;
      }, {} as Record<string, { completedTime: number; totalTasks: number }>);

      const daysToShow = timePeriod === 'weekly' ? 7 : 30;
      const dailyStats = Array.from({ length: daysToShow }, (_, i) => {
        const date = addDays(startDate, i);
        const dateStr = format(date, 'yyyy-MM-dd');
        const daySchedule = sleepScheduleMap[dateStr];
        
        let workHours = 0;
        if (daySchedule) {
          const wakeUp = parse(daySchedule.wake_up_time, 'HH:mm', date);
          let sleep = parse(daySchedule.sleep_time, 'HH:mm', date);
          if (sleep < wakeUp) {
            sleep = addDays(sleep, 1);
          }
          workHours = differenceInHours(sleep, wakeUp);
        }

        const dayData = tasksByDate[dateStr] || { completedTime: 0, totalTasks: 0 };
        const productivity = calculateDailyProductivity(dayData.completedTime, workHours);

        return {
          date: format(date, 'EEE'),
          completedTime: dayData.completedTime / 60,
          workHours,
          productivity: Number(productivity.toFixed(1))
        };
      });

      setTimeData(dailyStats);
    }
  };

  const updateRemainingTime = useCallback(() => {
    if (sleepData?.sleep_time) {
      const now = new Date();
      const todaySleepTime = parse(sleepData.sleep_time, 'HH:mm', now);
      
      // Calculate remaining time only if sleep time hasn't passed today
      const remainingSeconds = todaySleepTime > now 
        ? differenceInSeconds(todaySleepTime, now)
        : 0;

      const hours = Math.floor(remainingSeconds / 3600);
      const minutes = Math.floor((remainingSeconds % 3600) / 60);
      const seconds = remainingSeconds % 60;

      setRemainingTime(
        `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      );
    }
  }, [sleepData]);

  useEffect(() => {
    const timer = setInterval(updateRemainingTime, 1000);
    return () => clearInterval(timer);
  }, [updateRemainingTime]);

  useEffect(() => {
    if (userName) {
      fetchData();
      const interval = setInterval(checkEndOfDay, 60000);
      return () => clearInterval(interval);
    }
  }, [userName, timePeriod]);

  const fetchData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchStats(),
        fetchSleepData(),
        fetchTaskStats()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkEndOfDay = async () => {
    const now = new Date();
    const endOfDay = new Date(now);
    endOfDay.setHours(23, 59, 0);
    
    if (differenceInSeconds(endOfDay, now) <= 60) {
      await saveDailyProductivity();
    }
  };

  const fetchSleepData = async () => {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('wake_up_time, sleep_time, date')
      .eq('user_name', userName)
      .eq('date', new Date().toISOString().split('T')[0])
      .single();

    if (!error && data) {
      setSleepData(data);
      calculateWorkHours(data);
    }
  };

  const fetchTaskStats = async () => {
    const startDate = format(startOfWeek(new Date()), 'yyyy-MM-dd');
    const { data: tasks } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_name', userName)
      .gte('created_at', startDate);

    if (tasks) {
      const statsMap = new Map<string, TaskStats>();
      
      tasks.forEach(task => {
        const date = format(new Date(task.created_at), 'yyyy-MM-dd');
        const existing = statsMap.get(date) || {
          date,
          completedTime: 0,
          pendingTime: 0
        };

        if (task.completed) {
          existing.completedTime += task.duration;
        } else {
          existing.pendingTime += task.duration;
        }

        statsMap.set(date, existing);
      });

      setTaskStats(Array.from(statsMap.values()));
    }
  };

  const calculateProductivity = async () => {
    setRefreshing(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const todayStats = taskStats.find(stat => stat.date === today);
      
      if (todayStats && sleepData) {
        const wakeUp = parse(sleepData.wake_up_time, 'HH:mm', new Date());
        const sleep = parse(sleepData.sleep_time, 'HH:mm', new Date());
        
        let sleepTime = sleep;
        if (sleep < wakeUp) {
          sleepTime = addDays(sleep, 1);
        }

        const availableHours = differenceInHours(sleepTime, wakeUp);
        const productivity = calculateDailyProductivity(todayStats.completedTime, availableHours);
        
        setProductivityPercentage(Math.min(productivity, 100));
        setTotalWorkHours(availableHours);
      }
    } finally {
      setRefreshing(false);
    }
  };

  const calculateWorkHours = (data: SleepData) => {
    if (!data.wake_up_time || !data.sleep_time) return;

    const wakeUp = parse(data.wake_up_time, 'HH:mm', new Date());
    const sleep = parse(data.sleep_time, 'HH:mm', new Date());
    
    let sleepTime = sleep;
    if (sleep < wakeUp) {
      sleepTime = addDays(sleep, 1);
    }

    const availableHours = differenceInHours(sleepTime, wakeUp);
    setTotalWorkHours(availableHours);
  };

  const saveDailyProductivity = async () => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const todayStats = taskStats.find(stat => stat.date === today);
    
    if (todayStats && sleepData) {
      const wakeUp = parse(sleepData.wake_up_time, 'HH:mm', new Date());
      const sleep = parse(sleepData.sleep_time, 'HH:mm', new Date());
      
      let sleepTime = sleep;
      if (sleep < wakeUp) {
        sleepTime = addDays(sleep, 1);
      }

      const availableHours = differenceInHours(sleepTime, wakeUp);
      const productivity = calculateDailyProductivity(todayStats.completedTime, availableHours);

      await supabase
        .from('daily_productivity')
        .upsert({
          user_name: userName,
          date: today,
          productivity_percentage: Math.min(productivity, 100),
          total_work_hours: todayStats.completedTime / 60,
          available_hours: availableHours,
          completed_tasks_minutes: todayStats.completedTime,
          pending_tasks_minutes: todayStats.pendingTime
        });
    }
  };

  const formatMinutes = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatTime = (time: string | null) => {
    if (!time) return '--:--';
    try {
      return format(parse(time, 'HH:mm', new Date()), 'h:mm a');
    } catch (error) {
      return '--:--';
    }
  };

  const calculateWeeklyAverage = () => {
    const today = new Date();
    const weekStart = startOfWeek(today, { weekStartsOn: 0 });
    const daysPassed = differenceInDays(today, weekStart) + 1;
    const weeklyTotal = taskStats.reduce((sum, stat) => sum + stat.completedTime, 0);
    return weeklyTotal / Math.max(daysPassed, 1);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  const today = format(new Date(), 'yyyy-MM-dd');
  const todayStats = taskStats.find(stat => stat.date === today) || {
    completedTime: 0,
    pendingTime: 0
  };

  const weeklyTotalTime = taskStats.reduce((sum, stat) => sum + stat.completedTime, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      <div className="space-y-4">
        <ScheduleCard
          sleepData={sleepData}
          totalWorkHours={totalWorkHours}
          remainingTime={remainingTime}
          taskStats={todayStats}
          productivity={{
            percentage: productivityPercentage,
            onRefresh: calculateProductivity,
            isLoading: refreshing
          }}
          formatTime={formatTime}
          formatMinutes={formatMinutes}
        />

        <WeeklyStats
          data={timeData}
          totalTime={weeklyTotalTime}
          dailyAverage={calculateWeeklyAverage()}
          formatMinutes={formatMinutes}
        />
      </div>

      <ProductivityOverview
        data={timeData}
        timePeriod={timePeriod}
        onTimePeriodChange={setTimePeriod}
      />
    </div>
  );
}