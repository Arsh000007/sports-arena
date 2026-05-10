import MatchCard from '@/components/MatchCard';
import { getAllLive } from '@/lib/sportsApi';

export const revalidate = 30;

export default async function HomePage() {
  let matches: Awaited<ReturnType<typeof getAllLive>> = [];
  let error: string | null = null;
  try {
    matches = await getAllLive();
  } catch (e: any) {
    error = e?.message ?? 'Failed to load matches';
  }

  return (
    <>
      <div className="flex items-baseline gap-3 mb-5">
        <h1 className="font-display text-2xl">Today&apos;s Matches</h1>
        <span className="text-muted text-sm">
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-line bg-panel p-4 text-sm">
          <p className="text-live mb-2 font-semibold">Couldn&apos;t load data.</p>
          <p className="text-muted">{error}</p>
        </div>
      )}

      {!error && matches.length === 0 && (
        <p className="text-muted">No matches found.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((m) => <MatchCard key={m.id} m={m} />)}
      </div>
    </>
  );
}
