// POST /api/auth/signout — used by the header sign-out button.
import { NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase';

export async function POST() {
  const supabase = serverClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL('/', process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'));
}
