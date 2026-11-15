import { Component, input } from '@angular/core';

/** Message + next step for empty lists. Actions are projected as content. */
@Component({
  selector: 'app-empty-state',
  template: `
    <div class="empty">
      <h3>{{ title() }}</h3>
      @if (message()) {
        <p>{{ message() }}</p>
      }
      <div class="actions"><ng-content /></div>
    </div>
  `,
  styles: `
    .empty {
      padding: 48px 24px;
      text-align: center;
    }
    h3 {
      font-size: 15px;
      font-weight: 600;
    }
    p {
      max-width: 380px;
      margin: 6px auto 0;
      color: var(--rs-text-2);
    }
    .actions {
      display: flex;
      justify-content: center;
      flex-wrap: wrap;
      gap: 8px;
      margin-top: 18px;
      &:empty {
        display: none;
      }
    }
  `,
})
export class EmptyState {
  readonly title = input.required<string>();
  readonly message = input<string>();
}
