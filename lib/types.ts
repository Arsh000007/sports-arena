// Shared TypeScript types for the app.
// These describe the normalized shape of data that flows from
// our /api routes into our React components — independent of
// whatever shape API-Sports returns.

export type Sport = 'football' | 'cricket';

export interface Team {
  id: number;
  code: string;       // 3-letter code, e.g. "ARS"
  name: string;       // "Arsenal"
  logoUrl?: string;
}

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINAL' | 'POSTPONED';

export interface Match {
  id: string;             // unique across sports, e.g. "football:1234567"
  sport: Sport;
  competition: string;    // "Premier League"
  round?: string;         // "Matchday 36"
  status: MatchStatus;
  minute?: string;        // "76'"  or  "Inn 2 · 14.3 ov"
  kickoffISO: string;     // ISO 8601
  venue?: string;
  home: Team & { score?: string | number };
  away: Team & { score?: string | number };
  sub?: string;           // free-text caption
}

export interface FollowedTeam {
  user_id: string;
  sport: Sport;
  team_id: number;
  team_name: string;
  created_at: string;
}
