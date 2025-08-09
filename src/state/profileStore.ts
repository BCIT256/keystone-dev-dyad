import { create } from 'zustand';
import { Profile, ProfileRepository } from '@/api/profileRepository';
import { useTaskStore } from './taskStore';
import { differenceInCalendarDays, subDays, format } from 'date-fns';
import { showSuccess, showError } from '@/utils/toast';

interface ProfileState {
  profile: Profile | null;
  isLoading: boolean;
  fetchProfile: () => Promise<void>;
  updateStreak: () => Promise<void>;
  setHasRemovedAds: () => Promise<void>;
  updateProfile: (updates: Partial<Omit<Profile, 'id' | 'updated_at'>>) => Promise<void>;
}

export const useProfileStore = create<ProfileState>((set, get) => ({
  profile: null,
  isLoading: true,
  fetchProfile: async () => {
    set({ isLoading: true });
    try {
      const profile = await ProfileRepository.getProfile();
      set({ profile, isLoading: false });
    } catch (error) {
      console.error("Failed to fetch profile", error);
      set({ isLoading: false });
    }
  },
  updateStreak: async () => {
    const { profile } = get();
    if (!profile) return;

    const today = new Date();
    const lastCheckDate = profile.last_streak_check ? new Date(profile.last_streak_check) : null;

    if (!lastCheckDate) {
      const updatedProfile = await ProfileRepository.updateProfile({ last_streak_check: format(today, 'yyyy-MM-dd') });
      set({ profile: updatedProfile });
      return;
    }

    const daysDifference = differenceInCalendarDays(today, lastCheckDate);

    if (daysDifference <= 0) {
      return; // Already checked today or in the future
    }

    let newStreak = profile.streak;

    if (daysDifference === 1) {
      const yesterday = subDays(today, 1);
      const tasksForYesterday = useTaskStore.getState().getTasksForDate(yesterday);
      const allTasksCompleted = tasksForYesterday.every(t => t.isComplete);

      if (allTasksCompleted) {
        newStreak += 1;
      } else {
        newStreak = 0;
      }
    } else {
      newStreak = 0;
    }

    const updatedProfile = await ProfileRepository.updateProfile({
      streak: newStreak,
      last_streak_check: format(today, 'yyyy-MM-dd'),
    });
    set({ profile: updatedProfile });
  },
  setHasRemovedAds: async () => {
    const { profile } = get();
    if (!profile || profile.has_removed_ads) return;

    const updatedProfile = await ProfileRepository.updateProfile({
      has_removed_ads: true,
    });
    set({ profile: updatedProfile });
  },
  updateProfile: async (updates) => {
    try {
      const updatedProfile = await ProfileRepository.updateProfile(updates);
      set({ profile: updatedProfile });
      showSuccess("Profile updated successfully!");
    } catch (error) {
      showError("There was an error updating your profile.");
      console.error("Failed to update profile", error);
    }
  },
}));