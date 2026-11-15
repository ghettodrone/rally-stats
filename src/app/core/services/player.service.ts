import { Injectable, inject, signal } from '@angular/core';
import { defaultPlayer } from '../data/sample-data';
import { Player } from '../models/player.model';
import { StorageService } from '../storage/storage.service';

const PLAYER_KEY = 'rallystats.v1.player';

@Injectable({ providedIn: 'root' })
export class PlayerService {
  private readonly storage = inject(StorageService);
  private readonly state = signal<Player>(this.loadOrCreate());

  readonly player = this.state.asReadonly();

  update(changes: Pick<Player, 'name' | 'preferredFormat'>): void {
    const next: Player = { ...this.state(), name: changes.name.trim(), preferredFormat: changes.preferredFormat };
    this.storage.write(PLAYER_KEY, next);
    this.state.set(next);
  }

  private loadOrCreate(): Player {
    try {
      const stored = this.storage.read<Player>(PLAYER_KEY);
      if (stored?.name && stored.preferredFormat && stored.createdAt) return stored;
    } catch {
      // Corrupt profile: fall through and recreate it.
    }
    const player = defaultPlayer();
    try {
      this.storage.write(PLAYER_KEY, player);
    } catch {
      // Storage unavailable; keep the profile in memory only.
    }
    return player;
  }
}
