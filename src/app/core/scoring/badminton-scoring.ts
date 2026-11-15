import { GameScore, MatchResult } from '../models/match.model';

/**
 * Badminton scoring rules (BWF, 21-point rally scoring, best of three games).
 *
 * A game is won by the first side to reach 21 points. At 20–20 a side must
 * lead by two to win, up to a cap of 30: at 29–29 the next point wins (30–29).
 */
export const GAME_POINTS = 21;
export const MAX_POINTS = 30;
export const GAMES_TO_WIN = 2;
export const MAX_GAMES = 3;

export type GameSide = 'player' | 'opponent';

/** Returns a reason the score is impossible as a finished game, or null if it is valid. */
export function gameError(game: GameScore): string | null {
  const { player, opponent } = game;
  if (!Number.isInteger(player) || !Number.isInteger(opponent)) {
    return 'Scores must be whole numbers';
  }
  if (player < 0 || opponent < 0) {
    return 'Scores cannot be negative';
  }
  if (player > MAX_POINTS || opponent > MAX_POINTS) {
    return `No side can score more than ${MAX_POINTS}`;
  }
  if (player === opponent) {
    return 'A game cannot end level';
  }

  const winner = Math.max(player, opponent);
  const loser = Math.min(player, opponent);

  if (winner < GAME_POINTS) {
    return `The winner must reach ${GAME_POINTS} points`;
  }
  if (winner === GAME_POINTS) {
    return loser <= GAME_POINTS - 2 ? null : 'From 20–20 a game must be won by 2 points';
  }
  // winner is 22..30: the game went past 20–20.
  if (winner === MAX_POINTS && loser === MAX_POINTS - 1) {
    return null;
  }
  if (winner - loser === 2) {
    return null;
  }
  return winner - loser < 2
    ? 'From 20–20 a game must be won by 2 points'
    : `A game past ${GAME_POINTS} ends as soon as one side leads by 2`;
}

export function isValidGame(game: GameScore): boolean {
  return gameError(game) === null;
}

export function gameWinner(game: GameScore): GameSide {
  return game.player > game.opponent ? 'player' : 'opponent';
}

export interface MatchEvaluation {
  valid: boolean;
  result: MatchResult | null;
  gamesWon: number;
  gamesLost: number;
  /** Per-game messages, indexed by game position. */
  gameErrors: (string | null)[];
  /** Match-level messages (structure of the best-of-three). */
  matchErrors: string[];
}

/**
 * Validates a sequence of finished games as a best-of-three match and derives the result.
 * Pass only the games that were actually played (no placeholders).
 */
export function evaluateMatch(games: readonly GameScore[]): MatchEvaluation {
  const gameErrors = games.map(gameError);
  const matchErrors: string[] = [];
  let gamesWon = 0;
  let gamesLost = 0;

  if (games.length < GAMES_TO_WIN) {
    matchErrors.push('Enter the scores of at least two games');
  } else if (games.length > MAX_GAMES) {
    matchErrors.push(`A match has at most ${MAX_GAMES} games`);
  }

  if (gameErrors.every((e) => e === null)) {
    for (let i = 0; i < games.length; i++) {
      if (gamesWon === GAMES_TO_WIN || gamesLost === GAMES_TO_WIN) {
        matchErrors.push(
          i === 2 ? 'No third game is played after a 2–0 result' : 'The match was already decided',
        );
        break;
      }
      if (gameWinner(games[i]) === 'player') gamesWon++;
      else gamesLost++;
    }
    if (
      matchErrors.length === 0 &&
      games.length === GAMES_TO_WIN &&
      gamesWon === 1 &&
      gamesLost === 1
    ) {
      matchErrors.push('At one game all, a deciding third game is needed');
    }
  }

  const valid = matchErrors.length === 0 && gameErrors.every((e) => e === null);
  const result: MatchResult | null = valid ? (gamesWon > gamesLost ? 'win' : 'loss') : null;

  return { valid, result, gamesWon, gamesLost, gameErrors, matchErrors };
}

/** Games won/lost for an already-validated match. */
export function gameTally(games: readonly GameScore[]): { won: number; lost: number } {
  const won = games.filter((g) => gameWinner(g) === 'player').length;
  return { won, lost: games.length - won };
}
