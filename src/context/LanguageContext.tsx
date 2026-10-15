import React, { createContext, useContext, useState, useEffect } from 'react';
import ruLocale from '../locales/ru.json';
import tjLocale from '../locales/tj.json';
import enLocale from '../locales/en.json';

export type Language = 'ru' | 'tj' | 'en';

type LocaleData = typeof ruLocale;

const translations: Record<Language, any> = {
  ru: ruLocale,
  tj: tjLocale,
  en: enLocale,
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (path: string, fallback?: string) => any;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('airy_plane_lang') as Language;
      if (saved && (saved === 'ru' || saved === 'tj' || saved === 'en')) {
        return saved;
      }
    }
    return 'ru';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    if (typeof window !== 'undefined') {
      localStorage.setItem('airy_plane_lang', lang);
      document.documentElement.lang = lang;
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      document.documentElement.lang = language;
    }
  }, [language]);

  const t = (path: string, fallback?: string): any => {
    const keys = path.split('.');
    let current: any = translations[language];

    for (const key of keys) {
      if (current && typeof current === 'object' && key in current) {
        current = current[key];
      } else {
        // Fallback to Russian if key is missing in target language
        let fallbackVal: any = translations.ru;
        for (const fKey of keys) {
          if (fallbackVal && typeof fallbackVal === 'object' && fKey in fallbackVal) {
            fallbackVal = fallbackVal[fKey];
          } else {
            fallbackVal = undefined;
            break;
          }
        }
        return fallbackVal !== undefined ? fallbackVal : fallback || path;
      }
    }

    return current;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};
