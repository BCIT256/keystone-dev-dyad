import { Task, TaskCompletion } from '../types';
import { v4 as uuidv4 } from 'uuid';

// Mock Data
const mockTasks: Task[] = [
  {
    id: '1',
    userId: 'user-1',
    title: 'Morning meditation',
    recurrence: { type: 'daily' },
    dueTime: '08:00',
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    userId: 'user-1',
    title: 'Submit weekly report',
    recurrence: { type: 'weekly', dayOfWeek: 5 }, // Friday
    dueTime: '17:00',
    createdAt: new Date().toISOString(),
  },
  {
    id: '3',
    userId: 'user-1',
    title: 'Water the plants',
    recurrence: { type: 'daily' },
    dueTime: 'all_day',
    createdAt: new Date().toISOString(),
  },
  {
    id: '4',
    userId: 'user-1',
    title: 'Take out recycling',
    recurrence: { type: 'biweekly', dayOfWeek: 2, biweeklyWeeks: 'second_fourth' }, // 2nd & 4th Tuesday
    dueTime: '19:00',
    createdAt: new Date().toISOString(),
  },
  {
    id: '5',
    userId: 'user-1',
    title: 'Pay rent',
    recurrence: { type: 'monthly', monthlyType: 'dayOfMonth', day: 1 }, // 1st of the month
    dueTime: 'all_day',
    createdAt: new Date().toISOString(),
  },
  {
    id: '6',
    userId: 'user-1',
    title: 'Book club meeting',
    recurrence: { type: 'monthly', monthlyType: 'dayOfWeek', week: 'last', dayOfWeek: 4 }, // Last Thursday
    dueTime: '18:30',
    createdAt: new Date().toISOString(),
  },
];

const mockCompletions: TaskCompletion[] = [];

export class TaskRepository {
  static async getTasks(): Promise<Task[]> {
    return new Promise(resolve => setTimeout(() => resolve(mockTasks), 500));
  }

  static async getCompletions(): Promise<TaskCompletion[]> {
    return new Promise(resolve => setTimeout(() => resolve(mockCompletions), 500));
  }

  static async addTask(taskData: Omit<Task, 'id' | 'userId' | 'createdAt'>): Promise<Task> {
    const newTask: Task = {
      ...taskData,
      id: uuidv4(),
      userId: 'user-1', // Mocked
      createdAt: new Date().toISOString(),
    };
    mockTasks.push(newTask);
    return new Promise(resolve => setTimeout(() => resolve(newTask), 300));
  }

  static async addCompletion(taskId: string, date: string): Promise<TaskCompletion> {
    const newCompletion: TaskCompletion = {
      id: uuidv4(),
      taskId,
      completionDate: date,
    };
    mockCompletions.push(newCompletion);
    return new Promise(resolve => setTimeout(() => resolve(newCompletion), 300));
  }

  static async removeCompletion(taskId: string, date: string): Promise<void> {
    const index = mockCompletions.findIndex(c => c.taskId === taskId && c.completionDate === date);
    if (index > -1) {
      mockCompletions.splice(index, 1);
    }
    return new Promise(resolve => setTimeout(resolve, 300));
  }
}