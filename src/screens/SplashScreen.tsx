import { ActivityIndicator, View, StyleSheet, Text } from 'react-native';

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="white" />
      <Text style={styles.text}>Preparing your HealTone experience...</Text>
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
  }
});
