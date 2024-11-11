export interface Task {
    id: number;
    user_name: string;
    description: string;
    completed: boolean;
    duration: number;
    due_date: string;
    created_at: string;
  }