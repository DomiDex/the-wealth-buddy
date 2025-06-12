import { create } from 'zustand';
import type { SyncStatus } from '@/types/database';

interface SyncState {
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncAt: Date | null;
  syncQueue: string[];
  syncStatuses: Record<string, SyncStatus>;
}

interface SyncActions {
  setOnline: (online: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSyncAt: (date: Date) => void;
  addToSyncQueue: (tableName: string) => void;
  removeFromSyncQueue: (tableName: string) => void;
  updateSyncStatus: (tableName: string, status: SyncStatus) => void;
  clearSyncData: () => void;
}

export const useSyncStore = create<SyncState & SyncActions>((set, get) => ({
  // State
  isOnline: true,
  isSyncing: false,
  lastSyncAt: null,
  syncQueue: [],
  syncStatuses: {},

  // Actions
  setOnline: (isOnline) => set({ isOnline }),
  
  setSyncing: (isSyncing) => set({ isSyncing }),
  
  setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),
  
  addToSyncQueue: (tableName) => {
    const { syncQueue } = get();
    if (!syncQueue.includes(tableName)) {
      set({ syncQueue: [...syncQueue, tableName] });
    }
  },
  
  removeFromSyncQueue: (tableName) => {
    const { syncQueue } = get();
    set({ syncQueue: syncQueue.filter(name => name !== tableName) });
  },
  
  updateSyncStatus: (tableName, status) => {
    const { syncStatuses } = get();
    set({ 
      syncStatuses: { 
        ...syncStatuses, 
        [tableName]: status 
      } 
    });
  },
  
  clearSyncData: () => set({
    syncQueue: [],
    syncStatuses: {},
    lastSyncAt: null,
    isSyncing: false,
  }),
}));

// Selectors
export const useIsOnline = () => useSyncStore((state) => state.isOnline);
export const useIsSyncing = () => useSyncStore((state) => state.isSyncing);
export const useSyncQueue = () => useSyncStore((state) => state.syncQueue);