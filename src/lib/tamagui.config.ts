import { config } from '@tamagui/config/v3';
import { createTamagui } from '@tamagui/core';

const tamaguiConfig = createTamagui({
  ...config,
  themes: {
    ...config.themes,
    // Custom theme overrides
    light: {
      ...config.themes.light,
      background: '#ffffff',
      backgroundHover: '#f8fafc',
      backgroundPress: '#f1f5f9',
      borderColor: '#e2e8f0',
      color: '#0f172a',
      placeholderColor: '#64748b',
    },
    dark: {
      ...config.themes.dark,
      background: '#0f172a',
      backgroundHover: '#1e293b',
      backgroundPress: '#334155',
      borderColor: '#475569',
      color: '#f8fafc',
      placeholderColor: '#94a3b8',
    },
  },
});

export type TamaguiConfig = typeof tamaguiConfig;

declare module '@tamagui/core' {
  interface TamaguiCustomConfig extends TamaguiConfig {}
}

export default tamaguiConfig;