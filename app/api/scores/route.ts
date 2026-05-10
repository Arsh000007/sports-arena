import { NextResponse } from 'next/server';
import { getAllLive } from '@/lib/sportsApi';

export const revalidate = 0;

export async function GET() {
  try {
    const matches = await getAllLive();
    return NextResponse.json({ matches, count: matches.length });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? 'failed' }, { status: 500 });
  }
}
