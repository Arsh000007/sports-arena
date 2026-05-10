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
  if (!res.ok) throw new Error(`API-Sports ${res.status}`);
  const data = await res.json();
  cache.set(url, { at: Date.now(), data });
  return data;
}

function toDate(d: Date) {
  return d.toISOString().split('T')[0];
}

const COUNTRY_FLAGS: Record<string, string> = {
  'England': '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'Spain': '🇪🇸', 'Germany': '🇩🇪', 'Italy': '🇮🇹',
  'France': '🇫🇷', 'Portugal': '🇵🇹', 'Netherlands': '🇳🇱', 'Brazil': '🇧🇷',
  'Argentina': '🇦🇷', 'USA': '🇺🇸', 'Mexico': '🇲🇽', 'Australia': '🇦🇺',
  'Japan': '🇯🇵', 'South Korea': '🇰🇷', 'Turkey': '🇹🇷', 'Belgium': '🇧🇪',
  'Scotland': '🏴󠁧󠁢󠁳󠁣󠁴󠁿', 'Wales': '🏴󠁧󠁢󠁷󠁬󠁳󠁿', 'Saudi Arabia': '🇸🇦',
  'UAE': '🇦🇪', 'India': '🇮🇳', 'China': '🇨🇳', 'Colombia': '🇨🇴',
  'Chile': '🇨🇱', 'Uruguay': '🇺🇾', 'Greece': '🇬🇷', 'Poland': '🇵🇱',
  'Russia': '🇷🇺', 'Ukraine': '🇺🇦', 'Croatia': '🇭🇷', 'Serbia': '🇷🇸',
  'Romania': '🇷🇴', 'Czech Republic': '🇨🇿', 'Sweden': '🇸🇪', 'Norway': '🇳🇴',
  'Denmark': '🇩🇰', 'Switzerland': '🇨🇭', 'Austria': '🇦🇹', 'Ecuador': '🇪🇨',
  'Peru': '🇵🇪', 'Bolivia': '🇧🇴', 'Paraguay': '🇵🇾', 'Venezuela': '🇻🇪',
  'World': '🌍', 'Pakistan': '🇵🇰', 'Sri Lanka': '🇱🇰', 'Bangladesh': '🇧🇩',
  'New Zealand': '🇳🇿', 'West Indies': '🏝️', 'Afghanistan': '🇦🇫',
  'Zimbabwe': '🇿🇼', 'Ireland': '🇮🇪', 'Kenya': '🇰🇪',
};

export function getFlag(country?: string): string {
  if (!country) return '';
  return COUNTRY_FLAGS[country] ?? '🏳️';
}

async function getFootballByDate(date: string): Promise<Match[]> {
  const data: any = await get('v3.football.api-sports.io', 'fixtures', { date, timezone: 'UTC' });
  return (data.response ?? []).map((f: any) => ({
    id: `football:${f.fixture.id}`,
    sport: 'football' as const,
    competition: f.league.name,
    country: f.league.country,
    round: f.league.round,
    status: ['1H','2H','HT','ET','P'].includes(f.fixture.status.short) ? 'LIVE' :
            f.fixture.status.short === 'FT' ? 'FT' : 'NS',
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

async function getCricketMatches(): Promise<Match[]> {
  const cricketKey = process.env.CRICKET_API_KEY ?? '';
  if (!cricketKey) return [];
  try {
    const res = await fetch(
      `https://api.cricapi.com/v1/currentMatches?apikey=${cricketKey}&offset=0`,
      { next: { revalidate: 30 } }
    );
    const data = await res.json();
    if (!data.data) return [];
    return data.data.map((m: any) => ({
      id: `cricket:${m.id}`,
      sport: 'football' as const,
      competition: m.name ?? 'Cricket',
      country: 'World',
      status: m.matchStarted && !m.matchEnded ? 'LIVE' : m.matchEnded ? 'FT' : 'NS',
      kickoffISO: m.dateTimeGMT ?? new Date().toISOString(),
      venue: m.venue,
      home: {
        id: 0,
        code: (m.teams?.[0] ?? '???').slice(0, 3).toUpperCase(),
        name: m.teams?.[0] ?? 'TBD',
        logoUrl: undefined,
        score: m.score?.find((s: any) => s.inning?.startsWith(m.teams?.[0]))?.r?.toString() ?? '—',
      },
      away: {
        id: 1,
        code: (m.teams?.[1] ?? '???').slice(0, 3).toUpperCase(),
        name: m.teams?.[1] ?? 'TBD',
        logoUrl: undefined,
        score: m.score?.find((s: any) => s.inning?.startsWith(m.teams?.[1]))?.r?.toString() ?? '—',
      },
    }));
  } catch {
    return [];
  }
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

  const [yd, td, tm, cricket] = await Promise.allSettled([
    getFootballByDate(yesterday),
    getFootballByDate(today),
    getFootballByDate(tomorrow),
    getCricketMatches(),
  ]);

  const out: Match[] = [];
  if (yd.status === 'fulfilled') out.push(...yd.value);
  if (td.status === 'fulfilled') out.push(...td.value);
  if (tm.status === 'fulfilled') out.push(...tm.value);
  if (cricket.status === 'fulfilled') out.push(...cricket.value);
  return out;
}
