export type Sport = 'football' | 'cricket';

export interface Team {
  id: number;
  code: string;
  name: string;
  logoUrl?: string;
}

export type MatchStatus = 'SCHEDULED' | 'LIVE' | 'FINAL' | 'POSTPONED' | string;

export interface Match {
  id: string;
  sport: Sport;
  competition: string;
  country?: string;
  round?: string;
  status: MatchStatus;
  minute?: string;
  kickoffISO: string;
  venue?: string;
  home: Team & { score?: string | number };
  away: Team & { score?: string | number };
  sub?: string;
}

export interface FollowedTeam {
  user_id: string;
  sport: Sport;
  team_id: number;
  team_name: string;
  created_at: string;
}
