import { PackageType } from '../types/database';

export type PricingCurrency = 'usd' | 'tjs' | 'rub';

export interface PackagePricingConfig {
  id: PackageType;
  /** Base price in Tajik Somoni (TJS) */
  baseTjs: number;
  /** Presentation target rounded value in USD */
  usd: number;
  /** Presentation target rounded value in TJS */
  tjs: number;
  /** Presentation target rounded value in RUB */
  rub: number;
}

/**
 * Centralized pricing configuration.
 * Base prices in Tajik Somoni (TJS):
 * - Базовый: 700 TJS
 * - Стандарт: 1500 TJS
 * - Про: 2500 TJS
 *
 * Approximate exchange rates as of 15 October 2026:
 * - about 9.24 TJS per 1 USD
 * - about 9.08 RUB per 1 TJS
 *
 * Exact rounded values matching presentation:
 * - USD: $76 / $162 / $271
 * - TJS: 700 / 1500 / 2500 сомони
 * - RUB: 6 360 ₽ / 13 600 ₽ / 22 700 ₽
 */
export const PRICING_CONFIG = {
  // Editable exchange rates (approximate as of 15 October 2026)
  exchangeRates: {
    tjsPerUsd: 9.24,
    rubPerTjs: 9.08,
  },

  // Base prices in Tajik Somoni (TJS)
  basePricesTjs: {
    basic: 700,
    standard: 1500,
    pro: 2500,
  } as Record<PackageType, number>,

  // Packages with presentation-rounded values across currencies
  packages: {
    basic: {
      id: 'basic' as PackageType,
      baseTjs: 700,
      usd: 76,
      tjs: 700,
      rub: 6360,
    },
    standard: {
      id: 'standard' as PackageType,
      baseTjs: 1500,
      usd: 162,
      tjs: 1500,
      rub: 13600,
    },
    pro: {
      id: 'pro' as PackageType,
      baseTjs: 2500,
      usd: 271,
      tjs: 2500,
      rub: 22700,
    },
  } as Record<PackageType, PackagePricingConfig>,
};

/**
 * Format a number with spaces between thousands (e.g. 6 360, 13 600, 22 700).
 * Uses a non-breaking space (\u00A0) to prevent line breaks inside price digits.
 */
export function formatThousands(val: number): string {
  return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}

/**
 * Returns localized label for currency switcher buttons.
 * USD ($), TJS (сомони / сомонӣ / somoni), RUB (₽).
 */
export function getCurrencySwitcherLabel(
  currency: PricingCurrency,
  language: string = 'ru'
): string {
  switch (currency) {
    case 'usd':
      return 'USD ($)';
    case 'tjs':
      if (language === 'tj') return 'TJS (сомонӣ)';
      if (language === 'en') return 'TJS (somoni)';
      return 'TJS (сомони)';
    case 'rub':
      return 'RUB (₽)';
  }
}

/**
 * Returns formatted price string for a package tier.
 * Formats:
 * - USD: $76 / $162 / $271
 * - TJS: 700 сомони / 1 500 сомони / 2 500 сомони
 * - RUB: 6 360 ₽ / 13 600 ₽ / 22 700 ₽
 */
export function getPackagePriceDisplay(
  packageId: PackageType,
  currency: PricingCurrency,
  language: string = 'ru'
): string {
  const pkg = PRICING_CONFIG.packages[packageId];
  if (!pkg) return '';

  if (currency === 'usd') {
    return `$${formatThousands(pkg.usd)}`;
  }

  if (currency === 'rub') {
    return `${formatThousands(pkg.rub)}\u00A0₽`;
  }

  // TJS
  const tjsUnit =
    language === 'tj' ? 'сомонӣ' : language === 'en' ? 'somoni' : 'сомони';
  return `${formatThousands(pkg.tjs)}\u00A0${tjsUnit}`;
}
