import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Wallet, TrendingUp, TrendingDown, PiggyBank, Trash2,
  ArrowUpRight, ArrowDownRight, AlertTriangle, AlertCircle,
} from 'lucide-react';
import { Bar, Doughnut } from 'react-chartjs-2';
import { analyticsService } from '../services/analytics.service';
import { transactionService } from '../services/transaction.service';
import { useSettings } from '../store/settingsStore';
import { useTheme } from '../store/themeStore';
import { useTranslation } from '../i18n';
import { formatCurrency, formatDate } from '../utils/currency';
import { getTranslatedCategory, translateInsight } from '../utils/i18n';
import { PIE_COLORS, registerChartPlugins } from '../utils/chart';
import { toast } from 'sonner';
import type { Insight } from '../types';

registerChartPlugins();

// Simple count up animation hook
function useCountUp(end: number, duration: number = 1000) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percentage = Math.min(progress / duration, 1);

      // Easing out cubic
      const easeOut = 1 - Math.pow(1 - percentage, 3);
      setCount(end * easeOut);

      if (percentage < 1) {
        animationFrame = requestAnimationFrame(animate);
      } else {
        setCount(end);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [end, duration]);

  return count;
}

function AnimatedCurrency({ amount, currency }: { amount: number, currency: any }) {
  const count = useCountUp(amount);
  return <>{formatCurrency(count, currency)}</>;
}

export default function Dashboard() {
  const { currency } = useSettings();
  const { isDark } = useTheme();
  const { t, isRTL } = useTranslation();
  const queryClient = useQueryClient();

  const { data: dashboard, isLoading: isLoadingDash } = useQuery({
    queryKey: ['dashboard'],
    queryFn: analyticsService.getDashboard
  });

  const { data: insightsData, isLoading: isLoadingInsights } = useQuery({
    queryKey: ['insights'],
    queryFn: analyticsService.getInsights
  });

  const { data: summaryData } = useQuery({
    queryKey: ['summary'],
    queryFn: analyticsService.getSummary
  });

  const { data: budgetStatus } = useQuery({
    queryKey: ['budget-status'],
    queryFn: analyticsService.getBudgetStatus
  });

  const handleDelete = async (id: string) => {
    if (!confirm(t.transactions?.confirmDelete || 'Are you sure?')) return;
    try {
      await transactionService.delete(id);
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['insights'] });
      queryClient.invalidateQueries({ queryKey: ['summary'] });
      queryClient.invalidateQueries({ queryKey: ['budget-status'] });
      toast.success(t.transactions?.transactionDeleted || 'Deleted');
    } catch { toast.error('Failed to delete transaction'); }
  };

  const isLoading = isLoadingDash || isLoadingInsights;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 bg-surface-200 dark:bg-surface-700 rounded shimmer" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => <div key={i} className="h-32 card bg-surface-200 dark:bg-surface-700 shimmer" />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-96 card bg-surface-200 dark:bg-surface-700 shimmer" />
          <div className="h-96 card bg-surface-200 dark:bg-surface-700 shimmer" />
        </div>
      </div>
    );
  }

  const incomeChange = summaryData?.changes.incomeChange || 0;
  const expenseChange = summaryData?.changes.expenseChange || 0;

  const stats = [
    {
      label: t.dashboard.currentBalance,
      value: dashboard?.balance || 0,
      icon: Wallet,
      color: 'text-primary-600 dark:text-primary-400',
      bg: 'bg-primary-50 dark:bg-primary-500/10',
      iconColor: 'text-primary-600',
      trend: null
    },
    {
      label: t.dashboard.totalIncome,
      value: dashboard?.totalIncome || 0,
      icon: TrendingUp,
      color: 'text-success-500',
      bg: 'bg-success-50 dark:bg-success-500/10',
      iconColor: 'text-success-500',
      trend: incomeChange !== 0 ? { val: incomeChange, good: incomeChange > 0 } : null
    },
    {
      label: t.dashboard.totalExpenses,
      value: dashboard?.totalExpenses || 0,
      icon: TrendingDown,
      color: 'text-danger-500',
      bg: 'bg-danger-50 dark:bg-danger-500/10',
      iconColor: 'text-danger-500',
      trend: expenseChange !== 0 ? { val: expenseChange, good: expenseChange < 0 } : null
    },
    {
      label: t.dashboard.savingsRate,
      value: `${dashboard?.savingsRate || 0}%`,
      icon: PiggyBank,
      color: 'text-purple-500',
      bg: 'bg-purple-50 dark:bg-purple-500/10',
      iconColor: 'text-purple-500',
      trend: insightsData?.data?.savingsRateChange ? { val: insightsData.data.savingsRateChange, good: insightsData.data.savingsRateChange > 0 } : null
    },
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

  const pieChartData = { labels: dashboard?.expenseByCategory?.map(c => getTranslatedCategory(t, c.categoryName)) || [], datasets: [{ data: dashboard?.expenseByCategory?.map(c => c.amount) || [], backgroundColor: PIE_COLORS, borderWidth: 0, hoverOffset: 8 }] };
  const chartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { labels: { color: textColor, font: { size: 12 } } } }, scales: { x: { grid: { color: gridColor }, ticks: { color: textColor } }, y: { grid: { color: gridColor }, ticks: { color: textColor } } } };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t.dashboard.title}</h1>
          <p className="text-surface-500 mt-1">{t.dashboard.subtitle}</p>
        </div>
      </div>

      {/* Smart Insights Panel */}
      {insightsData && insightsData.insights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {insightsData.insights.map((insight: Insight, idx: number) => (
            <div key={insight.key + idx} className={`card p-4 flex items-start gap-3 animate-slide-up border ${insight.type === 'danger' ? 'border-danger-200 dark:border-danger-500/20' : 'border-warning-200 dark:border-warning-500/20'}`} style={{ animationDelay: `${idx * 0.1}s` }}>
              <div className={`shrink-0 mt-0.5 ${insight.type === 'danger' ? 'text-danger-500' : 'text-warning-500'
                }`}>
                {insight.type === 'danger' ? <AlertTriangle className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
              </div>
              <p className={`text-sm ${insight.type === 'danger' ? 'text-danger-700 dark:text-danger-300' : 'text-warning-700 dark:text-warning-300'}`}>
                {translateInsight(t, insight)}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, index) => (
          <div key={stat.label} className="card stat-card p-5 animate-slide-up relative overflow-hidden group" style={{ animationDelay: `${index * 0.05}s` }}>
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <stat.icon className="w-24 h-24" />
            </div>
            <div className="flex items-center justify-between mb-3 relative z-10">
              <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}><stat.icon className={`w-5 h-5 ${stat.iconColor}`} /></div>
              {/* Trend indicator removed by user request */}
            </div>
            <p className="text-sm text-surface-500 mb-1 relative z-10">{stat.label}</p>
            <p className={`text-2xl font-bold ${stat.color} relative z-10`}>
              {typeof stat.value === 'number' ? <AnimatedCurrency amount={stat.value} currency={currency} /> : stat.value}
            </p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 card p-6">
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">{t.dashboard.incomeVsExpenses}</h3>
          <div className="h-72"><Bar data={barChartData} options={chartOptions} /></div>
        </div>

        <div className="space-y-6">
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-4">{t.dashboard.spendingByCategory}</h3>
            <div className="h-64 flex items-center justify-center">
              <Doughnut data={pieChartData} options={{ responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { color: textColor, font: { size: 11 }, padding: 12 } } }, cutout: '65%' }} />
            </div>
          </div>

          {/* Budget Mini Section */}
          {budgetStatus && budgetStatus.length > 0 && (
            <div className="card p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white">{t.budget?.title || 'Budgets'}</h3>
                <a href="/budget" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  {'View all'}
                </a>
              </div>
              <div className="space-y-4">
                {budgetStatus.slice(0, 3).map((budget) => (
                  <div key={budget.id}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-surface-900 dark:text-white">{getTranslatedCategory(t, budget.categoryName)}</span>
                      <span className={`font-semibold ${budget.status === 'exceeded' ? 'text-danger-500' : 'text-surface-500'}`}>
                        {budget.percentage}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ease-out ${budget.status === 'exceeded' ? 'bg-danger-500' :
                            budget.status === 'danger' ? 'bg-orange-500' :
                              budget.status === 'warning' ? 'bg-warning-500' : 'bg-success-500'
                          }`}
                        style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
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
                  <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300">{getTranslatedCategory(t, tx.category?.name)}</span></td>
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
