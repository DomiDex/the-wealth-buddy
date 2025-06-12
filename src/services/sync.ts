import { supabase, supabaseHelpers } from '@/lib/supabase';
import { sqliteManager } from '@/lib/sqlite';
import { useSyncStore } from '@/store/sync';
import { useAuthStore } from '@/store/auth';
import type { User, Profile } from '@/types/database';

export class SyncService {
  private static instance: SyncService;
  
  static getInstance(): SyncService {
    if (!SyncService.instance) {
      SyncService.instance = new SyncService();
    }
    return SyncService.instance;
  }

  /**
   * Sync user data from cloud to local storage
   */
  async syncUserFromCloud(userId: string): Promise<void> {
    try {
      useSyncStore.getState().setSyncing(true);
      useSyncStore.getState().updateSyncStatus('users', {
        id: crypto.randomUUID(),
        tableName: 'users',
        status: 'syncing',
        lastSyncAt: new Date(),
      });

      // Get user from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      if (userData) {
        // Update local SQLite
        const existingUser = await sqliteManager.getUserByEmail(userData.email);
        
        if (existingUser) {
          await sqliteManager.updateUser(userData.id, {
            ...userData,
            createdAt: new Date(userData.createdAt),
            updatedAt: new Date(userData.updatedAt),
            lastSyncAt: new Date(),
          });
        } else {
          await sqliteManager.insertUser({
            ...userData,
            createdAt: new Date(userData.createdAt),
            updatedAt: new Date(userData.updatedAt),
            lastSyncAt: new Date(),
          });
        }
      }

      useSyncStore.getState().updateSyncStatus('users', {
        id: crypto.randomUUID(),
        tableName: 'users',
        status: 'completed',
        lastSyncAt: new Date(),
      });
    } catch (error) {
      console.error('Error syncing user from cloud:', error);
      useSyncStore.getState().updateSyncStatus('users', {
        id: crypto.randomUUID(),
        tableName: 'users',
        status: 'failed',
        lastSyncAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      useSyncStore.getState().setSyncing(false);
    }
  }

  /**
   * Sync profile data from cloud to local storage
   */
  async syncProfileFromCloud(userId: string): Promise<void> {
    try {
      useSyncStore.getState().setSyncing(true);
      useSyncStore.getState().updateSyncStatus('profiles', {
        id: crypto.randomUUID(),
        tableName: 'profiles',
        status: 'syncing',
        lastSyncAt: new Date(),
      });

      // Get profile from Supabase
      const profileData = await supabaseHelpers.getProfile(userId);

      if (profileData) {
        // Update local SQLite
        const existingProfile = await sqliteManager.getProfileByUserId(userId);
        
        if (!existingProfile) {
          await sqliteManager.insertProfile({
            ...profileData,
            createdAt: new Date(profileData.createdAt),
            updatedAt: new Date(profileData.updatedAt),
          });
        }
      }

      usSync store.getState().updateSyncStatus('profiles', {
        id: crypto.randomUUID(),
        tableName: 'profiles',
        status: 'completed',
        lastSyncAt: new Date(),
      });
    } catch (error) {
      console.error('Error syncing profile from cloud:', error);
      useSyncStore.getState().updateSyncStatus('profiles', {
        id: crypto.randomUUID(),
        tableName: 'profiles',
        status: 'failed',
        lastSyncAt: new Date(),
        errorMessage: error instanceof Error ? error.message : 'Unknown error',
      });
      throw error;
    } finally {
      useSyncStore.getState().setSyncing(false);
    }
  }

  /**
   * Sync local changes to cloud
   */
  async syncToCloud(): Promise<void> {
    const { isOnline, syncQueue } = useSyncStore.getState();
    const { user } = useAuthStore.getState();

    if (!isOnline || !user || syncQueue.length === 0) {
      return;
    }

    try {
      useSyncStore.getState().setSyncing(true);

      for (const tableName of syncQueue) {
        await this.syncTableToCloud(tableName, user.id);
        useSyncStore.getState().removeFromSyncQueue(tableName);
      }

      useSyncStore.getState().setLastSyncAt(new Date());
    } catch (error) {
      console.error('Error syncing to cloud:', error);
      throw error;
    } finally {
      useSyncStore.getState().setSyncing(false);
    }
  }

  private async syncTableToCloud(tableName: string, userId: string): Promise<void> {
    switch (tableName) {
      case 'profiles':
        await this.syncProfileToCloud(userId);
        break;
      default:
        console.warn(`Unknown table for sync: ${tableName}`);
    }
  }

  private async syncProfileToCloud(userId: string): Promise<void> {
    const localProfile = await sqliteManager.getProfileByUserId(userId);
    
    if (localProfile) {
      await supabaseHelpers.upsertProfile({
        userId: localProfile.userId,
        bio: localProfile.bio,
        website: localProfile.website,
        location: localProfile.location,
        preferences: localProfile.preferences,
      });
    }
  }

  /**
   * Perform full sync (both directions)
   */
  async performFullSync(userId: string): Promise<void> {
    try {
      // Sync from cloud to local
      await this.syncUserFromCloud(userId);
      await this.syncProfileFromCloud(userId);
      
      // Sync local changes to cloud
      await this.syncToCloud();
      
      console.log('Full sync completed successfully');
    } catch (error) {
      console.error('Full sync failed:', error);
      throw error;
    }
  }

  /**
   * Clear all sync data and reset state
   */
  async clearSyncData(): Promise<void> {
    try {
      await sqliteManager.clearAllData();
      useSyncStore.getState().clearSyncData();
    } catch (error) {
      console.error('Error clearing sync data:', error);
      throw error;
    }
  }
}

export const syncService = SyncService.getInstance();