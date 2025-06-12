import React from 'react';
import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TamaguiProvider } from '@tamagui/core';
import { ErrorBoundary } from '@/components/ui/ErrorBoundary';
import { AuthGuard } from '@/components/auth/AuthGuard';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import tamaguiConfig from '@/lib/tamagui.config';
import '@/styles/global.css';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ErrorBoundary>
      <TamaguiProvider config={tamaguiConfig}>
        <QueryClientProvider client={queryClient}>
          <AuthGuard>
            <Stack screenOptions={{ headerShown: false }}>
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="+not-found" />
            </Stack>
            <StatusBar style="auto" />
          </AuthGuard>
        </QueryClientProvider>
      </TamaguiProvider>
    </ErrorBoundary>
  );
}