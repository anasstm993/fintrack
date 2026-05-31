import { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  ArrowLeftRight,
  Tags,
  BarChart3,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Wallet,
  Bell,
  Sun,
  Moon,
  Languages,
} from 'lucide-react';
import { useAuth } from '../store/authStore';
import { useTheme } from '../store/themeStore';
import { authService } from '../services/auth.service';
import { useTranslation } from '../i18n';
import { toast } from 'sonner';

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();
  const { isDark, setTheme } = useTheme();
  const { t, language, setLanguage, isRTL } = useTranslation();
  const navigate = useNavigate();

  const navigation = [
    { name: t.nav.dashboard, href: '/dashboard', icon: LayoutDashboard },
    { name: t.nav.transactions, href: '/transactions', icon: ArrowLeftRight },
    { name: t.nav.categories, href: '/categories', icon: Tags },
    { name: t.nav.analytics, href: '/analytics', icon: BarChart3 },
    { name: t.nav.profile, href: '/profile', icon: User },
    { name: t.nav.settings, href: '/settings', icon: Settings },
  ];

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch {
      // Ignore logout API errors
    }
    logout();
    navigate('/login');
    toast.success(t.auth.loggedOut);
  };

  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 ${isRTL ? 'right-0' : 'left-0'} z-50 h-full w-72 bg-white dark:bg-surface-800 border-${isRTL ? 'l' : 'r'} border-surface-200 dark:border-surface-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          sidebarOpen
            ? 'translate-x-0'
            : isRTL
            ? 'translate-x-full'
            : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-surface-200 dark:border-surface-700">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-surface-900 dark:text-white">FinTrack</h1>
              <p className="text-xs text-surface-500">{t.appTagline}</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className={`${isRTL ? 'mr-auto' : 'ml-auto'} lg:hidden p-1 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700`}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {navigation.map((item) => (
              <NavLink
                key={item.href}
                to={item.href}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 shadow-sm'
                      : 'text-surface-600 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700/50 hover:text-surface-900 dark:hover:text-white'
                  }`
                }
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </NavLink>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-surface-200 dark:border-surface-700">
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-surface-50 dark:bg-surface-700/50">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-white truncate">
                  {user?.name || 'User'}
                </p>
                <p className="text-xs text-surface-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-2.5 mt-2 rounded-xl text-sm font-medium text-danger-500 hover:bg-danger-50 dark:hover:bg-danger-500/10 transition-all duration-200"
            >
              <LogOut className="w-5 h-5" />
              {t.nav.logout}
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={isRTL ? 'lg:pr-72' : 'lg:pl-72'}>
        {/* Top bar */}
        <header className="sticky top-0 z-30 glass border-b border-surface-200 dark:border-surface-700">
          <div className="flex items-center gap-4 px-4 lg:px-8 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors"
            >
              <Menu className="w-5 h-5 text-surface-600 dark:text-surface-400" />
            </button>

            <div className="flex-1" />

            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-all duration-200 flex items-center gap-1.5"
              title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
            >
              <Languages className="w-5 h-5 text-surface-500 dark:text-surface-400" />
              <span className="text-xs font-semibold text-surface-500 dark:text-surface-400">
                {language === 'en' ? 'AR' : 'EN'}
              </span>
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-all duration-200"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-surface-400 hover:text-yellow-400 transition-colors" />
              ) : (
                <Moon className="w-5 h-5 text-surface-500 hover:text-primary-500 transition-colors" />
              )}
            </button>

            <button className="p-2 rounded-xl hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors relative">
              <Bell className="w-5 h-5 text-surface-500 dark:text-surface-400" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full" />
            </button>

            <div className={`hidden sm:flex items-center gap-3 ${isRTL ? 'pr-4 border-r' : 'pl-4 border-l'} border-surface-200 dark:border-surface-700`}>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                {user?.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">
                {user?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
