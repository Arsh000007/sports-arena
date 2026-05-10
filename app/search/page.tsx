import MatchCard from '@/components/MatchCard';
import { getAllLive } from '@/lib/sportsApi';
import type { Match } from '@/lib/types';
import Link from 'next/link';

export default async function SearchPage({ searchParams }: { searchParams: { q?: string } }) {
  const q = searchParams.q?.toLowerCase() ?? '';
  let matches: Match[] = [];
  if (q) {
    const all = await getAllLive();
    matches = all.filter(m =>
      m.home.name.toLowerCase().includes(q) ||
      m.away.name.toLowerCase().includes(q) ||
      m.competition.toLowerCase().includes(q)
    );
  }

  return (
    <>
      <div className="flex items-baseline gap-3 mb-6">
        <Link href="/" className="text-muted text-sm hover:text-ink">← Back</Link>
        <h1 className="font-display text-2xl">Results for &quot;{searchParams.q}&quot;</h1>
        <span className="text-muted text-sm">{matches.length} matches</span>
      </div>
      {matches.length === 0 && <p className="text-muted">No matches found.</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {matches.map((m) => <MatchCard key={m.id} m={m} />)}
      </div>
    </>
  );
}
