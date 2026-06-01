import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, Loader2 } from 'lucide-react';
import { authService } from '../services/auth.service';
import { useAuth } from '../store/authStore';
import { useTranslation } from '../i18n';
import { toast } from 'sonner';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true);
    try {
      const response = await authService.login(data);
      login(response.user, response.accessToken, response.refreshToken);
      toast.success(t.auth.welcomeMsg);
      navigate('/dashboard');
    } catch (err) {
      const error = err as any;
      toast.error(error.response?.data?.error || 'Failed to login');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
        {t.auth.welcomeBack}
      </h2>
      <p className="text-surface-600 dark:text-surface-400 mb-8">
        {t.auth.enterCredentials}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="login-email" className="label">{t.auth.email}</label>
          <input
            id="login-email"
            type="email"
            placeholder={t.auth.emailPlaceholder}
            className={`input-field ${errors.email ? 'border-danger-500 focus:ring-danger-500' : ''}`}
            {...register('email')}
          />
          {errors.email && (
            <p className="text-sm text-danger-500 mt-1">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="login-password" className="label">{t.auth.password}</label>
          <div className="relative">
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t.auth.passwordPlaceholder}
              className={`input-field ${isRTL ? 'pl-10' : 'pr-10'} ${errors.password ? 'border-danger-500 focus:ring-danger-500' : ''}`}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors`}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && (
            <p className="text-sm text-danger-500 mt-1">{errors.password.message}</p>
          )}
        </div>

        <div className="flex items-center justify-between">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              className="w-4 h-4 rounded border-surface-300 text-primary-600 focus:ring-primary-500"
            />
            <span className="text-sm text-surface-600 dark:text-surface-400">{t.auth.rememberMe}</span>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary btn-md w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              {t.auth.signingIn}
            </>
          ) : (
            t.auth.signIn
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-600 dark:text-surface-400">
        {t.auth.noAccount}{' '}
        <Link to="/register" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
          {t.auth.createLink}
        </Link>
      </p>
    </div>
  );
}
