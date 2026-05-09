import { createBrowserClient, createServerClient } from '@supabase/ssr';

const SUPABASE_URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function browserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON);
}

export function serverClient() {
  const cookieStore = require('next/headers').cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON, {
    cookies: {
      get(name: string)                          { return cookieStore.get(name)?.value; },
      set(name: string, value: string, opts: any){ try { cookieStore.set({ name, value, ...opts }); } catch {} },
      remove(name: string, opts: any)            { try { cookieStore.set({ name, value: '', ...opts }); } catch {} },
    },
  });
}
