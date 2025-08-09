import { supabase } from '@/integrations/supabase/client';

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  updated_at: string | null;
  streak: number;
  last_streak_check: string | null; // YYYY-MM-DD
  is_premium: boolean;
  has_removed_ads: boolean;
  state: string | null;
}

export class ProfileRepository {
  private static async getUserId(): Promise<string> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("User not authenticated");
    return user.id;
  }

  static async getProfile(): Promise<Profile | null> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching profile:', error);
      if (error.code === 'PGRST116') { // "Not Found"
        return null;
      }
      throw error;
    }
    return data;
  }

  static async updateProfile(updates: Partial<Omit<Profile, 'id'>>): Promise<Profile> {
    const userId = await this.getUserId();
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      throw error;
    }
    return data;
  }
}