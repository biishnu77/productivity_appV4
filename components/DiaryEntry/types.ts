export interface DiaryEntry {
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

export interface DailyHabit {
  id?: number;
  diary_entry_id?: number;
  habit_name: string;
  completed: boolean;
}

export interface Scores {
  task_completion: number;
  focus_level: number;
  time_management: number;
  energy_level: number;
}

export const DEFAULT_HABITS: DailyHabit[] = [
  { habit_name: 'Reading', completed: false },
  { habit_name: 'No social media', completed: false },
  { habit_name: 'Gym', completed: false },
  { habit_name: '12h work', completed: false }
];