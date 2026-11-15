import { Injectable, inject } from '@angular/core';
import { Match } from '../models/match.model';
import { StorageService } from '../storage/storage.service';

/**
 * Persistence boundary for matches. MatchService talks only to this interface,
 * so a backend implementation can replace the localStorage one later.
 */
export abstract class MatchRepository {
  /** null means nothing has ever been stored (first run). */
  abstract load(): Match[] | null;
  abstract save(matches: Match[]): void;
}

const MATCHES_KEY = 'rallystats.v1.matches';

@Injectable()
export class LocalStorageMatchRepository extends MatchRepository {
  private readonly storage = inject(StorageService);

  load(): Match[] | null {
    const data = this.storage.read<Match[]>(MATCHES_KEY);
    return Array.isArray(data) ? data : data === null ? null : [];
  }

  save(matches: Match[]): void {
    this.storage.write(MATCHES_KEY, matches);
  }
}
