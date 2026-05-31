import api from './api';
import type { Category, CategoryFormData } from '../types';

export const categoryService = {
  async getAll(type?: 'INCOME' | 'EXPENSE'): Promise<Category[]> {
    const params = type ? `?type=${type}` : '';
    const response = await api.get(`/categories${params}`);
    return response.data;
  },

  async create(data: CategoryFormData): Promise<Category> {
    const response = await api.post('/categories', data);
    return response.data;
  },

  async update(id: string, data: CategoryFormData): Promise<Category> {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  async delete(id: string): Promise<void> {
    await api.delete(`/categories/${id}`);
  },
};
