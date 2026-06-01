import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

/** Standard palette for pie/doughnut charts throughout the app. */
export const PIE_COLORS = [
  '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6',
  '#ec4899', '#06b6d4', '#84cc16', '#f97316', '#6366f1',
];

/** Register all Chart.js plugins used by the app. Call once at module level. */
export function registerChartPlugins(): void {
  ChartJS.register(
    CategoryScale, LinearScale, BarElement, LineElement,
    PointElement, ArcElement, Title, Tooltip, Legend, Filler,
  );
}
