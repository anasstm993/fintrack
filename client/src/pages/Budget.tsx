import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Target, AlertTriangle, AlertCircle, CheckCircle2, Plus, Pencil, Loader2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { budgetService } from '../services/budget.service';
import { analyticsService } from '../services/analytics.service';
import { categoryService } from '../services/category.service';
import { useSettings } from '../store/settingsStore';
import { useTranslation } from '../i18n';
import { formatCurrency } from '../utils/currency';
import { getTranslatedCategory } from '../utils/i18n';
import { toast } from 'sonner';

const budgetSchema = z.object({
  categoryId: z.string().min(1, 'Category is required'),
  amount: z.coerce.number().positive('Amount must be positive'),
});

type BudgetForm = z.infer<typeof budgetSchema>;

export default function Budget() {
  const { currency } = useSettings();
  const { t, isRTL } = useTranslation();
  const queryClient = useQueryClient();
  const [showModal, setShowModal] = useState(false);

  const getTranslated = (name: string) => getTranslatedCategory(t, name);

  const { data: budgetStatus, isLoading: isLoadingStatus } = useQuery({
    queryKey: ['budget-status'],
    queryFn: () => analyticsService.getBudgetStatus(),
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  const expenseCategories = categories?.filter(c => c.type === 'EXPENSE') || [];
  
  // Filter out categories that already have a budget
  const availableCategories = expenseCategories.filter(
    cat => !budgetStatus?.some(b => b.categoryId === cat.id)
  );

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<BudgetForm>({
    // @ts-expect-error - Zod resolver type mismatch with React Hook Form
    resolver: zodResolver(budgetSchema),
  });

  const openAddModal = () => {
    reset({ categoryId: '', amount: undefined as unknown as number });
    setShowModal(true);
  };

  const openEditModal = (categoryId: string, currentAmount: number) => {
    reset({ categoryId, amount: currentAmount });
    setShowModal(true);
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['budget-status'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['insights'] });
    queryClient.invalidateQueries({ queryKey: ['summary'] });
  };

  const onSubmit = async (data: z.infer<typeof budgetSchema>) => {
    try {
      await budgetService.set(data.categoryId, data.amount);
      toast.success(t.budget?.budgetSaved || 'Budget saved successfully');
      invalidateAll();
      setShowModal(false);
    } catch (err) {
      const error = err as any;
      toast.error(error.response?.data?.error || 'Failed to save budget');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await budgetService.delete(id);
      invalidateAll();
      toast.success(t.budget?.budgetDeleted || 'Budget deleted successfully');
    } catch {
      toast.error('Failed to delete budget');
    }
  };

  if (isLoadingStatus) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'exceeded': return 'bg-danger-500';
      case 'danger': return 'bg-orange-500';
      case 'warning': return 'bg-warning-500';
      default: return 'bg-success-500';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'exceeded': return <AlertTriangle className="w-5 h-5 text-danger-500" />;
      case 'danger': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'warning': return <AlertCircle className="w-5 h-5 text-warning-500" />;
      default: return <CheckCircle2 className="w-5 h-5 text-success-500" />;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
            {t.budget?.title || 'Budgets'}
          </h1>
          <p className="text-surface-500 mt-1">
            {t.budget?.subtitle || 'Manage your monthly spending limits'}
          </p>
        </div>
        <button onClick={openAddModal} className="btn-primary btn-md">
          <Plus className="w-4 h-4" />
          {t.budget?.addBudget || 'Set Budget'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {budgetStatus?.map((budget, index) => (
          <div 
            key={budget.id} 
            className="card p-6 hover:shadow-lg transition-shadow duration-300 animate-slide-up"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  budget.status === 'exceeded' ? 'bg-danger-50 dark:bg-danger-500/10' :
                  budget.status === 'danger' ? 'bg-orange-50 dark:bg-orange-500/10' :
                  budget.status === 'warning' ? 'bg-warning-50 dark:bg-warning-500/10' :
                  'bg-success-50 dark:bg-success-500/10'
                }`}>
                  {getStatusIcon(budget.status)}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-surface-900 dark:text-white">
                    {getTranslated(budget.categoryName)}
                  </h3>
                  <p className="text-sm text-surface-500 flex items-center gap-1">
                    <Target className="w-3.5 h-3.5" />
                    {formatCurrency(budget.budgetAmount, currency)}
                  </p>
                </div>
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => openEditModal(budget.categoryId, budget.budgetAmount)}
                  className="p-2 text-surface-400 hover:text-primary-600 hover:bg-primary-50 dark:hover:bg-primary-500/10 rounded-lg transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(budget.id)}
                  className="p-2 text-surface-400 hover:text-danger-600 hover:bg-danger-50 dark:hover:bg-danger-500/10 rounded-lg transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-surface-600 dark:text-surface-400">
                  {formatCurrency(budget.spent, currency)} {t.budget?.spent || 'spent'}
                </span>
                <span className={`font-semibold ${
                  budget.status === 'exceeded' ? 'text-danger-500' : 'text-surface-900 dark:text-white'
                }`}>
                  {budget.remaining > 0 ? (
                    `${formatCurrency(budget.remaining, currency)} ${t.budget?.remaining || 'left'}`
                  ) : (
                    `${formatCurrency(Math.abs(budget.remaining), currency)} ${t.budget?.over || 'over budget'}`
                  )}
                </span>
              </div>
              
              <div className="h-2.5 w-full bg-surface-100 dark:bg-surface-700 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ease-out ${getStatusColor(budget.status)}`}
                  style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                />
              </div>
              
              <div className="flex justify-end">
                <span className={`text-xs font-medium ${
                  budget.status === 'exceeded' ? 'text-danger-500' : 'text-surface-500'
                }`}>
                  {budget.percentage}%
                </span>
              </div>
            </div>
          </div>
        ))}

        {budgetStatus?.length === 0 && (
          <div className="col-span-full card p-12 text-center">
            <Target className="w-12 h-12 text-surface-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">
              {t.budget?.noBudgets || 'No budgets set'}
            </h3>
            <p className="text-surface-500 mb-6 max-w-md mx-auto">
              {t.budget?.createFirst || 'Set monthly spending limits for your categories to keep your expenses in check.'}
            </p>
            <button onClick={openAddModal} className="btn-primary btn-md">
              <Plus className="w-4 h-4" />
              {t.budget?.addBudget || 'Set Budget'}
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                {t.budget?.setBudgetTitle || 'Set Budget'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit as any)} className="space-y-4">
              <div>
                <label className="label">{t.dashboard.category}</label>
                <select
                  className={`input-field ${errors.categoryId ? 'border-danger-500' : ''}`}
                  {...register('categoryId')}
                  disabled={availableCategories.length === 0 && !errors.categoryId?.message}
                >
                  <option value="">{t.transactions.selectCategory}</option>
                  
                  {/* If editing, show all categories. If adding, show only available ones */}
                  {(errors.categoryId?.message ? expenseCategories : (availableCategories.length > 0 ? availableCategories : expenseCategories)).map(c => (
                    <option key={c.id} value={c.id}>{getTranslated(c.name)}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-sm text-danger-500 mt-1">{errors.categoryId.message}</p>}
                {availableCategories.length === 0 && !errors.categoryId && (
                  <p className="text-sm text-warning-500 mt-1">
                    {t.budget?.allCategoriesHaveBudget || 'All expense categories already have budgets.'}
                  </p>
                )}
              </div>

              <div>
                <label className="label">{t.transactions.amountField}</label>
                <div className="relative">
                  <span className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 text-surface-400`}>
                    {currency === 'USD' ? '$' : currency === 'EUR' ? '€' : currency === 'GBP' ? '£' : 'LD'}
                  </span>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`input-field ${isRTL ? 'pr-8' : 'pl-8'} ${errors.amount ? 'border-danger-500' : ''}`}
                    {...register('amount')}
                  />
                </div>
                {errors.amount && <p className="text-sm text-danger-500 mt-1">{errors.amount.message}</p>}
              </div>

              <div className="flex gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary btn-md flex-1">
                  {t.cancel}
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary btn-md flex-1">
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />{t.transactions.saving}</>
                  ) : (
                    t.budget?.saveBudget || 'Save Budget'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
