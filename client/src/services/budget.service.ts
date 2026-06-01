import api from './api';
import type { Budget } from '../types';

export const budgetService = {
  async getAll(): Promise<Budget[]> {
    const response = await api.get('/budgets');
    return response.data;
  },

  async set(categoryId: string, amount: number): Promise<Budget> {
    const response = await api.post('/budgets', { categoryId, amount });
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/budgets/${id}`);
  },
};
