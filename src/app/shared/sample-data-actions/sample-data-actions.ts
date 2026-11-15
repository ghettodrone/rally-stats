import { Component, inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { MatchService } from '../../core/services/match.service';
import { errorMessage } from '../error-message';

/** "Load sample data" button used by empty states. */
@Component({
  selector: 'app-sample-data-actions',
  imports: [ButtonDirective],
  template: `<button pButton type="button" severity="secondary" [outlined]="true" (click)="load()">Load sample data</button>`,
})
export class SampleDataActions {
  private readonly matches = inject(MatchService);
  private readonly messages = inject(MessageService);

  protected load(): void {
    try {
      this.matches.loadSample();
      this.messages.add({ severity: 'success', summary: 'Sample matches loaded' });
    } catch (e) {
      this.messages.add({ severity: 'error', summary: 'Could not load sample data', detail: errorMessage(e) });
    }
  }
}
