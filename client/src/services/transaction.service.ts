import api from './api';
import type { Transaction, PaginatedResponse, TransactionFilters } from '../types';

export const transactionService = {
  async getAll(filters: TransactionFilters = {}): Promise<PaginatedResponse<Transaction>> {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.type) params.set('type', filters.type);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);
    if (filters.sortBy) params.set('sortBy', filters.sortBy);
    if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);
    if (filters.page) params.set('page', filters.page.toString());
    if (filters.limit) params.set('limit', filters.limit.toString());

    const response = await api.get(`/transactions?${params.toString()}`);
    return response.data;
  },

  async getById(id: string): Promise<Transaction> {
    const response = await api.get(`/transactions/${id}`);
    return response.data;
  },

  async create(data: any): Promise<Transaction> {
    const response = await api.post('/transactions', data);
    return response.data;
  },

  async update(id: string, data: any): Promise<Transaction> {
    const response = await api.put(`/transactions/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/transactions/${id}`);
  },

  async export(filters: TransactionFilters = {}): Promise<any[]> {
    const params = new URLSearchParams();
    if (filters.search) params.set('search', filters.search);
    if (filters.type) params.set('type', filters.type);
    if (filters.categoryId) params.set('categoryId', filters.categoryId);
    if (filters.startDate) params.set('startDate', filters.startDate);
    if (filters.endDate) params.set('endDate', filters.endDate);

    const response = await api.get(`/transactions/export?${params.toString()}`);
    return response.data;
  },
};
