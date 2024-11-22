import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useUserStore } from '@/lib/store';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import type { DiaryEntry, Scores } from './DiaryEntry/types';
import { DEFAULT_HABITS } from './DiaryEntry/types';
import { HabitsList } from './DiaryEntry/HabitsList';
import { ScoresSection } from './DiaryEntry/ScoresSection';
import { HistoryPanel } from './DiaryEntry/HistoryPanel';
import { DiaryService } from './DiaryEntry/DiaryService';

const DEFAULT_SCORES: Scores = {
  task_completion: 6,
  focus_level: 6,
  time_management: 8,
  energy_level: 7
};

export default function DiaryEntry() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [youngerSelf, setYoungerSelf] = useState('');
  const [lesson, setLesson] = useState('');
  const [habits, setHabits] = useState(DEFAULT_HABITS);
  const [scores, setScores] = useState(DEFAULT_SCORES);
  const [isEditing, setIsEditing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
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
      setIsEditing(false);
    } else {
      resetForm();
      setIsEditing(true);
    }
    // Close sidebar on mobile after selecting a date
    setIsSidebarOpen(false);
  }, [selectedDate, entries]);

  const resetForm = () => {
    setYoungerSelf('');
    setLesson('');
    setHabits(DEFAULT_HABITS);
    setScores(DEFAULT_SCORES);
  };

  const fetchEntries = async () => {
    if (!userName) return;
    
    try {
      const entriesData = await DiaryService.fetchEntries(userName);
      setEntries(entriesData);
    } catch (error) {
      toast.error('Failed to fetch diary entries');
    }
  };

  const handleScoreChange = (key: keyof Scores, value: number) => {
    if (!isEditing) return;
    setScores(prev => ({ ...prev, [key]: value }));
  };

  const toggleHabit = (habitName: string) => {
    if (!isEditing) return;
    setHabits(prevHabits =>
      prevHabits.map(habit =>
        habit.habit_name === habitName
          ? { ...habit, completed: !habit.completed }
          : habit
      )
    );
  };

  const saveDiaryEntry = async () => {
    if (!userName) {
      toast.error('User name is required');
      return;
    }

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

      await DiaryService.saveEntry(
        userName,
        entryData,
        habits,
        selectedDate
      );

      toast.success('Diary entry saved successfully');
      setIsEditing(false);
      fetchEntries();
    } catch (error) {
      toast.error('Failed to save diary entry');
    }
  };

  if (!userName) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Please log in to view your diary</h2>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        <div className="lg:hidden mb-4">
          <Button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            variant="outline"
            className="w-full"
          >
            {isSidebarOpen ? 'Hide Calendar' : 'Show Calendar'}
          </Button>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar */}
          <div className={`
            lg:w-64 lg:shrink-0
            ${isSidebarOpen ? 'block' : 'hidden lg:block'}
            transition-all duration-300 ease-in-out
          `}>
            <HistoryPanel
              entries={entries}
              selectedDate={selectedDate}
              onDateSelect={setSelectedDate}
            />
          </div>

          {/* Main Content */}
          <Card className="flex-1 p-4 md:p-6 space-y-6 bg-dark dark:bg-gray-800 border-gray-200 dark:border-gray-700">
            <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
              <div className="grid grid-cols-[1fr,1.5fr,2fr] md:grid-cols-[1fr,1.5fr,3fr] bg-gray-900 dark:bg-gray-900 text-white">
                <div className="p-3 font-semibold">Day</div>
                <div className="p-3 font-semibold">Date</div>
                <div className="p-3 font-semibold">Habits</div>
              </div>
              
              <div className="grid grid-cols-[1fr,1.5fr,2fr] md:grid-cols-[1fr,1.5fr,3fr] bg-white dark:bg-gray-800">
                <div className="p-3 border-r border-gray-200 dark:border-gray-700">
                  {entries.find(e => e.date === selectedDate)?.day_number || entries.length + 1}
                </div>
                <div className="p-3 border-r border-gray-200 dark:border-gray-700">
                  {format(new Date(selectedDate), 'MM/dd/yyyy')}
                </div>
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  <HabitsList 
                    habits={habits} 
                    onToggleHabit={toggleHabit}
                    disabled={!isEditing}
                  />
                </div>
              </div>
            </div>

            {/* Text Areas */}
            {['Younger self', 'Lesson'].map((section, index) => (
              <div key={section}>
                <div className="bg-gray-900 dark:bg-gray-900 text-white p-3 rounded-t-lg">
                  <h2 className="text-lg font-semibold">{section}</h2>
                </div>
                <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-b-lg bg-white dark:bg-gray-800">
                  <Textarea
                    value={index === 0 ? youngerSelf : lesson}
                    onChange={(e) => {
                      if (isEditing) {
                        index === 0 
                          ? setYoungerSelf(e.target.value)
                          : setLesson(e.target.value);
                      }
                    }}
                    placeholder={index === 0 
                      ? "Write a message to your younger self..."
                      : "What lesson did you learn today?"
                    }
                    className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500"
                    disabled={!isEditing}
                  />
                </div>
              </div>
            ))}

            {/* Scores Section */}
            <div>
              <div className="bg-gray-900 dark:bg-gray-900 text-white p-3 rounded-t-lg">
                <h2 className="text-lg font-semibold">Scoring - 10</h2>
              </div>
              <div className="border border-gray-200 dark:border-gray-700 rounded-b-lg bg-white dark:bg-gray-800">
                <ScoresSection 
                  scores={scores} 
                  onScoreChange={handleScoreChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <Button
                className="w-full bg-gray-900 dark:bg-gray-900 text-white hover:bg-gray-800 dark:hover:bg-gray-800"
                size="lg"
                onClick={saveDiaryEntry}
              >
                Save Entry
              </Button>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}