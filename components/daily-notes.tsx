import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useUserStore } from '@/lib/store';
import { supabase } from '@/lib/supabase';
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from 'sonner';
import { ChevronRight } from 'lucide-react';

interface DiaryEntry {
  id: number;
  date: string;
  day_number: number;
  younger_self: string;
  lesson: string;
  task_completion: number;
  focus_level: number;
  time_management: number;
  energy_level: number;
  habits: DailyHabit[];
}

interface DailyHabit {
  id?: number;
  diary_entry_id?: number;
  habit_name: string;
  completed: boolean;
}

const DEFAULT_HABITS = [
  { habit_name: 'Reading', completed: false },
  { habit_name: 'No social media', completed: false },
  { habit_name: 'Gym', completed: false },
  { habit_name: '12h work', completed: false }
];

export default function DiaryEntry() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [youngerSelf, setYoungerSelf] = useState('');
  const [lesson, setLesson] = useState('');
  const [habits, setHabits] = useState<DailyHabit[]>(DEFAULT_HABITS);
  const [scores, setScores] = useState({
    task_completion: 6,
    focus_level: 6,
    time_management: 8,
    energy_level: 7
  });
  const { userName } = useUserStore();

  useEffect(() => {
    if (userName) {
      fetchEntries();
    }
  }, [userName]);

  useEffect(() => {
    const entry = entries.find(e => e.date === selectedDate);
    if (entry) {
      setYoungerSelf(entry.younger_self || '');
      setLesson(entry.lesson || '');
      setScores({
        task_completion: entry.task_completion,
        focus_level: entry.focus_level,
        time_management: entry.time_management,
        energy_level: entry.energy_level
      });
      setHabits(entry.habits?.length ? entry.habits : DEFAULT_HABITS);
    } else {
      resetForm();
    }
  }, [selectedDate, entries]);

  const resetForm = () => {
    setYoungerSelf('');
    setLesson('');
    setHabits(DEFAULT_HABITS);
    setScores({
      task_completion: 6,
      focus_level: 6,
      time_management: 8,
      energy_level: 7
    });
  };

  const fetchEntries = async () => {
    try {
      // Fetch diary entries
      const { data: entriesData, error: entriesError } = await supabase
        .from('diary_entries')
        .select('*')
        .eq('user_name', userName)
        .order('date', { ascending: false });

      if (entriesError) throw entriesError;

      // Fetch habits for each entry
      const entriesWithHabits = await Promise.all(
        (entriesData || []).map(async (entry) => {
          const { data: habitsData } = await supabase
            .from('daily_habits')
            .select('*')
            .eq('diary_entry_id', entry.id);

          return {
            ...entry,
            habits: habitsData || DEFAULT_HABITS
          };
        })
      );

      setEntries(entriesWithHabits);
    } catch (error) {
      toast.error('Failed to fetch diary entries');
    }
  };

  const saveDiaryEntry = async () => {
    try {
      const existingEntry = entries.find(e => e.date === selectedDate);
      const dayNumber = existingEntry?.day_number || entries.length + 1;

      const entryData = {
        user_name: userName,
        date: selectedDate,
        day_number: dayNumber,
        younger_self: youngerSelf,
        lesson,
        ...scores
      };

      let entryId: number;

      if (existingEntry) {
        const { error: updateError } = await supabase
          .from('diary_entries')
          .update(entryData)
          .eq('id', existingEntry.id);
        
        if (updateError) throw updateError;
        entryId = existingEntry.id;

        // Delete existing habits
        await supabase
          .from('daily_habits')
          .delete()
          .eq('diary_entry_id', entryId);
      } else {
        const { data: insertedEntry, error: insertError } = await supabase
          .from('diary_entries')
          .insert([entryData])
          .select()
          .single();
        
        if (insertError) throw insertError;
        entryId = insertedEntry.id;
      }

      // Insert new habits
      const habitsData = habits.map(habit => ({
        diary_entry_id: entryId,
        habit_name: habit.habit_name,
        completed: habit.completed
      }));

      const { error: habitsError } = await supabase
        .from('daily_habits')
        .insert(habitsData);

      if (habitsError) throw habitsError;

      toast.success('Diary entry saved successfully');
      fetchEntries();
    } catch (error) {
      toast.error('Failed to save diary entry');
    }
  };

  const toggleHabit = (habitName: string) => {
    setHabits(prevHabits =>
      prevHabits.map(habit =>
        habit.habit_name === habitName
          ? { ...habit, completed: !habit.completed }
          : habit
      )
    );
  };

  return (
    <div className="flex gap-6 p-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen">
      <div className="w-64 shrink-0">
        <Card className="bg-gray-100 dark:bg-gray-800 border-gray-200 dark:border-gray-700">
          <div className="p-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="font-semibold">History</h2>
          </div>
          <ScrollArea className="h-[600px]">
            {entries.map(entry => (
              <Button
                key={entry.date}
                variant={entry.date === selectedDate ? "secondary" : "ghost"}
                className="w-full justify-start text-left hover:bg-gray-200 dark:hover:bg-gray-700"
                onClick={() => setSelectedDate(entry.date)}
              >
                <ChevronRight className="h-4 w-4 mr-2" />
                <span>{format(new Date(entry.date), 'MMM d, yyyy')}</span>
              </Button>
            ))}
          </ScrollArea>
        </Card>
      </div>

      <Card className="flex-1 p-6 space-y-6 bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700">
        <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-4 rounded-lg">
          <h1 className="text-2xl font-bold">The diary of: {userName}</h1>
        </div>

        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
          <div className="grid grid-cols-[1fr,1.5fr,3fr] bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="p-3 font-semibold">Day</div>
            <div className="p-3 font-semibold">Date</div>
            <div className="p-3 font-semibold">Habits</div>
          </div>
          
          <div className="grid grid-cols-[1fr,1.5fr,3fr] bg-white dark:bg-gray-800">
            <div className="p-3 border-r border-gray-200 dark:border-gray-700">
              {entries.find(e => e.date === selectedDate)?.day_number || entries.length + 1}
            </div>
            <div className="p-3 border-r border-gray-200 dark:border-gray-700">
              {format(new Date(selectedDate), 'MM/dd/yyyy')}
            </div>
            <div className="divide-y divide-gray-200 dark:divide-gray-700">
              <div className="grid grid-cols-2 gap-4 p-3">
                {habits.map((habit) => (
                  <div key={habit.habit_name} className="flex items-center space-x-4">
                    <Checkbox
                      id={habit.habit_name}
                      checked={habit.completed}
                      onCheckedChange={() => toggleHabit(habit.habit_name)}
                    />
                    <Label htmlFor={habit.habit_name}>{habit.habit_name}</Label>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-3 rounded-t-lg">
            <h2 className="text-lg font-semibold">Younger self</h2>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-b-lg bg-white dark:bg-gray-800">
            <Textarea
              value={youngerSelf}
              onChange={(e) => setYoungerSelf(e.target.value)}
              placeholder="Write a message to your younger self..."
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500"
            />
          </div>
        </div>

        <div>
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-3 rounded-t-lg">
            <h2 className="text-lg font-semibold">Lesson</h2>
          </div>
          <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-b-lg bg-white dark:bg-gray-800">
            <Textarea
              value={lesson}
              onChange={(e) => setLesson(e.target.value)}
              placeholder="What lesson did you learn today?"
              className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500"
            />
          </div>
        </div>

        <div>
          <div className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 p-3 rounded-t-lg">
            <h2 className="text-lg font-semibold">Scoring - 10</h2>
          </div>
          <div className="grid grid-cols-2 gap-4 p-4 border border-gray-200 dark:border-gray-700 rounded-b-lg bg-white dark:bg-gray-800">
            <div>
              <Label htmlFor="task-comp">Task Completion</Label>
              <Input
                id="task-comp"
                type="number"
                min="0"
                max="10"
                value={scores.task_completion}
                onChange={(e) => setScores({ ...scores, task_completion: parseInt(e.target.value) || 0 })}
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="focus">Focus</Label>
              <Input
                id="focus"
                type="number"
                min="0"
                max="10"
                value={scores.focus_level}
                onChange={(e) => setScores({ ...scores, focus_level: parseInt(e.target.value) || 0 })}
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="time">Time Management</Label>
              <Input
                id="time"
                type="number"
                min="0"
                max="10"
                value={scores.time_management}
                onChange={(e) => setScores({ ...scores, time_management: parseInt(e.target.value) || 0 })}
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500"
              />
            </div>
            <div>
              <Label htmlFor="energy">Energy</Label>
              <Input
                id="energy"
                type="number"
                min="0"
                max="10"
                value={scores.energy_level}
                onChange={(e) => setScores({ ...scores, energy_level: parseInt(e.target.value) || 0 })}
                className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500"
              />
            </div>
          </div>
        </div>

        <Button
          className="w-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100"
          size="lg"
          onClick={saveDiaryEntry}
        >
          Save Entry
        </Button>
      </Card>
    </div>
  );
}