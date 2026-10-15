import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { X, Copy, Check, Send, CreditCard, ShieldAlert } from 'lucide-react';

export const PaymentModal: React.FC = () => {
  const { t, language } = useTranslation();
  const { paymentModalOpen, closePaymentModal, selectedPackage, enrollment } = useAuth();
  const [copied, setCopied] = useState(false);

  if (!paymentModalOpen) return null;

  const pkgNameKey = `packages.${selectedPackage}.name`;
  const pkgPriceKey = `packages.${selectedPackage}.price`;
  const pkgPriceTjsKey = `packages.${selectedPackage}.price_tjs`;

  const displayPrice = language === 'tj' ? t(pkgPriceTjsKey) : t(pkgPriceKey);

  const requisitesText = `Получатель: Муниса М.\nКорти Милли / DCB: 9920001164161520\nСбер / Т-Банк: +992 116 41 61 52\nСумма: ${displayPrice} (Тариф: ${t(pkgNameKey)})`;

  const handleCopy = () => {
    navigator.clipboard.writeText(requisitesText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#E8D4D4] p-6 sm:p-8 overflow-hidden">
        {/* Close Button */}
        <button
          onClick={closePaymentModal}
          className="absolute top-5 right-5 p-2 rounded-full text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 transition-colors"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3DEDE] text-[#B86868] text-xs font-bold uppercase tracking-wider mb-2">
            <CreditCard className="w-3.5 h-3.5" />
            <span>{t('payment_modal.title')}</span>
          </div>
          <h3 className="text-2xl font-black text-neutral-900 font-display">
            {t('payment_modal.subtitle')} {t(pkgNameKey)}
          </h3>
          <div className="mt-2 text-2xl font-black text-[#B86868] font-display">
            {displayPrice}
          </div>
        </div>

        {/* Status Callout */}
        <div className="mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs sm:text-sm flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="leading-relaxed">
            {t('payment_modal.pending_notice')}
          </p>
        </div>

        {/* Payment Requisites Box */}
        <div className="p-5 rounded-2xl bg-[#FAF5F5] border border-[#EAD5D5] space-y-3 mb-6">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-extrabold uppercase tracking-wider text-neutral-500">
              {t('payment_modal.requisites_title')}
            </h4>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-[#B86868] hover:text-[#9A4F4F] transition-colors cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                  <span className="text-emerald-600">{t('payment_modal.copied')}</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>{t('payment_modal.copy_btn')}</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-1.5 text-sm font-mono text-neutral-800">
            <div className="font-semibold font-sans text-neutral-900">{t('payment_modal.card_recipient')}</div>
            <div className="p-2 bg-white rounded-lg border border-[#E5D0D0] text-xs sm:text-sm font-bold">
              {t('payment_modal.card_tjs')}
            </div>
            <div className="p-2 bg-white rounded-lg border border-[#E5D0D0] text-xs sm:text-sm font-bold">
              {t('payment_modal.card_rub')}
            </div>
          </div>
        </div>

        {/* 3 Step Instruction */}
        <div className="space-y-2 text-xs sm:text-sm text-neutral-600 mb-6">
          <p>{t('payment_modal.step_1')}</p>
          <p>{t('payment_modal.step_2')}</p>
          <p>{t('payment_modal.step_3')}</p>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <a
            href="https://t.me/+992116416152"
            target="_blank"
            rel="noopener noreferrer"
            onClick={closePaymentModal}
            className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Send className="w-4 h-4 text-sky-400" />
            <span>{t('payment_modal.open_tg')}</span>
          </a>

          <button
            onClick={closePaymentModal}
            className="w-full py-2.5 text-xs font-semibold text-neutral-500 hover:text-neutral-900 transition-colors"
          >
            {t('payment_modal.close')}
          </button>
        </div>
      </div>
    </div>
  );
};
