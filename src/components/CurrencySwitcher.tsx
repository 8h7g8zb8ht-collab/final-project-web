import React from 'react';
import {
  PricingCurrency,
  getCurrencySwitcherLabel,
} from '../config/pricingConfig';

interface CurrencySwitcherProps {
  currentCurrency: PricingCurrency;
  onChange: (currency: PricingCurrency) => void;
  language: string;
}

const CURRENCIES: PricingCurrency[] = ['usd', 'tjs', 'rub'];

export const CurrencySwitcher: React.FC<CurrencySwitcherProps> = ({
  currentCurrency,
  onChange,
  language,
}) => {
  return (
    <div
      role="group"
      aria-label="Выбор валюты"
      className="inline-flex items-center p-1 bg-white/85 backdrop-blur-xs rounded-full border border-[#DCB0B0] shadow-xs"
    >
      {CURRENCIES.map((curr) => {
        const isActive = currentCurrency === curr;
        const label = getCurrencySwitcherLabel(curr, language);

        return (
          <button
            key={curr}
            type="button"
            onClick={() => onChange(curr)}
            className={`px-3.5 py-1.5 sm:px-5 sm:py-2 rounded-full text-xs sm:text-sm font-bold tracking-tight transition-all duration-200 cursor-pointer select-none focus:outline-hidden ${
              isActive
                ? 'bg-neutral-900 text-white shadow-sm scale-100'
                : 'text-neutral-700 hover:text-neutral-950 hover:bg-white/60'
            }`}
            aria-pressed={isActive}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
};
