import React, { useState, useRef } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { PackageType } from '../types/database';
import { Check, ArrowRight, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { CurrencySwitcher } from './CurrencySwitcher';
import {
  PricingCurrency,
  getPackagePriceDisplay,
} from '../config/pricingConfig';

interface PackagesSectionProps {
  onSelectPackage: (pkg: PackageType) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({ onSelectPackage }) => {
  const { t, language } = useTranslation();
  const { enrollment } = useAuth();
  const [activePackageIndex, setActivePackageIndex] = useState(1); // Standard as default center
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Currency selection: defaults to USD on first visit, saved in localStorage
  const [currency, setCurrency] = useState<PricingCurrency>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('course_pricing_currency') as PricingCurrency;
      if (saved === 'usd' || saved === 'tjs' || saved === 'rub') {
        return saved;
      }
    }
    return 'usd';
  });

  const handleCurrencyChange = (newCurrency: PricingCurrency) => {
    setCurrency(newCurrency);
    if (typeof window !== 'undefined') {
      localStorage.setItem('course_pricing_currency', newCurrency);
    }
  };

  const packagesData: {
    id: PackageType;
    isPopular: boolean;
    nameKey: string;
    descKey: string;
    featuresKey: string;
  }[] = [
    {
      id: 'basic',
      isPopular: false,
      nameKey: 'packages.basic.name',
      descKey: 'packages.basic.desc',
      featuresKey: 'packages.basic.features',
    },
    {
      id: 'standard',
      isPopular: true,
      nameKey: 'packages.standard.name',
      descKey: 'packages.standard.desc',
      featuresKey: 'packages.standard.features',
    },
    {
      id: 'pro',
      isPopular: false,
      nameKey: 'packages.pro.name',
      descKey: 'packages.pro.desc',
      featuresKey: 'packages.pro.features',
    },
  ];

  const handlePrev = () => {
    setActivePackageIndex((prev) => (prev > 0 ? prev - 1 : packagesData.length - 1));
  };

  const handleNext = () => {
    setActivePackageIndex((prev) => (prev < packagesData.length - 1 ? prev + 1 : 0));
  };

  return (
    <section id="packages" className="py-24 sm:py-32 bg-[#EFCFCF] relative overflow-hidden">
      {/* Background radial gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#FAF5F5]/40 via-transparent to-[#FAF5F5]/30 pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1 rounded-full bg-white/70 border border-[#DEB5B5] text-neutral-800 text-xs font-semibold uppercase tracking-wider mb-3 shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-[#B86868]" />
            <span>{t('packages.tag')}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            {t('packages.title')}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-700">
            {t('packages.subtitle')}
          </p>

          {/* Currency Switcher above the pricing cards */}
          <div className="mt-8 flex justify-center">
            <CurrencySwitcher
              currentCurrency={currency}
              onChange={handleCurrencyChange}
              language={language}
            />
          </div>

          {/* Left / Right Carousel Navigation Controls */}
          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={handlePrev}
              className="w-11 h-11 rounded-full bg-white hover:bg-neutral-900 hover:text-white text-neutral-800 flex items-center justify-center shadow-md transition-all cursor-pointer border border-[#DCB0B0]"
              aria-label="Previous package"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="text-xs font-bold uppercase tracking-wider text-neutral-700">
              {activePackageIndex + 1} / {packagesData.length}
            </span>
            <button
              onClick={handleNext}
              className="w-11 h-11 rounded-full bg-white hover:bg-neutral-900 hover:text-white text-neutral-800 flex items-center justify-center shadow-md transition-all cursor-pointer border border-[#DCB0B0]"
              aria-label="Next package"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3 Arch-Shaped Cards on Pink Background */}
        <div
          ref={scrollContainerRef}
          className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto"
        >
          {packagesData.map((pkg, idx) => {
            const isSelected = enrollment?.package === pkg.id;
            const features = t(pkg.featuresKey) as string[];
            const isHighlight = pkg.isPopular;
            const displayPrice = getPackagePriceDisplay(pkg.id, currency, language);

            return (
              <div
                key={pkg.id}
                className={`arch-card bg-white transition-all duration-300 flex flex-col justify-between p-8 sm:p-10 relative ${
                  isHighlight
                    ? 'ring-2 ring-neutral-900 shadow-2xl scale-100 lg:-translate-y-3 z-10'
                    : 'shadow-xl hover:shadow-2xl border border-white/80'
                } ${activePackageIndex === idx ? 'ring-2 ring-[#B86868] lg:ring-0' : 'opacity-90 lg:opacity-100'}`}
              >
                {/* Popular Pill Badge */}
                {pkg.isPopular && (
                  <div className="absolute top-6 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider bg-neutral-900 text-white shadow-sm">
                      {t('packages.popular_badge')}
                    </span>
                  </div>
                )}

                <div>
                  {/* Card Arch Top Header */}
                  <div className="text-center pt-6 pb-6 border-b border-[#F0DEDE]">
                    <h3 className="text-2xl sm:text-3xl font-black text-neutral-900 font-display">
                      {t(pkg.nameKey)}
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-neutral-500 font-medium">
                      {t(pkg.descKey)}
                    </p>

                    {/* Price with fixed height container to prevent layout jump and smooth animation */}
                    <div className="mt-6 flex items-baseline justify-center min-h-[2.5rem]">
                      <span
                        key={`${pkg.id}-${currency}`}
                        className="text-2xl sm:text-3xl font-black text-neutral-900 font-display tabular-nums tracking-tight animate-price-change"
                      >
                        {displayPrice}
                      </span>
                    </div>
                  </div>

                  {/* Feature Checklist */}
                  <div className="py-8 space-y-4">
                    {features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-3">
                        <div className="w-5 h-5 rounded-full bg-[#F3DEDE] text-[#B86868] flex items-center justify-center shrink-0 mt-0.5">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-sm text-neutral-700 leading-snug">
                          {feature}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom CTA Button: Pill with Circular Arrow beside it */}
                <div className="pt-6 border-t border-[#F0DEDE]">
                  <div className="flex items-center justify-center gap-1.5 w-full">
                    <button
                      onClick={() => onSelectPackage(pkg.id)}
                      className={`flex-1 py-3.5 px-6 rounded-full text-sm font-bold transition-all cursor-pointer text-center ${
                        isSelected
                          ? 'bg-[#B86868] text-white shadow-sm'
                          : isHighlight
                          ? 'bg-neutral-900 hover:bg-neutral-800 text-white shadow-md'
                          : 'bg-[#F2DFDF] hover:bg-[#E8CFCF] text-neutral-900'
                      }`}
                    >
                      {isSelected ? t('packages.current_btn') : t('packages.select_btn')}
                    </button>
                    <button
                      onClick={() => onSelectPackage(pkg.id)}
                      className={`w-12 h-12 rounded-full flex items-center justify-center transition-all cursor-pointer shrink-0 ${
                        isSelected
                          ? 'bg-[#B86868] text-white'
                          : isHighlight
                          ? 'bg-neutral-900 hover:bg-neutral-800 text-white'
                          : 'bg-[#F2DFDF] hover:bg-[#E8CFCF] text-neutral-900'
                      }`}
                      aria-label={t('packages.select_btn')}
                    >
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>

                  {isSelected && enrollment?.status === 'pending' && (
                    <p className="mt-3 text-center text-xs font-semibold text-amber-700 bg-amber-50 py-1.5 px-3 rounded-lg">
                      Ожидает подтверждения оплаты
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Small muted text under the prices */}
        <div className="mt-8 text-center px-4">
          <p className="text-xs sm:text-sm text-neutral-600 font-medium max-w-2xl mx-auto">
            {t('packages.currency_disclaimer')}
          </p>
        </div>
      </div>
    </section>
  );
};
