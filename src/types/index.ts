export type MonthlyRecurrence =
  | {
      monthlyType: 'dayOfMonth';
      day: number; // 1-31
    }
  | {
      monthlyType: 'dayOfWeek';
      week: 'first' | 'second' | 'third' | 'fourth' | 'last';
      dayOfWeek: number; // 0-6, Sunday-Saturday
    }
  | {
      monthlyType: 'firstLastDay';
      position: 'first' | 'last';
    };

export type Recurrence =
  | { type: 'daily' }
  | { type: 'weekly'; dayOfWeek: number }
  | { type: 'biweekly'; dayOfWeek: number; biweeklyWeeks: 'first_third' | 'second_fourth' }
  | ({ type: 'monthly' } & MonthlyRecurrence);

export interface Task {
  id: string;
  user_id: string;
  title: string;
  recurrence: Recurrence;
  due_time?: string; // 'HH:MM' format or 'all_day'
  created_at: string; // ISO 8601 timestamp
}

export interface TaskCompletion {
  id: string;
  user_id: string;
  task_id: string;
  completion_date: string; // 'YYYY-MM-DD' format
}