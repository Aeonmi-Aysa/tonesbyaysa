import React, { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  Pressable,
  Alert,
  ActivityIndicator,
  ImageBackground,
  Animated,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSessionStore, type SessionState } from '@/store/useSessionStore';
import { useTheme } from '@/store/useThemeStore';
import { checkSubscriptionStatus as checkStripeSubscription } from '@/lib/stripeSetup';
import { handlePurchase } from '@/lib/paymentToggle';
import { supabase } from '@/lib/supabaseClient';

interface PricingTier {
  id: string;
  name: string;
  price: string;
  period: string;
  features: string[];
  badge?: string;
  isPrimary?: boolean;
  locked?: boolean;
  accentColor?: string;
}

const PRICING_TIERS: PricingTier[] = [
  {
    id: 'weekly',
    name: 'Weekly + 7-Day Trial',
    price: '$4.99',
    period: 'per week (7 days free)',
    features: ['500+ healing frequencies', 'All frequency baths', 'Frequency journal', 'Session reminders', 'Community presets', 'Full analytics'],
    badge: '🎁 Try Free (7 Days)',
    isPrimary: true,
    accentColor: '#06b6d4', // Cyan
  },
  {
    id: 'lifetime',
    name: 'Lifetime',
    price: '$69.99',
    period: 'one-time',
    features: ['Everything forever', 'No renewal needed', 'All future features', 'Priority support', 'Lifetime updates'],
    badge: '⭐ Best Value',
    isPrimary: false,
    accentColor: '#fbbf24', // Amber
  },
];

export function PricingScreen({ onDismiss }: { onDismiss?: () => void }) {
  const profile = useSessionStore((state: SessionState) => state.profile);
  const setProfile = useSessionStore((state: SessionState) => state.setProfile);
  const { colors, isDark } = useTheme();

  const [loading, setLoading] = useState(false);
  const [currentTier, setCurrentTier] = useState(profile?.subscription_tier || 'free');
  const [pulseAnim] = useState(new Animated.Value(1));

  // Pulsing animation for primary CTA
  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.02,
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [pulseAnim]);

  // Check current subscription status on mount
  useEffect(() => {
    loadSubscriptionStatus();
  }, []);

  const loadSubscriptionStatus = async () => {
    try {
      const session = await supabase.auth.getSession();
      if (!session?.data?.session?.user?.id) {
        setCurrentTier('free');
        return;
      }

      const status = await checkStripeSubscription(session.data.session.user.id);
      setCurrentTier(status.tier);
    } catch (error) {
      console.log('[PricingScreen] Error checking subscription:', error);
      setCurrentTier('free');
    }
  };

  const handlePurchasePress = async (tier: PricingTier) => {
    if (tier.locked || currentTier === tier.id) {
      return;
    }

    setLoading(true);
    try {
      console.log('[PricingScreen] Starting purchase for:', tier.name);

      const session = await supabase.auth.getSession();
      if (!session?.data?.session?.user?.id || !session?.data?.session?.user?.email) {
        Alert.alert('Error', 'Please log in to make a purchase');
        setLoading(false);
        return;
      }

      const userId = session.data.session.user.id;
      const email = session.data.session.user.email;

      // Use payment toggle - automatically routes to Stripe or RevenueCat
      const result = await handlePurchase(tier.id, userId, email);

      if (!result.success) {
        Alert.alert('Purchase Error', result.message);
        setLoading(false);
        return;
      }

      // Update local state and Supabase
      const newTier = tier.id as 'weekly' | 'lifetime';
      if (profile) {
        setProfile({ ...profile, subscription_tier: newTier } as typeof profile);
      }

      // Sync to Supabase
      try {
        await supabase
          .from('profiles')
          .update({
            subscription_tier: newTier,
            subscription_status: 'active',
          })
          .eq('id', userId);

        console.log('[PricingScreen] ✅ Subscription synced to Supabase');
      } catch (error) {
        console.error('[PricingScreen] Failed to sync to Supabase:', error);
      }

      setCurrentTier(newTier);

      Alert.alert('Success! 🎉', `Welcome to ${tier.name}! Enjoy all the frequencies.`, [
        { text: 'OK', onPress: onDismiss },
      ]);
    } catch (error: any) {
      console.error('[PricingScreen] Purchase error:', error);
      if (!error?.message?.includes('cancelled')) {
        Alert.alert('Purchase Error', error?.message || 'Something went wrong during purchase');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setLoading(true);
    try {
      const session = await supabase.auth.getSession();
      if (!session?.data?.session?.user?.id) {
        Alert.alert('Error', 'Please log in to restore purchases');
        setLoading(false);
        return;
      }

      // Reload subscription status from Supabase
      await loadSubscriptionStatus();
      Alert.alert('Success', 'Purchases restored!');
    } catch (error) {
      console.error('[PricingScreen] Restore failed:', error);
      Alert.alert('Error', 'Failed to restore purchases');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>✨ Start Your 7-Day Trial</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>Full access to all frequencies (payment info required)</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Value Proposition */}
        <View style={[styles.valueStack, { backgroundColor: isDark ? '#1e1b4b' : '#f0f4ff', borderColor: colors.primary }]}>
          <Text style={[styles.valueTitle, { color: colors.text }]}>What You Get:</Text>
          <View style={styles.valueList}>
            <Text style={[styles.valueItem, { color: colors.text }]}>✨ 500+ healing frequencies</Text>
            <Text style={[styles.valueItem, { color: colors.text }]}>🌊 All frequency baths</Text>
            <Text style={[styles.valueItem, { color: colors.text }]}>📊 Frequency journal & analytics</Text>
            <Text style={[styles.valueItem, { color: colors.text }]}>🔔 Session reminders</Text>
            <Text style={[styles.valueItem, { color: colors.text }]}>👥 Community presets</Text>
          </View>
        </View>

        {/* Pricing Tiers */}
        {PRICING_TIERS.map((tier) => (
          <View key={tier.id} style={styles.tierContainer}>
            {tier.badge && (
              <View
                style={[
                  styles.badge,
                  { backgroundColor: tier.accentColor || colors.primary },
                ]}
              >
                <Text style={styles.badgeText}>{tier.badge}</Text>
              </View>
            )}

            <View
              style={[
                styles.tierCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: tier.accentColor || colors.border,
                  borderWidth: 2,
                  shadowColor: tier.accentColor || colors.primary,
                  shadowOpacity: 0.2,
                  shadowRadius: 8,
                  elevation: 4,
                },
              ]}
            >
              <Text style={[styles.tierName, { color: colors.text }]}>{tier.name}</Text>
              <Text style={[styles.tierPrice, { color: tier.accentColor || colors.primary }]}>{tier.price}</Text>
              <Text style={[styles.tierPeriod, { color: colors.textSecondary }]}>{tier.period}</Text>

              {/* Features List */}
              <View style={styles.featuresList}>
                {tier.features.map((feature, idx) => (
                  <Text key={idx} style={[styles.feature, { color: colors.text }]}>
                    ✓ {feature}
                  </Text>
                ))}
              </View>

              {/* CTA Button */}
              <Animated.View
                style={[
                  styles.ctaContainer,
                  tier.isPrimary && { transform: [{ scale: pulseAnim }] },
                ]}
              >
                <Pressable
                  style={[
                    styles.ctaButton,
                    {
                      backgroundColor: tier.accentColor || colors.primary,
                    },
                  ]}
                  onPress={() => handlePurchasePress(tier)}
                  disabled={loading || (currentTier !== 'free' && currentTier === tier.id)}
                >
                  {loading && tier.isPrimary ? (
                    <ActivityIndicator color="white" />
                  ) : currentTier === tier.id ? (
                    <Text style={styles.ctaButtonText}>✓ Current Plan</Text>
                  ) : tier.locked ? (
                    <Text style={styles.ctaButtonText}>Your Current Plan</Text>
                  ) : (
                    <Text style={styles.ctaButtonText}>
                      {tier.id === 'lifetime' ? 'Get Lifetime' : 'Start 7-Day Trial'}
                    </Text>
                  )}
                </Pressable>
              </Animated.View>
            </View>
          </View>
        ))}

        {/* Trust Signals */}
        <View style={[styles.trustSignals, { backgroundColor: isDark ? '#1e293b' : '#f1f5f9' }]}>
          <Text style={[styles.trustText, { color: colors.textSecondary }]}>
            ✓ Secure payments via Stripe
          </Text>
          <Text style={[styles.trustText, { color: colors.textSecondary }]}>
            ✓ Cancel anytime • No hidden charges
          </Text>
          <Text style={[styles.trustText, { color: colors.textSecondary }]}>
            ✓ 30-day money-back guarantee
          </Text>
        </View>

        {/* Restore Purchases Button */}
        <Pressable
          style={[styles.restoreButton, { borderColor: colors.primary }]}
          onPress={handleRestorePurchases}
          disabled={loading}
        >
          <Text style={[styles.restoreButtonText, { color: colors.primary }]}>
            🔄 Restore Purchases
          </Text>
        </Pressable>

        {/* Dismiss Button */}
        {onDismiss && (
          <Pressable
            style={[styles.dismissButton, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}
            onPress={onDismiss}
          >
            <Text style={[styles.dismissButtonText, { color: colors.text }]}>← Continue with Free</Text>
          </Pressable>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 24,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  valueStack: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
  },
  valueTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  valueList: {
    gap: 8,
  },
  valueItem: {
    fontSize: 14,
    lineHeight: 22,
  },
  tierContainer: {
    marginBottom: 16,
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -10,
    right: 20,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    zIndex: 10,
  },
  badgeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '700',
  },
  tierCard: {
    borderRadius: 16,
    padding: 20,
    marginTop: 4,
  },
  tierName: {
    fontSize: 24,
    fontWeight: '800',
    marginBottom: 8,
  },
  tierPrice: {
    fontSize: 32,
    fontWeight: '800',
  },
  tierPeriod: {
    fontSize: 14,
    marginBottom: 16,
  },
  featuresList: {
    gap: 10,
    marginVertical: 16,
  },
  feature: {
    fontSize: 14,
    lineHeight: 20,
  },
  ctaContainer: {
    marginTop: 16,
  },
  ctaButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
  trustSignals: {
    borderRadius: 12,
    padding: 16,
    marginVertical: 24,
    alignItems: 'center',
    gap: 8,
  },
  trustText: {
    fontSize: 13,
    lineHeight: 20,
  },
  restoreButton: {
    borderWidth: 2,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  restoreButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
  dismissButton: {
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
  },
  dismissButtonText: {
    fontSize: 14,
    fontWeight: '600',
  },
});
