import MatchCard from '@/components/MatchCard';
import { getAllLive } from '@/lib/sportsApi';
import type { Match } from '@/lib/types';

export const revalidate = 30;

export default async function HomePage() {
  let matches: Match[] = [];
  let error: string | null = null;
  try {
    matches = await getAllLive();
  } catch (e: any) {
    error = e?.message ?? 'Failed to load matches';
  }

  // Group by competition
  const groups: Record<string, Match[]> = {};
  for (const m of matches) {
    const key = m.competition ?? 'Other';
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }

  return (
    <>
      <div className="flex items-baseline gap-3 mb-6">
        <h1 className="font-display text-2xl">Today&apos;s Matches</h1>
        <span className="text-muted text-sm">{matches.length} matches</span>
      </div>

      {error && (
        <div className="rounded-lg border border-line bg-panel p-4 text-sm mb-4">
          <p className="text-live font-semibold">Error: {error}</p>
        </div>
      )}

      {!error && matches.length === 0 && (
        <p className="text-muted">No matches found.</p>
      )}

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
