import { cookies } from 'next/headers';
import { createServerClient } from '@supabase/ssr';
import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function getServerSupabase() {
  const cookieStore = cookies();
  return createServerClient(url, anon, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(items) { items.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); },
    },
  });
}

export function getServiceSupabase() {
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
}
