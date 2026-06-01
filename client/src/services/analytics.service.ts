import api from './api';
import type { DashboardData, MonthlyReport, InsightsResponse, FinancialSummary, BudgetStatus } from '../types';

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

  async getInsights(): Promise<InsightsResponse> {
    const response = await api.get('/analytics/insights');
    return response.data;
  },

  async getSummary(): Promise<FinancialSummary> {
    const response = await api.get('/analytics/summary');
    return response.data;
  },

  async getBudgetStatus(): Promise<BudgetStatus[]> {
    const response = await api.get('/analytics/budget-status');
    return response.data;
  },
};
