import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Smartphone, Database, Sync, Shield } from 'lucide-react-native';
import { useAuth } from '@/hooks/useAuth';
import { useSync } from '@/hooks/useSync';
import { useSyncStore } from '@/store/sync';

export function HomeScreen() {
  const { user } = useAuth();
  const { isOnline, isSyncing } = useSync();
  const { syncQueue, lastSyncAt } = useSyncStore();

  const features = [
    {
      icon: <Shield size={32} color="#3b82f6" />,
      title: 'Secure Authentication',
      description: 'Protected with industry-standard security',
    },
    {
      icon: <Database size={32} color="#10b981" />,
      title: 'Dual Database',
      description: 'Cloud sync with offline-first local storage',
    },
    {
      icon: <Sync size={32} color="#8b5cf6" />,
      title: 'Auto Sync',
      description: 'Seamless synchronization across devices',
    },
    {
      icon: <Smartphone size={32} color="#f59e0b" />,
      title: 'Cross Platform',
      description: 'Works on mobile and web platforms',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcome}>
            Welcome back, {user?.firstName}!
          </Text>
          <Text style={styles.subtitle}>
            Your modern React Native app is ready
          </Text>
        </View>

        {/* Status Cards */}
        <View style={styles.statusGrid}>
          <View style={[styles.statusCard, styles.onlineCard]}>
            <Text style={styles.statusLabel}>Connection</Text>
            <Text style={[styles.statusValue, { color: isOnline ? '#10b981' : '#ef4444' }]}>
              {isOnline ? 'Online' : 'Offline'}
            </Text>
          </View>
          
          <View style={[styles.statusCard, styles.syncCard]}>
            <Text style={styles.statusLabel}>Sync Status</Text>
            <Text style={[styles.statusValue, { color: isSyncing ? '#f59e0b' : '#6b7280' }]}>
              {isSyncing ? 'Syncing...' : 'Idle'}
            </Text>
          </View>
        </View>

        {/* Sync Info */}
        {lastSyncAt && (
          <View style={styles.syncInfo}>
            <Text style={styles.syncInfoTitle}>Last Sync</Text>
            <Text style={styles.syncInfoTime}>
              {lastSyncAt.toLocaleString()}
            </Text>
          </View>
        )}

        {syncQueue.length > 0 && (
          <View style={styles.syncQueue}>
            <Text style={styles.syncQueueTitle}>Pending Sync</Text>
            <Text style={styles.syncQueueItems}>
              {syncQueue.join(', ')}
            </Text>
          </View>
        )}

        {/* Features */}
        <View style={styles.featuresSection}>
          <Text style={styles.featuresTitle}>App Features</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature, index) => (
              <View key={index} style={styles.featureCard}>
                <View style={styles.featureIcon}>{feature.icon}</View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Tech Stack */}
        <View style={styles.techSection}>
          <Text style={styles.techTitle}>Built With</Text>
          <View style={styles.techList}>
            {[
              'React Native & Expo',
              'TypeScript',
              'Zustand & TanStack Query',
              'Supabase & SQLite',
              'Tamagui & NativeWind',
              'Zod Validation',
            ].map((tech, index) => (
              <View key={index} style={styles.techItem}>
                <View style={styles.techBullet} />
                <Text style={styles.techText}>{tech}</Text>
              </View>
            ))}
          </View>
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
    marginBottom: 32,
  },
  
  welcome: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  
  subtitle: {
    fontSize: 16,
    color: '#6b7280',
    lineHeight: 24,
  },
  
  statusGrid: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 24,
  },
  
  statusCard: {
    flex: 1,
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  statusLabel: {
    fontSize: 14,
    color: '#6b7280',
    marginBottom: 4,
  },
  
  statusValue: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  
  syncInfo: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  syncInfoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  
  syncInfoTime: {
    fontSize: 14,
    color: '#6b7280',
  },
  
  syncQueue: {
    backgroundColor: '#fef3c7',
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#fbbf24',
  },
  
  syncQueueTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#92400e',
    marginBottom: 4,
  },
  
  syncQueueItems: {
    fontSize: 14,
    color: '#b45309',
  },
  
  featuresSection: {
    marginBottom: 32,
  },
  
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  
  featuresGrid: {
    gap: 16,
  },
  
  featureCard: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  featureIcon: {
    marginBottom: 12,
  },
  
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  
  featureDescription: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  
  techSection: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  techTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  
  techList: {
    gap: 12,
  },
  
  techItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  
  techBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#3b82f6',
    marginRight: 12,
  },
  
  techText: {
    fontSize: 14,
    color: '#374151',
  },
});