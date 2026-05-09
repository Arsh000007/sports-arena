import Link from 'next/link';
import type { Match } from '@/lib/types';

export default function MatchCard({ m }: { m: Match }) {
  const isLive = m.status === 'LIVE';
  return (
    <Link
      href={`/match/${encodeURIComponent(m.id)}`}
      className="block rounded-xl border border-line bg-panel p-4 hover:border-accent/40 transition"
    >
      <div className="flex items-center gap-2 text-xs text-muted mb-3">
        {isLive && <span className="dot-live" aria-hidden />}
        <span className="uppercase tracking-wider">
          {isLive ? `LIVE · ${m.minute ?? ''}` : m.status}
        </span>
        <span className="ml-auto truncate">{m.competition}</span>
      </div>

      <Row team={m.home.name} logo={m.home.logoUrl} score={m.home.score} />
      <Row team={m.away.name} logo={m.away.logoUrl} score={m.away.score} />

      {m.sub && <p className="mt-3 text-xs text-muted line-clamp-1">{m.sub}</p>}
    </Link>
  );
}

function Row({
  team, logo, score,
}: { team: string; logo?: string; score?: string | number }) {
  return (
    <div className="flex items-center gap-3 py-1">
      {logo
        ? <img src={logo} alt="" className="w-6 h-6 object-contain" />
        : <div className="w-6 h-6 rounded bg-line" />}
      <span className="text-ink text-sm truncate">{team}</span>
      <span className="ml-auto font-display text-lg tabular-nums">
        {score ?? '—'}
      </span>
    </div>
  );
}
