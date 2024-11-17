import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw } from 'lucide-react';

interface ProductivityCardProps {
  percentage: number;
  onRefresh: () => void;
  isLoading: boolean;
}

export function ProductivityCard({ percentage, onRefresh, isLoading }: ProductivityCardProps) {
  return (
    <div className="mt-4 bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-muted-foreground">Today's Productivity</div>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={onRefresh}
          disabled={isLoading}
        >
          <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      <div className="text-2xl font-bold">{percentage.toFixed(1)}%</div>
      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mt-2">
        <div
          className="bg-green-600 h-2.5 rounded-full transition-all duration-500"
          style={{ width: `${percentage}%` }}
        ></div>
      </div>
    </div>
  );
}