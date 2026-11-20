/**
 * Konfigurasi Klien Supabase untuk Syaé Coffee.
 *
 * Cara menyambungkan ke Supabase:
 * 1. Jalankan: npm install @supabase/supabase-js
 * 2. Isi VITE_SUPABASE_URL dan VITE_SUPABASE_ANON_KEY di file .env
 * 3. Aktifkan kode createClient di bawah ini dan gunakan pada src/services/coffeeService.ts
 */

export const supabaseConfig = {
  url: import.meta.env.VITE_SUPABASE_URL || '',
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || '',
  isConfigured: Boolean(
    import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY
  ),
};

/*
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  supabaseConfig.url,
  supabaseConfig.anonKey
);
*/
