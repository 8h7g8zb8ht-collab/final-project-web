import React from 'react';
import { useTranslation } from '../context/LanguageContext';
import { Send, Mail, Phone, Heart } from 'lucide-react';

interface FooterProps {
  onNavClick: (id: string) => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavClick }) => {
  const { t } = useTranslation();

  return (
    <footer className="bg-[#FAF5F5] border-t border-[#EBD6D6] pt-16 pb-12 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 pb-16 border-b border-[#EBD6D6]">
          {/* Brand & mission */}
          <div className="md:col-span-6 space-y-4">
            <span className="font-display text-2xl font-black tracking-tight text-neutral-900">
              AIRY PLANE
            </span>
            <p className="text-sm text-neutral-600 max-w-md leading-relaxed">
              {t('footer.desc')}
            </p>
          </div>

          {/* Quick links */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">
              {t('footer.links_title')}
            </h4>
            <ul className="space-y-2 text-sm text-neutral-700">
              <li>
                <button
                  onClick={() => onNavClick('about')}
                  className="hover:text-neutral-950 transition-colors cursor-pointer"
                >
                  {t('nav.about')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('teacher')}
                  className="hover:text-neutral-950 transition-colors cursor-pointer"
                >
                  {t('nav.teacher')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('packages')}
                  className="hover:text-neutral-950 transition-colors cursor-pointer"
                >
                  {t('nav.packages')}
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavClick('faq')}
                  className="hover:text-neutral-950 transition-colors cursor-pointer"
                >
                  {t('nav.faq')}
                </button>
              </li>
              <li className="pt-2 border-t border-[#EBD6D6]">
                <span className="block text-[11px] font-bold uppercase text-neutral-400 mb-1">
                  Демо для скриншотов:
                </span>
                <div className="flex flex-col gap-1 text-xs">
                  <a href="#/demo/student" className="text-[#B86868] hover:underline font-semibold">
                    → Кабинет ученика
                  </a>
                  <a href="#/demo/teacher" className="text-[#B86868] hover:underline font-semibold">
                    → Кабинет преподавателя
                  </a>
                  <a href="#/demo/admin" className="text-[#B86868] hover:underline font-semibold">
                    → Кабинет администратора
                  </a>
                </div>
              </li>
            </ul>
          </div>

          {/* Contacts */}
          <div className="md:col-span-3 space-y-3">
            <h4 className="text-xs uppercase font-extrabold text-neutral-400 tracking-wider">
              {t('footer.contacts_title')}
            </h4>
            <div className="space-y-2 text-sm text-neutral-700">
              <a
                href="https://t.me/+992116416152"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-neutral-950 transition-colors"
              >
                <Send className="w-4 h-4 text-[#B86868]" />
                <span>+992 116 41 61 52 (Telegram)</span>
              </a>
              <div className="flex items-center gap-2 text-neutral-600">
                <Phone className="w-4 h-4 text-[#B86868]" />
                <span>+992 116 41 61 52</span>
              </div>
              <div className="flex items-center gap-2 text-neutral-600">
                <Mail className="w-4 h-4 text-[#B86868]" />
                <span>mahmudimunisa8@gmail.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Huge bottom watermark typography:
            Full width within footer container, perfectly centered without clipping letter 'E' */}
        <div className="pt-10 text-center select-none @container">
          <p
            className="font-display font-black tracking-tight text-[#E8C4C4]/70 uppercase leading-none whitespace-nowrap text-center text-[clamp(2.25rem,11.4vw,9.6rem)]"
            style={{
              fontSize: 'clamp(2.25rem, 12.5cqi, 9.6rem)',
            }}
          >
            AIRY PLANE
          </p>
        </div>

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-neutral-500 gap-4 pt-6 border-t border-[#F0DEDE]">
          <p>© {new Date().getFullYear()} AIRY PLANE. {t('footer.rights')}</p>
          
          {/* DEMO, удалить после скриншотов */}
          <div className="flex items-center gap-2 text-[11px] text-neutral-400 bg-neutral-100/70 px-3 py-1 rounded-full border border-neutral-200">
            <span className="font-bold text-neutral-600">Демо для скриншотов:</span>
            <a href="#/demo/student" className="hover:text-[#B86868] font-medium underline">Ученик</a>
            <span>·</span>
            <a href="#/demo/teacher" className="hover:text-[#B86868] font-medium underline">Преподаватель</a>
            <span>·</span>
            <a href="#/demo/admin" className="hover:text-[#B86868] font-medium underline">Админ</a>
          </div>

          <p className="flex items-center gap-1">
            <span>Школа графического дизайна Мунисы Махмуди</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
