export type RecurrenceType = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface Task {
  id: string;
  userId: string; // Mocked
  title: string;
  recurrence: {
    type: RecurrenceType;
    dayOfWeek?: number; // 0=Sunday, 1=Monday, etc. Only for weekly/biweekly
    biweeklyWeeks?: 'first_third' | 'second_fourth'; // For biweekly on 1st/3rd or 2nd/4th weeks
    dayOfMonth?: number; // For monthly
    isLastDayOfMonth?: boolean; // For monthly tasks on days 29, 30, 31
  };
  dueTime?: string; // 'HH:MM' format or 'all_day'
  createdAt: string; // ISO 8601 timestamp
}

export interface TaskCompletion {
  id: string;
  taskId: string;
  completionDate: string; // 'YYYY-MM-DD' format
}