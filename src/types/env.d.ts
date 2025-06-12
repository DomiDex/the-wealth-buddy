declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY: string;
      EXPO_PUBLIC_SUPABASE_URL: string;
      EXPO_PUBLIC_SUPABASE_ANON_KEY: string;
      SUPABASE_SERVICE_ROLE_KEY: string;
    }
  }
}

export {};