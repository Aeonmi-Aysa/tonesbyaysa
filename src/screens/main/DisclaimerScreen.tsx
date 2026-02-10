import { ScrollView, StyleSheet, Text, View, Pressable } from 'react-native';

interface DisclaimerScreenProps {
  onClose?: () => void;
}

export function DisclaimerScreen({ onClose }: DisclaimerScreenProps) {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <View style={styles.header}>
        <Text style={styles.emoji}>⚖️</Text>
        <Text style={styles.title}>Disclaimer & Legal</Text>
        <Text style={styles.subtitle}>Important Information About Tones by Aysa</Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🔔 WELLNESS DISCLAIMER</Text>
        <Text style={styles.disclaimerText}>
          Tones by Aysa is a wellness, relaxation, and mindfulness tool designed to provide sound-based experiences for general well-being.
        </Text>
        <Text style={styles.disclaimerTextBold}>
          This app does NOT provide medical advice, diagnosis, or treatment.
        </Text>
        <Text style={styles.disclaimerText}>
          Tones by Aysa is not intended to diagnose, treat, cure, or prevent any disease or medical condition. The frequencies and sound experiences offered are for relaxation and wellness purposes only.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>👨‍⚕️ MEDICAL ADVICE</Text>
        <Text style={styles.disclaimerText}>
          Always consult with a qualified healthcare professional before making any decisions about your health. Do not use Tones by Aysa as a substitute for professional medical advice, diagnosis, or treatment.
        </Text>
        <Text style={styles.disclaimerText}>
          If you have any medical conditions, are pregnant, or have concerns about your health, please consult your physician before using this app.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>🎧 AUDIO SAFETY</Text>
        <Text style={styles.disclaimerText}>
          • Listen at comfortable volume levels to protect your hearing{'\n'}
          • Take regular breaks during extended listening sessions{'\n'}
          • If you experience discomfort, stop listening immediately{'\n'}
          • Do not use while driving or operating machinery{'\n'}
          • Binaural beats require headphones for intended effect
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>⚠️ SPECIAL PRECAUTIONS</Text>
        <Text style={styles.disclaimerText}>
          People with epilepsy, seizure disorders, or those prone to seizures should consult a medical professional before using audio-based wellness tools, particularly those with binaural beats or pulsing tones.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📋 INTENDED USE</Text>
        <Text style={styles.disclaimerText}>
          Tones by Aysa is designed for:{'\n\n'}
          ✓ Relaxation and stress reduction{'\n'}
          ✓ Meditation and mindfulness practice{'\n'}
          ✓ Focus and concentration support{'\n'}
          ✓ Sleep and rest support{'\n'}
          ✓ General wellness exploration{'\n\n'}
          Individual experiences may vary. The effectiveness of frequency-based wellness is a personal experience and results are not guaranteed.
        </Text>
      </View>

      <View style={styles.card}>
        <Text style={styles.cardTitle}>📜 TERMS OF USE</Text>
        <Text style={styles.disclaimerText}>
          By using Tones by Aysa, you acknowledge that you have read and understood this disclaimer. You agree to use this app at your own risk and accept full responsibility for your use of the app.
        </Text>
      </View>

      <View style={styles.footer}>
        <Text style={styles.footerText}>
          © 2024 DarkMeta AI. All rights reserved.
        </Text>
        <Text style={styles.footerText}>
          Questions? Contact support@darkmeta.ai
        </Text>
      </View>

      {onClose && (
        <Pressable style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </Pressable>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#030712',
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    alignItems: 'center',
    marginBottom: 24,
  },
  emoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#f8fafc',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#1e293b',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#a855f7',
    marginBottom: 12,
  },
  disclaimerText: {
    fontSize: 14,
    color: '#cbd5e1',
    lineHeight: 22,
    marginBottom: 12,
  },
  disclaimerTextBold: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fbbf24',
    lineHeight: 22,
    marginBottom: 12,
    textAlign: 'center',
    paddingVertical: 8,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    borderRadius: 8,
  },
  footer: {
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 24,
  },
  footerText: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 4,
  },
  closeButton: {
    backgroundColor: '#a855f7',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 20,
  },
  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
