import type { Match } from './types';

const KEY = process.env.API_SPORTS_KEY ?? '';
const CACHE_TTL_MS = 30_000;

type Cached = { at: number; data: unknown };
const cache = new Map<string, Cached>();

async function get(host: string, path: string, params: Record<string, string | number> = {}) {
  const qs = new URLSearchParams(
    Object.entries(params).map(([k, v]) => [k, String(v)])
  ).toString();
  const url = `https://${host}/${path}${qs ? `?${qs}` : ''}`;

  const hit = cache.get(url);
  if (hit && Date.now() - hit.at < CACHE_TTL_MS) return hit.data;

  const res = await fetch(url, {
    headers: { 'x-apisports-key': KEY },
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`API-Sports ${res.status}: ${await res.text().catch(() => '')}`);
  }
  const data = await res.json();
  cache.set(url, { at: Date.now(), data });
  return data;
}

function toDate(d: Date) {
  return d.toISOString().split('T')[0];
}

async function getFootballByDate(date: string): Promise<Match[]> {
  const data: any = await get('v3.football.api-sports.io', 'fixtures', { date, timezone: 'UTC' });
  return (data.response ?? []).map((f: any) => ({
    id: `football:${f.fixture.id}`,
    sport: 'football' as const,
    competition: f.league.name,
    round: f.league.round,
    status: f.fixture.status.short === '1H' || f.fixture.status.short === '2H' || f.fixture.status.short === 'HT' ? 'LIVE' : f.fixture.status.short === 'FT' ? 'FT' : 'NS',
    minute: f.fixture.status.elapsed ? `${f.fixture.status.elapsed}'` : undefined,
    kickoffISO: f.fixture.date,
    venue: f.fixture.venue?.name,
    home: {
      id: f.teams.home.id,
      code: (f.teams.home.name ?? '').slice(0, 3).toUpperCase(),
      name: f.teams.home.name,
      logoUrl: f.teams.home.logo,
      score: f.goals.home ?? 0,
    },
    away: {
      id: f.teams.away.id,
      code: (f.teams.away.name ?? '').slice(0, 3).toUpperCase(),
      name: f.teams.away.name,
      logoUrl: f.teams.away.logo,
      score: f.goals.away ?? 0,
    },
  }));
}

export async function getFootballFixture(fixtureId: number): Promise<Match | null> {
  const data: any = await get('v3.football.api-sports.io', 'fixtures', { id: fixtureId });
  const f = data.response?.[0];
  if (!f) return null;
  return {
    id: `football:${f.fixture.id}`,
    sport: 'football',
    competition: f.league.name,
    round: f.league.round,
    status: f.fixture.status.short,
    minute: f.fixture.status.elapsed ? `${f.fixture.status.elapsed}'` : undefined,
    kickoffISO: f.fixture.date,
    venue: f.fixture.venue?.name,
    home: {
      id: f.teams.home.id,
      code: (f.teams.home.name ?? '').slice(0, 3).toUpperCase(),
      name: f.teams.home.name,
      logoUrl: f.teams.home.logo,
      score: f.goals.home ?? 0,
    },
    away: {
      id: f.teams.away.id,
      code: (f.teams.away.name ?? '').slice(0, 3).toUpperCase(),
      name: f.teams.away.name,
      logoUrl: f.teams.away.logo,
      score: f.goals.away ?? 0,
    },
  };
}

export async function getAllLive(): Promise<Match[]> {
  const today = toDate(new Date());
  const yesterday = toDate(new Date(Date.now() - 86400000));
  const tomorrow = toDate(new Date(Date.now() + 86400000));

  const [yd, td, tm] = await Promise.allSettled([
    getFootballByDate(yesterday),
    getFootballByDate(today),
    getFootballByDate(tomorrow),
  ]);

  const out: Match[] = [];
  if (yd.status === 'fulfilled') out.push(...yd.value);
  if (td.status === 'fulfilled') out.push(...td.value);
  if (tm.status === 'fulfilled') out.push(...tm.value);
  return out;
}
