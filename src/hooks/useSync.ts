import { useEffect, useCallback } from 'react';
import { useSyncStore, useIsOnline, useIsSyncing } from '@/store/sync';
import { useAuthStore } from '@/store/auth';
import { syncService } from '@/services/sync';
import NetInfo from '@react-native-community/netinfo';

export function useSync() {
  const { user } = useAuthStore();
  const isOnline = useIsOnline();
  const isSyncing = useIsSyncing();
  const { setOnline, addToSyncQueue } = useSyncStore();

  // Monitor network connectivity
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setOnline(state.isConnected ?? false);
    });

    return unsubscribe;
  }, [setOnline]);

  // Auto-sync when coming online
  useEffect(() => {
    if (isOnline && user && !isSyncing) {
      syncService.syncToCloud().catch(console.error);
    }
  }, [isOnline, user, isSyncing]);

  const performSync = useCallback(async () => {
    if (!user) return;

    try {
      await syncService.performFullSync(user.id);
    } catch (error) {
      console.error('Sync failed:', error);
      throw error;
    }
  }, [user]);

  const queueForSync = useCallback((tableName: string) => {
    addToSyncQueue(tableName);
  }, [addToSyncQueue]);

  return {
    isOnline,
    isSyncing,
    performSync,
    queueForSync,
  };
}