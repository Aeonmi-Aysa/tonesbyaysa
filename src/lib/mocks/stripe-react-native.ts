/**
 * Mock Stripe Module
 * 
 * This is a temporary mock that allows the app to compile while npm auth issues are resolved.
 * Replace with real @stripe/react-native package once npm is fixed.
 * 
 * Real package: npm install @stripe/react-native
 */

export async function initStripe({ publishableKey, merchantIdentifier }: any) {
  console.log('[MockStripe] Initializing with key:', publishableKey?.substring(0, 15) + '...');
  return { success: true };
}

export function useStripe() {
  console.log('[MockStripe] useStripe hook called');
  return {
    createPaymentMethod: async (params: any) => {
      console.log('[MockStripe] createPaymentMethod:', params);
      return { paymentMethod: { id: 'pm_mock_123' } };
    },
  };
}

export function usePaymentSheet() {
  console.log('[MockStripe] usePaymentSheet hook called');
  return {
    presentPaymentSheet: async () => {
      console.log('[MockStripe] presentPaymentSheet called');
      return { paymentOption: { id: 'mock_payment' } };
    },
  };
}

export const PlatformPay = {
  isAvailable: async () => false,
  present: async () => ({ success: false }),
};

export default {
  initStripe,
  useStripe,
  usePaymentSheet,
  PlatformPay,
};
