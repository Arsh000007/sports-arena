// Supabase client helpers.
//
// We export TWO clients:
//   - browserClient(): for use in client components ("use client")
//   - serverClient():  for use in server components and API routes
//
// They share the same project URL + anon key but read cookies
// differently. Auth state is stored in cookies so the server
// knows who's logged in.

import { createBrowserClient, createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const URL  = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export function browserClient() {
  return createBrowserClient(URL, ANON);
}

export function serverClient() {
  const store = cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      get(name)               { return store.get(name)?.value; },
      set(name, value, opts)  { try { store.set({ name, value, ...opts }); } catch {} },
      remove(name, opts)      { try { store.set({ name, value: '', ...opts }); } catch {} },
    },
  });
}
