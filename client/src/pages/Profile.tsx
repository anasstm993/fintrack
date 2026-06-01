import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Camera, Loader2, User, Lock } from 'lucide-react';
import { useAuth } from '../store/authStore';
import { userService } from '../services/user.service';
import { useTranslation } from '../i18n';
import { toast } from 'sonner';

const profileSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email'),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine(d => d.newPassword === d.confirmPassword, { message: 'Passwords do not match', path: ['confirmPassword'] });

type ProfileForm = z.infer<typeof profileSchema>;
type PasswordForm = z.infer<typeof passwordSchema>;

export default function Profile() {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();
  const [avatarLoading, setAvatarLoading] = useState(false);

  const { register: regProfile, handleSubmit: handleProfile, formState: { errors: profileErrors, isSubmitting: profileSubmitting } } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: user?.name || '', email: user?.email || '' },
  });

  const { register: regPassword, handleSubmit: handlePassword, reset: resetPassword, formState: { errors: passwordErrors, isSubmitting: passwordSubmitting } } = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
  });

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      const updated = await userService.updateProfile(data);
      updateUser(updated);
      toast.success(t.profile.profileUpdated);
    } catch (err) {
      const error = err as any;
      toast.error(error.response?.data?.error || 'Failed to update profile');
    }
  };

  const onPasswordSubmit = async (data: PasswordForm) => {
    try {
      await userService.changePassword(data);
      resetPassword();
      toast.success(t.profile.passwordChanged);
    } catch (err) {
      const error = err as any;
      toast.error(error.response?.data?.error || 'Failed to change password');
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    try {
      const updated = await userService.updateAvatar(file);
      updateUser(updated);
      toast.success(t.profile.avatarUpdated);
    } catch {
      toast.error('Failed to update avatar');
    } finally {
      setAvatarLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div><h1 className="text-2xl font-bold text-surface-900 dark:text-white">{t.profile.title}</h1><p className="text-surface-500 mt-1">{t.profile.subtitle}</p></div>

      {/* Avatar */}
      <div className="card p-6">
        <div className="flex items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
              {user?.avatar ? <img src={user.avatar} alt="Avatar" className="w-full h-full object-cover" /> : user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <label className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-primary-600 flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow-lg">
              {avatarLoading ? <Loader2 className="w-4 h-4 text-white animate-spin" /> : <Camera className="w-4 h-4 text-white" />}
              <input type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} disabled={avatarLoading} />
            </label>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-surface-900 dark:text-white">{user?.name}</h3>
            <p className="text-sm text-surface-500">{user?.email}</p>
            <p className="text-xs text-surface-400 mt-1">{t.profile.memberSince} {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}</p>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6"><User className="w-5 h-5 text-primary-600" /><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t.profile.personalInfo}</h2></div>
        <form onSubmit={handleProfile(onProfileSubmit)} className="space-y-4">
          <div>
            <label className="label">{t.auth.fullName}</label>
            <input type="text" className={`input-field ${profileErrors.name ? 'border-danger-500' : ''}`} {...regProfile('name')} />
            {profileErrors.name && <p className="text-sm text-danger-500 mt-1">{profileErrors.name.message}</p>}
          </div>
          <div>
            <label className="label">{t.auth.email}</label>
            <input type="email" className={`input-field ${profileErrors.email ? 'border-danger-500' : ''}`} {...regProfile('email')} />
            {profileErrors.email && <p className="text-sm text-danger-500 mt-1">{profileErrors.email.message}</p>}
          </div>
          <button type="submit" disabled={profileSubmitting} className="btn-primary btn-md">
            {profileSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t.profile.saving}</> : t.profile.saveChanges}
          </button>
        </form>
      </div>

      {/* Change Password */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6"><Lock className="w-5 h-5 text-primary-600" /><h2 className="text-lg font-semibold text-surface-900 dark:text-white">{t.profile.changePassword}</h2></div>
        <form onSubmit={handlePassword(onPasswordSubmit)} className="space-y-4">
          <div>
            <label className="label">{t.profile.currentPassword}</label>
            <input type="password" className={`input-field ${passwordErrors.currentPassword ? 'border-danger-500' : ''}`} {...regPassword('currentPassword')} />
            {passwordErrors.currentPassword && <p className="text-sm text-danger-500 mt-1">{passwordErrors.currentPassword.message}</p>}
          </div>
          <div>
            <label className="label">{t.profile.newPassword}</label>
            <input type="password" className={`input-field ${passwordErrors.newPassword ? 'border-danger-500' : ''}`} {...regPassword('newPassword')} />
            {passwordErrors.newPassword && <p className="text-sm text-danger-500 mt-1">{passwordErrors.newPassword.message}</p>}
          </div>
          <div>
            <label className="label">{t.profile.confirmNewPassword}</label>
            <input type="password" className={`input-field ${passwordErrors.confirmPassword ? 'border-danger-500' : ''}`} {...regPassword('confirmPassword')} />
            {passwordErrors.confirmPassword && <p className="text-sm text-danger-500 mt-1">{passwordErrors.confirmPassword.message}</p>}
          </div>
          <button type="submit" disabled={passwordSubmitting} className="btn-primary btn-md">
            {passwordSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" />{t.profile.updating}</> : t.profile.changePassword}
          </button>
        </form>
      </div>
    </div>
  );
}
