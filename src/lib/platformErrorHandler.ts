import { Platform, Alert } from 'react-native';
import * as Application from 'expo-application';

/**
 * Platform-specific error handler
 * Handles different error behaviors for iOS, Android, and web
 */
export const platformErrorHandler = {
  /**
   * Handle initialization errors specific to the platform
   */
  handleInitError: (error: Error, context: string) => {
    console.error(`[INIT ERROR - ${context}]`, error.message);

    if (Platform.OS === 'android') {
      // Android: More verbose logging for debugging
      console.error('[ANDROID DEBUG]', {
        message: error.message,
        stack: error.stack,
        context,
        buildVersion: Application.nativeApplicationVersion,
      });
    } else if (Platform.OS === 'ios') {
      // iOS: Simpler logging, often masks slow AsyncStorage
      console.error(`[iOS] ${context}: ${error.message}`);
    }
  },

  /**
   * Handle async storage errors
   * Android is slower and more prone to timeouts
   */
  handleAsyncStorageError: (error: Error) => {
    console.error('[ASYNC STORAGE ERROR]', error.message);

    if (Platform.OS === 'android') {
      console.warn('[ANDROID] AsyncStorage may be slow. Consider using mmkv for better performance.');
    }
  },

  /**
   * Handle auth errors with platform-specific fallbacks
   */
  handleAuthError: (error: Error, fallbackSession?: any) => {
    console.error('[AUTH ERROR]', error.message);

    if (Platform.OS === 'android') {
      // Android: Log detailed auth errors for debugging
      console.error('[ANDROID] Auth context:', {
        error: error.message,
        hasGooglePlay: true, // Detect at runtime if needed
      });
    }

    return fallbackSession || null;
  },

  /**
   * Handle native module errors gracefully
   */
  handleNativeModuleError: (moduleName: string, error: Error) => {
    console.warn(`[NATIVE MODULE] ${moduleName} failed to load: ${error.message}`);

    if (Platform.OS === 'android') {
      // Android-specific handling
      console.warn(`[ANDROID] Native module ${moduleName} may not be included in build`);
    } else if (Platform.OS === 'ios') {
      console.warn(`[iOS] Native module ${moduleName} not available`);
    }
  },

  /**
   * Handle navigation errors
   */
  handleNavigationError: (error: Error) => {
    console.error('[NAVIGATION ERROR]', error.message);

    if (Platform.OS === 'android') {
      // Android: Deep linking errors are more common
      console.error('[ANDROID] Deep linking may have failed:', error.message);
    }
  },

  /**
   * Handle network/connectivity errors with platform hints
   */
  handleNetworkError: (error: Error) => {
    console.error('[NETWORK ERROR]', error.message);

    if (Platform.OS === 'android') {
      console.warn('[ANDROID] Check device network settings and ensure Google Play Services is up to date');
    } else if (Platform.OS === 'ios') {
      console.warn('[iOS] Check device network settings');
    }
  },

  /**
   * Alert user to critical errors with platform-appropriate UI
   */
  alertError: (title: string, message: string, retry?: () => void) => {
    if (Platform.OS === 'web') {
      window.alert(`${title}: ${message}`);
      return;
    }

    const buttons: Array<{ text: string; onPress: () => void }> = [
      {
        text: 'Dismiss',
        onPress: () => {},
      },
    ];

    if (retry) {
      buttons.unshift({
        text: 'Retry',
        onPress: retry,
      });
    }

    Alert.alert(title, message, buttons);
  },
};

/**
 * Detect platform capabilities at runtime
 */
export const platformCapabilities = {
  hasNotifications: Platform.OS !== 'web',
  hasDeepLinking: Platform.OS !== 'web',
  hasAsyncStorage: Platform.OS !== 'web',
  hasGoogleSignIn: Platform.OS === 'android' || Platform.OS === 'ios',
  supportsExpoUpdates: Platform.OS !== 'web',
};
