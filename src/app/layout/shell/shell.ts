import { Component, effect, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MessageService } from 'primeng/api';
import { ConfirmDialog } from 'primeng/confirmdialog';
import { Toast } from 'primeng/toast';
import { MatchService } from '../../core/services/match.service';

interface NavItem {
  label: string;
  path: string;
  icon: string;
  exact: boolean;
}

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, Toast, ConfirmDialog],
  templateUrl: './shell.html',
  styleUrl: './shell.scss',
})
export class Shell {
  protected readonly nav: NavItem[] = [
    { label: 'Match History', path: '/matches', icon: 'pi pi-list', exact: true },
  ];

  constructor() {
    const matches = inject(MatchService);
    const messages = inject(MessageService);
    effect(() => {
      const error = matches.loadError();
      if (error) {
        messages.add({
          severity: 'error',
          summary: 'Saved data could not be read',
          detail: `${error}. You can clear it from your profile page.`,
          sticky: true,
        });
      }
    });
  }
}
