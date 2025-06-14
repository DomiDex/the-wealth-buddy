module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        '@tamagui/babel-plugin',
        {
          components: ['@tamagui/core'],
          config: './src/lib/tamagui.config.ts',
        },
      ],
      'nativewind/babel',
      'react-native-reanimated/plugin',
    ],
  };
};