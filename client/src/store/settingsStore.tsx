import { createContext, useContext, useState, type ReactNode } from 'react';
import type { Currency } from '../types';

interface SettingsContextType {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>(() => {
    const stored = localStorage.getItem('currency') as Currency;
    return stored || 'USD';
  });

  const setCurrency = (newCurrency: Currency) => {
    setCurrencyState(newCurrency);
    localStorage.setItem('currency', newCurrency);
  };

  return (
    <SettingsContext.Provider value={{ currency, setCurrency }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
