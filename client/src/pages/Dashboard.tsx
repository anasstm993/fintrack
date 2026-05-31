import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Wallet, TrendingUp, TrendingDown, PiggyBank, Trash2, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { analyticsService } from '../services/analytics.service';
import { transactionService } from '../services/transaction.service';
import { useSettings } from '../store/settingsStore';
import { useTheme } from '../store/themeStore';
import { useTranslation } from '../i18n';
import { formatCurrency, formatDate } from '../utils/currency';
import { toast } from 'sonner';

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend, Filler);

export default function Dashboard() {
  const { currency } = useSettings();
  const { isDark } = useTheme();
  const { t, isRTL } = useTranslation();
  const queryClient = useQueryClient();

  const { data: dashboard, isLoading } = useQuery({ queryKey: ['dashboard'], queryFn: analyticsService.getDashboard });

  const handleDelete = async (id: string) => {
    if (!confirm(t.transactions.confirmDelete)) return;
    try {
      await transactionService.delete(id);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(t.transactions.transactionDeleted);
    } catch { toast.error('Failed to delete transaction'); }
  };

  if (isLoading) return <div className="flex items-center justify-center h-64"><div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" /></div>;

  const stats = [
    { label: t.dashboard.currentBalance, value: formatCurrency(dashboard?.balance || 0, currency), icon: Wallet, color: 'text-primary-600 dark:text-primary-400', bg: 'bg-primary-50 dark:bg-primary-500/10', iconColor: 'text-primary-600' },
    { label: t.dashboard.totalIncome, value: formatCurrency(dashboard?.totalIncome || 0, currency), icon: TrendingUp, color: 'text-success-500', bg: 'bg-success-50 dark:bg-success-500/10', iconColor: 'text-success-500' },
    { label: t.dashboard.totalExpenses, value: formatCurrency(dashboard?.totalExpenses || 0, currency), icon: TrendingDown, color: 'text-danger-500', bg: 'bg-danger-50 dark:bg-danger-500/10', iconColor: 'text-danger-500' },
    { label: t.dashboard.savingsRate, value: `${dashboard?.savingsRate || 0}%`, icon: PiggyBank, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10', iconColor: 'text-purple-500' },
  ];

  const gridColor = isDark ? 'rgba(148,163,184,0.1)' : 'rgba(148,163,184,0.2)';
  const textColor = isDark ? '#94a3b8' : '#64748b';

  const barChartData = {
    labels: dashboard?.monthlyChart?.map(m => { const [y, mo] = m.month.split('-'); return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short' }); }) || [],
    datasets: [
      { label: t.transactions.income, data: dashboard?.monthlyChart?.map(m => m.income) || [], backgroundColor: 'rgba(16,185,129,0.8)', borderRadius: 6, barThickness: 20 },
      { label: t.transactions.expense, data: dashboard?.monthlyChart?.map(m => m.expense) || [], backgroundColor: 'rgba(239,68,68,0.8)', borderRadius: 6, barThickness: 20 },
    ],
  };

  const lineChartData = {
    labels: dashboard?.monthlyChart?.map(m => { const [y, mo] = m.month.split('-'); return new Date(parseInt(y), parseInt(mo) - 1).toLocaleDateString(isRTL ? 'ar-SA' : 'en-US', { month: 'short' }); }) || [],
    datasets: [{ label: t.dashboard.totalExpenses, data: dashboard?.monthlyChart?.map(m => m.expense) || [], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.1)', fill: true, tension: 0.4, pointRadius: 4, pointBackgroundColor: '#3b82f6' }],
  };

  const pieColors = ['#3b82f6','#10b981','#f59e0b','#ef4444','#8b5cf6','#ec4899','#06b6d4','#84cc16','#f97316','#6366f1'];
  const pieChartData = { labels: dashboard?.expenseByCategory?.map(c => c.categoryName) || [], datasets: [{ data: dashboard?.expenseByCategory?.map(c => c.amount) || [], backgroundColor: pieColors, borderWidth: 0, hoverOffset: 8 }] };
  const chartOptions: any = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: textColor, font: { size: 12 } } } }, scales: { x: { grid: { color: gridColor }, ticks: { color: textColor } }, y: { grid: { color: gridColor }, ticks: { color: textColor } } } };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t.dashboard.title}</h1>
        <p className="text-surface-500 mt-1">{t.dashboard.subtitle}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className="card p-5 animate-slide-up" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}><stat.icon className={`w-5 h-5 ${stat.iconColor}`} /></div>
            </div>
            <p className="text-sm text-surface-500 mb-1">{stat.label}</p>
            <p className={`text-xl font-bold ${stat.color}`}>{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">{t.dashboard.incomeVsExpenses}</h3>
          <div className="h-72"><Bar data={barChartData} options={chartOptions} /></div>
        </div>
        <div className="card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">{t.dashboard.spendingByCategory}</h3>
          <div className="h-72 flex items-center justify-center">
            <Doughnut data={pieChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textColor, font: { size: 11 }, padding: 12 } } }, cutout: '65%' }} />
          </div>
        </div>
      </div>

      <div className="card p-6">
        <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">{t.dashboard.monthlySpendingTrend}</h3>
        <div className="h-64"><Line data={lineChartData} options={chartOptions} /></div>
      </div>

      <div className="card overflow-hidden">
        <div className="p-6 border-b border-surface-200 dark:border-surface-700">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white">{t.dashboard.recentTransactions}</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-surface-50 dark:bg-surface-700/30">
                <th className={`text-${isRTL ? 'right' : 'left'} px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider`}>{t.dashboard.date}</th>
                <th className={`text-${isRTL ? 'right' : 'left'} px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider`}>{t.dashboard.description}</th>
                <th className={`text-${isRTL ? 'right' : 'left'} px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider`}>{t.dashboard.category}</th>
                <th className={`text-${isRTL ? 'right' : 'left'} px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider`}>{t.dashboard.amount}</th>
                <th className={`text-${isRTL ? 'right' : 'left'} px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider`}>{t.dashboard.type}</th>
                <th className={`text-${isRTL ? 'left' : 'right'} px-6 py-3 text-xs font-semibold text-surface-500 uppercase tracking-wider`}>{t.actions}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200 dark:divide-surface-700">
              {dashboard?.recentTransactions?.length === 0 && (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-surface-500">{t.dashboard.noTransactions}</td></tr>
              )}
              {dashboard?.recentTransactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors">
                  <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400 whitespace-nowrap">{formatDate(tx.date)}</td>
                  <td className="px-6 py-4">
                    <p className="text-sm font-medium text-surface-900 dark:text-white">{tx.title}</p>
                    {tx.description && <p className="text-xs text-surface-500 mt-0.5 truncate max-w-xs">{tx.description}</p>}
                  </td>
                  <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300">{tx.category?.name}</span></td>
                  <td className="px-6 py-4"><span className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-success-500' : 'text-danger-500'}`}>{tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount, currency)}</span></td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${tx.type === 'INCOME' ? 'bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400' : 'bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400'}`}>
                      {tx.type === 'INCOME' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                      {tx.type === 'INCOME' ? t.transactions.income : t.transactions.expense}
                    </span>
                  </td>
                  <td className={`px-6 py-4 text-${isRTL ? 'left' : 'right'}`}>
                    <button onClick={() => handleDelete(tx.id)} className="p-1.5 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
