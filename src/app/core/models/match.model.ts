export type MatchFormat = 'singles' | 'mens-doubles' | 'womens-doubles' | 'mixed-doubles';

export type MatchResult = 'win' | 'loss';

/** Points in a single game, from the player's point of view. */
export interface GameScore {
  player: number;
  opponent: number;
}

export interface Match {
  id: string;
  /** ISO date (YYYY-MM-DD) the match was played. */
  date: string;
  opponent: string;
  format: MatchFormat;
  result: MatchResult;
  tournament: string | null;
  games: GameScore[];
  createdAt: string;
  updatedAt: string;
}

/** Fields the user supplies; id, result and timestamps are managed by the service. */
export type MatchInput = Pick<Match, 'date' | 'opponent' | 'format' | 'tournament' | 'games'>;

export interface MatchFormatOption {
  value: MatchFormat;
  label: string;
  short: string;
}

export const MATCH_FORMATS: readonly MatchFormatOption[] = [
  { value: 'singles', label: 'Singles', short: 'S' },
  { value: 'mens-doubles', label: "Men's Doubles", short: 'MD' },
  { value: 'womens-doubles', label: "Women's Doubles", short: 'WD' },
  { value: 'mixed-doubles', label: 'Mixed Doubles', short: 'XD' },
];

export function formatLabel(format: MatchFormat): string {
  return MATCH_FORMATS.find((f) => f.value === format)?.label ?? format;
}
