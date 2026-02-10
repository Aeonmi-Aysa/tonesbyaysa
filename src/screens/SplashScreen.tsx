import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="white" />
      <Text style={styles.text}>Preparing your Tones by Aysa experience...</Text>
      <Text style={styles.disclaimer}>
        Wellness & Relaxation Tool{'\n'}Not intended for medical use
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0f172a',
    paddingHorizontal: 24
  },
  text: {
    marginTop: 24,
    color: '#94a3b8',
    textAlign: 'center',
    fontSize: 16
  },
  disclaimer: {
    position: 'absolute',
    bottom: 40,
    color: '#64748b',
    textAlign: 'center',
    fontSize: 12,
    lineHeight: 18
  }
});
