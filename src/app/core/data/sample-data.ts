import { MatchInput } from '../models/match.model';
import { Player } from '../models/player.model';

/** Days before `today` as an ISO date, so the sample always looks recent. */
function daysAgo(days: number, today = new Date()): string {
  const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - days);
  return toIsoDate(d);
}

export function toIsoDate(d: Date): string {
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

const s = (player: number, opponent: number) => ({ player, opponent });

export function sampleMatches(): MatchInput[] {
  return [
    { date: daysAgo(3), opponent: 'Daniel Hartley', format: 'singles',  tournament: 'City League — Round 9', games: [s(21, 17), s(21, 19)] },
    { date: daysAgo(6), opponent: 'Kenji Mori', format: 'singles',  tournament: null, games: [s(18, 21), s(21, 16), s(22, 20)] },
    { date: daysAgo(10), opponent: 'Hartley / Osei', format: 'mens-doubles', tournament: 'City League — Round 8', games: [s(15, 21), s(19, 21)] },
    { date: daysAgo(17), opponent: 'Marcus Lind',  format: 'singles',  tournament: 'Northside Open', games: [s(21, 12), s(21, 14)] },
    { date: daysAgo(17), opponent: 'Tomás Rivera', format: 'singles', tournament: 'Northside Open', games: [s(21, 23), s(21, 18), s(17, 21)] },
    { date: daysAgo(24), opponent: 'Chen / Novak', format: 'mixed-doubles',  tournament: null, games: [s(21, 15), s(21, 13)] },
    { date: daysAgo(31), opponent: 'Kenji Mori', format: 'singles', tournament: 'City League — Round 7', games: [s(19, 21), s(14, 21)] },
    { date: daysAgo(40), opponent: 'Aaron Whitfield', format: 'singles', tournament: null, games: [s(21, 9), s(21, 11)] },
    { date: daysAgo(46), opponent: 'Patel / Brooks', format: 'mens-doubles',  tournament: 'Club Doubles Night', games: [s(30, 29), s(18, 21), s(21, 17)] },
    { date: daysAgo(55), opponent: 'Marcus Lind', format: 'singles', tournament: 'City League — Round 6', games: [s(21, 18), s(21, 19)] },
    { date: daysAgo(68), opponent: 'Owen Gallagher', format: 'singles', tournament: 'Autumn Grand Prix', games: [s(21, 16), s(16, 21), s(21, 14)] },
    { date: daysAgo(68), opponent: 'Lukas Brandt', format: 'singles', tournament: 'Autumn Grand Prix', games: [s(17, 21), s(20, 22)] },
    { date: daysAgo(82), opponent: 'Chen / Novak', format: 'mixed-doubles', tournament: null, games: [s(21, 19), s(19, 21), s(26, 28)] },
    { date: daysAgo(97), opponent: 'Daniel Hartley', format: 'singles', tournament: 'City League — Round 5', games: [s(12, 21), s(21, 19), s(21, 15)] },
    { date: daysAgo(118), opponent: 'Aaron Whitfield', format: 'singles', tournament: null, games: [s(21, 13), s(21, 10)] },
    { date: daysAgo(134), opponent: 'Tomás Rivera', format: 'singles', tournament: 'Summer Series Final', games: [s(16, 21), s(21, 23)] },
  ];
}

export function defaultPlayer(): Player {
  return { name: 'Andrei Kormin', preferredFormat: 'singles', createdAt: new Date().toISOString() };
}
