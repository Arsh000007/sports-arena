// Match detail. URL is /match/<encoded-id>, where id looks like
// "football:1234567" or "cricket:9876".

import { notFound } from 'next/navigation';
import { getFootballFixture } from '@/lib/sportsApi';
import type { Match } from '@/lib/types';

export const revalidate = 30;

export default async function MatchPage({ params }: { params: { id: string } }) {
  const decoded = decodeURIComponent(params.id);
  const [sport, rawId] = decoded.split(':');
  const numericId = Number(rawId);

  let match: Match | null = null;
  if (sport === 'football' && Number.isFinite(numericId)) {
    match = await getFootballFixture(numericId);
  }
  // TODO: cricket detail endpoint — wire similarly when ready.

  if (!match) return notFound();

  const isLive = match.status === 'LIVE';

  return (
    <article className="grid gap-6">
      <header className="flex items-baseline gap-3">
        <span className="text-muted text-sm uppercase tracking-wider">
          {match.competition}{match.round ? ` · ${match.round}` : ''}
        </span>
        {isLive && (
          <span className="ml-auto inline-flex items-center gap-2 text-xs">
            <span className="dot-live" /> LIVE · {match.minute}
          </span>
        )}
      </header>

      <div className="rounded-2xl border border-line bg-panel p-8 grid grid-cols-3 items-center gap-4">
        <Side team={match.home} align="right" />
        <div className="text-center">
          <div className="font-display text-5xl tabular-nums">
            {match.home.score} <span className="text-muted">—</span> {match.away.score}
          </div>
          {match.venue && (
            <p className="text-muted text-xs mt-2">{match.venue}</p>
          )}
        </div>
        <Side team={match.away} align="left" />
      </div>

      <p className="text-muted text-sm">
        Kickoff: {new Date(match.kickoffISO).toLocaleString()}
      </p>

      <p className="text-xs text-muted">
        More tabs (lineups, timeline, stats) will land here as we wire deeper
        endpoints. For v1 this is the score + status.
      </p>
    </article>
  );
}

function Side({
  team, align,
}: { team: Match['home']; align: 'left' | 'right' }) {
  return (
    <div className={`flex items-center gap-3 ${align === 'right' ? 'flex-row-reverse text-right' : ''}`}>
      {team.logoUrl
        ? <img src={team.logoUrl} alt="" className="w-14 h-14 object-contain" />
        : <div className="w-14 h-14 rounded bg-line" />}
      <div>
        <p className="font-display text-lg">{team.name}</p>
        <p className="text-muted text-xs uppercase tracking-wider">{team.code}</p>
      </div>
    </div>
  );
}
