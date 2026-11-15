import { Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { DatePicker } from 'primeng/datepicker';
import { InputText } from 'primeng/inputtext';
import { SelectButton } from 'primeng/selectbutton';
import { startWith } from 'rxjs';
import { toIsoDate } from '../../core/data/sample-data';
import { MATCH_FORMATS, Match, MatchFormat, MatchInput } from '../../core/models/match.model';
import { MAX_POINTS, evaluateMatch } from '../../core/scoring/badminton-scoring';
import {
  GameForm,
  ScoreErrors,
  matchScoreValidator,
  needsDecider,
  notInFutureValidator,
  readGames,
} from '../../core/scoring/score-validators';
import { MatchService } from '../../core/services/match.service';
import { PlayerService } from '../../core/services/player.service';
import { EmptyState } from '../../shared/empty-state/empty-state';
import { errorMessage } from '../../shared/error-message';
import { ResultBadge } from '../../shared/result-badge/result-badge';

@Component({
  selector: 'app-match-form',
  imports: [ReactiveFormsModule, RouterLink, ButtonDirective, DatePicker, InputText, SelectButton, EmptyState, ResultBadge],
  templateUrl: './match-form.html',
  styleUrl: './match-form.scss',
})
export class MatchForm implements OnInit {
  /** Bound from the :id route parameter; absent when adding. */
  readonly id = input<string>();

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly matchService = inject(MatchService);
  private readonly player = inject(PlayerService).player;
  private readonly router = inject(Router);
  private readonly messages = inject(MessageService);

  protected readonly formats = [...MATCH_FORMATS];
  protected readonly maxPoints = MAX_POINTS;
  protected readonly today = new Date();
  protected readonly submitted = signal(false);
  protected readonly saving = signal(false);
  protected readonly editing = signal<Match | null>(null);
  protected readonly notFound = signal(false);

  protected readonly form = this.fb.group({
    opponent: this.fb.control('', [Validators.required, Validators.maxLength(60), Validators.pattern(/\S/)]),
    date: new FormControl<Date | null>(new Date(), [Validators.required, notInFutureValidator]),
    format: this.fb.control<MatchFormat>(this.player().preferredFormat, Validators.required),
    tournament: this.fb.control('', Validators.maxLength(80)),
    games: new FormArray<GameForm>([this.gameRow(), this.gameRow(), this.gameRow()], matchScoreValidator),
  });

  private readonly gamesValue = toSignal(
    this.form.controls.games.valueChanges.pipe(startWith(this.form.controls.games.value)),
  );

  /** Live outcome preview, derived from the entered scores. */
  protected readonly preview = computed(() => {
    this.gamesValue();
    const games = readGames(this.form.controls.games).filter((g) => g !== null);
    const e = evaluateMatch(games);
    return e.valid ? { result: e.result!, won: e.gamesWon, lost: e.gamesLost } : null;
  });

  ngOnInit(): void {
    this.form.controls.games.controls[2].disable({ emitEvent: false });
    this.form.controls.games.valueChanges.subscribe(() => this.syncDeciderRow());

    const id = this.id();
    if (!id) return;
    const match = this.matchService.getById(id);
    if (!match) {
      this.notFound.set(true);
      return;
    }
    this.editing.set(match);
    this.form.patchValue({
      opponent: match.opponent,
      date: parseIsoDate(match.date),
      format: match.format,
      tournament: match.tournament ?? '',
    });
    match.games.forEach((g, i) => this.form.controls.games.at(i).setValue({ player: g.player, opponent: g.opponent }));
  }

  protected scoreErrors(): ScoreErrors | null {
    return (this.form.controls.games.errors?.['score'] as ScoreErrors | undefined) ?? null;
  }

  /** Per-row message, shown once the row has been interacted with or the form submitted. */
  protected gameMessage(index: number): string | null {
    const row = this.form.controls.games.at(index);
    if (!this.submitted() && !(row.controls.player.touched && row.controls.opponent.touched)) return null;
    return this.scoreErrors()?.games[index] ?? null;
  }

  protected matchMessage(): string | null {
    const errors = this.scoreErrors();
    if (!errors || errors.games.some(Boolean)) return null;
    const touchedFirstTwo = [0, 1].every((i) => this.form.controls.games.at(i).touched);
    return this.submitted() || touchedFirstTwo ? (errors.match[0] ?? null) : null;
  }

  protected showError(control: 'opponent' | 'date' | 'tournament'): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.touched || this.submitted());
  }

  protected deciderEnabled(): boolean {
    return this.form.controls.games.at(2).enabled;
  }

  protected save(): void {
    this.submitted.set(true);
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const value = this.form.getRawValue();
    const input: MatchInput = {
      opponent: value.opponent,
      date: toIsoDate(value.date!),
      format: value.format,
      tournament: value.tournament,
      games: readGames(this.form.controls.games).filter((g) => g !== null),
    };

    this.saving.set(true);
    try {
      const existing = this.editing();
      const saved = existing ? this.matchService.update(existing.id, input) : this.matchService.add(input);
      this.messages.add({
        severity: 'success',
        summary: existing ? 'Match updated' : 'Match saved',
        detail: `${saved.result === 'win' ? 'Win' : 'Loss'} against ${saved.opponent}`,
      });
      this.router.navigate(['/matches', saved.id]);
    } catch (e) {
      this.messages.add({ severity: 'error', summary: 'Could not save the match', detail: errorMessage(e) });
    } finally {
      this.saving.set(false);
    }
  }

  protected cancelLink(): string[] {
    const existing = this.editing();
    return existing ? ['/matches', existing.id] : ['/matches'];
  }

  /** Game 3 is only playable at one game all; otherwise it is cleared and disabled. */
  private syncDeciderRow(): void {
    const games = this.form.controls.games;
    const decider = games.at(2);
    // Games 1 and 2 are always enabled, so they lead the list.
    const needed = needsDecider(readGames(games));
    if (needed && decider.disabled) {
      decider.enable({ emitEvent: false });
      games.updateValueAndValidity({ emitEvent: false });
    } else if (!needed && decider.enabled) {
      decider.reset({ player: null, opponent: null }, { emitEvent: false });
      decider.disable({ emitEvent: false });
      games.updateValueAndValidity({ emitEvent: false });
    }
  }

  private gameRow(): GameForm {
    const points = [Validators.min(0), Validators.max(MAX_POINTS)];
    return new FormGroup({
      player: new FormControl<number | null>(null, points),
      opponent: new FormControl<number | null>(null, points),
    });
  }
}

function parseIsoDate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}
