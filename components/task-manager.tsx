import React, { useState, useEffect } from 'react';
import { useUserStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { Loader2, Plus, Clock, Sun, Moon, Dumbbell, Brain, Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { WellnessCard } from '@/components/ui/wellness-card';
import { TaskList } from '@/components/ui/task-list';
import { Task } from '@/types/task';
import { formatDuration } from '@/lib/utils';
import { SleepTimeManager } from '@/components/sleep-time-manager';

export default function TaskManager() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTask, setNewTask] = useState('');
  const [duration, setDuration] = useState('30');
  const [loading, setLoading] = useState(true);
  const { userName } = useUserStore();
  
  // Wellness tracking states
  const [exerciseTimer, setExerciseTimer] = useState(15 * 60);
  const [meditationTimer, setMeditationTimer] = useState(15 * 60);
  const [isExerciseActive, setIsExerciseActive] = useState(false);
  const [isMeditationActive, setIsMeditationActive] = useState(false);
  const [weeklyProgress] = useState(() => {
    return Array(7).fill(null).map((_, i) => ({
      date: format(new Date(Date.now() - i * 24 * 60 * 60 * 1000), 'EEE'),
      completion: Math.random() * 100
    }));
  });

  useEffect(() => {
    if (userName) {
      fetchTasks();
    }
  }, [userName]);

  useEffect(() => {
    let exerciseInterval: NodeJS.Timeout;
    let meditationInterval: NodeJS.Timeout;

    if (isExerciseActive && exerciseTimer > 0) {
      exerciseInterval = setInterval(() => {
        setExerciseTimer(prev => {
          if (prev <= 1) {
            setIsExerciseActive(false);
            toast.success('Exercise session completed!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    if (isMeditationActive && meditationTimer > 0) {
      meditationInterval = setInterval(() => {
        setMeditationTimer(prev => {
          if (prev <= 1) {
            setIsMeditationActive(false);
            toast.success('Meditation session completed!');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      clearInterval(exerciseInterval);
      clearInterval(meditationInterval);
    };
  }, [isExerciseActive, isMeditationActive, exerciseTimer, meditationTimer]);

  const fetchTasks = async () => {
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_name', userName)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setTasks(data || []);
    } catch (error) {
      toast.error('Failed to fetch tasks');
    } finally {
      setLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTask.trim()) return;
    if (!duration || isNaN(Number(duration)) || Number(duration) <= 0) {
      toast.error('Please enter a valid duration');
      return;
    }

    try {
      const { error } = await supabase.from('tasks').insert([
        {
          user_name: userName,
          description: newTask.trim(),
          completed: false,
          duration: Number(duration),
          due_date: new Date().toISOString(),
        },
      ]);

      if (error) throw error;
      
      setNewTask('');
      setDuration('30');
      fetchTasks();
      toast.success('Task added successfully');
    } catch (error) {
      toast.error('Failed to add task');
    }
  };

  const startTask = (task: Task) => {
    localStorage.setItem('currentTask', JSON.stringify({
      id: task.id,
      description: task.description,
      duration: task.duration
    }));
    
    const tabsList = document.querySelector('[role="tablist"]');
    const pomodoroTab = tabsList?.querySelector('[value="pomodoro"]') as HTMLElement;
    if (pomodoroTab) {
      pomodoroTab.click();
    }
  };

  const toggleTask = async (taskId: number, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed })
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed } : task
      ));
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const deleteTask = async (taskId: number) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);

      if (error) throw error;
      
      setTasks(tasks.filter(task => task.id !== taskId));
      toast.success('Task deleted successfully');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const toggleExerciseTimer = () => {
    if (exerciseTimer === 0) {
      setExerciseTimer(15 * 60);
    }
    setIsExerciseActive(!isExerciseActive);
  };

  const toggleMeditationTimer = () => {
    if (meditationTimer === 0) {
      setMeditationTimer(15 * 60);
    }
    setIsMeditationActive(!isMeditationActive);
  };
  
  const totalTime = tasks.reduce((acc, task) => acc + task.duration, 0);
  const completedTime = tasks.filter(task => task.completed).reduce((acc, task) => acc + task.duration, 0);
  const remainingTime = totalTime - completedTime;

  const chartData = [
    { name: 'Completed', value: completedTime, color: 'hsl(var(--chart-2))' },
    { name: 'Remaining', value: remainingTime, color: 'hsl(var(--chart-1))' },
  ];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardContent className="p-4">
            <div className="text-lg font-semibold mb-2">Time Overview</div>
            <div className="text-sm text-muted-foreground mb-4">
              Total time needed: {formatDuration(totalTime)}
            </div>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatDuration(value)}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <div className="space-y-4">
          <SleepTimeManager />

          <WellnessCard
            icon={<Dumbbell className="h-5 w-5 text-green-500" />}
            title="Daily Exercise"
            description="Stay active and healthy"
            timer={exerciseTimer}
            isActive={isExerciseActive}
            onToggle={toggleExerciseTimer}
            showTimer
            duration={exerciseTimer}
          />

          <WellnessCard
            icon={<Brain className="h-5 w-5 text-purple-500" />}
            title="Meditation"
            description="Minutes of mindfulness"
            timer={meditationTimer}
            isActive={isMeditationActive}
            onToggle={toggleMeditationTimer}
            showTimer
            duration={meditationTimer}
          />

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Weekly Consistency
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between gap-1">
                {weeklyProgress.map((day, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="text-xs text-muted-foreground">{day.date}</div>
                    <div
                      className="w-8 h-8 rounded-sm mt-1"
                      style={{
                        backgroundColor: `hsl(var(--chart-2) / ${day.completion}%)`,
                      }}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <form onSubmit={addTask} className="flex gap-2">
        <div className="flex-1 flex gap-2">
          <Input
            type="text"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)}
            placeholder="Add a new task..."
            className="flex-1"
          />
          <div className="flex items-center gap-2 w-32">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <Input
              type="number"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="Minutes"
              className="w-20"
              min="1"
            />
          </div>
        </div>
        <Button type="submit">
          <Plus className="h-4 w-4 mr-2" />
          Add Task
        </Button>
      </form>

      <TaskList
        tasks={tasks}
        onToggleTask={toggleTask}
        onStartTask={startTask}
        onDeleteTask={deleteTask}
      />
    </div>
  );
}