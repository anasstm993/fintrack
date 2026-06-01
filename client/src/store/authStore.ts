import { create } from 'zustand';
import type { User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (user: User, accessToken: string, refreshToken: string) => void;
  logout: () => void;
  updateUser: (user: User) => void;
  initialize: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: true,

  login: (user, accessToken, refreshToken) => {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    set({ user, accessToken, refreshToken, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    localStorage.removeItem('user');
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
  },

  updateUser: (user) => {
    localStorage.setItem('user', JSON.stringify(user));
    set({ user });
  },

  initialize: () => {
    const storedUser = localStorage.getItem('user');
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');

    if (storedUser && accessToken && refreshToken) {
      try {
        const user = JSON.parse(storedUser);
        set({
          user,
          accessToken,
          refreshToken,
          isAuthenticated: true,
          isLoading: false,
        });
      } catch {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
