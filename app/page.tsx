import MatchCard from '@/components/MatchCard';
import SearchBar from '@/components/SearchBar';
import { getAllLive, getFlag } from '@/lib/sportsApi';
import type { Match } from '@/lib/types';
import Link from 'next/link';

export const revalidate = 30;

const POPULAR_LEAGUES = [
  'UEFA Champions League', 'Premier League', 'La Liga', 'Serie A',
  'Bundesliga', 'Ligue 1', 'FIFA World Cup', 'UEFA Europa League',
  'MLS', 'Copa Libertadores',
];

export default async function HomePage({
  searchParams,
}: {
  searchParams: { tab?: string };
}) {
  const tab = searchParams.tab ?? 'live';
  let matches: Match[] = [];
  let error: string | null = null;
  try {
    matches = await getAllLive();
  } catch (e: any) {
    error = e?.message ?? 'Failed to load matches';
  }

  const live = matches.filter(m => m.status === 'LIVE');
  const fixtures = matches.filter(m => m.status === 'NS');
  const results = matches.filter(m => m.status === 'FT' || m.status === 'AET' || m.status === 'PEN');

  const displayed = tab === 'fixtures' ? fixtures : tab === 'results' ? results : live;

  const groups: Record<string, { country?: string; matches: Match[] }> = {};
  for (const m of displayed) {
    const key = m.competition ?? 'Other';
    if (!groups[key]) groups[key] = { country: m.country, matches: [] };
    groups[key].matches.push(m);
  }

  const tabs = [
    { id: 'live', label: `🔴 Live (${live.length})` },
    { id: 'fixtures', label: `📅 Fixtures (${fixtures.length})` },
    { id: 'results', label: `✅ Results (${results.length})` },
  ];

  return (
    <>
      <SearchBar />

      <div className="flex gap-2 mb-8 border-b border-line pb-0">
        {tabs.map(t => (
          <Link
            key={t.id}
            href={`/?tab=${t.id}`}
            className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition ${
              tab === t.id
                ? 'bg-accent text-bg'
                : 'text-muted hover:text-ink'
            }`}
          >
            {t.label}
          </Link>
        ))}
      </div>

      {error && (
        <div className="rounded-lg border border-line bg-panel p-4 text-sm mb-4">
          <p className="text-live font-semibold">Error: {error}</p>
        </div>
      )}

      {!error && displayed.length === 0 && (
        <p className="text-muted">No matches found.</p>
      )}

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
