import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme, type Theme, LinkingOptions } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';
import { useEffect } from 'react';

import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import { useStoreHydration } from '@/hooks/useStoreHydration';
import { AppNavigator, RootStackParamList } from '@/navigation/AppNavigator';
import { ErrorBoundary } from '@/providers/ErrorBoundary';
import { initializeRevenueCat } from '@/lib/revenueCatSetup';

const navigationTheme: Theme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: '#a855f7',
    background: '#030712',
    card: '#0f172a',
    border: '#1f2937',
    text: '#f8fafc'
  }
};

const linking: LinkingOptions<RootStackParamList> = {
  prefixes: ['healtone://', 'https://healtone.app', 'https://*.healtone.app'],
  config: {
    screens: {
      Auth: 'auth',
      Main: {
        screens: {
          Dashboard: 'dashboard',
          Composer: 'composer',
          Manifest: 'manifest',
          Favorites: 'favorites',
          Profile: 'profile',
          Admin: 'admin',
        },
      },
    },
  },
};

// Set to true to test payments without Google Play Developer account
const PAYMENT_TESTING_MODE = true;

export default function App() {
  const { isBootstrapping } = useAuthBootstrap();
  const { isHydrated } = useStoreHydration();
  
  console.log('🏠 App rendering, isBootstrapping:', isBootstrapping, 'isHydrated:', isHydrated);
  if (PAYMENT_TESTING_MODE) {
    console.log('⚠️  PAYMENT TESTING MODE ENABLED - Using mock purchases');
  }

  // Initialize RevenueCat on app start
  useEffect(() => {
    initializeRevenueCat({
      apiKey: process.env.REVENUECAT_API_KEY,
      observerMode: false,
      networkTimeout: 5000,
    });
  }, []);

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <NavigationContainer theme={navigationTheme} linking={linking} fallback={
            <View style={styles.splash}>
              <Image
                source={require('./assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
                accessible
                accessibilityLabel="Tones by Aysa logo"
              />
              <Text style={styles.brand}>Tones by Aysa</Text>
              <Text style={styles.tagline}>Frequency Wellness</Text>
              <ActivityIndicator size="large" color="#a855f7" style={styles.loader} />
            </View>
          }>
            <StatusBar style="light" />
            {isBootstrapping || !isHydrated ? (
              <View style={styles.splash}>
                <Image
                  source={require('./assets/icon.png')}
                  style={styles.logo}
                  resizeMode="contain"
                  accessible
                  accessibilityLabel="Tones by Aysa logo"
                />
                <Text style={styles.brand}>Tones by Aysa</Text>
                <Text style={styles.tagline}>Frequency Wellness</Text>
                <ActivityIndicator size="large" color="#a855f7" style={styles.loader} />
              </View>
            ) : (
              <AppNavigator />
            )}
          </NavigationContainer>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#030712'
  },
  splash: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
    backgroundColor: '#030712'
  },
  logo: {
    width: 220,
    height: 220,
    marginBottom: 24
  },
  brand: {
    fontSize: 32,
    fontWeight: '700',
    color: '#ffffff',
    letterSpacing: 0.8
  },
  tagline: {
    marginTop: 8,
    fontSize: 15,
    letterSpacing: 2,
    color: '#c3b3ff',
    textTransform: 'uppercase'
  },
  loader: {
    marginTop: 32
  }
});
