import 'react-native-gesture-handler';

import { StatusBar } from 'expo-status-bar';
import { NavigationContainer, DarkTheme, type Theme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ActivityIndicator, Image, StyleSheet, Text, View } from 'react-native';

import { useAuthBootstrap } from '@/hooks/useAuthBootstrap';
import { AppNavigator } from '@/navigation/AppNavigator';

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

export default function App() {
  const { isBootstrapping } = useAuthBootstrap();
  
  console.log('🏠 App rendering, isBootstrapping:', isBootstrapping);

  return (
    <GestureHandlerRootView style={styles.root}>
      <SafeAreaProvider>
        <NavigationContainer theme={navigationTheme}>
          <StatusBar style="light" />
          {isBootstrapping ? (
            <View style={styles.splash}>
              <Image
                source={require('./assets/icon.png')}
                style={styles.logo}
                resizeMode="contain"
                accessible
                accessibilityLabel="HealTone logo"
              />
              <Text style={styles.brand}>HealTone</Text>
              <Text style={styles.tagline}>Frequency Healing</Text>
              <ActivityIndicator size="large" color="#a855f7" style={styles.loader} />
            </View>
          ) : (
            <AppNavigator />
          )}
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
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
