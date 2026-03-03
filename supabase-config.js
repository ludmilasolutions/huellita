// supabase-config.js - Configuración de Supabase
// Reemplaza la configuración de Firebase

console.log("🔄 Inicializando Supabase...");

const SUPABASE_URL = 'https://uiaxftabxrdfkzvyzpzo.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVpYXhmdGFieHJkZmt6dnl6cHpvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI0MDY2NDksImV4cCI6MjA4Nzk4MjY0OX0.Co902fS1LtSXHrXxNWk8PtorrLuRtesh28pBDeBc1b8';

async function initSupabase() {
    try {
        // Usar el cliente de Supabase del SDK
        window.supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
            auth: {
                persistSession: true,
                autoRefreshToken: true,
                detectSessionInUrl: true
            }
        });

        console.log("✅ Cliente Supabase creado");

        const adapter = createFirebaseAdapter(window.supabase);
        
        window.db = adapter.db;
        window.auth = adapter.auth;
        window.googleProvider = 'google';
        
        //模拟 firebase 对象 para compatibilidad
        window.firebase = {
            auth: () => window.auth,
            firestore: () => window.db,
            initializeApp: () => {},
            apps: [],
            FieldValue: FieldValue
        };

        console.log("✅ Adaptador Firebase→Supabase configurado");
        
        return { supabase: window.supabase, db: window.db, auth: window.auth };

    } catch (error) {
        console.error("❌ Error inicializando Supabase:", error);
        return null;
    }
}

async function testSupabaseConnection() {
    try {
        const { data, error } = await window.supabase.from('settings').select('*').limit(1);
        if (error) throw error;
        console.log('✅ Conexión a Supabase exitosa');
        return true;
    } catch (error) {
        console.error('❌ Error conectando a Supabase:', error);
        return false;
    }
}

async function testSupabaseSave() {
    try {
        const { error } = await window.supabase.from('test').insert({
            message: 'Conexión exitosa',
            timestamp: new Date().toISOString()
        });
        
        if (error) throw error;
        console.log('✅ Test de escritura en Supabase exitoso');
        return true;
    } catch (error) {
        console.error('❌ Error en test de Supabase:', error);
        return false;
    }
}

window.initSupabase = initSupabase;
window.testSupabaseConnection = testSupabaseConnection;
window.testSupabaseSave = testSupabaseSave;

console.log("🎯 Supabase configurado - ejecuta initSupabase() cuando quieras conectar");
