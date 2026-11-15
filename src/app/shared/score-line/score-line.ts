import { Component, computed, input } from '@angular/core';
import { GameScore } from '../../core/models/match.model';
import { gameWinner } from '../../core/scoring/badminton-scoring';

/** "21–17  19–21  21–15", with the player's won games emphasised. */
@Component({
  selector: 'app-score-line',
  template: `
    <span class="line num">
      @for (g of view(); track $index) {
        <span class="game" [class.won]="g.won">{{ g.player }}–{{ g.opponent }}</span>
      }
    </span>
  `,
  styles: `
    .line {
      display: inline-flex;
      gap: 10px;
      white-space: nowrap;
    }
    .game {
      color: var(--rs-text-2);
    }
    .won {
      color: var(--rs-text);
      font-weight: 600;
    }
  `,
})
export class ScoreLine {
  readonly games = input.required<GameScore[]>();

  protected readonly view = computed(() =>
    this.games().map((g) => ({ ...g, won: gameWinner(g) === 'player' })),
  );
}
