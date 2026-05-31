import { Outlet, Link } from 'react-router-dom';
import { Wallet } from 'lucide-react';
import { useTranslation } from '../i18n';

export default function AuthLayout() {
  const { t, isRTL } = useTranslation();

  return (
    <div className={`min-h-screen flex ${isRTL ? 'flex-row-reverse' : ''} bg-surface-50 dark:bg-surface-900`}>
      {/* Left side - branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 via-primary-700 to-primary-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-20 w-72 h-72 bg-white/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-20 w-96 h-96 bg-primary-400/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/5 rounded-full blur-2xl" />
        </div>
        <div className="relative z-10 flex flex-col justify-center px-16">
          <div className="flex items-center gap-3 mb-8">
            <div className="w-12 h-12 rounded-xl bg-white/20 backdrop-blur flex items-center justify-center">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">FinTrack</h1>
          </div>
          <h2 className="text-4xl font-bold text-white leading-tight mb-4">
            {t.landing.heroTitle1}<br />{t.landing.heroTitle2}
          </h2>
          <p className="text-lg text-primary-100 max-w-md">
            {t.landing.heroSubtitle}
          </p>
          <div className="flex gap-8 mt-12">
            <div>
              <p className="text-3xl font-bold text-white">50K+</p>
              <p className="text-sm text-primary-200">{t.landing.activeUsers}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">$2M+</p>
              <p className="text-sm text-primary-200">{t.landing.trackedMonthly}</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-white">99.9%</p>
              <p className="text-sm text-primary-200">{t.landing.uptime}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
              <Wallet className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-surface-900 dark:text-white">FinTrack</h1>
          </Link>
          <Outlet />
        </div>
      </div>
    </div>
  );
}
