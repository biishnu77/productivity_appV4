import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useUserStore } from '@/lib/store';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from 'sonner';
import type { DiaryEntry, Scores } from './DiaryEntry/types';
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
  const [lessonLearned, setLessonLearned] = useState('');
  const [tomorrowBetter, setTomorrowBetter] = useState('');
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
      setLessonLearned(entry.lesson_learned || '');
      setTomorrowBetter(entry.tomorrow_better || '');
      setScores({
        task_completion: entry.task_completion,
        focus_level: entry.focus_level,
        time_management: entry.time_management,
        energy_level: entry.energy_level
      });
      setIsEditing(false);
    } else {
      resetForm();
      setIsEditing(true);
    }
    setIsSidebarOpen(false);
  }, [selectedDate, entries]);

  const resetForm = () => {
    setLessonLearned('');
    setTomorrowBetter('');
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
        lesson_learned: lessonLearned,
        tomorrow_better: tomorrowBetter,
        ...scores
      };

      await DiaryService.saveEntry(userName, entryData, selectedDate);
      toast.success('Diary entry saved successfully');
      setIsEditing(false);
      fetchEntries();
    } catch (error) {
      toast.error('Failed to save diary entry');
    }
  };

  if (!userName) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Please log in to view your diary</h2>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6 text-center">Diary of {userName}</h1>
        
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

          <Card className="flex-1 p-4 md:p-6 space-y-6">
            {/* Day and Date Section */}
            <div className="border rounded-lg overflow-hidden">
              <div className="grid grid-cols-[1fr,1.5fr] bg-background text-foreground">
                <div className="p-3 font-semibold">Day</div>
                <div className="p-3 font-semibold">Date</div>
              </div>
              
              <div className="grid grid-cols-[1fr,1.5fr] bg-background">
                <div className="p-3 border-r">
                  {entries.find(e => e.date === selectedDate)?.day_number || entries.length + 1}
                </div>
                <div className="p-3">
                  {format(new Date(selectedDate), 'MM/dd/yyyy')}
                </div>
              </div>
            </div>

            {/* Updated Text Areas */}
            <div>
              <div className="bg-background text-foreground p-3 rounded-t-lg">
                <h2 className="text-lg font-semibold">Lesson learned today</h2>
              </div>
              <div className="p-4 border rounded-b-lg bg-background">
                <Textarea
                  value={lessonLearned}
                  onChange={(e) => isEditing && setLessonLearned(e.target.value)}
                  placeholder="What lesson did you learn today?"
                  className="bg-background text-foreground border focus:border-primary"
                  disabled={!isEditing}
                />
              </div>
            </div>

            <div>
              <div className="bg-background text-foreground p-3 rounded-t-lg">
                <h2 className="text-lg font-semibold">How can I make tomorrow better?</h2>
              </div>
              <div className="p-4 border rounded-b-lg bg-background">
                <Textarea
                  value={tomorrowBetter}
                  onChange={(e) => isEditing && setTomorrowBetter(e.target.value)}
                  placeholder="How can you improve tomorrow?"
                  className="bg-background text-foreground border focus:border-primary"
                  disabled={!isEditing}
                />
              </div>
            </div>

            {/* Scores Section */}
            <div>
              <div className="bg-background text-foreground p-3 rounded-t-lg">
                <h2 className="text-lg font-semibold">Daily Scores</h2>
              </div>
              <div className="border rounded-b-lg bg-background">
                <ScoresSection 
                  scores={scores} 
                  onScoreChange={handleScoreChange}
                  disabled={!isEditing}
                />
              </div>
            </div>

            {isEditing && (
              <Button
                className="w-full"
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