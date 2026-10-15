import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { ArrowUpRight, Sparkles, Globe, GraduationCap, Briefcase } from 'lucide-react';
import { HeroPaperPlane } from './HeroPaperPlane';

interface HeroProps {
  onSelectPackage: () => void;
  onEnterCabinet: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSelectPackage, onEnterCabinet }) => {
  const { t, language } = useTranslation();
  const { user } = useAuth();

  const mainWord = language === 'en' ? 'Design' : 'Дизайн';

  return (
    <section className="relative overflow-x-hidden pt-6 pb-1 sm:pt-12 sm:pb-2">
      {/* Background subtle atmospheric aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] sm:w-[900px] h-[400px] bg-gradient-to-tr from-[#F1D7D7]/60 via-[#E8C4C4]/50 to-transparent blur-3xl pointer-events-none rounded-full -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Subtle pill kicker */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 border border-[#E4C9C9] text-xs font-semibold text-neutral-800 shadow-xs mb-8">
          <Sparkles className="w-3.5 h-3.5 text-[#C47D7D]" />
          <span>{t('hero.badge')}</span>
        </div>

        {/* Massive expressive display title with Chrome Airplane object */}
        <div className="relative my-4 select-none flex items-center justify-center">
          {/* Big Typography behind/underneath the airplane */}
          <h1
            className="font-display font-black tracking-tight text-[#ECD3D3] uppercase text-6xl sm:text-8xl md:text-9xl lg:text-[13rem] xl:text-[15rem] leading-none"
            style={{
              textShadow: '0 2px 20px rgba(232, 196, 196, 0.4)',
            }}
          >
            {mainWord}
          </h1>

          {/* Floating 3D Chrome Paper Airplane illustration centered over the title */}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="pointer-events-auto">
              <HeroPaperPlane />
            </div>
          </div>
        </div>

        {/* Primary Course Value Proposition Headline & Subtitle */}
        <div className="max-w-3xl mx-auto mt-8 sm:mt-12 space-y-3 sm:space-y-4">
          {/* 1. НАД ЗАГОЛОВКОМ: Маленькая подпись-«таблетка» над заголовком «Курс графического дизайна с нуля» */}
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/90 border border-[#E8D4D4] text-xs font-semibold text-[#8B4848] shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-[#B86868]" />
              <span>{t('hero.school_badge')}</span>
            </div>
          </div>

          <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold tracking-tight text-neutral-900 leading-tight">
            {t('hero.heading')}
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-neutral-600 font-normal leading-relaxed max-w-2xl mx-auto">
            {t('hero.subheading')}
          </p>

          {/* 2. ПОД ПОДЗАГОЛОВКОМ (перед кнопками): Короткая строка серым цветом */}
          <p className="text-xs sm:text-sm text-neutral-500 font-normal leading-relaxed max-w-xl mx-auto pt-0.5">
            {t('hero.description')}
          </p>
        </div>

        {/* Buttons in tablet/pill shape paired with separate circular arrow button */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
          {/* Primary Pill Button with adjacent circular arrow button */}
          <div className="inline-flex items-center gap-1.5 p-1 bg-white rounded-full shadow-md border border-[#E8D3D3] hover:border-[#D6A9A9] transition-all group">
            <button
              onClick={onSelectPackage}
              className="px-6 py-3.5 text-sm sm:text-base font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-colors cursor-pointer"
            >
              {t('hero.cta_package')}
            </button>
            <button
              onClick={onSelectPackage}
              className="w-12 h-12 rounded-full bg-neutral-900 group-hover:bg-[#B86868] text-white flex items-center justify-center transition-colors cursor-pointer"
              aria-label={t('hero.cta_package')}
            >
              <ArrowUpRight className="w-5 h-5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
          </div>

          {/* Secondary Pill Button */}
          <div className="inline-flex items-center gap-1.5 p-1 bg-white/70 hover:bg-white rounded-full border border-[#E8D3D3] transition-all">
            <button
              onClick={onEnterCabinet}
              className="px-6 py-3.5 text-sm sm:text-base font-semibold text-neutral-800 hover:text-neutral-950 rounded-full transition-colors cursor-pointer"
            >
              {user ? t('nav.cabinet') : t('hero.cta_login')}
            </button>
            <button
              onClick={onEnterCabinet}
              className="w-12 h-12 rounded-full bg-[#FAF5F5] hover:bg-[#EFE3E3] text-neutral-900 flex items-center justify-center transition-colors cursor-pointer border border-[#E8D3D3]"
              aria-label={t('hero.cta_login')}
            >
              <ArrowUpRight className="w-4 h-4 text-neutral-700" />
            </button>
          </div>
        </div>

        {/* 3. ТРИ МЕТКИ: Под кнопками в один ряд (на телефоне в столбик) */}
        <div className="mt-12 pt-8 border-t border-[#EBD6D6] max-w-3xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-neutral-600 font-medium">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#E8D6D6] text-neutral-700 shadow-2xs">
            <Globe className="w-3.5 h-3.5 text-[#B86868] shrink-0" />
            <span>{t('hero.tag_online')}</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#E8D6D6] text-neutral-700 shadow-2xs">
            <GraduationCap className="w-3.5 h-3.5 text-[#B86868] shrink-0" />
            <span>{t('hero.tag_beginners')}</span>
          </div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/80 border border-[#E8D6D6] text-neutral-700 shadow-2xs">
            <Briefcase className="w-3.5 h-3.5 text-[#B86868] shrink-0" />
            <span>{t('hero.tag_portfolio')}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
