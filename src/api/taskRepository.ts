import { supabase } from '@/integrations/supabase/client';
import { Task, TaskCompletion, Recurrence } from '../types';

type TaskData = {
  title: string;
  recurrence: Recurrence;
  due_time?: string;
}

export class TaskRepository {
  private static async getUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    return user.id;
  }

  static async getTasks(): Promise<Task[]> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching tasks:', error);
      throw error;
    }
    return data || [];
  }

  static async getCompletions(): Promise<TaskCompletion[]> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from('task_completions')
      .select('*')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching completions:', error);
      throw error;
    }
    return data || [];
  }

  static async addTask(taskData: TaskData): Promise<Task> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from('tasks')
      .insert([{ ...taskData, user_id: userId }])
      .select()
      .single();

    if (error) {
      console.error('Error adding task:', error);
      throw error;
    }
    return data;
  }

  static async addCompletion(taskId: string, date: string): Promise<TaskCompletion> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from('task_completions')
      .insert([{ task_id: taskId, completion_date: date, user_id: userId }])
      .select()
      .single();
    
    if (error) {
      // Handle unique constraint violation gracefully, which can happen on rapid clicks
      if (error.code === '23505') { // unique_violation
        const { data: existing, error: fetchError } = await supabase
          .from('task_completions')
          .select()
          .eq('user_id', userId)
          .eq('task_id', taskId)
          .eq('completion_date', date)
          .single();
        if (fetchError) throw fetchError;
        return existing;
      }
      console.error('Error adding completion:', error);
      throw error;
    }
    return data;
  }

  static async removeCompletion(taskId: string, date: string): Promise<void> {
    const userId = await this.getUserId();
    const { error } = await supabase
      .from('task_completions')
      .delete()
      .eq('user_id', userId)
      .eq('task_id', taskId)
      .eq('completion_date', date);

    if (error) {
      console.error('Error removing completion:', error);
      throw error;
    }
  }
}