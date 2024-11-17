import type { Scores } from './types';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ScoresSectionProps {
  scores: Scores;
  onScoreChange: (key: keyof Scores, value: number) => void;
  disabled?: boolean;
}

export function ScoresSection({ scores, onScoreChange, disabled = false }: ScoresSectionProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4">
      {Object.entries(scores).map(([key, value]) => (
        <div key={key}>
          <Label htmlFor={key}>{key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}</Label>
          <Input
            id={key}
            type="number"
            min="0"
            max="10"
            value={value}
            onChange={(e) => onScoreChange(key as keyof Scores, parseInt(e.target.value) || 0)}
            className="bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-200 dark:border-gray-600 focus:border-gray-400 dark:focus:border-gray-500"
            disabled={disabled}
          />
        </div>
      ))}
    </div>
  );
}