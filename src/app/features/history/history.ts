import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ButtonDirective } from 'primeng/button';
import { IconField } from 'primeng/iconfield';
import { InputIcon } from 'primeng/inputicon';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { SelectButton } from 'primeng/selectbutton';
import { TableModule } from 'primeng/table';
import { MATCH_FORMATS, Match, MatchFormat, MatchResult, formatLabel } from '../../core/models/match.model';
import { MatchService } from '../../core/services/match.service';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { ResultBadge } from '../../shared/result-badge/result-badge';
import { HistoryFilters } from './history-filters';
import { SampleDataActions } from '../../shared/sample-data-actions/sample-data-actions';
import { ScoreLine } from '../../shared/score-line/score-line';

type SortDirection = 'desc' | 'asc';

const PAGE_SIZE = 15;

@Component({
  selector: 'app-history',
  imports: [
    DatePipe,
    FormsModule,
    RouterLink,
    ButtonDirective,
    IconField,
    InputIcon,
    InputText,
    Select,
    SelectButton,
    TableModule,
    EmptyState,
    ResultBadge,
    SampleDataActions,
    ScoreLine,
  ],
  templateUrl: './history.html',
  styleUrl: './history.scss',
})
export class History {
  private readonly matchService = inject(MatchService);
  private readonly router = inject(Router);
  /** Filters live in a root service so they survive visiting a match and coming back. */
  protected readonly filters = inject(HistoryFilters);

  protected readonly pageSize = PAGE_SIZE;
  protected readonly formatOptions = [{ value: null, label: 'All formats' }, ...MATCH_FORMATS];
  protected readonly resultOptions: { value: MatchResult | null; label: string }[] = [
    { value: null, label: 'All' },
    { value: 'win', label: 'Wins' },
    { value: 'loss', label: 'Losses' },
  ];

  protected readonly totalCount = computed(() => this.matchService.matches().length);

  protected readonly rows = computed(() => {
    const query = this.filters.query().trim().toLowerCase();
    const format = this.filters.format();
    const result = this.filters.result();
    const list = this.matchService
      .matches()
      .filter(
        (m) =>
          (!format || m.format === format) &&
          (!result || m.result === result) &&
          (!query || m.opponent.toLowerCase().includes(query)),
      )
      .map((m) => ({ ...m, formatLabel: formatLabel(m.format) }));
    // matches() is newest first.
    return this.filters.sort() === 'asc' ? list.reverse() : list;
  });

  protected readonly summary = computed(() => {
    const rows = this.rows();
    const wins = rows.filter((r) => r.result === 'win').length;
    return { count: rows.length, wins, losses: rows.length - wins };
  });

  protected toggleSort(): void {
    this.filters.sort.update((s: SortDirection) => (s === 'desc' ? 'asc' : 'desc'));
  }

  protected setFormat(value: MatchFormat | null): void {
    this.filters.format.set(value);
  }

  protected setResult(value: MatchResult | null): void {
    this.filters.result.set(value ?? null);
  }

  protected open(match: Match): void {
    this.router.navigate(['/matches', match.id]);
  }
}
