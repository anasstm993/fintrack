import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Plus, Search, Filter, Download, X, Loader2,
  ArrowUpRight, ArrowDownRight, Pencil, Trash2,
  ChevronLeft, ChevronRight, FileSpreadsheet, FileText,
} from 'lucide-react';
import { transactionService } from '../services/transaction.service';
import { categoryService } from '../services/category.service';
import { useSettings } from '../store/settingsStore';
import { useTranslation } from '../i18n';
import { formatCurrency, formatDate } from '../utils/currency';
import { useDebounce } from '../hooks/useDebounce';
import { toast } from 'sonner';
import * as XLSX from 'xlsx';
import type { TransactionFilters, Transaction } from '../types';

const transactionSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  amount: z.coerce.number().positive('Amount must be positive'),
  type: z.enum(['INCOME', 'EXPENSE']),
  categoryId: z.string().min(1, 'Category is required'),
  date: z.string().min(1, 'Date is required'),
});

type TransactionForm = z.infer<typeof transactionSchema>;

export default function Transactions() {
  const { currency } = useSettings();
  const queryClient = useQueryClient();
  const { t, isRTL } = useTranslation();

  const [showModal, setShowModal] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);

  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    limit: 10,
    sortBy: 'date',
    sortOrder: 'desc',
  });

  const { data: categories } = useQuery({
    queryKey: ['categories'],
    queryFn: () => categoryService.getAll(),
  });

  const { data: transactionsData, isLoading } = useQuery({
    queryKey: ['transactions', { ...filters, search: debouncedSearch }],
    queryFn: () => transactionService.getAll({ ...filters, search: debouncedSearch }),
  });

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<TransactionForm>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: 'EXPENSE',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const selectedType = watch('type');

  const filteredCategories = categories?.filter((c) => c.type === selectedType) || [];

  const openAddModal = () => {
    setEditingTransaction(null);
    reset({
      title: '',
      description: '',
      amount: undefined as any,
      type: 'EXPENSE',
      categoryId: '',
      date: new Date().toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const openEditModal = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    reset({
      title: transaction.title,
      description: transaction.description || '',
      amount: Number(transaction.amount),
      type: transaction.type,
      categoryId: transaction.categoryId,
      date: new Date(transaction.date).toISOString().split('T')[0],
    });
    setShowModal(true);
  };

  const onSubmit = async (data: TransactionForm) => {
    try {
      if (editingTransaction) {
        await transactionService.update(editingTransaction.id, data);
        toast.success(t.transactions.transactionUpdated);
      } else {
        await transactionService.create(data);
        toast.success(t.transactions.transactionAdded);
      }
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      setShowModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to save transaction');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t.transactions.confirmDelete)) return;
    try {
      await transactionService.delete(id);
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      toast.success(t.transactions.transactionDeleted);
    } catch {
      toast.error('Failed to delete transaction');
    }
  };

  const exportData = async (format: 'csv' | 'excel') => {
    try {
      const data = await transactionService.export(filters);
      if (data.length === 0) {
        toast.error(t.transactions.noDataExport);
        return;
      }

      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Transactions');

      if (format === 'csv') {
        XLSX.writeFile(wb, 'transactions.csv');
      } else {
        XLSX.writeFile(wb, 'transactions.xlsx');
      }
      toast.success(`${t.transactions.exportedAs} ${format.toUpperCase()}`);
    } catch {
      toast.error('Failed to export data');
    }
  };

  const pagination = transactionsData?.pagination;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t.transactions.title}</h1>
          <p className="text-surface-500 mt-1">{t.transactions.subtitle}</p>
        </div>
        <button onClick={openAddModal} className="btn-primary btn-md">
          <Plus className="w-4 h-4" />
          {t.transactions.addTransaction}
        </button>
      </div>

      {/* Search and Filters */}
      <div className="card p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              placeholder={t.transactions.searchPlaceholder}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className={`input-field ${isRTL ? 'pr-10' : 'pl-10'}`}
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`btn-secondary btn-md ${showFilters ? 'ring-2 ring-primary-500' : ''}`}
          >
            <Filter className="w-4 h-4" />
            {t.filter}
          </button>
          <div className="flex gap-2">
            <button onClick={() => exportData('csv')} className="btn-secondary btn-md" title="Export CSV">
              <FileText className="w-4 h-4" />
              CSV
            </button>
            <button onClick={() => exportData('excel')} className="btn-secondary btn-md" title="Export Excel">
              <FileSpreadsheet className="w-4 h-4" />
              Excel
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-4 pt-4 border-t border-surface-200 dark:border-surface-700 animate-slide-up">
            <div>
              <label className="label">{t.dashboard.type}</label>
              <select
                value={filters.type || ''}
                onChange={(e) => setFilters((f) => ({ ...f, type: e.target.value as any, page: 1 }))}
                className="input-field"
              >
                <option value="">{t.transactions.allTypes}</option>
                <option value="INCOME">{t.transactions.income}</option>
                <option value="EXPENSE">{t.transactions.expense}</option>
              </select>
            </div>
            <div>
              <label className="label">{t.dashboard.category}</label>
              <select
                value={filters.categoryId || ''}
                onChange={(e) => setFilters((f) => ({ ...f, categoryId: e.target.value, page: 1 }))}
                className="input-field"
              >
                <option value="">{t.transactions.allCategories}</option>
                {categories?.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">{t.transactions.startDate}</label>
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => setFilters((f) => ({ ...f, startDate: e.target.value, page: 1 }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">{t.transactions.endDate}</label>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => setFilters((f) => ({ ...f, endDate: e.target.value, page: 1 }))}
                className="input-field"
              />
            </div>
            <div>
              <label className="label">{t.transactions.sortBy}</label>
              <select
                value={`${filters.sortBy}-${filters.sortOrder}`}
                onChange={(e) => {
                  const [sortBy, sortOrder] = e.target.value.split('-');
                  setFilters((f) => ({ ...f, sortBy: sortBy as any, sortOrder: sortOrder as any }));
                }}
                className="input-field"
              >
                <option value="date-desc">{t.transactions.newestFirst}</option>
                <option value="date-asc">{t.transactions.oldestFirst}</option>
                <option value="amount-desc">{t.transactions.highestAmount}</option>
                <option value="amount-asc">{t.transactions.lowestAmount}</option>
              </select>
            </div>
            <div className="flex items-end">
              <button
                onClick={() => setFilters({ page: 1, limit: 10, sortBy: 'date', sortOrder: 'desc' })}
                className="btn-ghost btn-md w-full"
              >
                {t.clearFilters}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Transactions Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin" />
          </div>
        ) : (
          <>
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
                  {transactionsData?.data?.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-surface-500">
                        {t.transactions.noTransactions}
                      </td>
                    </tr>
                  )}
                  {transactionsData?.data?.map((tx) => (
                    <tr key={tx.id} className="hover:bg-surface-50 dark:hover:bg-surface-700/30 transition-colors">
                      <td className="px-6 py-4 text-sm text-surface-600 dark:text-surface-400 whitespace-nowrap">
                        {formatDate(tx.date)}
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-medium text-surface-900 dark:text-white">{tx.title}</p>
                        {tx.description && (
                          <p className="text-xs text-surface-500 mt-0.5 truncate max-w-xs">{tx.description}</p>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-medium bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300">
                          {tx.category?.name}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`text-sm font-semibold ${tx.type === 'INCOME' ? 'text-success-500' : 'text-danger-500'}`}>
                          {tx.type === 'INCOME' ? '+' : '-'}{formatCurrency(tx.amount, currency)}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium ${
                          tx.type === 'INCOME'
                            ? 'bg-success-50 dark:bg-success-500/10 text-success-600 dark:text-success-400'
                            : 'bg-danger-50 dark:bg-danger-500/10 text-danger-600 dark:text-danger-400'
                        }`}>
                          {tx.type === 'INCOME' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                          {tx.type === 'INCOME' ? t.transactions.income : t.transactions.expense}
                        </span>
                      </td>
                      <td className={`px-6 py-4 text-${isRTL ? 'left' : 'right'}`}>
                        <div className={`flex items-center ${isRTL ? 'justify-start' : 'justify-end'} gap-1`}>
                          <button
                            onClick={() => openEditModal(tx)}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-500/10 transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(tx.id)}
                            className="p-1.5 rounded-lg text-surface-400 hover:text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-between px-6 py-4 border-t border-surface-200 dark:border-surface-700">
                <p className="text-sm text-surface-500">
                  {t.transactions.showing} {((pagination.page - 1) * pagination.limit) + 1} {t.transactions.to}{' '}
                  {Math.min(pagination.page * pagination.limit, pagination.total)} {t.transactions.of}{' '}
                  {pagination.total} {t.transactions.results}
                </p>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) - 1 }))}
                    disabled={pagination.page <= 1}
                    className="btn-secondary btn-sm"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="text-sm text-surface-600 dark:text-surface-400 px-3">
                    {pagination.page} / {pagination.totalPages}
                  </span>
                  <button
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page || 1) + 1 }))}
                    disabled={pagination.page >= pagination.totalPages}
                    className="btn-secondary btn-sm"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="card w-full max-w-lg p-6 animate-scale-in max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-surface-900 dark:text-white">
                {editingTransaction ? t.transactions.editTransaction : t.transactions.addTransaction}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-surface-100 dark:bg-surface-700">
                <button
                  type="button"
                  onClick={() => { setValue('type', 'EXPENSE'); setValue('categoryId', ''); }}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedType === 'EXPENSE'
                      ? 'bg-white dark:bg-surface-600 text-danger-500 shadow-sm'
                      : 'text-surface-500 hover:text-surface-700'
                  }`}
                >
                  {t.transactions.expense}
                </button>
                <button
                  type="button"
                  onClick={() => { setValue('type', 'INCOME'); setValue('categoryId', ''); }}
                  className={`py-2 rounded-lg text-sm font-medium transition-all ${
                    selectedType === 'INCOME'
                      ? 'bg-white dark:bg-surface-600 text-success-500 shadow-sm'
                      : 'text-surface-500 hover:text-surface-700'
                  }`}
                >
                  {t.transactions.income}
                </button>
              </div>

              <div>
                <label className="label">{t.transactions.titleField}</label>
                <input
                  type="text"
                  placeholder={t.transactions.titlePlaceholder}
                  className={`input-field ${errors.title ? 'border-danger-500' : ''}`}
                  {...register('title')}
                />
                {errors.title && <p className="text-sm text-danger-500 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="label">{t.transactions.descriptionField}</label>
                <input
                  type="text"
                  placeholder={t.transactions.descriptionPlaceholder}
                  className="input-field"
                  {...register('description')}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">{t.transactions.amountField}</label>
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    className={`input-field ${errors.amount ? 'border-danger-500' : ''}`}
                    {...register('amount')}
                  />
                  {errors.amount && <p className="text-sm text-danger-500 mt-1">{errors.amount.message}</p>}
                </div>
                <div>
                  <label className="label">{t.transactions.dateField}</label>
                  <input
                    type="date"
                    className={`input-field ${errors.date ? 'border-danger-500' : ''}`}
                    {...register('date')}
                  />
                  {errors.date && <p className="text-sm text-danger-500 mt-1">{errors.date.message}</p>}
                </div>
              </div>

              <div>
                <label className="label">{t.transactions.categoryField}</label>
                <select
                  className={`input-field ${errors.categoryId ? 'border-danger-500' : ''}`}
                  {...register('categoryId')}
                >
                  <option value="">{t.transactions.selectCategory}</option>
                  {filteredCategories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                {errors.categoryId && <p className="text-sm text-danger-500 mt-1">{errors.categoryId.message}</p>}
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setShowModal(false)} className="btn-secondary btn-md flex-1">
                  {t.cancel}
                </button>
                <button type="submit" disabled={isSubmitting} className="btn-primary btn-md flex-1">
                  {isSubmitting ? (
                    <><Loader2 className="w-4 h-4 animate-spin" />{t.transactions.saving}</>
                  ) : (
                    editingTransaction ? t.update : t.transactions.addTransaction
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
