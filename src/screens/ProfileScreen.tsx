import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { User, Settings, LogOut, Save, Wifi, WifiOff } from 'lucide-react-native';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useSync } from '@/hooks/useSync';
import { useSyncStore } from '@/store/sync';

export function ProfileScreen() {
  const { user, signOut } = useAuth();
  const { profile, updateProfile, isUpdating } = useProfile();
  const { isOnline, isSyncing, performSync } = useSync();
  const { lastSyncAt } = useSyncStore();

  const [bio, setBio] = useState(profile?.bio || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [location, setLocation] = useState(profile?.location || '');

  const handleUpdateProfile = async () => {
    try {
      await updateProfile({
        bio: bio.trim() || undefined,
        website: website.trim() || undefined,
        location: location.trim() || undefined,
      });
      
      Alert.alert('Success', 'Profile updated successfully');
    } catch (error) {
      Alert.alert('Error', 'Failed to update profile');
    }
  };

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const handleSync = async () => {
    try {
      await performSync();
      Alert.alert('Success', 'Sync completed successfully');
    } catch (error) {
      Alert.alert('Error', 'Sync failed. Please try again.');
    }
  };

  if (!user) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <User size={48} color="#3b82f6" />
          </View>
          <Text style={styles.name}>
            {user.firstName} {user.lastName}
          </Text>
          <Text style={styles.email}>{user.email}</Text>
        </View>

        {/* Sync Status */}
        <View style={styles.syncSection}>
          <View style={styles.syncHeader}>
            <View style={styles.syncStatus}>
              {isOnline ? (
                <Wifi size={20} color="#10b981" />
              ) : (
                <WifiOff size={20} color="#ef4444" />
              )}
              <Text style={[styles.syncText, { color: isOnline ? '#10b981' : '#ef4444' }]}>
                {isOnline ? 'Online' : 'Offline'}
              </Text>
            </View>
            {isSyncing && <LoadingSpinner size="small" />}
          </View>
          
          {lastSyncAt && (
            <Text style={styles.lastSync}>
              Last sync: {lastSyncAt.toLocaleString()}
            </Text>
          )}
          
          <Button
            title="Sync Now"
            variant="outline"
            onPress={handleSync}
            disabled={isSyncing || !isOnline}
            loading={isSyncing}
            style={styles.syncButton}
          />
        </View>

        {/* Profile Form */}
        <View style={styles.form}>
          <Text style={styles.sectionTitle}>Profile Information</Text>
          
          <Input
            label="Bio"
            value={bio}
            onChangeText={setBio}
            placeholder="Tell us about yourself"
            multiline
            numberOfLines={3}
            style={styles.textArea}
          />
          
          <Input
            label="Website"
            value={website}
            onChangeText={setWebsite}
            placeholder="https://your-website.com"
            keyboardType="url"
            autoCapitalize="none"
          />
          
          <Input
            label="Location"
            value={location}
            onChangeText={setLocation}
            placeholder="City, Country"
          />
          
          <Button
            title="Save Changes"
            onPress={handleUpdateProfile}
            loading={isUpdating}
            leftIcon={<Save size={20} color="#ffffff" />}
            style={styles.saveButton}
          />
        </View>

        {/* Settings */}
        <View style={styles.settingsSection}>
          <TouchableOpacity style={styles.settingItem}>
            <Settings size={24} color="#6b7280" />
            <Text style={styles.settingText}>Settings</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.settingItem} onPress={handleSignOut}>
            <LogOut size={24} color="#ef4444" />
            <Text style={[styles.settingText, { color: '#ef4444' }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  
  scrollContent: {
    padding: 24,
  },
  
  header: {
    alignItems: 'center',
    marginBottom: 32,
    backgroundColor: '#ffffff',
    padding: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  avatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#eff6ff',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  
  name: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  
  email: {
    fontSize: 16,
    color: '#6b7280',
  },
  
  syncSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  syncHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  
  syncStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  syncText: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  
  lastSync: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 16,
  },
  
  syncButton: {
    marginTop: 8,
  },
  
  form: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  
  saveButton: {
    marginTop: 8,
  },
  
  settingsSection: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#f3f4f6',
  },
  
  settingText: {
    fontSize: 16,
    color: '#374151',
    marginLeft: 12,
  },
});