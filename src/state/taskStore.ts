import create from 'zustand';
import { Task, TaskCompletion } from '../types';
import { TaskRepository } from '../api/taskRepository';
import { format, getDay, differenceInCalendarWeeks, parseISO } from 'date-fns';

interface TaskState {
  tasks: Task[];
  completions: TaskCompletion[];
  isLoading: boolean;
  getTasksForDate: (date: Date) => { task: Task; isComplete: boolean }[];
  addTask: (task: Omit<Task, 'id' | 'userId' | 'createdAt'>) => Promise<void>;
  toggleTaskCompletion: (taskId: string, date: Date) => void;
  fetchTasks: () => Promise<void>;
}

export const useTaskStore = create<TaskState>((set, get) => ({
  tasks: [],
  completions: [],
  isLoading: true,

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
    const dayOfWeek = getDay(date); // Sunday = 0, Monday = 1, etc.
    const dateString = format(date, 'yyyy-MM-dd');

    const dailyTasks = tasks.filter(t => t.recurrence.type === 'daily');
    const weeklyTasks = tasks.filter(t => t.recurrence.type === 'weekly' && t.recurrence.dayOfWeek === dayOfWeek);
    const biweeklyTasks = tasks.filter(t => {
      if (t.recurrence.type !== 'biweekly' || t.recurrence.dayOfWeek !== dayOfWeek) {
        return false;
      }
      const taskStartDate = parseISO(t.createdAt);
      const weeksDifference = differenceInCalendarWeeks(date, taskStartDate, { weekStartsOn: 0 /* Sunday */ });
      return weeksDifference % 2 === 0;
    });

    const allTasksForDate = [...new Set([...dailyTasks, ...weeklyTasks, ...biweeklyTasks])];

    return allTasksForDate.map(task => {
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
}));