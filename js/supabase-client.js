// Supabase configuration (use real project values for production)
// IMPORTANT: Do not commit secret keys. For production, use environment variables on the server-side or hosting platform.
let SUPABASE_URL = 'https://kzjtapggtuoshxmbilbb.supabase.co';
let SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt6anRhcGdndHVvc2h4bWJpbGJiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI1MDM2OTgsImV4cCI6MjA4ODA3OTY5OH0.XMpTTa7Hit8cfWNLaw0nki_dhVk6_zJLD2VrBK6rmRo';

// Production-time overrides (host-config)
if (typeof window !== 'undefined' && window.SUPABASE_CONFIG) {
  if (window.SUPABASE_CONFIG.url) SUPABASE_URL = window.SUPABASE_CONFIG.url;
  if (window.SUPABASE_CONFIG.anonKey) SUPABASE_ANON_KEY = window.SUPABASE_CONFIG.anonKey;
}

// Optional dynamic config fetch (production-time)
(function() {
  try {
    if (typeof fetch === 'function') {
      fetch('/config.supabase.json', { cache: 'no-store' })
        .then(res => res.json())
        .then(cfg => {
          if (cfg?.url) SUPABASE_URL = cfg.url;
          if (cfg?.anonKey) SUPABASE_ANON_KEY = cfg.anonKey;
        })
        .catch(() => {});
    }
  } catch (e) {}
})();

function createSupabaseClient() {
    const supabase = window.Supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    return { supabase };
}

function getSupabaseUrl() {
    return SUPABASE_URL;
}

function getSupabaseAnonKey() {
    return SUPABASE_ANON_KEY;
}

window.createSupabaseClient = createSupabaseClient;
window.getSupabaseUrl = getSupabaseUrl;
window.getSupabaseAnonKey = getSupabaseAnonKey;
