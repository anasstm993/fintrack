import api from './api';
import type { DashboardData, MonthlyReport } from '../types';

export const analyticsService = {
  async getDashboard(): Promise<DashboardData> {
    const response = await api.get('/analytics/dashboard');
    return response.data;
  },

  async getMonthlyReport(year?: number, month?: number): Promise<MonthlyReport> {
    const params = new URLSearchParams();
    if (year) params.set('year', year.toString());
    if (month) params.set('month', month.toString());
    const response = await api.get(`/analytics/monthly?${params.toString()}`);
    return response.data;
  },
};
