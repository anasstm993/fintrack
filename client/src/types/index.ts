export interface User {
  id: string;
  name: string;
  email: string;
  avatar: string | null;
  createdAt: string;
  updatedAt?: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string | null;
  userId: string;
  createdAt: string;
  _count?: {
    transactions: number;
  };
}

export interface Transaction {
  id: string;
  title: string;
  description?: string | null;
  amount: number | string;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  category: {
    id: string;
    name: string;
    type: string;
    icon?: string | null;
  };
  userId: string;
  date: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  user: User;
  accessToken: string;
  refreshToken: string;
}

export interface TokenRefreshResponse {
  accessToken: string;
  refreshToken: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardData {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  savingsRate: number;
  recentTransactions: Transaction[];
  expenseByCategory: CategoryBreakdown[];
  monthlyChart: MonthlyChartData[];
}

export interface CategoryBreakdown {
  categoryId: string;
  categoryName: string;
  amount: number;
  percentage: number;
}

export interface MonthlyChartData {
  month: string;
  income: number;
  expense: number;
}

export interface MonthlyReport {
  year: number;
  month: number;
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  expenseByCategory: CategoryBreakdown[];
  dailyChart: DailyChartData[];
}

export interface DailyChartData {
  date: string;
  income: number;
  expense: number;
}

export interface TransactionFilters {
  search?: string;
  type?: 'INCOME' | 'EXPENSE' | '';
  categoryId?: string;
  startDate?: string;
  endDate?: string;
  sortBy?: 'date' | 'amount' | 'title';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface TransactionFormData {
  title: string;
  description?: string;
  amount: number;
  type: 'INCOME' | 'EXPENSE';
  categoryId: string;
  date: string;
}

export interface CategoryFormData {
  name: string;
  type: 'INCOME' | 'EXPENSE';
  icon?: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type Currency = 'USD' | 'EUR' | 'GBP' | 'LYD';

export interface Insight {
  type: 'warning' | 'info' | 'success' | 'danger';
  message: string;
  key: string;
  data?: { categoryName?: string };
}

export interface FinancialSummary {
  allTime: { totalIncome: number; totalExpenses: number; balance: number };
  thisMonth: { income: number; expenses: number; balance: number };
  lastMonth: { income: number; expenses: number; balance: number };
  changes: { incomeChange: number; expenseChange: number };
  transactionCount: number;
}

export interface BudgetStatus {
  id: string;
  categoryId: string;
  categoryName: string;
  budgetAmount: number;
  spent: number;
  remaining: number;
  percentage: number;
  status: 'safe' | 'warning' | 'danger' | 'exceeded';
}

export interface Budget {
  id: string;
  amount: number;
  categoryId: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  category?: {
    id: string;
    name: string;
    type: string;
    icon?: string | null;
  };
}

/** Shape of a single row returned by the transaction export API. */
export interface ExportedTransaction {
  Date: string;
  Title: string;
  Description: string;
  Category: string;
  Type: string;
  Amount: string;
}

/** Response shape from the insights API endpoint. */
export interface InsightsResponse {
  insights: Insight[];
  data: {
    currentIncome: number;
    currentExpenses: number;
    prevIncome: number;
    prevExpenses: number;
    currentSavingsRate: number;
    prevSavingsRate: number;
    savingsRateChange: number;
    topCategoryName: string;
    topCategoryAmount: number;
    expenseChange: number;
  };
}
