import { NextRequest, NextResponse } from 'next/server';
import { serverClient } from '@/lib/supabase';

export async function GET() {
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { data, error } = await supabase
    .from('followed_teams')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ teams: data });
}

export async function POST(req: NextRequest) {
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const body = await req.json();
  const { sport, team_id, team_name } = body ?? {};
  if (!sport || !team_id || !team_name) {
    return NextResponse.json({ error: 'sport, team_id, team_name required' }, { status: 400 });
  }

  const { error } = await supabase.from('followed_teams').upsert({
    user_id: user.id, sport, team_id, team_name,
  });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest) {
  const supabase = await serverClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const { sport, team_id } = await req.json();
  const { error } = await supabase
    .from('followed_teams')
    .delete()
    .eq('user_id', user.id)
    .eq('sport', sport)
    .eq('team_id', team_id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
