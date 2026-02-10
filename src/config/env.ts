import Constants from 'expo-constants';

export type EnvConfig = {
  supabaseUrl: string;
  supabaseAnonKey: string;
  stripePublishableKey?: string;
  railwayApiBase?: string;
};

// Fallback values for when env vars are missing (should not happen in production)
const FALLBACK_SUPABASE_URL = 'https://qdnijmpcedgrpalnlojp.supabase.co';
const FALLBACK_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFkbmlqbXBjZWRncnBhbG5sb2pwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njg3MTE2NDgsImV4cCI6MjA4NDI4NzY0OH0.3MXwffoZRvDBGLUCBrKSfy0F-O5ZCtMk-tSWyvFMpNo';

function resolveExtra(): EnvConfig {
  const extra = (Constants?.expoConfig?.extra ?? Constants?.manifest?.extra ?? {}) as Record<string, string | undefined>;

  const supabaseUrl = extra.supabaseUrl || FALLBACK_SUPABASE_URL;
  const supabaseAnonKey = extra.supabaseAnonKey || FALLBACK_SUPABASE_ANON_KEY;

  console.log('[ENV DEBUG]', {
    hasExtra: !!extra,
    extraKeys: Object.keys(extra),
    supabaseUrlPresent: !!extra.supabaseUrl,
    supabaseKeyPresent: !!extra.supabaseAnonKey,
    usingFallbacks: !extra.supabaseUrl || !extra.supabaseAnonKey
  });

  if (!supabaseUrl || !supabaseAnonKey) {
    const missingVars = [];
    if (!supabaseUrl) missingVars.push('SUPABASE_URL');
    if (!supabaseAnonKey) missingVars.push('SUPABASE_ANON_KEY');
    const msg = `Supabase env missing: ${missingVars.join(', ')}`;
    console.error('[ENV ERROR]', msg);
    // Use fallbacks instead of throwing
  }

  return {
    supabaseUrl,
    supabaseAnonKey,
    stripePublishableKey: extra.stripePublishableKey,
    railwayApiBase: extra.railwayApiBase
  };
}

export const env = resolveExtra();
