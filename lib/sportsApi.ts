// Wrapper around the API-Sports endpoints we use.
//
// API-Sports has separate hosts per sport:
//   football → v3.football.api-sports.io
//   cricket  → v1.cricket.api-sports.io
//
// All calls are server-side (this file is only imported from
// /app/api routes) so the API key never reaches the browser.
//
// We also do simple in-memory caching: if the same URL was
// fetched within CACHE_TTL_MS, return the cached response.
// In production, replace this with Redis / Vercel KV.

import type { Match } from './types';

const KEY = process.env.API_SPORTS_KEY!;
const CACHE_TTL_MS = 30_000; // 30 seconds — tune as your plan allows

type Cached = { at: number; data: any };
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
    // Next.js caches by default — we want fresh-ish:
    next: { revalidate: 30 },
  });
  if (!res.ok) {
    throw new Error(`API-Sports ${res.status}: ${await res.text().catch(() => '')}`);
  }
  const data = await res.json();
  cache.set(url, { at: Date.now(), data });
  return data;
}

// ============== FOOTBALL ==============

export async function getLiveFootball(): Promise<Match[]> {
  const data = await get('v3.football.api-sports.io', 'fixtures', { live: 'all' });
  const fixtures = data.response ?? [];
  return fixtures.map((f: any): Match => ({
    id: `football:${f.fixture.id}`,
    sport: 'football',
    competition: f.league?.name ?? 'Football',
    round: f.league?.round,
    status: f.fixture.status?.short === 'FT' ? 'FINAL' : 'LIVE',
    minute: f.fixture.status?.elapsed ? `${f.fixture.status.elapsed}'` : undefined,
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
  const data = await get('v3.football.api-sports.io', 'fixtures', { id: fixtureId });
  const f = data.response?.[0];
  if (!f) return null;
  return {
    id: `football:${f.fixture.id}`,
    sport: 'football',
    competition: f.league?.name ?? 'Football',
    round: f.league?.round,
    status: f.fixture.status?.short === 'FT' ? 'FINAL'
          : f.fixture.status?.short === 'NS' ? 'SCHEDULED'
          : 'LIVE',
    minute: f.fixture.status?.elapsed ? `${f.fixture.status.elapsed}'` : undefined,
    kickoffISO: f.fixture.date,
    venue: f.fixture.venue?.name,
    home: { id: f.teams.home.id, code: (f.teams.home.name ?? '').slice(0,3).toUpperCase(),
            name: f.teams.home.name, logoUrl: f.teams.home.logo, score: f.goals.home ?? 0 },
    away: { id: f.teams.away.id, code: (f.teams.away.name ?? '').slice(0,3).toUpperCase(),
            name: f.teams.away.name, logoUrl: f.teams.away.logo, score: f.goals.away ?? 0 },
  };
}

// ============== CRICKET ==============

export async function getLiveCricket(): Promise<Match[]> {
  const data = await get('v1.cricket.api-sports.io', 'games', { live: 'all' });
  const games = data.response ?? [];
  return games.map((g: any): Match => ({
    id: `cricket:${g.id}`,
    sport: 'cricket',
    competition: g.league?.name ?? 'Cricket',
    status: g.status?.short === 'FT' ? 'FINAL' : 'LIVE',
    minute: g.status?.long,
    kickoffISO: g.date,
    venue: g.venue,
    home: {
      id: g.teams.home.id,
      code: (g.teams.home.name ?? '').slice(0, 3).toUpperCase(),
      name: g.teams.home.name,
      logoUrl: g.teams.home.logo,
      score: g.scores?.home?.total ?? '—',
    },
    away: {
      id: g.teams.away.id,
      code: (g.teams.away.name ?? '').slice(0, 3).toUpperCase(),
      name: g.teams.away.name,
      logoUrl: g.teams.away.logo,
      score: g.scores?.away?.total ?? '—',
    },
  }));
}

// ============== COMBINED ==============

export async function getAllLive(): Promise<Match[]> {
  const [football, cricket] = await Promise.allSettled([
    getLiveFootball(),
    getLiveCricket(),
  ]);
  const out: Match[] = [];
  if (football.status === 'fulfilled') out.push(...football.value);
  if (cricket.status  === 'fulfilled') out.push(...cricket.value);
  return out;
}
