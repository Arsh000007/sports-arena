import MatchCard from '@/components/MatchCard';
import SearchBar from '@/components/SearchBar';
import { getAllLive, getFlag } from '@/lib/sportsApi';
import type { Match } from '@/lib/types';

export const revalidate = 30;

const POPULAR_LEAGUES = [
  'UEFA Champions League', 'Premier League', 'La Liga', 'Serie A',
  'Bundesliga', 'Ligue 1', 'FIFA World Cup', 'UEFA Europa League',
  'MLS', 'Copa Libertadores',
];

export default async function HomePage() {
  let matches: Match[] = [];
  let error: string | null = null;
  try {
    matches = await getAllLive();
  } catch (e: any) {
    error = e?.message ?? 'Failed to load matches';
  }

  const live = matches.filter(m => m.status === 'LIVE');
  const popular = matches.filter(m => POPULAR_LEAGUES.includes(m.competition) && m.status !== 'LIVE');
  const rest = matches.filter(m => !POPULAR_LEAGUES.includes(m.competition) && m.status !== 'LIVE');

  const groups: Record<string, { country?: string; matches: Match[] }> = {};
  for (const m of rest) {
    const key = m.competition ?? 'Other';
    if (!groups[key]) groups[key] = { country: m.country, matches: [] };
    groups[key].matches.push(m);
  }

  return (
    <>
      <SearchBar />

      {error && (
        <div className="rounded-lg border border-line bg-panel p-4 text-sm mb-4">
          <p className="text-live font-semibold">Error: {error}</p>
        </div>
      )}

      {live.length > 0 && (
        <div className="mb-10">
          <h2 className="font-display text-xl mb-4 pb-2 border-b border-line">
            🔴 Live Now <span className="text-muted text-sm font-sans">{live.length} matches</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {live.map((m) => <MatchCard key={m.id} m={m} />)}
          </div>
        </div>
      )}

      {popular.length > 0 && (
        <div className="mb-10">
          <h2 className="font-display text-xl mb-4 pb-2 border-b border-line">
            ⭐ Featured Leagues
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {popular.map((m) => <MatchCard key={m.id} m={m} />)}
          </div>
        </div>
      )}

      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="font-display text-2xl">All Matches</h1>
        <span className="text-muted text-sm">{matches.length} matches</span>
      </div>

      {!error && matches.length === 0 && <p className="text-muted">No matches found.</p>}

      <div className="grid gap-8">
        {Object.entries(groups).map(([competition, { country, matches: cms }]) => (
          <div key={competition}>
            <h2 className="font-display text-base mb-3 border-b border-line pb-2 flex items-center gap-2">
              <span>{getFlag(country)}</span>
              <span className="text-muted text-xs uppercase">{country}</span>
              <span className="text-accent">{competition}</span>
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {cms.map((m) => <MatchCard key={m.id} m={m} />)}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
