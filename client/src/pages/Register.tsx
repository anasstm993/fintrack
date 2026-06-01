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

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const { t, isRTL } = useTranslation();

  const {
    register: registerField,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true);
    try {
      const response = await authService.register(data);
      login(response.user, response.accessToken, response.refreshToken);
      toast.success(t.auth.accountCreated);
      navigate('/dashboard');
    } catch (err) {
      const error = err as any;
      toast.error(error.response?.data?.error || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="animate-fade-in">
      <h2 className="text-2xl font-bold text-surface-900 dark:text-white mb-2">
        {t.auth.createAccount}
      </h2>
      <p className="text-surface-600 dark:text-surface-400 mb-8">
        {t.auth.startManaging}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        <div>
          <label htmlFor="register-name" className="label">{t.auth.fullName}</label>
          <input
            id="register-name"
            type="text"
            placeholder={t.auth.namePlaceholder}
            className={`input-field ${errors.name ? 'border-danger-500 focus:ring-danger-500' : ''}`}
            {...registerField('name')}
          />
          {errors.name && <p className="text-sm text-danger-500 mt-1">{errors.name.message}</p>}
        </div>

        <div>
          <label htmlFor="register-email" className="label">{t.auth.email}</label>
          <input
            id="register-email"
            type="email"
            placeholder={t.auth.emailPlaceholder}
            className={`input-field ${errors.email ? 'border-danger-500 focus:ring-danger-500' : ''}`}
            {...registerField('email')}
          />
          {errors.email && <p className="text-sm text-danger-500 mt-1">{errors.email.message}</p>}
        </div>

        <div>
          <label htmlFor="register-password" className="label">{t.auth.password}</label>
          <div className="relative">
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              placeholder={t.auth.passwordMinChars}
              className={`input-field ${isRTL ? 'pl-10' : 'pr-10'} ${errors.password ? 'border-danger-500 focus:ring-danger-500' : ''}`}
              {...registerField('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className={`absolute ${isRTL ? 'left-3' : 'right-3'} top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600 transition-colors`}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {errors.password && <p className="text-sm text-danger-500 mt-1">{errors.password.message}</p>}
        </div>

        <div>
          <label htmlFor="register-confirm" className="label">{t.auth.confirmPassword}</label>
          <input
            id="register-confirm"
            type="password"
            placeholder={t.auth.confirmPlaceholder}
            className={`input-field ${errors.confirmPassword ? 'border-danger-500 focus:ring-danger-500' : ''}`}
            {...registerField('confirmPassword')}
          />
          {errors.confirmPassword && <p className="text-sm text-danger-500 mt-1">{errors.confirmPassword.message}</p>}
        </div>

        <button type="submit" disabled={isLoading} className="btn-primary btn-md w-full">
          {isLoading ? (
            <><Loader2 className="w-4 h-4 animate-spin" />{t.auth.creatingAccount}</>
          ) : (
            t.auth.createBtn
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-surface-600 dark:text-surface-400">
        {t.auth.hasAccount}{' '}
        <Link to="/login" className="text-primary-600 dark:text-primary-400 font-medium hover:underline">
          {t.auth.signInLink}
        </Link>
      </p>
    </div>
  );
}
