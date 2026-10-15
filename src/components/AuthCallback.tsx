import React, { useEffect, useState } from 'react';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { CheckCircle, AlertCircle, Clock, ArrowRight, Mail, RefreshCw } from 'lucide-react';
import { UserRole } from '../types/database';

interface AuthCallbackProps {
  onSuccess: (role: UserRole) => void;
  onNavigateToLogin: (prefilledEmail?: string) => void;
}

export const AuthCallback: React.FC<AuthCallbackProps> = ({ onSuccess, onNavigateToLogin }) => {
  const { refreshUserData } = useAuth();

  const [status, setStatus] = useState<'loading' | 'success' | 'expired' | 'no_session' | 'error'>('loading');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [resending, setResending] = useState<boolean>(false);
  const [resendNotice, setResendNotice] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const handleCallback = async () => {
      if (!isSupabaseConfigured || !supabase) {
        if (isMounted) {
          setStatus('error');
          setErrorMessage('Supabase не подключён. Проверьте настройки проекта.');
        }
        return;
      }

      try {
        // 1. Check for errors in URL (both hash and query string)
        const hashParams = new URLSearchParams(window.location.hash.replace(/^#\/?/, ''));
        const searchParams = new URLSearchParams(window.location.search);

        const urlError = searchParams.get('error') || hashParams.get('error');
        const urlErrorCode = searchParams.get('error_code') || hashParams.get('error_code');
        const urlErrorDesc = searchParams.get('error_description') || hashParams.get('error_description');

        if (urlError || urlErrorCode) {
          console.error('Supabase Auth callback error:', { urlError, urlErrorCode, urlErrorDesc });
          if (
            urlErrorCode === 'otp_expired' ||
            urlErrorDesc?.toLowerCase().includes('expired') ||
            urlErrorDesc?.toLowerCase().includes('invalid')
          ) {
            if (isMounted) {
              setStatus('expired');
              setErrorMessage('Ссылка устарела или уже была использована. Запросите новое письмо.');
            }
            return;
          }

          if (isMounted) {
            setStatus('error');
            setErrorMessage(urlErrorDesc ? decodeURIComponent(urlErrorDesc.replace(/\+/g, ' ')) : 'Ошибка подтверждения ссылки.');
          }
          return;
        }

        // 2. Check for PKCE code flow (?code=...)
        const code = searchParams.get('code');
        if (code) {
          const { data, error } = await supabase.auth.exchangeCodeForSession(code);
          if (error) {
            console.error('exchangeCodeForSession error:', error);
            if (error.message.toLowerCase().includes('expired') || error.message.toLowerCase().includes('invalid')) {
              if (isMounted) {
                setStatus('expired');
                setErrorMessage('Ссылка устарела, запросите новое письмо.');
              }
              return;
            }
            throw error;
          }

          if (data?.session?.user) {
            const { role } = await refreshUserData(data.session.user);
            if (isMounted) {
              setStatus('success');
              setUserEmail(data.session.user.email || '');
              setTimeout(() => {
                onSuccess(role);
              }, 1200);
            }
            return;
          }
        }

        // 3. Check for OTP token_hash flow (?token_hash=...&type=...)
        const tokenHash = searchParams.get('token_hash');
        const otpType = (searchParams.get('type') as any) || 'signup';
        if (tokenHash) {
          const { data, error } = await supabase.auth.verifyOtp({
            token_hash: tokenHash,
            type: otpType,
          });

          if (error) {
            console.error('verifyOtp error:', error);
            if (error.message.toLowerCase().includes('expired')) {
              if (isMounted) {
                setStatus('expired');
                setErrorMessage('Ссылка устарела, запросите новое письмо.');
              }
              return;
            }
            throw error;
          }

          if (data?.session?.user) {
            const { role } = await refreshUserData(data.session.user);
            if (isMounted) {
              setStatus('success');
              setUserEmail(data.session.user.email || '');
              setTimeout(() => {
                onSuccess(role);
              }, 1200);
            }
            return;
          }
        }

        // 4. Check if session was already established or parsed automatically by Supabase client
        const { data: { session }, error: sessionErr } = await supabase.auth.getSession();
        if (sessionErr) {
          console.error('getSession error:', sessionErr);
        }

        if (session?.user) {
          const { role } = await refreshUserData(session.user);
          if (isMounted) {
            setStatus('success');
            setUserEmail(session.user.email || '');
            setTimeout(() => {
              onSuccess(role);
            }, 1200);
          }
          return;
        }

        // 5. If no active session in this browser, but also no explicit error:
        // User might have opened the link in another browser / tab where session was confirmed
        if (isMounted) {
          setStatus('no_session');
        }
      } catch (err: any) {
        console.error('AuthCallback unexpected error:', err);
        if (isMounted) {
          if (err?.message?.toLowerCase().includes('expired')) {
            setStatus('expired');
            setErrorMessage('Ссылка устарела, запросите новое письмо.');
          } else {
            setStatus('error');
            setErrorMessage(err?.message || 'Не удалось завершить подтверждение почты.');
          }
        }
      }
    };

    handleCallback();

    return () => {
      isMounted = false;
    };
  }, [refreshUserData, onSuccess]);

  // Handler to resend confirmation email
  const handleResend = async () => {
    if (!userEmail.trim()) {
      setResendNotice('Пожалуйста, введите ваш email для отправки письма.');
      return;
    }

    if (!supabase) return;

    setResending(true);
    setResendNotice(null);

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: userEmail.trim(),
        options: {
          emailRedirectTo: window.location.origin + '/auth/callback',
        },
      });

      if (error) {
        console.error('Supabase resend error:', error);
        setResendNotice(error.message || 'Ошибка отправки письма.');
      } else {
        setResendNotice('Новое письмо с подтверждением отправлено! Проверьте входящие и папку «Спам».');
      }
    } catch (err: any) {
      console.error('Resend catch error:', err);
      setResendNotice('Не удалось отправить письмо. Пожалуйста, попробуйте чуть позже.');
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-[#FAF5F5] flex items-center justify-center py-12 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-3xl p-8 sm:p-10 shadow-xl border border-[#E8D4D4] text-center">
        {/* State: Loading */}
        {status === 'loading' && (
          <div className="space-y-4 py-4">
            <div className="w-16 h-16 rounded-full bg-[#FAF0F0] border border-[#E8D4D4] flex items-center justify-center mx-auto text-[#B86868] animate-spin">
              <RefreshCw className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-neutral-900 font-display">
              Подтверждаем электронную почту...
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              Пожалуйста, подождите пару секунд, проверяем токен безопасности.
            </p>
          </div>
        )}

        {/* State: Success */}
        {status === 'success' && (
          <div className="space-y-4 py-4 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle className="w-9 h-9" />
            </div>
            <h2 className="text-2xl font-black text-neutral-900 font-display">
              Почта успешно подтверждена!
            </h2>
            <p className="text-xs sm:text-sm text-neutral-600">
              {userEmail && <span className="font-semibold text-neutral-900 block mb-1">{userEmail}</span>}
              Вход выполнен успешно. Перенаправляем вас в личный кабинет...
            </p>
            <div className="pt-2">
              <div className="inline-block w-6 h-6 border-2 border-neutral-900 border-t-transparent rounded-full animate-spin" />
            </div>
          </div>
        )}

        {/* State: Expired Link */}
        {status === 'expired' && (
          <div className="space-y-5 py-2 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-amber-50 border border-amber-300 flex items-center justify-center mx-auto text-amber-600">
              <Clock className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 font-display">
                Ссылка устарела
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                Ссылка подтверждения устарела или уже была использована ранее. Запросите новое письмо с ссылкой.
              </p>
            </div>

            {/* Email input to resend */}
            <div className="space-y-3 pt-2">
              <input
                type="email"
                placeholder="name@example.com"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                className="w-full px-4 py-3 bg-[#FAF7F7] border border-[#E2CECE] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B86868] text-neutral-900"
              />

              <button
                type="button"
                onClick={handleResend}
                disabled={resending}
                className="w-full py-3 px-5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Mail className="w-4 h-4" />
                <span>{resending ? 'Отправляем...' : 'Отправить письмо ещё раз'}</span>
              </button>
            </div>

            {resendNotice && (
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
                {resendNotice}
              </div>
            )}

            <div className="pt-2 border-t border-[#F2E4E4]">
              <button
                type="button"
                onClick={() => onNavigateToLogin(userEmail)}
                className="text-xs font-bold text-neutral-700 hover:text-neutral-950 underline cursor-pointer"
              >
                Перейти на страницу входа
              </button>
            </div>
          </div>
        )}

        {/* State: Confirmed without local session (e.g. opened in another browser) */}
        {status === 'no_session' && (
          <div className="space-y-5 py-2 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600">
              <CheckCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 font-display">
                Почта подтверждена
              </h2>
              <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                Ваша электронная почта успешно верифицирована. Теперь вы можете войти в свой аккаунт со своим паролем.
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => onNavigateToLogin()}
                className="w-full py-3 px-5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Войти в аккаунт</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* State: General Error */}
        {status === 'error' && (
          <div className="space-y-5 py-2 animate-in fade-in">
            <div className="w-16 h-16 rounded-full bg-red-50 border border-red-200 flex items-center justify-center mx-auto text-red-500">
              <AlertCircle className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-neutral-900 font-display">
                Ошибка подтверждения
              </h2>
              <p className="text-xs sm:text-sm text-red-700 mt-2 leading-relaxed">
                {errorMessage || 'Не удалось подтвердить электронную почту.'}
              </p>
            </div>

            <div className="pt-3">
              <button
                type="button"
                onClick={() => onNavigateToLogin()}
                className="w-full py-3 px-5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Вернуться ко входу</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
