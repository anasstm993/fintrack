import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler,
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { TrendingUp, TrendingDown, Wallet, ChevronLeft, ChevronRight } from 'lucide-react';
import { analyticsService } from '../services/analytics.service';
import { useSettings } from '../store/settingsStore';
import { useTheme } from '../store/themeStore';
import { useTranslation } from '../i18n';
import { formatCurrency, getMonthName } from '../utils/currency';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

const pieColors = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#6366f1'];

export default function Analytics() {
  const { currency } = useSettings();
  const { isDark } = useTheme();
  const { t, isRTL } = useTranslation();
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);

  const { data: report, isLoading } = useQuery({
    queryKey: ['monthly-report', year, month],
    queryFn: () => analyticsService.getMonthlyReport(year, month),
  });

  const prevMonth = () => { if (month === 1) { setMonth(12); setYear(year - 1); } else { setMonth(month - 1); } };
  const nextMonth = () => { if (month === 12) { setMonth(1); setYear(year + 1); } else { setMonth(month + 1); } };

  const gc = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.2)';
  const tc = isDark ? '#94a3b8' : '#64748b';

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  const pieData = { labels: report?.expenseByCategory?.map(c => c.categoryName) || [], datasets: [{ data: report?.expenseByCategory?.map(c => c.amount) || [], backgroundColor: pieColors, borderWidth: 0, hoverOffset: 8 }] };
  const barData = { labels: ['Income','Expenses','Savings'], datasets: [{ data: [report?.totalIncome||0, report?.totalExpenses||0, report?.netSavings||0], backgroundColor: ['rgba(16,185,129,0.8)','rgba(239,68,68,0.8)','rgba(59,130,246,0.8)'], borderRadius: 8, barThickness: 48 }] };
  const lineData = { labels: report?.dailyChart?.map(d => `${new Date(d.date).getDate()}`) || [], datasets: [{ label: 'Income', data: report?.dailyChart?.map(d => d.income) || [], borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.1)', fill: true, tension: 0.4, pointRadius: 3 }, { label: 'Expenses', data: report?.dailyChart?.map(d => d.expense) || [], borderColor: '#ef4444', backgroundColor: 'rgba(239,68,68,0.1)', fill: true, tension: 0.4, pointRadius: 3 }] };
  const opts: any = { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } }, scales: { x: { grid: { color: gc }, ticks: { color: tc } }, y: { grid: { color: gc }, ticks: { color: tc } } } };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div><h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t.analytics.title}</h1><p className="text-surface-500 mt-1">{t.analytics.subtitle}</p></div>
        <div className="flex items-center gap-3">
          <button onClick={prevMonth} className="btn-secondary btn-sm"><ChevronLeft className="w-4 h-4" /></button>
          <span className="text-sm font-semibold text-surface-900 dark:text-white min-w-[140px] text-center">{getMonthName(month)} {year}</span>
          <button onClick={nextMonth} className="btn-secondary btn-sm"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: t.analytics.totalIncome, val: report?.totalIncome||0, icon: TrendingUp, cls: 'text-success-500', bg: 'bg-success-50 dark:bg-success-500/10' },
          { label: t.analytics.totalExpenses, val: report?.totalExpenses||0, icon: TrendingDown, cls: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-500/10' },
          { label: t.analytics.netSavings, val: report?.netSavings||0, icon: Wallet, cls: (report?.netSavings||0) >= 0 ? 'text-primary-600' : 'text-danger-500', bg: 'bg-primary-50 dark:bg-primary-500/10' },
        ].map(s => (
          <div key={s.label} className="card p-5">
            <div className="flex items-center gap-3 mb-2"><div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center`}><s.icon className={`w-5 h-5 ${s.cls}`} /></div><p className="text-sm text-surface-500">{s.label}</p></div>
            <p className={`text-2xl font-bold ${s.cls}`}>{formatCurrency(s.val, currency)}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6"><h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">{t.analytics.monthlyOverview}</h3><div className="h-64"><Bar data={barData} options={opts} /></div></div>
        <div className="card p-6"><h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">{t.analytics.categoryBreakdown}</h3><div className="h-64 flex items-center justify-center"><Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: (isRTL ? 'left' : 'right') as any, labels: { color: tc, font: { size: 11 }, padding: 8 } } }, cutout: '60%' }} /></div></div>
      </div>

      <div className="card p-6"><h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">{t.analytics.dailyTrend}</h3><div className="h-72"><Line data={lineData} options={{ ...opts, plugins: { legend: { labels: { color: tc, font: { size: 12 } } } } }} /></div></div>

      {report?.expenseByCategory && report.expenseByCategory.length > 0 && (
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">{t.analytics.spendingBreakdown}</h3>
          <div className="space-y-4">
            {report.expenseByCategory.map((cat, i) => (
              <div key={cat.categoryId}>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-surface-900 dark:text-white">{cat.categoryName}</span>
                  <div className="flex items-center gap-3"><span className="text-sm text-surface-500">{Math.round(cat.percentage)}%</span><span className="text-sm font-semibold text-surface-900 dark:text-white">{formatCurrency(cat.amount, currency)}</span></div>
                </div>
                <div className="h-2 rounded-full bg-surface-100 dark:bg-surface-700 overflow-hidden"><div className="h-full rounded-full transition-all duration-1000 ease-out" style={{ width: `${cat.percentage}%`, backgroundColor: pieColors[i % pieColors.length] }} /></div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
