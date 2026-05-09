// GET /api/scores  →  { matches: Match[] }
// Optional client-callable mirror of getAllLive(); useful for client polling.

import { NextResponse } from 'next/server';
import { getAllLive } from '@/lib/sportsApi';

export const revalidate = 30;

export async function GET() {
  try {
    const matches = await getAllLive();
    return NextResponse.json({ matches });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'failed' }, { status: 500 });
  }
}
