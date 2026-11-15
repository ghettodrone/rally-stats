import { MatchFormat } from './match.model';

export interface Player {
  name: string;
  preferredFormat: MatchFormat;
  createdAt: string;
}
