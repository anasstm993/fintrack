import api from './api';
import type { AuthResponse, TokenRefreshResponse } from '../types';

export const authService = {
  async register(data: { name: string; email: string; password: string; confirmPassword: string }): Promise<AuthResponse> {
    const response = await api.post('/auth/register', data);
    return response.data;
  },

  async login(data: { email: string; password: string }): Promise<AuthResponse> {
    const response = await api.post('/auth/login', data);
    return response.data;
  },

  async refresh(refreshToken: string): Promise<TokenRefreshResponse> {
    const response = await api.post('/auth/refresh', { refreshToken });
    return response.data;
  },

  async logout(): Promise<void> {
    const refreshToken = localStorage.getItem('refreshToken');
    await api.post('/auth/logout', { refreshToken });
  },
};
