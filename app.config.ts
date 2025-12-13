import 'dotenv/config';
import type { ExpoConfig } from '@expo/config';

const config: ExpoConfig = {
  name: 'HealTone',
  slug: 'healtoneapp',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  // Dark-only experience to match brand and in-app styling
  userInterfaceStyle: 'dark',
  newArchEnabled: true,
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff'
  },
  ios: {
    supportsTablet: true
  },
  android: {
    package: 'com.darkmetaai.healtoneapp.dev',
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff'
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    // Enable background audio and foreground service tuning via Audio API Expo plugin
    'react-native-audio-api'
  ],
  extra: {
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    railwayApiBase: process.env.RAILWAY_API_BASE
  }
};

export default config;
