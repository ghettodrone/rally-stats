import { AbstractControl, FormArray, FormControl, FormGroup, ValidationErrors, ValidatorFn } from '@angular/forms';
import { GameScore } from '../models/match.model';
import { GAMES_TO_WIN, evaluateMatch, gameError, gameWinner } from './badminton-scoring';

export type GameForm = FormGroup<{
  player: FormControl<number | null>;
  opponent: FormControl<number | null>;
}>;

export interface ScoreErrors {
  /** Message per game row (null when the row is fine or untouched). */
  games: (string | null)[];
  /** Messages about the match as a whole. */
  match: string[];
}

/** Reads the complete, enabled game rows; null marks an incomplete row. */
export function readGames(array: FormArray<GameForm>): (GameScore | null)[] {
  return array.controls
    .filter((c) => c.enabled)
    .map((c) => {
      const { player, opponent } = c.getRawValue();
      return player == null || opponent == null ? null : { player, opponent };
    });
}

/** True when the first two games are complete, valid and split one each. */
export function needsDecider(games: readonly (GameScore | null)[]): boolean {
  const [g1, g2] = games;
  return (
    !!g1 && !!g2 && !gameError(g1) && !gameError(g2) && gameWinner(g1) !== gameWinner(g2)
  );
}


export const matchScoreValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
  const array = control as FormArray<GameForm>;
  const rows = array.controls.filter((c) => c.enabled).map((c) => c.getRawValue());
  const gameMessages: (string | null)[] = rows.map(() => null);
  const matchMessages: string[] = [];

  // Each complete row is checked on its own, so a bad game is flagged immediately.
  const played: GameScore[] = [];
  rows.forEach((row, i) => {
    if (row.player != null && row.opponent != null) {
      const game = { player: row.player, opponent: row.opponent };
      gameMessages[i] = gameError(game);
      played.push(game);
    } else if (row.player != null || row.opponent != null) {
      gameMessages[i] = 'Enter both scores';
    }
  });

  const firstTwoMissing = rows.slice(0, GAMES_TO_WIN).some((r) => r.player == null && r.opponent == null);
  if (firstTwoMissing) {
    matchMessages.push('Enter the scores for games 1 and 2');
  } else if (!gameMessages.some(Boolean)) {
    // All rows are valid games: check the best-of-three structure.
    matchMessages.push(...evaluateMatch(played).matchErrors);
  }

  return gameMessages.some(Boolean) || matchMessages.length
    ? { score: { games: gameMessages, match: matchMessages } satisfies ScoreErrors }
    : null;
};

// Rejects dates after today (local time). 
export const notInFutureValidator: ValidatorFn = (control) => {
  const value = control.value as Date | null;
  if (!value) return null;
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);
  return value.getTime() > endOfToday.getTime() ? { future: true } : null;
};
