import { create } from 'zustand';
import type { Currency } from '../types';

interface SettingsState {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

export const useSettings = create<SettingsState>((set) => ({
  currency: (localStorage.getItem('currency') as Currency) || 'USD',
  setCurrency: (currency) => {
    localStorage.setItem('currency', currency);
    set({ currency });
  },
}));
