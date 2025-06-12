import * as SQLite from 'expo-sqlite';
import type { User, Profile, SyncStatus } from '@/types/database';

// Initialize SQLite database
export const initDatabase = async (): Promise<SQLite.SQLiteDatabase> => {
  const db = await SQLite.openDatabaseAsync('app.db');
  
  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');
  
  // Create tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      firstName TEXT,
      lastName TEXT,
      avatarUrl TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      lastSyncAt TEXT
    );

    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY,
      userId TEXT NOT NULL,
      bio TEXT,
      website TEXT,
      location TEXT,
      preferences TEXT,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL,
      FOREIGN KEY (userId) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS sync_status (
      id TEXT PRIMARY KEY,
      tableName TEXT NOT NULL,
      lastSyncAt TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('pending', 'syncing', 'completed', 'failed')),
      errorMessage TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_profiles_userId ON profiles(userId);
    CREATE INDEX IF NOT EXISTS idx_sync_status_tableName ON sync_status(tableName);
  `);
  
  return db;
};

// SQLite operations wrapper
export class SQLiteManager {
  private db: SQLite.SQLiteDatabase | null = null;

  async init() {
    if (!this.db) {
      this.db = await initDatabase();
    }
    return this.db;
  }

  // User operations
  async insertUser(user: Omit<User, 'id'>) {
    await this.init();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    return await this.db!.runAsync(
      `INSERT INTO users (id, email, firstName, lastName, avatarUrl, createdAt, updatedAt, lastSyncAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [id, user.email, user.firstName || null, user.lastName || null, user.avatarUrl || null, now, now, user.lastSyncAt?.toISOString() || null]
    );
  }

  async getUserByEmail(email: string): Promise<User | null> {
    await this.init();
    const result = await this.db!.getFirstAsync<any>(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    
    if (!result) return null;
    
    return {
      ...result,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
      lastSyncAt: result.lastSyncAt ? new Date(result.lastSyncAt) : undefined,
    };
  }

  async updateUser(id: string, updates: Partial<User>) {
    await this.init();
    const now = new Date().toISOString();
    
    const fields = Object.keys(updates).filter(key => key !== 'id' && key !== 'createdAt');
    const values = fields.map(key => updates[key as keyof User]);
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    
    return await this.db!.runAsync(
      `UPDATE users SET ${setClause}, updatedAt = ? WHERE id = ?`,
      [...values, now, id]
    );
  }

  // Profile operations
  async insertProfile(profile: Omit<Profile, 'id'>) {
    await this.init();
    const id = crypto.randomUUID();
    const now = new Date().toISOString();
    
    return await this.db!.runAsync(
      `INSERT INTO profiles (id, userId, bio, website, location, preferences, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        profile.userId,
        profile.bio || null,
        profile.website || null,
        profile.location || null,
        profile.preferences ? JSON.stringify(profile.preferences) : null,
        now,
        now
      ]
    );
  }

  async getProfileByUserId(userId: string): Promise<Profile | null> {
    await this.init();
    const result = await this.db!.getFirstAsync<any>(
      'SELECT * FROM profiles WHERE userId = ?',
      [userId]
    );
    
    if (!result) return null;
    
    return {
      ...result,
      preferences: result.preferences ? JSON.parse(result.preferences) : undefined,
      createdAt: new Date(result.createdAt),
      updatedAt: new Date(result.updatedAt),
    };
  }

  // Sync status operations
  async updateSyncStatus(tableName: string, status: SyncStatus['status'], errorMessage?: string) {
    await this.init();
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    
    return await this.db!.runAsync(
      `INSERT OR REPLACE INTO sync_status (id, tableName, lastSyncAt, status, errorMessage)
       VALUES (?, ?, ?, ?, ?)`,
      [id, tableName, now, status, errorMessage || null]
    );
  }

  async getSyncStatus(tableName: string): Promise<SyncStatus | null> {
    await this.init();
    const result = await this.db!.getFirstAsync<any>(
      'SELECT * FROM sync_status WHERE tableName = ? ORDER BY lastSyncAt DESC LIMIT 1',
      [tableName]
    );
    
    if (!result) return null;
    
    return {
      ...result,
      lastSyncAt: new Date(result.lastSyncAt),
    };
  }

  // Clear all data (useful for logout)
  async clearAllData() {
    await this.init();
    await this.db!.execAsync(`
      DELETE FROM sync_status;
      DELETE FROM profiles;
      DELETE FROM users;
    `);
  }
}

export const sqliteManager = new SQLiteManager();