import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '@/store/auth';
import { sqliteManager } from '@/lib/sqlite';
import { supabaseHelpers } from '@/lib/supabase';
import { useSync } from './useSync';
import type { Profile } from '@/types/database';

export function useProfile() {
  const { user } = useAuthStore();
  const { queueForSync } = useSync();
  const queryClient = useQueryClient();

  const {
    data: profile,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      if (!user) return null;
      
      // Try to get from local storage first
      let profile = await sqliteManager.getProfileByUserId(user.id);
      
      // If not found locally, try cloud
      if (!profile) {
        try {
          const cloudProfile = await supabaseHelpers.getProfile(user.id);
          if (cloudProfile) {
            await sqliteManager.insertProfile({
              ...cloudProfile,
              createdAt: new Date(cloudProfile.createdAt),
              updatedAt: new Date(cloudProfile.updatedAt),
            });
            profile = cloudProfile;
          }
        } catch (error) {
          console.log('Could not fetch profile from cloud, using local only');
        }
      }
      
      return profile;
    },
    enabled: !!user,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (updates: Partial<Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>>) => {
      if (!user) throw new Error('User not authenticated');

      const updatedProfile = {
        userId: user.id,
        ...updates,
      };

      // Update locally first
      const existingProfile = await sqliteManager.getProfileByUserId(user.id);
      if (existingProfile) {
        // For simplicity, we'll recreate the profile
        // In production, you'd want a proper update method
        await sqliteManager.insertProfile(updatedProfile);
      } else {
        await sqliteManager.insertProfile(updatedProfile);
      }

      // Queue for cloud sync
      queueForSync('profiles');

      return updatedProfile;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile', user?.id] });
    },
  });

  return {
    profile,
    isLoading,
    error,
    updateProfile: updateProfileMutation.mutate,
    isUpdating: updateProfileMutation.isPending,
  };
}