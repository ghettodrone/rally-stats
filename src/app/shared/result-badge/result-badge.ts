import { Component, computed, input } from '@angular/core';
import { MatchResult } from '../../core/models/match.model';

@Component({
  selector: 'app-result-badge',
  template: `<span class="badge" [class]="result()" [attr.aria-label]="label()">{{ compact() ? short() : label() }}</span>`,
  styles: `
    .badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      width: 50px;
      height: 22px;
      padding: 0 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.02em;
    }
    .win {
      background: var(--rs-green-tint);
      color: var(--rs-win);
    }
    .loss {
      background: var(--rs-loss-tint);
      color: #b93c3c;
    }
  `,
})
export class ResultBadge {
  readonly result = input.required<MatchResult>();
  /** Show just "W" / "L". */
  readonly compact = input(false);

  protected readonly label = computed(() => (this.result() === 'win' ? 'Win' : 'Loss'));
  protected readonly short = computed(() => (this.result() === 'win' ? 'W' : 'L'));
}
