import React, { useState, useRef, useEffect } from 'react';
import { useTranslation, Language } from '../context/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { Menu, X, LogOut, Settings, Globe, ChevronDown, Check, ShieldCheck, GraduationCap, BookOpen, Eye } from 'lucide-react';

interface NavbarProps {
  currentView: 'landing' | 'login' | 'cabinet' | 'teacher' | 'admin';
  setCurrentView: (view: 'landing' | 'login' | 'cabinet' | 'teacher' | 'admin') => void;
  onOpenConfig?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentView, setCurrentView, onOpenConfig }) => {
  const { t, language, setLanguage } = useTranslation();
  const { user, userRole, isAdmin, adminViewAs, setAdminViewAs, isConfigured, signOut } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);

  const languages: { code: Language; label: string; fullLabel: string }[] = [
    { code: 'ru', label: 'RU', fullLabel: 'Русский' },
    { code: 'tj', label: 'TJ', fullLabel: 'Тоҷикӣ' },
    { code: 'en', label: 'EN', fullLabel: 'English' },
  ];

  const currentLangObj = languages.find((l) => l.code === language) || languages[0];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setLangDropdownOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setLangDropdownOpen(false);
      }
    };

    if (langDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [langDropdownOpen]);

  const handleNavClick = (anchorId?: string) => {
    if (!anchorId || anchorId === 'home') {
      setCurrentView('landing');
      window.location.hash = '#/';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      if (currentView !== 'landing') {
        setCurrentView('landing');
        window.location.hash = '#/';
        setTimeout(() => {
          const el = document.getElementById(anchorId);
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }
    }
    setMobileMenuOpen(false);
  };

  const handleOpenMyCabinet = () => {
    if (userRole === 'admin') {
      setCurrentView('admin');
      window.location.hash = '#/admin';
    } else if (userRole === 'teacher') {
      setCurrentView('teacher');
      window.location.hash = '#/teacher';
    } else {
      setCurrentView('cabinet');
      window.location.hash = '#/cabinet';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setMobileMenuOpen(false);
  };

  const handleSignOut = async () => {
    await signOut();
    setCurrentView('landing');
    window.location.hash = '#/';
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-[#FAF5F5]/90 backdrop-blur-md border-b border-[#EED9D9]/80 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo Brand Title */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left group cursor-pointer"
            >
              <span className="font-display text-xl sm:text-2xl font-black tracking-tight text-neutral-900 group-hover:text-[#C47D7D] transition-colors">
                AIRY PLANE
              </span>
            </button>
          </div>

          {/* Desktop Nav: Главная, Пакеты, Вопросы */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-neutral-700">
            <button
              onClick={() => handleNavClick('home')}
              className={`hover:text-neutral-950 transition-colors cursor-pointer font-semibold ${
                currentView === 'landing' ? 'text-neutral-950 font-bold' : ''
              }`}
            >
              {t('nav.home') || 'Главная'}
            </button>
            <button
              onClick={() => handleNavClick('packages')}
              className="hover:text-neutral-950 transition-colors cursor-pointer font-semibold"
            >
              {t('nav.packages') || 'Пакеты'}
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className="hover:text-neutral-950 transition-colors cursor-pointer font-semibold"
            >
              {t('nav.faq') || 'Вопросы'}
            </button>
            <a
              href="https://t.me/+992116416152"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-neutral-950 transition-colors text-xs font-semibold text-[#B86868] bg-[#F7EAEA] px-3 py-1.5 rounded-full"
            >
              Telegram: +992 116 41 61 52
            </a>
          </nav>

          {/* Right Controls: Admin View-As Switcher + Language Selector + Cabinet/Auth */}
          <div className="flex items-center gap-2.5 sm:gap-4">
            {/* Rule 4: Admin "View As" Switcher (visible ONLY to admin) */}
            {isAdmin && (
              <div className="hidden md:flex items-center bg-[#F2E4E4] p-1 rounded-full border border-[#DFCECE] text-xs shadow-xs">
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider text-neutral-500 flex items-center gap-1">
                  <Eye className="w-3 h-3" />
                  Вид:
                </span>
                <button
                  onClick={() => {
                    setAdminViewAs('admin');
                    setCurrentView('admin');
                    window.location.hash = '#/admin';
                  }}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer text-xs ${
                    currentView === 'admin'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-700 hover:text-neutral-950 hover:bg-white/60'
                  }`}
                >
                  Админ
                </button>
                <button
                  onClick={() => {
                    setAdminViewAs('teacher');
                    setCurrentView('teacher');
                    window.location.hash = '#/teacher';
                  }}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer text-xs ${
                    currentView === 'teacher'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-700 hover:text-neutral-950 hover:bg-white/60'
                  }`}
                >
                  Преподаватель
                </button>
                <button
                  onClick={() => {
                    setAdminViewAs('student');
                    setCurrentView('cabinet');
                    window.location.hash = '#/cabinet';
                  }}
                  className={`px-2.5 py-1 rounded-full font-bold transition-all cursor-pointer text-xs ${
                    currentView === 'cabinet'
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-700 hover:text-neutral-950 hover:bg-white/60'
                  }`}
                >
                  Ученик
                </button>
              </div>
            )}

            {/* Language Dropdown */}
            <div className="relative" ref={langDropdownRef}>
              <button
                type="button"
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-1.5 px-3 py-2 text-xs font-bold text-neutral-800 bg-white border border-[#DAC4C4] rounded-full hover:bg-[#F3E7E7] transition-colors cursor-pointer"
                aria-expanded={langDropdownOpen}
                aria-haspopup="listbox"
              >
                <Globe className="w-3.5 h-3.5 text-neutral-500" />
                <span>{currentLangObj.label}</span>
                <ChevronDown className="w-3 h-3 text-neutral-400" />
              </button>

              {langDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-36 bg-white rounded-2xl shadow-xl border border-[#DAC4C4] py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100"
                  role="listbox"
                >
                  {languages.map((l) => (
                    <button
                      key={l.code}
                      onClick={() => {
                        setLanguage(l.code);
                        setLangDropdownOpen(false);
                      }}
                      className="w-full text-left px-3.5 py-2 text-xs font-semibold text-neutral-700 hover:bg-[#FAF0F0] flex items-center justify-between cursor-pointer"
                    >
                      <span>{l.fullLabel}</span>
                      {language === l.code && <Check className="w-3.5 h-3.5 text-[#B86868]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Auth Actions */}
            {user ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={handleOpenMyCabinet}
                  className={`inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 text-xs sm:text-sm font-bold rounded-full transition-all cursor-pointer ${
                    currentView === 'cabinet' || currentView === 'teacher' || currentView === 'admin'
                      ? 'bg-neutral-900 text-white shadow-sm'
                      : 'bg-white text-neutral-900 border border-[#DAC4C4] hover:bg-[#F3E7E7]'
                  }`}
                >
                  {userRole === 'admin' ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                  ) : userRole === 'teacher' ? (
                    <BookOpen className="w-3.5 h-3.5 text-[#E2A6A6]" />
                  ) : (
                    <GraduationCap className="w-3.5 h-3.5" />
                  )}
                  <span>
                    {userRole === 'admin'
                      ? 'Панель администратора'
                      : userRole === 'teacher'
                      ? 'Кабинет преподавателя'
                      : 'Личный кабинет'}
                  </span>
                </button>

                <button
                  onClick={handleSignOut}
                  title="Выйти"
                  className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-600 hover:text-neutral-950 hover:bg-[#EFE3E3] rounded-full transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Выйти</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setCurrentView('login');
                  window.location.hash = '#/login';
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-5 py-2.5 text-xs sm:text-sm font-bold text-white bg-neutral-900 hover:bg-neutral-800 rounded-full transition-colors shadow-xs cursor-pointer"
              >
                {t('nav.login') || 'Войти'}
              </button>
            )}

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-neutral-700 hover:text-neutral-900 rounded-lg cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#FAF5F5] border-b border-[#EED9D9] px-4 pt-3 pb-6 space-y-3">
          {/* Admin Switcher Mobile */}
          {isAdmin && (
            <div className="p-3 bg-[#F2E4E4] rounded-2xl border border-[#DFCECE] space-y-2">
              <span className="text-[11px] font-black uppercase text-neutral-600 flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" /> Режим просмотра администратора:
              </span>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  onClick={() => {
                    setAdminViewAs('admin');
                    setCurrentView('admin');
                    window.location.hash = '#/admin';
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 rounded-xl text-xs font-bold ${
                    currentView === 'admin' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-800'
                  }`}
                >
                  Админ
                </button>
                <button
                  onClick={() => {
                    setAdminViewAs('teacher');
                    setCurrentView('teacher');
                    window.location.hash = '#/teacher';
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 rounded-xl text-xs font-bold ${
                    currentView === 'teacher' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-800'
                  }`}
                >
                  Учитель
                </button>
                <button
                  onClick={() => {
                    setAdminViewAs('student');
                    setCurrentView('cabinet');
                    window.location.hash = '#/cabinet';
                    setMobileMenuOpen(false);
                  }}
                  className={`py-1.5 rounded-xl text-xs font-bold ${
                    currentView === 'cabinet' ? 'bg-neutral-900 text-white' : 'bg-white text-neutral-800'
                  }`}
                >
                  Ученик
                </button>
              </div>
            </div>
          )}

          <div className="flex flex-col space-y-2">
            <button
              onClick={() => handleNavClick('home')}
              className="text-left py-2.5 px-3 rounded-xl text-sm font-semibold text-neutral-800 hover:bg-white transition-colors"
            >
              {t('nav.home') || 'Главная'}
            </button>
            <button
              onClick={() => handleNavClick('packages')}
              className="text-left py-2.5 px-3 rounded-xl text-sm font-semibold text-neutral-800 hover:bg-white transition-colors"
            >
              {t('nav.packages') || 'Пакеты'}
            </button>
            <button
              onClick={() => handleNavClick('faq')}
              className="text-left py-2.5 px-3 rounded-xl text-sm font-semibold text-neutral-800 hover:bg-white transition-colors"
            >
              {t('nav.faq') || 'Вопросы'}
            </button>
            <a
              href="https://t.me/+992116416152"
              target="_blank"
              rel="noopener noreferrer"
              className="text-left py-2.5 px-3 rounded-xl text-sm font-semibold text-[#B86868] hover:bg-white transition-colors"
            >
              Telegram: +992 116 41 61 52
            </a>
          </div>

          {/* Mobile Auth Button */}
          <div className="pt-2 border-t border-[#EED9D9]">
            {user ? (
              <div className="flex flex-col gap-2">
                <button
                  onClick={handleOpenMyCabinet}
                  className="w-full flex items-center justify-center gap-2 py-3 bg-neutral-900 text-white font-bold rounded-2xl text-sm shadow-xs cursor-pointer"
                >
                  {userRole === 'admin' ? (
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                  ) : userRole === 'teacher' ? (
                    <BookOpen className="w-4 h-4 text-[#E2A6A6]" />
                  ) : (
                    <GraduationCap className="w-4 h-4" />
                  )}
                  <span>
                    {userRole === 'admin'
                      ? 'Панель администратора'
                      : userRole === 'teacher'
                      ? 'Кабинет преподавателя'
                      : 'Личный кабинет'}
                  </span>
                </button>
                <button
                  onClick={handleSignOut}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white text-neutral-700 font-bold rounded-2xl text-sm border border-[#DAC4C4] hover:bg-[#F3E7E7] cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Выйти</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setCurrentView('login');
                  window.location.hash = '#/login';
                  setMobileMenuOpen(false);
                }}
                className="w-full py-3 bg-neutral-900 text-white font-bold rounded-2xl text-sm shadow-xs cursor-pointer"
              >
                {t('nav.login') || 'Войти'}
              </button>
            )}
          </div>

          {!isConfigured && onOpenConfig && (
            <div className="pt-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenConfig();
                }}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-amber-900 bg-amber-100 rounded-xl border border-amber-300"
              >
                <Settings className="w-3.5 h-3.5" />
                <span>Настроить Supabase подключение</span>
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
