import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { formatLabel } from '../../core/models/match.model';
import { MatchService } from '../../core/services/match.service';
import { PlayerService } from '../../core/services/player.service';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ResultBadge } from '../../shared/result-badge/result-badge';
import { ScoreLine } from '../../shared/score-line/score-line';
import { TrendChart } from '../../shared/trend-chart/trend-chart';
import { SampleDataActions } from '../../shared/sample-data-actions/sample-data-actions';

@Component({
  selector: 'app-overview',
  imports: [DatePipe, RouterLink, ButtonDirective, EmptyState, ResultBadge, ScoreLine, TrendChart, SampleDataActions],
  templateUrl: './overview.html',
  styleUrl: './overview.scss',
})
export class Overview {
  private readonly matchService = inject(MatchService);
  protected readonly player = inject(PlayerService).player;

  protected readonly stats = this.matchService.stats;
  protected readonly trend = this.matchService.monthlyTrend;
  protected readonly recent = computed(() =>
    this.matchService.recent().map((m) => ({ ...m, formatLabel: formatLabel(m.format) })),
  );
  protected readonly firstName = computed(() => this.player().name.split(' ')[0]);
}
