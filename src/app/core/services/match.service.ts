import { Injectable, computed, inject, signal } from '@angular/core';
import { MatchRepository } from '../data/match.repository';
import { sampleMatches } from '../data/sample-data';
import { Match, MatchInput } from '../models/match.model';
import { evaluateMatch } from '../scoring/badminton-scoring';

export interface MatchStats {
  total: number;
  wins: number;
  losses: number;
  /** 0–100, or null when no matches have been played. */
  winRate: number | null;
}

export interface MonthlyTrendPoint {
  /** YYYY-MM */
  month: string;
  wins: number;
  losses: number;
  /** Career win rate up to and including this month, 0–100. */
  cumulativeWinRate: number;
}

export class InvalidMatchError extends Error {}

const byDateDesc = (a: Match, b: Match) =>
  b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt);

@Injectable({ providedIn: 'root' })
export class MatchService {
  private readonly repository = inject(MatchRepository);
  private readonly state = signal<Match[]>([]);

  /** Set when stored data could not be read; the UI surfaces it once. */
  readonly loadError = signal<string | null>(null);

  /** All matches, newest first. */
  readonly matches = computed(() => [...this.state()].sort(byDateDesc));

  readonly stats = computed<MatchStats>(() => computeStats(this.state()));

  readonly recent = computed(() => this.matches().slice(0, 5));

  readonly monthlyTrend = computed(() => computeMonthlyTrend(this.state()));

  constructor() {
    try {
      const stored = this.repository.load();
      if (stored === null) {
        this.loadSample();
      } else {
        this.state.set(stored);
      }
    } catch (e) {
      this.loadError.set(e instanceof Error ? e.message : 'Could not load saved matches');
    }
  }

  getById(id: string): Match | undefined {
    return this.state().find((m) => m.id === id);
  }

  add(input: MatchInput): Match {
    const now = new Date().toISOString();
    const match: Match = {
      ...normalize(input),
      id: newId(),
      result: deriveResult(input),
      createdAt: now,
      updatedAt: now,
    };
    this.commit([...this.state(), match]);
    return match;
  }

  update(id: string, input: MatchInput): Match {
    const existing = this.getById(id);
    if (!existing) throw new Error('Match not found');
    const updated: Match = {
      ...existing,
      ...normalize(input),
      result: deriveResult(input),
      updatedAt: new Date().toISOString(),
    };
    this.commit(this.state().map((m) => (m.id === id ? updated : m)));
    return updated;
  }

  delete(id: string): void {
    this.commit(this.state().filter((m) => m.id !== id));
  }

  clearAll(): void {
    this.commit([]);
  }

  /** Replaces all matches with the bundled sample set. */
  loadSample(): void {
    const now = new Date().toISOString();
    const matches = sampleMatches().map<Match>((input) => ({
      ...input,
      id: newId(),
      result: deriveResult(input),
      createdAt: now,
      updatedAt: now,
    }));
    this.commit(matches);
  }

  /** Persists first so a storage failure leaves in-memory state untouched. */
  private commit(next: Match[]): void {
    this.repository.save(next);
    this.state.set(next);
    this.loadError.set(null);
  }
}

function deriveResult(input: MatchInput): Match['result'] {
  const evaluation = evaluateMatch(input.games);
  if (!evaluation.valid || !evaluation.result) {
    throw new InvalidMatchError(
      [...evaluation.matchErrors, ...evaluation.gameErrors.filter(Boolean)][0] ?? 'Invalid score',
    );
  }
  return evaluation.result;
}

function normalize(input: MatchInput): MatchInput {
  const tournament = input.tournament?.trim();
  return {
    date: input.date,
    country: input.country,
    opponent: input.opponent.trim(),
    format: input.format,
    tournament: tournament ? tournament : null,
    games: input.games.map((g) => ({ player: g.player, opponent: g.opponent })),
  };
}

function newId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `m-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function computeStats(matches: readonly Match[]): MatchStats {
  const wins = matches.filter((m) => m.result === 'win').length;
  const total = matches.length;
  return {
    total,
    wins,
    losses: total - wins,
    winRate: total ? Math.round((wins / total) * 100) : null,
  };
}

export function computeMonthlyTrend(matches: readonly Match[]): MonthlyTrendPoint[] {
  if (!matches.length) return [];
  const buckets = new Map<string, { wins: number; losses: number }>();
  for (const m of matches) {
    const key = m.date.slice(0, 7);
    const b = buckets.get(key) ?? { wins: 0, losses: 0 };
    if (m.result === 'win') b.wins++;
    else b.losses++;
    buckets.set(key, b);
  }

  // Fill gaps so months without matches still show on the axis.
  const months = [...buckets.keys()].sort();
  const all: string[] = [];
  let [y, mo] = months[0].split('-').map(Number);
  const last = months[months.length - 1];
  while (true) {
    const key = `${y}-${String(mo).padStart(2, '0')}`;
    all.push(key);
    if (key >= last) break;
    mo++;
    if (mo > 12) {
      mo = 1;
      y++;
    }
  }

  let wins = 0;
  let total = 0;
  return all.map((month) => {
    const b = buckets.get(month) ?? { wins: 0, losses: 0 };
    wins += b.wins;
    total += b.wins + b.losses;
    return {
      month,
      wins: b.wins,
      losses: b.losses,
      cumulativeWinRate: total ? Math.round((wins / total) * 100) : 0,
    };
  });
}
