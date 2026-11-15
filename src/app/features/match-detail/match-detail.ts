import { DatePipe } from '@angular/common';
import { Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { formatLabel } from '../../core/models/match.model';
import { gameTally, gameWinner } from '../../core/scoring/badminton-scoring';
import { MatchService } from '../../core/services/match.service';
import { PlayerService } from '../../core/services/player.service';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { errorMessage } from '../../shared/error-message';
import { ResultBadge } from '../../shared/result-badge/result-badge';

@Component({
  selector: 'app-match-detail',
  imports: [DatePipe, RouterLink, ButtonDirective, EmptyState, ResultBadge],
  templateUrl: './match-detail.html',
  styleUrl: './match-detail.scss',
})
export class MatchDetail {
  /** Bound from the :id route parameter. */
  readonly id = input.required<string>();

  private readonly matchService = inject(MatchService);
  private readonly router = inject(Router);
  private readonly confirm = inject(ConfirmationService);
  private readonly messages = inject(MessageService);
  private readonly player = inject(PlayerService).player;
  protected readonly playerName = computed(() => this.player().name);

  protected readonly match = computed(() => {
    // Read matches() so the view reacts to edits and deletes.
    this.matchService.matches();
    return this.matchService.getById(this.id()) ?? null;
  });

  protected readonly view = computed(() => {
    const m = this.match();
    if (!m) return null;
    const tally = gameTally(m.games);
    const notes = [
      ...(m.games.length === 3 ? ['Decided in a third game'] : []),
      ...m.games.flatMap((g, i) => (Math.max(g.player, g.opponent) > 21 ? [`Game ${i + 1} went past 20–20`] : [])),
    ];
    return {
      ...m,
      formatLabel: formatLabel(m.format),
      tally,
      games: m.games.map((g, i) => ({
        ...g,
        number: i + 1,
        won: gameWinner(g) === 'player',
      })),
      notes,
      edited: m.updatedAt !== m.createdAt,
    };
  });

  protected remove(): void {
    const m = this.match();
    if (!m) return;
    this.confirm.confirm({
      header: 'Delete this match?',
      message: `The match against ${m.opponent} will be removed from your history and statistics. This can’t be undone.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete match',
      rejectLabel: 'Cancel',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', text: true },
      defaultFocus: 'reject',
      accept: () => {
        try {
          this.matchService.delete(m.id);
          this.messages.add({ severity: 'success', summary: 'Match deleted' });
          this.router.navigate(['/matches']);
        } catch (e) {
          this.messages.add({ severity: 'error', summary: 'Could not delete the match', detail: errorMessage(e) });
        }
      },
    });
  }
}
