import { DatePipe } from '@angular/common';
import { Component, computed, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ButtonDirective } from 'primeng/button';
import { InputText } from 'primeng/inputtext';
import { Select } from 'primeng/select';
import { MATCH_FORMATS, MatchFormat, formatLabel } from '../../core/models/match.model';
import { MatchService } from '../../core/services/match.service';
import { PlayerService } from '../../core/services/player.service';
import { errorMessage } from '../../shared/error-message';

@Component({
  selector: 'app-profile',
  imports: [DatePipe, ReactiveFormsModule, ButtonDirective, InputText, Select],
  templateUrl: './profile.html',
  styleUrl: './profile.scss',
})
export class Profile {
  private readonly playerService = inject(PlayerService);
  private readonly matchService = inject(MatchService);
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly confirm = inject(ConfirmationService);
  private readonly messages = inject(MessageService);

  protected readonly player = this.playerService.player;
  protected readonly stats = this.matchService.stats;
  protected readonly formats = [...MATCH_FORMATS];
  protected readonly editing = signal(false);

  protected readonly initials = computed(() =>
    this.player()
      .name.split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join(''),
  );
  protected readonly preferredLabel = computed(() => formatLabel(this.player().preferredFormat));

  /** Win rate in the preferred category, to put the career number in context. */
  protected readonly preferredStats = computed(() => {
    const format = this.player().preferredFormat;
    const list = this.matchService.matches().filter((m) => m.format === format);
    const wins = list.filter((m) => m.result === 'win').length;
    return { total: list.length, winRate: list.length ? Math.round((wins / list.length) * 100) : null };
  });

  protected readonly form = this.fb.group({
    name: this.fb.control('', [Validators.required, Validators.maxLength(50), Validators.pattern(/\S/)]),
    preferredFormat: this.fb.control<MatchFormat>('singles', Validators.required),
  });

  protected startEdit(): void {
    const p = this.player();
    this.form.reset({ name: p.name, preferredFormat: p.preferredFormat });
    this.editing.set(true);
  }

  protected cancelEdit(): void {
    this.editing.set(false);
  }

  protected save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    try {
      this.playerService.update(this.form.getRawValue());
      this.editing.set(false);
      this.messages.add({ severity: 'success', summary: 'Profile updated' });
    } catch (e) {
      this.messages.add({ severity: 'error', summary: 'Could not save your profile', detail: errorMessage(e) });
    }
  }

  protected nameError(): string | null {
    const c = this.form.controls.name;
    if (!c.invalid || !c.touched) return null;
    return c.hasError('maxlength') ? 'Keep it under 50 characters' : 'Enter your name';
  }

  protected clearMatches(): void {
    const count = this.stats().total;
    this.confirm.confirm({
      header: 'Delete all matches?',
      message: `All ${count} recorded ${count === 1 ? 'match' : 'matches'} will be permanently removed from this browser. Your profile is kept.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Delete all',
      rejectLabel: 'Cancel',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', text: true },
      defaultFocus: 'reject',
      accept: () => this.run(() => this.matchService.clearAll(), 'All matches deleted'),
    });
  }

  protected restoreSample(): void {
    const replace = () => this.run(() => this.matchService.loadSample(), 'Sample matches loaded');
    if (this.stats().total === 0) {
      replace();
      return;
    }
    this.confirm.confirm({
      header: 'Replace your matches?',
      message: 'Loading the sample data replaces every match currently recorded.',
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Replace with sample',
      rejectLabel: 'Cancel',
      acceptButtonProps: { severity: 'danger' },
      rejectButtonProps: { severity: 'secondary', text: true },
      defaultFocus: 'reject',
      accept: replace,
    });
  }

  private run(action: () => void, success: string): void {
    try {
      action();
      this.messages.add({ severity: 'success', summary: success });
    } catch (e) {
      this.messages.add({ severity: 'error', summary: 'Something went wrong', detail: errorMessage(e) });
    }
  }
}
