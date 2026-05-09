// Home page — shows the live grid.
// This is a Server Component, so the fetch happens on the server
// (your API key never reaches the browser).

import MatchCard from '@/components/MatchCard';
import { getAllLive } from '@/lib/sportsApi';

export const revalidate = 30; // re-fetch every 30s

export default async function HomePage() {
  let matches: Awaited<ReturnType<typeof getAllLive>> = [];
  let error: string | null = null;
  try {
    matches = await getAllLive();
  } catch (e: any) {
    error = e?.message ?? 'Failed to load live matches';
  }

  return (
    <>
      <div className="flex items-baseline gap-3 mb-5">
        <h1 className="font-display text-2xl">Live now</h1>
        <span className="text-muted text-sm">
          {matches.length} {matches.length === 1 ? 'match' : 'matches'}
        </span>
      </div>

      {error && (
        <div className="rounded-lg border border-line bg-panel p-4 text-sm">
          <p className="text-live mb-2 font-semibold">Couldn&apos;t load live data.</p>
          <p className="text-muted">
            {error}<br />
            Check that <code className="text-ink">API_SPORTS_KEY</code> is set in
            <code className="text-ink"> .env.local</code> and your daily quota isn&apos;t exhausted.
          </p>
        </div>
      )}

      {!error && matches.length === 0 && (
        <p className="text-muted">No matches are live right now.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((m) => <MatchCard key={m.id} m={m} />)}
      </div>
    </>
  );
}
