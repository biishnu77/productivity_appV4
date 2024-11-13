import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Sun, Play, Pause } from 'lucide-react';
import { formatTimer } from '@/lib/utils';

interface WellnessCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  timer?: number;
  isActive?: boolean;
  onToggle?: () => void;
  showTimer?: boolean;
  timeInput?: {
    value: string;
    onChange: (value: string) => void;
    onSave: () => void;
  };
}

export function WellnessCard({
  icon,
  title,
  description,
  timer,
  isActive,
  onToggle,
  showTimer,
  timeInput
}: WellnessCardProps) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <div className="font-semibold">{title}</div>
              <div className="text-sm text-muted-foreground">{description}</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {timeInput && (
              <>
                <Input
                  type="time"
                  value={timeInput.value} // Controlled value
                  onChange={(e) => timeInput.onChange(e.target.value)} // Update on change
                  className="w-32"
                />
                <Button onClick={timeInput.onSave} size="sm">Save</Button>
              </>
            )}
            {showTimer && (
              <>
                <span className="font-mono text-lg">{formatTimer(timer || 0)}</span>
                <Button
                  variant={isActive ? "secondary" : "outline"}
                  size="sm"
                  onClick={onToggle}
                >
                  {isActive ? (
                    <><Pause className="h-4 w-4 mr-2" />Pause</>
                  ) : (
                    <><Play className="h-4 w-4 mr-2" />Start</>
                  )}
                </Button>
              </>
            )}
          </div>
        </div>
        {showTimer && isActive && (
          <div className="mt-2 w-full bg-secondary h-2 rounded-full overflow-hidden">
            <div 
              className="bg-green-500 h-full transition-all duration-1000"
              style={{ width: `${(timer || 0) / (15 * 60) * 100}%` }}
            />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
