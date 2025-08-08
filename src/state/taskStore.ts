import { create } from 'zustand';
import { Task, TaskCompletion } from '../types';
import { TaskRepository } from '../api/taskRepository';
import { format, getDay, getDate, addDays, subDays, endOfMonth } from 'date-fns';

interface TaskState {
  tasks: Task[];
  completions: TaskCompletion[];
  isLoading: boolean;
  currentDate: Date;
  adsVisible: boolean;
  getTasksForDate: (date: Date) => { task: Task; isComplete: boolean }[];
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  toggleTaskCompletion: (taskId: string, date: Date) => void;
  fetchTasks: () => Promise<void>;
  nextDay: () => void;
  previousDay: () => void;
  setCurrentDate: (date: Date) => void;
  hideAds: () => void;
}

const getWeekOfMonth = (date: Date): number => {
  return Math.ceil(getDate(date) / 7);
};

const isCorrectWeekOfMonth = (date: Date, week: 'first' | 'second' | 'third' | 'fourth' | 'last', dayOfWeek: number): boolean => {
  if (getDay(date) !== dayOfWeek) return false;

  const dayOfMonth = getDate(date);

  switch (week) {
    case 'first': return dayOfMonth >= 1 && dayOfMonth <= 7;
    case 'second': return dayOfMonth >= 8 && dayOfMonth <= 14;
    case 'third': return dayOfMonth >= 15 && dayOfMonth <= 21;
    case 'fourth': return dayOfMonth >= 22 && dayOfMonth <= 28;
    case 'last': return getDate(endOfMonth(date)) - dayOfMonth < 7;
    default: return false;
  }
};

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  completions: [],
  isLoading: true,
  currentDate: new Date(),
  adsVisible: true,

  fetchTasks: async () => {
    set({ isLoading: true });
    const [tasks, completions] = await Promise.all([
      TaskRepository.getTasks(),
      TaskRepository.getCompletions(),
    ]);
    set({ tasks, completions, isLoading: false });
  },

  getTasksForDate: (date: Date) => {
    const { tasks, completions } = get();
    const dayOfWeek = getDay(date);
    const dayOfMonth = getDate(date);
    const weekOfMonth = getWeekOfMonth(date);
    const dateString = format(date, 'yyyy-MM-dd');

    const tasksForDate = tasks.filter(t => {
      switch (t.recurrence.type) {
        case 'daily':
          return true;
        case 'weekly':
          return t.recurrence.dayOfWeek === dayOfWeek;
        case 'biweekly': {
          if (t.recurrence.dayOfWeek !== dayOfWeek) return false;
          if (t.recurrence.biweeklyWeeks === 'first_third') {
            return weekOfMonth === 1 || weekOfMonth === 3;
          }
          if (t.recurrence.biweeklyWeeks === 'second_fourth') {
            return weekOfMonth === 2 || weekOfMonth === 4;
          }
          return false;
        }
        case 'monthly': {
          const { recurrence } = t;
          if (recurrence.monthlyType === 'dayOfMonth') {
            const lastDay = getDate(endOfMonth(date));
            // If task is for day 31 but month has 28, show on 28th
            if (recurrence.day > lastDay) {
              return dayOfMonth === lastDay;
            }
            return recurrence.day === dayOfMonth;
          }
          if (recurrence.monthlyType === 'dayOfWeek') {
            return isCorrectWeekOfMonth(date, recurrence.week, recurrence.dayOfWeek);
          }
          return false;
        }
        default:
          return false;
      }
    });

    return tasksForDate.map(task => {
      const isComplete = completions.some(c => c.taskId === task.id && c.completionDate === dateString);
      return { task, isComplete };
    }).sort((a, b) => a.task.title.localeCompare(b.task.title));
  },

  addTask: async (taskData) => {
    const newTask = await TaskRepository.addTask(taskData);
    set(state => ({ tasks: [...state.tasks, newTask] }));
  },

  toggleTaskCompletion: async (taskId: string, date: Date) => {
    const dateString = format(date, 'yyyy-MM-dd');
    const { completions } = get();
    const existingCompletion = completions.find(c => c.taskId === taskId && c.completionDate === dateString);

    if (existingCompletion) {
      await TaskRepository.removeCompletion(taskId, dateString);
      set(state => ({
        completions: state.completions.filter(c => c.id !== existingCompletion.id),
      }));
    } else {
      const newCompletion = await TaskRepository.addCompletion(taskId, dateString);
      set(state => ({
        completions: [...state.completions, newCompletion],
      }));
    }
  },

  nextDay: () => {
    set(state => ({ currentDate: addDays(state.currentDate, 1) }));
  },

  previousDay: () => {
    set(state => ({ currentDate: subDays(state.currentDate, 1) }));
  },

  setCurrentDate: (date: Date) => {
    set({ currentDate: date });
  },

  hideAds: () => {
    set({ adsVisible: false });
  },
}));