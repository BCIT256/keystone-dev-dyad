export type MonthlyRecurrence =
  | {
      monthlyType: 'dayOfMonth';
      day: number; // 1-31
    }
  | {
      monthlyType: 'dayOfWeek';
      week: 'first' | 'second' | 'third' | 'fourth' | 'last';
      dayOfWeek: number; // 0-6, Sunday-Saturday
    };

export type Recurrence =
  | { type: 'daily' }
  | { type: 'weekly'; dayOfWeek: number }
  | { type: 'biweekly'; dayOfWeek: number; biweeklyWeeks: 'first_third' | 'second_fourth' }
  | ({ type: 'monthly' } & MonthlyRecurrence);

export interface Task {
  id: string;
  userId: string; // Mocked
  title: string;
  recurrence: Recurrence;
  dueTime?: string; // 'HH:MM' format or 'all_day'
  createdAt: string; // ISO 8601 timestamp
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  completionDate: string; // 'YYYY-MM-DD' format
}