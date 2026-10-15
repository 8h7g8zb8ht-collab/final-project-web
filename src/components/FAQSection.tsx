import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { HelpCircle, ChevronDown, ChevronUp, Send } from 'lucide-react';

export const FAQSection: React.FC = () => {
  const { t } = useTranslation();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const items = t('faq.items') as Array<{ q: string; a: string }>;

  return (
    <section id="faq" className="py-20 sm:py-28 bg-[#FAF5F5] relative">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F3DEDE] text-neutral-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <HelpCircle className="w-3.5 h-3.5 text-[#B86868]" />
            <span>{t('faq.tag')}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            {t('faq.title')}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600">
            {t('faq.subtitle')}
          </p>
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-4">
          {items.map((item, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'bg-white border-[#E0BCBC] shadow-md'
                    : 'bg-white/80 border-[#EFE0E0] hover:border-[#E4C8C8]'
                }`}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : index)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                >
                  <span className="text-base sm:text-lg font-bold text-neutral-900 leading-snug">
                    {item.q}
                  </span>
                  <div className="p-1 rounded-full text-neutral-400 shrink-0">
                    {isOpen ? <ChevronUp className="w-5 h-5 text-neutral-900" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </button>
                {isOpen && (
                  <div className="px-6 pb-6 pt-1 text-sm sm:text-base text-neutral-600 leading-relaxed border-t border-[#F8EFEF]">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Telegram Direct Contact Banner */}
        <div className="mt-16 p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-[#F5D8D8] via-[#EBC3C3] to-[#E2B2B2] border border-white/60 shadow-xl text-center relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 font-display">
              {t('telegram_banner.title')}
            </h3>
            <p className="text-sm sm:text-base text-neutral-700">
              {t('telegram_banner.subtitle')}
            </p>

            <div className="pt-4 flex items-center justify-center">
              <a
                href="https://t.me/+992116416152"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-bold text-sm sm:text-base shadow-lg transition-transform hover:scale-102"
              >
                <Send className="w-4 h-4 text-sky-400" />
                <span>{t('telegram_banner.button')} ({t('telegram_banner.phone')})</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
