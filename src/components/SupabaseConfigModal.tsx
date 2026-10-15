import React, { useState } from 'react';
import { supabaseUrl, supabasePublishableKey, isSupabaseConfigured, updateSupabaseConfig } from '../lib/supabase';
import { X, Database, Check, Copy, ExternalLink, ShieldAlert, Key } from 'lucide-react';

interface SupabaseConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SupabaseConfigModal: React.FC<SupabaseConfigModalProps> = ({ isOpen, onClose }) => {
  const [url, setUrl] = useState(supabaseUrl);
  const [key, setKey] = useState(supabasePublishableKey);
  const [copiedSql, setCopiedSql] = useState(false);
  const [copiedAdminCmd, setCopiedAdminCmd] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateSupabaseConfig(url, key);
  };

  const adminSqlCmd = `UPDATE public.profiles \nSET role = 'admin' \nWHERE id = (SELECT id FROM auth.users WHERE email = 'mahmudimunisa8@gmail.com');`;

  const handleCopyAdminCmd = () => {
    navigator.clipboard.writeText(adminSqlCmd);
    setCopiedAdminCmd(true);
    setTimeout(() => setCopiedAdminCmd(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-[#E8D4D4] p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-bold font-display text-neutral-900">
              Подключение к Supabase
            </h3>
            <p className="text-xs text-neutral-500">
              {isSupabaseConfigured ? '✅ Supabase подключен' : '⚠️ Требуется указать Project URL и Publishable key'}
            </p>
          </div>
        </div>

        {/* Important Security Notice */}
        <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl mb-6 text-xs text-amber-900 space-y-1">
          <div className="font-bold flex items-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-700" />
            <span>Безопасность и настройки:</span>
          </div>
          <p>
            Используйте только <strong>Project URL</strong> и <strong>Publishable (anon) key</strong> из настроек вашего проекта Supabase (Project Settings → API).
            Никогда не указывайте secret_role key в клиентском коде!
          </p>
        </div>

        {/* Settings Form */}
        <form onSubmit={handleSave} className="space-y-4 mb-6">
          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Project URL (VITE_SUPABASE_URL):
            </label>
            <input
              type="url"
              required
              placeholder="https://xyzcompany.supabase.co"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full p-2.5 bg-[#FAF7F7] border border-[#E2CECE] rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B86868]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-neutral-700 mb-1">
              Publishable Key / Anon Key (VITE_SUPABASE_PUBLISHABLE_KEY):
            </label>
            <div className="relative">
              <input
                type="text"
                required
                placeholder="your-anon-or-publishable-key..."
                value={key}
                onChange={(e) => setKey(e.target.value)}
                className="w-full p-2.5 bg-[#FAF7F7] border border-[#E2CECE] rounded-xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[#B86868]"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="text-[11px] text-neutral-500">
              Данные также можно задать в файле <code>.env</code>
            </span>
            <button
              type="submit"
              className="px-6 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-bold text-xs shadow-md transition-all cursor-pointer"
            >
              Сохранить и подключиться
            </button>
          </div>
        </form>

        {/* Step-by-Step Instructions */}
        <div className="border-t border-[#F0DEDE] pt-6 space-y-4">
          <h4 className="text-sm font-bold text-neutral-900 font-display">
            Шаги для настройки проекта:
          </h4>

          <div className="space-y-3 text-xs text-neutral-700">
            <div className="p-3 bg-[#FAF7F7] rounded-xl border border-[#EAE0E0]">
              <strong>1. Создайте таблицы:</strong> Откройте вкладку <strong>SQL Editor</strong> в вашей консоли Supabase, вставьте и запустите файл <code>schema.sql</code> (он уже подготовлен в корне проекта).
            </div>

            <div className="p-3 bg-[#FAF7F7] rounded-xl border border-[#EAE0E0]">
              <div className="flex items-center justify-between mb-1.5">
                <strong>2. Назначьте себе роль admin:</strong>
                <button
                  type="button"
                  onClick={handleCopyAdminCmd}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#B86868] hover:underline"
                >
                  {copiedAdminCmd ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedAdminCmd ? 'Скопировано!' : 'Скопировать SQL'}</span>
                </button>
              </div>
              <p className="text-neutral-500 mb-2">Зарегистрируйтесь в приложении, затем выполните команду в SQL Editor:</p>
              <pre className="p-2 bg-neutral-900 text-white rounded-lg font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                {adminSqlCmd}
              </pre>
            </div>

            <div className="p-3 bg-[#FAF7F7] rounded-xl border border-[#EAE0E0]">
              <strong>3. Настройте Email уведомления преподавателю:</strong>
              <p className="text-neutral-500 mt-1">
                Файл Edge Function <code>supabase/functions/notify-teacher/index.ts</code> готов. Для отправки писем через Resend добавьте секрет <code>RESEND_API_KEY</code> в Supabase Dashboard → Project Settings → Edge Functions.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-[#F0DEDE] flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-neutral-700 hover:text-neutral-900"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
