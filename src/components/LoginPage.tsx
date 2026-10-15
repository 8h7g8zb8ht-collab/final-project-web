import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { PackageType, UserRole } from '../types/database';
import {
  Mail,
  Lock,
  User as UserIcon,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  AlertTriangle,
  Send,
  GraduationCap,
  BookOpen
} from 'lucide-react';

interface LoginPageProps {
  onSuccess: (role: UserRole) => void;
  onBackToHome: () => void;
  initialMode?: 'login' | 'register' | 'reset';
  selectedPackage?: PackageType;
  initialEmail?: string;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  onSuccess,
  onBackToHome,
  initialMode = 'login',
  selectedPackage,
  initialEmail = '',
}) => {
  const { t } = useTranslation();
  const { user, profile, isAdmin, refreshUserData, enrollInPackage } = useAuth();

  const [mode, setMode] = useState<'login' | 'register' | 'reset'>(initialMode);
  const [roleHint, setRoleHint] = useState<'student' | 'teacher'>('student');
  const [email, setEmail] = useState(initialEmail);
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  // Email confirmation states (Rule 1 & 2)
  const [awaitingEmailVerification, setAwaitingEmailVerification] = useState(false);
  const [unconfirmedEmailError, setUnconfirmedEmailError] = useState(false);
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendStatusMsg, setResendStatusMsg] = useState<string | null>(null);

  // Helper to map Supabase auth errors into friendly human messages
  const formatErrorMessage = (err: any): string => {
    const raw = (err?.message || String(err || '')).toLowerCase();
    if (raw.includes('invalid login credentials') || raw.includes('invalid_grant')) {
      return 'Неверный email или пароль. Пожалуйста, проверьте введённые данные.';
    }
    if (raw.includes('email not confirmed') || raw.includes('email_not_confirmed')) {
      return 'Почта не подтверждена. Проверьте письмо или отправьте его ещё раз.';
    }
    if (raw.includes('user already registered') || raw.includes('already exists')) {
      return 'Пользователь с таким email уже зарегистрирован. Пожалуйста, войдите.';
    }
    if (raw.includes('password should be at least') || raw.includes('weak_password')) {
      return 'Пароль слишком короткий. Используйте не менее 6 символов.';
    }
    if (raw.includes('failed to fetch') || raw.includes('network')) {
      return 'Не удалось подключиться к серверу Supabase. Проверьте интернет-соединение.';
    }
    if (raw.includes('rate limit') || raw.includes('too many requests')) {
      return 'Слишком много попыток. Пожалуйста, подождите пару минут и попробуйте снова.';
    }
    return err?.message || 'Произошла ошибка при авторизации. Попробуйте снова.';
  };

  // Handler: Resend verification email via supabase.auth.resend
  const handleResendConfirmation = async (targetEmail: string) => {
    const cleanEmail = targetEmail.trim();
    if (!cleanEmail) {
      setResendStatusMsg('Укажите email для отправки письма.');
      return;
    }

    if (!supabase) return;

    setResendingEmail(true);
    setResendStatusMsg(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: cleanEmail,
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback',
        },
      });

      if (error) {
        console.error('Supabase Auth error (resend):', error);
        setResendStatusMsg(error.message || 'Не удалось отправить письмо повторно.');
      } else {
        setResendStatusMsg('Письмо отправлено повторно! Проверьте папку «Входящие» и «Спам».');
      }
    } catch (err: any) {
      console.error('Resend catch error:', err);
      setResendStatusMsg('Произошла ошибка при отправке письма.');
    } finally {
      setResendingEmail(false);
    }
  };

  // Helper with timeout to prevent hanging network requests
  const withTimeout = async <T,>(
    promise: PromiseLike<T>,
    ms = 12000,
    errorMsg = 'Сервер не ответил вовремя. Пожалуйста, проверьте интернет-соединение и попробуйте снова.'
  ): Promise<T> => {
    let timer: any;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(new Error(errorMsg)), ms);
    });
    return Promise.race([Promise.resolve(promise), timeoutPromise]).finally(() => {
      clearTimeout(timer);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessNotice(null);
    setUnconfirmedEmailError(false);
    setResendStatusMsg(null);

    // If Supabase is not configured, block login
    if (!isSupabaseConfigured || !supabase) {
      setErrorMessage('Подключение к Supabase отсутствует. Авторизация невозможна.');
      return;
    }

    setLoading(true);

    try {
      if (mode === 'register') {
        const { data, error } = await withTimeout(
          supabase.auth.signUp({
            email: email.trim(),
            password,
            options: {
              emailRedirectTo: window.location.origin + '/auth/callback',
              data: {
                full_name: fullName.trim(),
                role: roleHint,
              },
            },
          }),
          15000,
          'Время ожидания ответа от сервера при регистрации истекло. Попробуйте снова.'
        );

        if (error) {
          console.error('Supabase Auth error (signUp):', error);
          throw error;
        }

        // Rule 1: Check if session returned immediately (email confirmation OFF)
        if (data?.session && data?.user) {
          // Immediately logged in
          const { role } = await withTimeout(refreshUserData(data.user), 8000);
          if (selectedPackage && role === 'student') {
            try {
              await enrollInPackage(selectedPackage);
            } catch {}
          }
          // Redirect strictly according to database role
          onSuccess(role);
        } else if (data?.user && !data.session) {
          // Rule 1: No session (email confirmation is ON)
          // Show verification screen with email and resend button
          setAwaitingEmailVerification(true);
        }
      } else if (mode === 'login') {
        // STEP 1: Wrap login logic in try/catch/finally with timeout
        const { data, error } = await withTimeout(
          supabase.auth.signInWithPassword({
            email: email.trim(),
            password,
          }),
          12000,
          'Время ожидания ответа от Supabase истекло. Проверьте интернет-соединение или настройки Supabase и попробуйте снова.'
        );

        if (error) {
          console.error('Supabase Auth error (signInWithPassword):', error);

          // Check unconfirmed email error
          const raw = (error.message || '').toLowerCase();
          if (raw.includes('email not confirmed') || raw.includes('email_not_confirmed')) {
            setUnconfirmedEmailError(true);
            setErrorMessage('Почта не подтверждена. Проверьте письмо или отправьте его ещё раз.');
            return;
          }

          throw error;
        }

        if (!data?.user) {
          throw new Error('Не удалось получить данные сессии.');
        }

        const authUser = data.user;

        // Query role from profiles table (Single Source of Truth)
        let profileRole: string | null = null;
        try {
          const profileQuery = await withTimeout(
            supabase
              .from('profiles')
              .select('role')
              .eq('id', authUser.id)
              .maybeSingle(),
            6000
          );
          if (profileQuery?.data?.role) {
            profileRole = profileQuery.data.role;
          }
        } catch (queryErr) {
          console.warn('Profile direct check error:', queryErr);
        }

        // Refresh user data in AuthContext
        const { role: contextRole, profile: ctxProfile } = await withTimeout(
          refreshUserData(authUser),
          6000
        );

        const isMasterTeacherEmail = authUser.email?.toLowerCase() === 'mahmudimunisa8@gmail.com';
        const finalRole =
          profileRole ||
          ctxProfile?.role ||
          contextRole ||
          (authUser.user_metadata?.role as string | undefined) ||
          (isMasterTeacherEmail ? 'teacher' : 'student');

        const isUserTeacher =
          finalRole === 'teacher' ||
          finalRole === 'admin' ||
          authUser.user_metadata?.role === 'teacher' ||
          isMasterTeacherEmail;

        // STEP 2: Проверка роли преподавателя при входе
        if (roleHint === 'teacher') {
          if (!isUserTeacher) {
            // Sign out user immediately so unauthorized session does not persist
            await supabase.auth.signOut();
            setErrorMessage(
              'У этого аккаунта нет прав преподавателя (в базе роль «ученик»). Доступ в кабинет преподавателя запрещён. Выберите карточку «Я ученик», чтобы войти в личный кабинет ученика.'
            );
            return; // finally block will guarantee setLoading(false)
          }

          // Role matched (teacher/admin) -> Redirect to teacher panel
          onSuccess(finalRole === 'admin' ? 'admin' : 'teacher');
          return;
        }

        // If user chose 'student':
        if (selectedPackage && finalRole === 'student') {
          try {
            await enrollInPackage(selectedPackage);
          } catch {}
        }

        // Redirect according to role (student -> /cabinet, teacher -> /teacher, admin -> /admin)
        onSuccess(finalRole as UserRole);
      } else if (mode === 'reset') {
        const { error } = await withTimeout(
          supabase.auth.resetPasswordForEmail(email.trim(), {
            redirectTo: window.location.origin + '/auth/callback',
          }),
          12000
        );

        if (error) {
          console.error('Supabase Auth error (resetPassword):', error);
          throw error;
        }
        setSuccessNotice('Ссылка для сброса пароля отправлена на вашу почту. Проверьте входящие.');
      }
    } catch (err: any) {
      console.error('Auth operation failed:', err);
      setErrorMessage(formatErrorMessage(err));
    } finally {
      // STEP 1 Requirement: Always reset loading state to unlock button and form
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF5F5] flex items-center justify-center py-10 px-4 sm:px-6">
      <div className="w-full max-w-lg bg-white rounded-3xl p-6 sm:p-10 shadow-xl border border-[#E8D4D4] relative">
        {/* Back to Home Link */}
        <button
          onClick={onBackToHome}
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-600 hover:text-neutral-950 transition-colors mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{t('login_page.back_to_home') || 'На главную'}</span>
        </button>

        {/* Rule 4: If Supabase is not connected, show persistent banner and block form */}
        {!isSupabaseConfigured && (
          <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-300 rounded-2xl flex items-start gap-3 text-amber-950">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-xs sm:text-sm">
              <span className="font-bold block text-sm">Supabase не подключён</span>
              <p className="mt-1 text-neutral-700 leading-relaxed">
                Для работы авторизации укажите <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-xs">VITE_SUPABASE_URL</code> и <code className="bg-amber-100 px-1 py-0.5 rounded font-mono text-xs">VITE_SUPABASE_PUBLISHABLE_KEY</code> в файле .env.
              </p>
            </div>
          </div>
        )}

        {/* SCREEN 1: Awaiting Email Verification (Rule 1) */}
        {awaitingEmailVerification ? (
          <div className="text-center py-4 space-y-5 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-[#FAF0F0] border border-[#E8D4D4] flex items-center justify-center mx-auto text-[#B86868]">
              <Mail className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-black uppercase tracking-widest text-[#B86868]">
                ПОДТВЕРЖДЕНИЕ АККАУНТА
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 font-display mt-1">
                Проверьте вашу почту
              </h1>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-sm mx-auto leading-relaxed">
                Мы отправили письмо на <strong className="text-neutral-900">{email}</strong>. Перейдите по ссылке в письме, затем войдите в аккаунт.
              </p>
            </div>

            {resendStatusMsg && (
              <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 font-medium">
                {resendStatusMsg}
              </div>
            )}

            <div className="pt-2 space-y-3">
              <button
                type="button"
                onClick={() => handleResendConfirmation(email)}
                disabled={resendingEmail}
                className="w-full py-3.5 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <Send className="w-4 h-4" />
                <span>{resendingEmail ? 'Отправляем письмо...' : 'Отправить письмо ещё раз'}</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setAwaitingEmailVerification(false);
                  setMode('login');
                  setSuccessNotice('После подтверждения почты введите пароль и нажмите «Войти».');
                }}
                className="w-full py-3 px-6 bg-white hover:bg-[#FAF0F0] text-neutral-800 border border-[#DAC4C4] rounded-full font-bold text-xs sm:text-sm transition-all cursor-pointer"
              >
                Я подтвердил(а) почту / Войти
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Standard Login / Register Header */}
            <div className="text-center mb-6">
              <span className="text-xs font-black uppercase tracking-widest text-[#B86868]">
                AIRY PLANE
              </span>
              <h1 className="text-2xl sm:text-3xl font-black text-neutral-900 font-display mt-1">
                {mode === 'login' && (t('login_page.welcome') || 'Вход в аккаунт')}
                {mode === 'register' && (t('login_page.register_title') || 'Регистрация аккаунта')}
                {mode === 'reset' && (t('login_page.reset_title') || 'Восстановление пароля')}
              </h1>
              <p className="text-sm text-neutral-600 mt-1 font-medium">
                {mode === 'login' && 'Введите ваши данные для входа в кабинет'}
                {mode === 'register' && 'Создайте аккаунт для начала обучения на курсе'}
                {mode === 'reset' && 'Укажите email, на который мы отправим ссылку для сброса'}
              </p>
            </div>

            {/* Role hint cards: Available for both Register and Login (verifies teacher role on login) */}
            {(mode === 'register' || mode === 'login') && (
              <div className="grid grid-cols-2 gap-3 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setRoleHint('student');
                    setErrorMessage(null);
                  }}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    roleHint === 'student'
                      ? 'border-[#B86868] bg-[#FBF3F3] shadow-xs ring-1 ring-[#B86868]/30'
                      : 'border-neutral-200 bg-white hover:border-[#DAC0C0]'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${roleHint === 'student' ? 'bg-neutral-900 text-white' : 'bg-[#F2E6E6] text-neutral-700'}`}>
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-neutral-900">Я ученик</div>
                    <div className="text-[10px] text-neutral-500 truncate">
                      {mode === 'login' ? 'Вход для ученика' : 'Прохожу курс'}
                    </div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setRoleHint('teacher');
                    setErrorMessage(null);
                  }}
                  className={`p-3 rounded-2xl border-2 text-left transition-all cursor-pointer flex items-center gap-2.5 ${
                    roleHint === 'teacher'
                      ? 'border-[#B86868] bg-[#FBF3F3] shadow-xs ring-1 ring-[#B86868]/30'
                      : 'border-neutral-200 bg-white hover:border-[#DAC0C0]'
                  }`}
                >
                  <div className={`p-2 rounded-xl shrink-0 ${roleHint === 'teacher' ? 'bg-neutral-900 text-white' : 'bg-[#F2E6E6] text-neutral-700'}`}>
                    <BookOpen className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="font-bold text-xs text-neutral-900">Я преподаватель</div>
                    <div className="text-[10px] text-neutral-500 truncate">
                      {mode === 'login' ? 'Вход для учителя' : 'Веду занятия'}
                    </div>
                  </div>
                </button>
              </div>
            )}

            {/* Error Notice */}
            {errorMessage && (
              <div className="mb-5 p-4 bg-red-50 border border-red-200 rounded-2xl text-xs sm:text-sm text-red-800 animate-in fade-in space-y-2.5">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-5 h-5 shrink-0 text-red-500 mt-0.5" />
                  <div className="leading-snug font-medium">{errorMessage}</div>
                </div>

                {/* Rule 2: Unconfirmed email banner action */}
                {unconfirmedEmailError && (
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => handleResendConfirmation(email)}
                      disabled={resendingEmail}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer disabled:opacity-50"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>{resendingEmail ? 'Отправляем...' : 'Отправить письмо ещё раз'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* Resend confirmation notification */}
            {resendStatusMsg && (
              <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2 text-xs text-amber-900 font-medium">
                <CheckCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <span>{resendStatusMsg}</span>
              </div>
            )}

            {/* Success Notice */}
            {successNotice && (
              <div className="mb-5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-start gap-2.5 text-xs sm:text-sm text-emerald-900 animate-in fade-in">
                <CheckCircle className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <div className="leading-snug">{successNotice}</div>
              </div>
            )}

            {/* Form Body */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <div>
                  <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                    {t('login_page.name_label') || 'Ваше имя'}
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
                      placeholder="Иван Иванов"
                      disabled={!isSupabaseConfigured || loading}
                      className="w-full pl-10 pr-4 py-3 bg-[#FAF7F7] border border-[#E2CECE] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B86868] focus:bg-white transition-all text-neutral-900 disabled:opacity-50"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-neutral-800 mb-1.5">
                  {t('login_page.email_label') || 'Электронная почта'}
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
                    placeholder="name@example.com"
                    disabled={!isSupabaseConfigured || loading}
                    className="w-full pl-10 pr-4 py-3 bg-[#FAF7F7] border border-[#E2CECE] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B86868] focus:bg-white transition-all text-neutral-900 disabled:opacity-50"
                  />
                </div>
              </div>

              {mode !== 'reset' && (
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold text-neutral-800">
                      {t('login_page.password_label') || 'Пароль'}
                    </label>
                    {mode === 'login' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('reset');
                          setErrorMessage(null);
                        }}
                        className="text-xs font-semibold text-[#B86868] hover:underline cursor-pointer"
                      >
                        {t('login_page.forgot_password') || 'Забыли пароль?'}
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-400">
                      <Lock className="w-4 h-4" />
                    </div>
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Минимум 6 символов"
                      disabled={!isSupabaseConfigured || loading}
                      className="w-full pl-10 pr-10 py-3 bg-[#FAF7F7] border border-[#E2CECE] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B86868] focus:bg-white transition-all text-neutral-900 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-neutral-400 hover:text-neutral-700 cursor-pointer"
                      aria-label="Переключить видимость пароля"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Action Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={!isSupabaseConfigured || loading}
                  className="w-full min-h-[50px] py-3.5 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-bold text-sm sm:text-base shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span>
                    {loading
                      ? 'Пожалуйста, подождите...'
                      : mode === 'register'
                      ? (t('login_page.register_btn') || 'Зарегистрироваться')
                      : mode === 'login'
                      ? (t('login_page.login_btn') || 'Войти')
                      : (t('login_page.reset_btn') || 'Отправить ссылку')}
                  </span>
                  {!loading && <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </form>

            {/* Footer Mode Switchers */}
            <div className="mt-6 pt-5 border-t border-[#F2E4E4] text-center text-xs text-neutral-600">
              {mode === 'login' && (
                <p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('register');
                      setErrorMessage(null);
                      setUnconfirmedEmailError(false);
                    }}
                    className="font-bold text-neutral-900 hover:text-[#B86868] transition-colors cursor-pointer"
                  >
                    {t('login_page.no_account_register') || 'Нет аккаунта? Зарегистрироваться'}
                  </button>
                </p>
              )}

              {mode === 'register' && (
                <p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                      setUnconfirmedEmailError(false);
                    }}
                    className="font-bold text-neutral-900 hover:text-[#B86868] transition-colors cursor-pointer"
                  >
                    {t('login_page.have_account_login') || 'Уже есть аккаунт? Войти'}
                  </button>
                </p>
              )}

              {mode === 'reset' && (
                <p>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                      setUnconfirmedEmailError(false);
                    }}
                    className="font-bold text-neutral-900 hover:text-[#B86868] transition-colors cursor-pointer"
                  >
                    Вернуться ко входу
                  </button>
                </p>
              )}
            </div>

            {/* Temporary Debug Line (visible only to admin) */}
            {isAdmin && (
              <div className="mt-6 pt-3 border-t border-dashed border-neutral-300 text-center text-[11px] font-mono text-neutral-500">
                [debug: {user?.email || 'anon'} | role: {profile?.role || 'none'} | route: /login]
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};
