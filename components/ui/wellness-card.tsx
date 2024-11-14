import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useUserStore } from '@/lib/store';
import { formatDuration } from '@/lib/utils';

interface WellnessCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  timeInput?: {
    value: string;
    onChange: (value: string) => void;
    onSave?: () => void; // Made optional since we might not use it
  };
  timer?: number;
  isActive?: boolean;
  onToggle?: () => void;
  showTimer?: boolean;
  duration?: number;
}

export function WellnessCard({
  icon,
  title,
  description,
  timeInput,
  timer,
  isActive,
  onToggle,
  showTimer,
  duration,
}: WellnessCardProps) {
  const setActiveTab = useUserStore((state) => state.setActiveTab);

  const handleStart = () => {
    if (onToggle && duration) {
      localStorage.setItem('currentTask', JSON.stringify({
        description: title,
        duration: duration / 60 // Convert seconds to minutes
      }));
      setActiveTab('pomodoro');
    } else {
      onToggle?.();
    }
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {icon}
            <div>
              <h3 className="font-medium">{title}</h3>
              <p className="text-sm text-muted-foreground">{description}</p>
            </div>
          </div>
          {timeInput ? (
            <div className="flex items-center gap-2">
              <Input
                type="time"
                value={timeInput.value}
                onChange={(e) => timeInput.onChange(e.target.value)}
                className="w-32"
              />
            </div>
          ) : showTimer ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-mono">
                15m
              </span>
              <Button
                onClick={handleStart}
                variant={isActive ? "destructive" : "default"}
                size="sm"
              >
                {isActive ? "Stop" : "Start"}
              </Button>
            </div>
          ) : null}
        </div>
      </CardContent>
    </Card>
  );
}