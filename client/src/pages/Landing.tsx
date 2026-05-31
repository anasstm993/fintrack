import { Link } from 'react-router-dom';
import {
  Wallet, ArrowRight, BarChart3, TrendingUp, Tags,
  Download, Moon, Shield, Star, ChevronRight, Languages,
} from 'lucide-react';
import { useTranslation } from '../i18n';

export default function Landing() {
  const { t, language, setLanguage, isRTL } = useTranslation();

  const features = [
    { icon: TrendingUp, title: t.landing.feature1Title, description: t.landing.feature1Desc, iconColor: 'text-red-500', bg: 'bg-red-50 dark:bg-red-500/10' },
    { icon: Wallet, title: t.landing.feature2Title, description: t.landing.feature2Desc, iconColor: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-500/10' },
    { icon: BarChart3, title: t.landing.feature3Title, description: t.landing.feature3Desc, iconColor: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-500/10' },
    { icon: Tags, title: t.landing.feature4Title, description: t.landing.feature4Desc, iconColor: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-500/10' },
    { icon: Download, title: t.landing.feature5Title, description: t.landing.feature5Desc, iconColor: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-500/10' },
    { icon: Moon, title: t.landing.feature6Title, description: t.landing.feature6Desc, iconColor: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-500/10' },
  ];

  const testimonials = [
    { name: isRTL ? 'سارة جونسون' : 'Sarah Johnson', role: isRTL ? 'مصممة حرة' : 'Freelance Designer', content: t.landing.testimonial1, rating: 5 },
    { name: isRTL ? 'مايكل تشن' : 'Michael Chen', role: isRTL ? 'مهندس برمجيات' : 'Software Engineer', content: t.landing.testimonial2, rating: 5 },
    { name: isRTL ? 'إيميلي رودريغيز' : 'Emily Rodriguez', role: isRTL ? 'صاحبة مشروع صغير' : 'Small Business Owner', content: t.landing.testimonial3, rating: 5 },
  ];

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-900">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-surface-200 dark:border-surface-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center shadow-lg shadow-primary-500/25">
                <Wallet className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-surface-900 dark:text-white">FinTrack</span>
            </div>

            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {t.landing.footerFeatures}
              </a>
              <a href="#testimonials" className="text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                {t.landing.testimonialsTitle}
              </a>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
                className="btn-ghost btn-sm flex items-center gap-1"
                title={language === 'en' ? 'التبديل إلى العربية' : 'Switch to English'}
              >
                <Languages className="w-4 h-4" />
                <span className="text-xs font-bold">{language === 'en' ? 'AR' : 'EN'}</span>
              </button>
              <Link to="/login" className="btn-ghost btn-sm">
                {t.landing.login}
              </Link>
              <Link to="/register" className="btn-primary btn-sm">
                {t.landing.getStarted}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 dark:bg-primary-500/10 text-primary-600 dark:text-primary-400 text-sm font-medium mb-8 animate-fade-in">
            <Shield className="w-4 h-4" />
            {t.landing.heroTag}
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-surface-900 dark:text-white leading-tight mb-6 animate-slide-up">
            {t.landing.heroTitle1}{' '}
            <span className="gradient-text">{t.landing.heroTitle2}</span>
          </h1>

          <p className="text-lg sm:text-xl text-surface-600 dark:text-surface-400 max-w-2xl mx-auto mb-10 animate-slide-up" style={{ animationDelay: '0.1s' }}>
            {t.landing.heroSubtitle}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <Link to="/register" className="btn-primary btn-lg text-base w-full sm:w-auto">
              {t.landing.ctaPrimary}
              <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </Link>
            <a href="#features" className="btn-secondary btn-lg text-base w-full sm:w-auto">
              {t.landing.ctaSecondary}
              <ChevronRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
            </a>
          </div>

          {/* Dashboard preview mock */}
          <div className="mt-16 lg:mt-24 animate-slide-up" style={{ animationDelay: '0.3s' }}>
            <div className="relative max-w-5xl mx-auto">
              <div className="absolute inset-0 bg-gradient-to-t from-surface-50 dark:from-surface-900 to-transparent z-10 pointer-events-none h-full" />
              <div className="card p-4 lg:p-6 shadow-2xl shadow-primary-500/10">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 mb-4">
                  {[
                    { label: isRTL ? 'الرصيد' : 'Balance', value: '$12,450', color: 'text-primary-600' },
                    { label: isRTL ? 'الدخل' : 'Income', value: '$8,200', color: 'text-success-500' },
                    { label: isRTL ? 'المصروفات' : 'Expenses', value: '$3,750', color: 'text-danger-500' },
                    { label: isRTL ? 'التوفير' : 'Savings', value: '54.3%', color: 'text-purple-500' },
                  ].map((stat) => (
                    <div key={stat.label} className="bg-surface-50 dark:bg-surface-700/50 rounded-xl p-3 lg:p-4">
                      <p className="text-xs text-surface-500 mb-1">{stat.label}</p>
                      <p className={`text-lg lg:text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                  ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-3 lg:gap-4">
                  <div className="lg:col-span-2 bg-surface-50 dark:bg-surface-700/50 rounded-xl p-4 h-40 flex items-center justify-center">
                    <div className="flex items-end gap-2 h-24">
                      {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 50].map((h, i) => (
                        <div key={i} className="w-4 lg:w-6 rounded-t-md bg-gradient-to-t from-primary-600 to-primary-400" style={{ height: `${h}%` }} />
                      ))}
                    </div>
                  </div>
                  <div className="bg-surface-50 dark:bg-surface-700/50 rounded-xl p-4 h-40 flex items-center justify-center">
                    <div className="w-24 h-24 rounded-full border-8 border-primary-500 border-t-success-500 border-r-danger-500" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 lg:py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mb-4">
              {t.landing.featuresTitle}
            </h2>
            <p className="text-lg text-surface-600 dark:text-surface-400 max-w-2xl mx-auto">
              {t.landing.featuresSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <div key={feature.title} className="card-hover p-6 group animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className={`w-12 h-12 rounded-xl ${feature.bg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className={`w-6 h-6 ${feature.iconColor}`} />
                </div>
                <h3 className="text-lg font-semibold text-surface-900 dark:text-white mb-2">{feature.title}</h3>
                <p className="text-surface-600 dark:text-surface-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="py-20 lg:py-32 bg-surface-100/50 dark:bg-surface-800/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mb-4">{t.landing.testimonialsTitle}</h2>
            <p className="text-lg text-surface-600 dark:text-surface-400">{t.landing.testimonialsSubtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((testimonial, index) => (
              <div key={testimonial.name} className="card p-6 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: testimonial.rating }).map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="text-surface-700 dark:text-surface-300 text-sm leading-relaxed mb-6">"{testimonial.content}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-sm font-semibold">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-surface-900 dark:text-white">{testimonial.name}</p>
                    <p className="text-xs text-surface-500">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-surface-900 dark:text-white mb-4">{t.landing.ctaTitle}</h2>
          <p className="text-lg text-surface-600 dark:text-surface-400 mb-8">{t.landing.ctaSubtitle}</p>
          <Link to="/register" className="btn-primary btn-lg text-base">
            {t.landing.ctaButton}
            <ArrowRight className={`w-5 h-5 ${isRTL ? 'rotate-180' : ''}`} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-surface-200 dark:border-surface-700 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-surface-900 dark:text-white">FinTrack</span>
            </div>
            <div className="flex items-center gap-8">
              <a href="#" className="text-sm text-surface-600 dark:text-surface-400 hover:text-primary-600 transition-colors">{t.landing.footerHome}</a>
              <a href="#features" className="text-sm text-surface-600 dark:text-surface-400 hover:text-primary-600 transition-colors">{t.landing.footerFeatures}</a>
              <a href="#" className="text-sm text-surface-600 dark:text-surface-400 hover:text-primary-600 transition-colors">{t.landing.footerPricing}</a>
              <a href="#" className="text-sm text-surface-600 dark:text-surface-400 hover:text-primary-600 transition-colors">{t.landing.footerContact}</a>
            </div>
            <p className="text-sm text-surface-500">{t.landing.footerCopy}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
