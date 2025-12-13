// Metro configuration that applies Expo defaults before wrapping the Audio API helper.
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { getDefaultConfig } = require('@expo/metro-config');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { wrapWithAudioAPIMetroConfig } = require('react-native-audio-api/metro-config');

/** @type {import('metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

module.exports = wrapWithAudioAPIMetroConfig(config);
