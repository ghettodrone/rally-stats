import { Component, computed, input } from '@angular/core';
import { MonthlyTrendPoint } from '../../core/services/match.service';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * Diverging monthly bars: wins rise above the baseline, losses hang below it.
 * Position (not only colour) separates the two series, so it reads without colour vision.
 */
@Component({
  selector: 'app-trend-chart',
  templateUrl: './trend-chart.html',
  styleUrl: './trend-chart.scss',
})
export class TrendChart {
  readonly points = input.required<MonthlyTrendPoint[]>();
  /** Most recent months to show. */
  readonly months = input(12);

  protected readonly view = computed(() => {
    const pts = this.points().slice(-this.months());
    const max = Math.max(2, ...pts.map((p) => Math.max(p.wins, p.losses)));
    return {
      max,
      columns: pts.map((p, i) => {
        const [year, month] = p.month.split('-').map(Number);
        const label = MONTHS[month - 1];
        return {
          ...p,
          label,
          // Show the year under January and under the first column.
          year: i === 0 || month === 1 ? String(year) : '',
          fullLabel: `${label} ${year}`,
          // Keep tooltips inside the plot at the edges.
          tipAlign: i < 2 ? 'start' : i >= pts.length - 2 ? 'end' : 'mid',
          winPct: (p.wins / max) * 100,
          lossPct: (p.losses / max) * 100,
        };
      }),
    };
  });
}
