import type { ExpoConfig } from '@expo/config';
const config: ExpoConfig = {
  name: 'Tones by Aysa',
  slug: 'healtoneapp',
  owner: 'darkmetaai',
  version: '1.0.1',
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
    package: 'com.aysa.tones',
    versionCode: 2,
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#0a0a0f'
    },
    edgeToEdgeEnabled: true,
    predictiveBackGestureEnabled: false
  },
  web: {
    favicon: './assets/favicon.png'
  },
  plugins: [
    // Expo plugins for audio, notifications, etc.
    // Audio synthesis handled via expo-av with dynamic WAV generation
    'expo-font',
    'expo-asset',
    [
      '@react-native-google-signin/google-signin',
      {
        iosClientId: process.env.GOOGLE_OAUTH_IOS_CLIENT_ID,
        androidClientId: process.env.GOOGLE_OAUTH_ANDROID_CLIENT_ID,
        webClientId: process.env.GOOGLE_OAUTH_WEB_CLIENT_ID,
        iosUrlScheme: 'com.googleusercontent.apps.283475830868-smi0amsgcbnh60b1at30d2e0rvnh4dei'
      }
    ]
    // RevenueCat handled via react-native-purchases package
  ],
  extra: {
    eas: {
      projectId: '9c6bee36-9b16-4148-ab56-ea32b532a68e'
    },
    supabaseUrl: process.env.SUPABASE_URL,
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY,
    stripePublishableKey: process.env.STRIPE_PUBLISHABLE_KEY,
    railwayApiBase: process.env.RAILWAY_API_BASE,
    googleOAuthClientId: process.env.GOOGLE_OAUTH_CLIENT_ID,
    revenueCatApiKey: process.env.REVENUECAT_API_KEY,
  }
};
export default config;