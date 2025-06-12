import { z } from 'zod';

// User schema for validation
export const UserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  avatarUrl: z.string().url().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
  lastSyncAt: z.date().optional(),
});

// Profile schema for user profile management
export const ProfileSchema = z.object({
  id: z.string().uuid(),
  userId: z.string().uuid(),
  bio: z.string().optional(),
  website: z.string().url().optional(),
  location: z.string().optional(),
  preferences: z.record(z.any()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

// Sync status schema for tracking synchronization
export const SyncStatusSchema = z.object({
  id: z.string().uuid(),
  tableName: z.string(),
  lastSyncAt: z.date(),
  status: z.enum(['pending', 'syncing', 'completed', 'failed']),
  errorMessage: z.string().optional(),
});

// Export TypeScript types
export type User = z.infer<typeof UserSchema>;
export type Profile = z.infer<typeof ProfileSchema>;
export type SyncStatus = z.infer<typeof SyncStatusSchema>;

// Database table definitions for Supabase
export interface Database {
  public: {
    Tables: {
      users: {
        Row: User;
        Insert: Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<User, 'id' | 'createdAt'>>;
      };
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'createdAt' | 'updatedAt'>;
        Update: Partial<Omit<Profile, 'id' | 'createdAt'>>;
      };
      sync_status: {
        Row: SyncStatus;
        Insert: Omit<SyncStatus, 'id'>;
        Update: Partial<Omit<SyncStatus, 'id'>>;
      };
    };
  };
}