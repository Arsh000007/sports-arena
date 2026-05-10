import MatchCard from '@/components/MatchCard';
import SearchBar from '@/components/SearchBar';
import { getAllLive } from '@/lib/sportsApi';
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

  const popular = matches.filter(m => POPULAR_LEAGUES.includes(m.competition));
  const rest = matches.filter(m => !POPULAR_LEAGUES.includes(m.competition));

  const groups: Record<string, Match[]> = {};
  for (const m of rest) {
    const key = m.competition ?? 'Other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }

  return (
    <>
      <SearchBar />

      {error && (
        <div className="rounded-lg border border-line bg-panel p-4 text-sm mb-4">
          <p className="text-live font-semibold">Error: {error}</p>
        </div>
      )}

      {popular.length > 0 && (
        <div className="mb-10">
          <h2 className="font-display text-xl mb-4 text-accent border-b border-line pb-2">
            ⭐ Featured Matches
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
        {Object.entries(groups).map(([competition, cms]) => (
          <div key={competition}>
            <h2 className="font-display text-lg mb-3 border-b border-line pb-2 text-accent">
              {competition}
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
