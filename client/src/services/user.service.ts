import api from './api';
import type { User } from '../types';

export const userService = {
  async getMe(): Promise<User> {
    const response = await api.get('/users/me');
    return response.data;
  },

  async updateProfile(data: { name?: string; email?: string }): Promise<User> {
    const response = await api.put('/users/me', data);
    return response.data;
  },

  async changePassword(data: { currentPassword: string; newPassword: string; confirmPassword: string }): Promise<void> {
    await api.put('/users/password', data);
  },

  async updateAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append('avatar', file);
    const response = await api.put('/users/avatar', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },
};
