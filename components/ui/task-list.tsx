import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Clock, Play, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { Task } from '@/types/task';
import { formatDuration } from '@/lib/utils';

interface TaskListProps {
  tasks: Task[];
  onToggleTask: (taskId: number, completed: boolean) => void;
  onStartTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
}

export function TaskList({ tasks, onToggleTask, onStartTask, onDeleteTask }: TaskListProps) {
  return (
    <div className="space-y-2">
      {tasks.map((task) => (
        <Card key={task.id}>
          <CardContent className="flex items-center justify-between p-4">
            <div className="flex items-center gap-2">
              <Checkbox
                checked={task.completed}
                onCheckedChange={(checked) => onToggleTask(task.id, checked as boolean)}
              />
              <div className={task.completed ? 'line-through text-muted-foreground' : ''}>
                <div>{task.description}</div>
                <div className="text-sm text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {formatDuration(task.duration)}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {format(new Date(task.created_at), 'MMM d, yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onStartTask(task)}
                className="flex items-center gap-1"
                disabled={task.completed}
              >
                <Play className="h-3 w-3" />
                Start
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => onDeleteTask(task.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}