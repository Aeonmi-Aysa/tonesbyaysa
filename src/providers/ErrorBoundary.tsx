import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Platform } from 'react-native';

interface Props {
  children: React.ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: { componentStack: string } | null;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };

    // Defer error boundary setup to allow native context initialization
    setImmediate(() => {
      console.log('✅ ErrorBoundary initialized');
    });
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: { componentStack: string }) {
    console.error('🔴 ErrorBoundary caught error:', error);
    console.error('📍 Component stack:', errorInfo.componentStack);

    this.setState({
      error,
      errorInfo
    });
  }

  handleRestart = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };

  handleReload = async () => {
    try {
      if (Platform.OS === 'web') {
        (window as any).location.reload();
      } else {
        // For native, trigger a reload via Expo
        // This works with expo-dev-client; for production use expo-updates
        if (typeof require !== 'undefined') {
          try {
            const Updates = require('expo-updates');
            await Updates.reloadAsync();
          } catch (e) {
            // expo-updates not available; fallback to console message
            console.warn('Unable to reload app. Please restart the app manually.');
          }
        }
      }
    } catch (e) {
      console.error('Failed to reload:', e);
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <ScrollView contentContainerStyle={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>⚠️</Text>
            </View>

            <Text style={styles.title}>Something Went Wrong</Text>

            <Text style={styles.subtitle}>
              We've encountered an error. Don't worry—this has been logged and our team will investigate.
            </Text>

            {this.state.error && (
              <View style={styles.errorBox}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorMessage}>{this.state.error.toString()}</Text>

                {this.state.errorInfo && (
                  <>
                    <Text style={styles.stackTitle}>Component Stack:</Text>
                    <Text style={styles.stackTrace}>{this.state.errorInfo.componentStack}</Text>
                  </>
                )}
              </View>
            )}

            <Text style={styles.suggestion}>
              Try refreshing the app. If the problem persists, please contact support at support@tonesbyaysa.com
            </Text>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.button, styles.restartButton]}
              onPress={this.handleRestart}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Try Again</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, styles.reloadButton]}
              onPress={this.handleReload}
              activeOpacity={0.7}
            >
              <Text style={styles.buttonText}>Reload App</Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
    justifyContent: 'space-between'
  },
  content: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingVertical: 40,
    justifyContent: 'center'
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 24
  },
  icon: {
    fontSize: 64,
    marginBottom: 16
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: 12
  },
  subtitle: {
    fontSize: 15,
    color: '#a1a5b1',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24
  },
  errorBox: {
    backgroundColor: '#1a1d2e',
    borderRadius: 8,
    padding: 16,
    marginVertical: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444'
  },
  errorTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#ef4444',
    marginBottom: 8
  },
  errorMessage: {
    fontSize: 12,
    color: '#e5e7eb',
    lineHeight: 18,
    marginBottom: 12,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  stackTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#fbbf24',
    marginTop: 12,
    marginBottom: 8
  },
  stackTrace: {
    fontSize: 11,
    color: '#d1d5db',
    lineHeight: 16,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace'
  },
  suggestion: {
    fontSize: 13,
    color: '#a1a5b1',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 16,
    fontStyle: 'italic'
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1f2937'
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center'
  },
  restartButton: {
    backgroundColor: '#a855f7'
  },
  reloadButton: {
    backgroundColor: '#1f2937'
  },
  buttonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#ffffff'
  }
});
