import { format } from 'date-fns';
import type { DiaryEntry } from './types';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChevronRight } from 'lucide-react';

interface HistoryPanelProps {
  entries: DiaryEntry[];
  selectedDate: string;
  onDateSelect: (date: string) => void;
}

export function HistoryPanel({ entries, selectedDate, onDateSelect }: HistoryPanelProps) {
  return (
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
            onClick={() => onDateSelect(entry.date)}
          >
            <ChevronRight className="h-4 w-4 mr-2" />
            <span>{format(new Date(entry.date), 'MMM d, yyyy')}</span>
          </Button>
        ))}
      </ScrollArea>
    </Card>
  );
}