import { DailyHabit } from './types';
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface HabitsListProps {
  habits: DailyHabit[];
  onToggleHabit: (habitName: string) => void;
  disabled?: boolean;
}

export function HabitsList({ habits, onToggleHabit, disabled = false }: HabitsListProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-3">
      {habits.map((habit) => (
        <div key={habit.habit_name} className="flex items-center space-x-4">
          <Checkbox
            id={habit.habit_name}
            checked={habit.completed}
            onCheckedChange={() => onToggleHabit(habit.habit_name)}
            disabled={disabled}
          />
          <Label htmlFor={habit.habit_name}>{habit.habit_name}</Label>
        </div>
      ))}
    </div>
  );
}