import { createBrowserClient, createServerClient } from '@supabase/ssr';

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function browserClient() {
  return createBrowserClient(URL, ANON);
}

export async function serverClient() {
  const { cookies } = await import('next/headers');
  const store = cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      get(name) { return store.get(name)?.value; },
      set(name, value, opts) { try { store.set({ name, value, ...opts }); } catch { } },
      remove(name, opts) { try { store.set({ name, value: '', ...opts }); } catch { } },
    },
  });
}