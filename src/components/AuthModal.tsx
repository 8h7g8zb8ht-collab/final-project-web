import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { X, Mail, Lock, User as UserIcon, AlertCircle, CheckCircle, ArrowRight } from 'lucide-react';

export const AuthModal: React.FC = () => {
  const { t } = useTranslation();
  const {
    authModalOpen,
    authModalMode,
    openAuthModal,
    closeAuthModal,
    refreshUserData,
    selectedPackage,
    enrollInPackage,
  } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!authModalOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);

    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage(
        'Supabase не подключен. Пожалуйста, укажите VITE_SUPABASE_URL и VITE_SUPABASE_PUBLISHABLE_KEY в файле .env или в настройках.'
      );
      return;
    }

    setLoading(true);

    try {
      if (authModalMode === 'register') {
        const { data, error } = await supabase.auth.signUp({
          email: email.trim(),
          password,
          options: {
            data: {
              full_name: fullName.trim(),
            },
          },
        });

        if (error) throw error;

        // If email confirmation is required by Supabase
        if (data?.user && !data.session) {
          setSuccessNotice(t('auth.confirm_email_notice'));
        } else {
          // User signed in immediately
          await refreshUserData();
          if (selectedPackage) {
            await enrollInPackage(selectedPackage);
          }
          closeAuthModal();
        }
      } else if (authModalMode === 'login') {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });

        if (error) throw error;

        if (data?.user) {
          await refreshUserData(data.user);
        } else {
          await refreshUserData();
        }

        if (selectedPackage) {
          await enrollInPackage(selectedPackage);
        }
        closeAuthModal();
      } else if (authModalMode === 'reset') {
        const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
          redirectTo: window.location.origin,
        });

        if (error) throw error;
        setSuccessNotice('Ссылка для сброса пароля отправлена на вашу почту. Проверьте входящие.');
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      setErrorMessage(err.message || 'Произошла ошибка при аутентификации.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#E8D4D4] p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={closeAuthModal}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="mb-6 text-center">
          <span className="text-xs uppercase font-extrabold tracking-wider text-[#B86868]">
            AIRY PLANE
          </span>
          <h3 className="text-2xl font-black text-neutral-900 font-display mt-1">
            {authModalMode === 'register' && t('auth.register_title')}
            {authModalMode === 'login' && t('auth.login_title')}
            {authModalMode === 'reset' && t('auth.reset_title')}
          </h3>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="mb-4 p-3.5 bg-red-50 border border-red-200 rounded-xl flex items-start gap-2.5 text-xs text-red-700">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500 mt-0.5" />
            <div className="leading-snug">{errorMessage}</div>
          </div>
        )}

        {/* Success Notice */}
        {successNotice && (
          <div className="mb-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2.5 text-xs text-emerald-800">
            <CheckCircle className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
            <div className="leading-snug">{successNotice}</div>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {authModalMode === 'register' && (
            <div>
              <label className="block text-xs font-bold text-neutral-700 mb-1.5">
                {t('auth.name_label')}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <UserIcon className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder={t('auth.name_placeholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F7] border border-[#E2CECE] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B86868] focus:bg-white transition-all text-neutral-900"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1.5">
              {t('auth.email_label')}
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('auth.email_placeholder')}
                className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F7] border border-[#E2CECE] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B86868] focus:bg-white transition-all text-neutral-900"
              />
            </div>
          </div>

          {authModalMode !== 'reset' && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold text-neutral-700">
                  {t('auth.password_label')}
                </label>
                {authModalMode === 'login' && (
                  <button
                    type="button"
                    onClick={() => openAuthModal('reset')}
                    className="text-xs text-[#B86868] hover:underline"
                  >
                    {t('auth.forgot_pass')}
                  </button>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={t('auth.password_placeholder')}
                  className="w-full pl-10 pr-4 py-2.5 bg-[#FAF7F7] border border-[#E2CECE] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B86868] focus:bg-white transition-all text-neutral-900"
                />
              </div>
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              <span>
                {loading
                  ? t('common.loading')
                  : authModalMode === 'register'
                  ? t('auth.register_btn')
                  : authModalMode === 'login'
                  ? t('auth.login_btn')
                  : t('auth.reset_btn')}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>

        {/* Switch Between Modes */}
        <div className="mt-6 text-center text-xs text-neutral-500 pt-4 border-t border-[#F2E4E4] space-y-2">
          {authModalMode === 'login' && (
            <p>
              <button
                onClick={() => openAuthModal('register')}
                className="font-bold text-neutral-900 hover:text-[#B86868] transition-colors"
              >
                {t('auth.no_account')}
              </button>
            </p>
          )}

          {authModalMode === 'register' && (
            <p>
              <button
                onClick={() => openAuthModal('login')}
                className="font-bold text-neutral-900 hover:text-[#B86868] transition-colors"
              >
                {t('auth.have_account')}
              </button>
            </p>
          )}

          {authModalMode === 'reset' && (
            <p>
              <button
                onClick={() => openAuthModal('login')}
                className="font-bold text-neutral-900 hover:text-[#B86868] transition-colors"
              >
                {t('auth.back_to_login')}
              </button>
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
