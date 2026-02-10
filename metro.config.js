// Metro configuration for HealTone app
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require('@expo/metro-config');

/** @type {import('metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable source maps and better error reporting
config.transformer = {
  ...config.transformer,
  minifierPath: 'metro-minify-terser',
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    compress: {
      drop_debugger: false,
    },
  },
};

module.exports = config;
