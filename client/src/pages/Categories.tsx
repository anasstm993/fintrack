import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, X, Loader2, Pencil, Trash2, Tags, TrendingUp, TrendingDown } from 'lucide-react';
import { categoryService } from '../services/category.service';
import { useTranslation } from '../i18n';
import { getTranslatedCategory } from '../utils/i18n';
import { toast } from 'sonner';
import type { Category } from '../types';

const categorySchema = z.object({
  name: z.string().min(1, 'Category name is required').max(50),
  type: z.enum(['INCOME', 'EXPENSE']),
});

type CategoryForm = z.infer<typeof categorySchema>;

export default function Categories() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();
  const getTranslated = (name: string) => getTranslatedCategory(t, name);

  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'INCOME' | 'EXPENSE'>('ALL');

  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryForm>({
    resolver: zodResolver(categorySchema),
    defaultValues: { type: 'EXPENSE' },
  });

  const openAddModal = () => {
    setEditingCategory(null);
    reset({ name: '', type: 'EXPENSE' });
    setShowModal(true);
  };

  const openEditModal = (category: Category) => {
    setEditingCategory(category);
    reset({ name: category.name, type: category.type });
    setShowModal(true);
  };

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.invalidateQueries({ queryKey: ['transactions'] });
    queryClient.invalidateQueries({ queryKey: ['dashboard'] });
    queryClient.invalidateQueries({ queryKey: ['budget-status'] });
    queryClient.invalidateQueries({ queryKey: ['insights'] });
    queryClient.invalidateQueries({ queryKey: ['monthly-report'] });
    queryClient.invalidateQueries({ queryKey: ['summary'] });
  };

  const onSubmit = async (data: CategoryForm) => {
    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, data);
        toast.success(t.categories.categoryUpdated);
      } else {
        await categoryService.create(data);
        toast.success(t.categories.categoryCreated);
      }
      invalidateAll();
      setShowModal(false);
    } catch (err) {
      const error = err as any;
      toast.error(error.response?.data?.error || 'Failed to save category');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.categories.confirmDelete)) return;
    try {
      await categoryService.delete(id);
      invalidateAll();
      toast.success(t.categories.categoryDeleted);
    } catch (err) {
      const error = err as any;
      toast.error(error.response?.data?.error || 'Failed to delete category');
    }
  };

  const filteredCategories = categories?.filter((c) => {
    if (filterType === 'ALL') return true;
    return c.type === filterType;
  }) || [];

  const incomeCategories = filteredCategories.filter((c) => c.type === 'INCOME');
  const expenseCategories = filteredCategories.filter((c) => c.type === 'EXPENSE');

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t.categories.title}</h1>
          <p className="text-surface-500 mt-1">{t.categories.subtitle}</p>
        </div>
        <button onClick={openAddModal} className="btn-primary btn-md">
          <Plus className="w-4 h-4" />
          {t.categories.addCategory}
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['ALL', 'INCOME', 'EXPENSE'] as const).map((type) => (
          <button
            key={type}
            onClick={() => setFilterType(type)}
            className={`btn-sm rounded-lg font-medium transition-all ${
              filterType === type
                ? 'bg-primary-600 text-white shadow-sm'
                : 'bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-600'
            }`}
          >
            {type === 'ALL' ? t.all : type === 'INCOME' ? t.categories.incomeLabel : t.categories.expenseLabel}
          </button>
        ))}
      </div>

      {/* Income Categories */}
      {(filterType === 'ALL' || filterType === 'INCOME') && incomeCategories.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-success-500" />
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t.categories.incomeLabel}</h2>
            <span className="text-sm text-surface-500">({incomeCategories.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {incomeCategories.map((category, index) => (
              <div
                key={category.id}
                className="card-hover p-5 group animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-success-50 dark:bg-success-500/10 flex items-center justify-center">
                    <Tags className="w-5 h-5 text-success-500" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-white">{getTranslated(category.name)}</h3>
                <p className="text-sm text-surface-500 mt-1">
                  {category._count?.transactions || 0} {t.categories.transactions}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Expense Categories */}
      {(filterType === 'ALL' || filterType === 'EXPENSE') && expenseCategories.length > 0 && (
        <div>
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-5 h-5 text-danger-500" />
            <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t.categories.expenseLabel}</h2>
            <span className="text-sm text-surface-500">({expenseCategories.length})</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {expenseCategories.map((category, index) => (
              <div
                key={category.id}
                className="card-hover p-5 group animate-slide-up"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-danger-50 dark:bg-danger-500/10 flex items-center justify-center">
                    <Tags className="w-5 h-5 text-danger-500" />
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openEditModal(category)}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1.5 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <h3 className="font-semibold text-surface-900 dark:text-white">{getTranslated(category.name)}</h3>
                <p className="text-sm text-surface-500 mt-1">
                  {category._count?.transactions || 0} {t.categories.transactions}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {filteredCategories.length === 0 && (
        <div className="card p-12 text-center">
          <Tags className="w-12 h-12 text-surface-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{t.categories.noCategoriesFound}</h3>
          <p className="text-surface-500 mb-4">{t.categories.createFirst}</p>
          <button onClick={openAddModal} className="btn-primary btn-md">
            <Plus className="w-4 h-4" />
            {t.categories.addCategory}
          </button>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-md p-6 animate-scale-in">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                {editingCategory ? t.categories.editCategory : t.categories.addCategory}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">{t.categories.categoryName}</label>
                <input
                  type="text"
                  placeholder={t.categories.categoryPlaceholder}
                  className={`input-field ${errors.name ? 'border-danger-500' : ''}`}
                  {...register('name')}
                />
                {errors.name && <p className="text-sm text-danger-500 mt-1">{errors.name.message}</p>}
              </div>

              <div>
                <label className="label">{t.categories.typeLabel}</label>
                <select className="input-field" {...register('type')}>
                  <option value="EXPENSE">{t.categories.expenseLabel}</option>
                  <option value="INCOME">{t.categories.incomeLabel}</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary btn-md flex-1">
                  {t.cancel}
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary btn-md flex-1">
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />{t.transactions.saving}</>
                  ) : (
                    editingCategory ? t.update : t.create
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
