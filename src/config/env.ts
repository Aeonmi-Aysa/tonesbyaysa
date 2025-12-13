import Constants from 'expo-constants';

export type EnvConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  stripePublishableKey?: string;
  railwayApiBase?: string;
};

function resolveExtra(): EnvConfig {
  const extra = (Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? {}) as Record<string, string | undefined>;

  const supabaseUrl = extra.supabaseUrl;
  const supabaseAnonKey = extra.supabaseAnonKey;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Supabase environment variables are missing. Add SUPABASE_URL and SUPABASE_ANON_KEY to your .env file.');
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    stripePublishableKey: extra.stripePublishableKey,
    railwayApiBase: extra.railwayApiBase
  };
}

export const env = resolveExtra();
