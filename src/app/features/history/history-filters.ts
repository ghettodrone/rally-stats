import { Injectable, computed, signal } from '@angular/core';
import { MatchFormat, MatchResult } from '../../core/models/match.model';

@Injectable({ providedIn: 'root' })
export class HistoryFilters {
  readonly query = signal('');
  readonly format = signal<MatchFormat | null>(null);
  readonly result = signal<MatchResult | null>(null);
  readonly sort = signal<'desc' | 'asc'>('desc');

  readonly active = computed(() => !!this.query().trim() || !!this.format() || !!this.result());

  clear(): void {
    this.query.set('');
    this.format.set(null);
    this.result.set(null);
  }
}
