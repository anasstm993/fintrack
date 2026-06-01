import { Sun, Moon, Monitor, DollarSign, Languages } from 'lucide-react';
import { useTheme } from '../store/themeStore';
import { useSettings } from '../store/settingsStore';
import { useTranslation } from '../i18n';
import type { ThemeMode, Currency } from '../types';

export default function Settings() {
  const { theme, setTheme } = useTheme();
  const { currency, setCurrency } = useSettings();
  const { t, language, setLanguage, isRTL } = useTranslation();

  const themes: { value: ThemeMode; label: string; icon: typeof Sun }[] = [
    { value: 'light', label: t.settings.light, icon: Sun },
    { value: 'dark', label: t.settings.dark, icon: Moon },
    { value: 'system', label: t.settings.system, icon: Monitor },
  ];

  const currencies: { value: Currency; label: string; symbol: string }[] = [
    { value: 'USD', label: t.settings.usDollar, symbol: '$' },
    { value: 'EUR', label: t.settings.euro, symbol: '€' },
    { value: 'GBP', label: t.settings.britishPound, symbol: '£' },
    { value: 'LYD', label: t.settings.libyanDinar, symbol: 'LD' },
  ];

  const languages = [
    { value: 'en' as const, label: t.settings.english, nativeLabel: 'English', flag: '🇬🇧' },
    { value: 'ar' as const, label: t.settings.arabic, nativeLabel: 'العربية', flag: '🇱🇾' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t.settings.title}</h1>
        <p className="text-surface-500 mt-1">{t.settings.subtitle}</p>
      </div>

      {/* Language */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Languages className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t.settings.language}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setLanguage(lang.value)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                language === lang.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                  : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
              }`}
            >
              <span className="text-2xl">{lang.flag}</span>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className={`text-sm font-medium ${language === lang.value ? 'text-primary-600' : 'text-surface-900 dark:text-white'}`}>
                  {lang.nativeLabel}
                </p>
                <p className="text-xs text-surface-500">{lang.label}</p>
              </div>
              {language === lang.value && (
                <span className={`${isRTL ? 'mr-auto' : 'ml-auto'} text-xs font-medium px-2 py-1 rounded-full bg-primary-100 dark:bg-primary-500/20 text-primary-600 dark:text-primary-400`}>
                  {t.active}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Appearance */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Sun className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t.settings.appearance}</h2>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {themes.map((th) => (
            <button
              key={th.value}
              onClick={() => setTheme(th.value)}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all duration-200 ${
                theme === th.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                  : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
              }`}
            >
              <th.icon className={`w-6 h-6 ${theme === th.value ? 'text-primary-600' : 'text-surface-400'}`} />
              <span className={`text-sm font-medium ${theme === th.value ? 'text-primary-600' : 'text-surface-600 dark:text-surface-400'}`}>
                {th.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Currency */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <DollarSign className="w-5 h-5 text-primary-600" />
          <h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t.settings.currency}</h2>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {currencies.map((c) => (
            <button
              key={c.value}
              onClick={() => setCurrency(c.value)}
              className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 ${
                currency === c.value
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-500/10'
                  : 'border-surface-200 dark:border-surface-700 hover:border-surface-300 dark:hover:border-surface-600'
              }`}
            >
              <span className={`text-lg font-bold ${currency === c.value ? 'text-primary-600' : 'text-surface-400'}`}>
                {c.symbol}
              </span>
              <div className={isRTL ? 'text-right' : 'text-left'}>
                <p className={`text-sm font-medium ${currency === c.value ? 'text-primary-600' : 'text-surface-900 dark:text-white'}`}>
                  {c.value}
                </p>
                <p className="text-xs text-surface-500">{c.label}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
