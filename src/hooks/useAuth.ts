import { useEffect } from 'react';
import { useAuthStore } from '@/store/auth';
import { syncService } from '@/services/sync';
import { sqliteManager } from '@/lib/sqlite';

export function useAuth() {
  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    setUser,
    setLoading,
    setError,
    signOut: storeSignOut,
    clearError,
  } = useAuthStore();

  useEffect(() => {
    // Initialize database on mount
    sqliteManager.init().catch(console.error);
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would use Clerk
      // For now, we'll simulate authentication
      const mockUser = {
        id: crypto.randomUUID(),
        email,
        firstName: 'Demo',
        lastName: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(mockUser);

      // Perform initial sync
      await syncService.performFullSync(mockUser.id);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign in failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signUp = async (email: string, password: string, firstName?: string, lastName?: string) => {
    try {
      setLoading(true);
      setError(null);

      // In a real implementation, this would use Clerk
      const mockUser = {
        id: crypto.randomUUID(),
        email,
        firstName: firstName || 'New',
        lastName: lastName || 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      setUser(mockUser);

      // Store user locally
      await sqliteManager.insertUser(mockUser);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Sign up failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      
      // Clear sync data
      await syncService.clearSyncData();
      
      // Clear auth state
      storeSignOut();
    } catch (err) {
      console.error('Error during sign out:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshUser = async () => {
    if (!user) return;

    try {
      setLoading(true);
      await syncService.syncUserFromCloud(user.id);
    } catch (err) {
      console.error('Error refreshing user:', err);
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated,
    isLoading,
    error,
    signIn,
    signUp,
    signOut,
    refreshUser,
    clearError,
  };
}