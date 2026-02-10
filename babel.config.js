module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['.'],
          alias: {
            '@': './src'
          }
        }
      ],
      'react-native-reanimated/plugin'
    ],
    // Enable detailed error messages and stack traces
    overrides: [
      {
        test: ['./src'],
        compact: false,
        sourceType: 'unambiguous'
      }
    ]
  };
};
