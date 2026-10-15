/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { AboutCourse } from './components/AboutCourse';
import { TeacherSection } from './components/TeacherSection';
import { PackagesSection } from './components/PackagesSection';
import { FAQSection } from './components/FAQSection';
import { Footer } from './components/Footer';
import { LoginPage } from './components/LoginPage';
import { PaymentModal } from './components/PaymentModal';
import { StudentCabinet } from './components/StudentCabinet';
import { TeacherCabinet } from './components/TeacherCabinet';
import { AdminPanel } from './components/AdminPanel';
import { SupabaseConfigModal } from './components/SupabaseConfigModal';
import { FloatingSurprisePlane } from './components/FloatingSurprisePlane';
import { PackageType, UserRole } from './types/database';
import { AlertTriangle, X } from 'lucide-react';

/* DEMO, удалить после скриншотов */
import { DemoNavBanner } from './demo/DemoNavBanner';
import { DemoStudentCabinet } from './demo/DemoStudentCabinet';
import { DemoTeacherCabinet } from './demo/DemoTeacherCabinet';
import { DemoAdminPanel } from './demo/DemoAdminPanel';

type AppView = 'landing' | 'login' | 'cabinet' | 'teacher' | 'admin' | 'demo-student' | 'demo-teacher' | 'demo-admin';

const MainLayout: React.FC = () => {
  const { user, userRole, isAdmin, loading: authLoading, selectedPackage, setSelectedPackage, enrollInPackage } = useAuth();

  const [currentView, setCurrentView] = useState<AppView>('landing');
  const [loginMode, setLoginMode] = useState<'login' | 'register' | 'reset'>('login');
  const [accessNotice, setAccessNotice] = useState<string | null>(null);
  const [configModalOpen, setConfigModalOpen] = useState(false);

  const parseHash = useCallback((): { view: AppView; mode?: 'login' | 'register' | 'reset' } => {
    const hash = window.location.hash.toLowerCase();
    const rawHash = hash.replace(/\/$/, '');
    const pathname = window.location.pathname.toLowerCase().replace(/\/$/, '');

    // DEMO ROUTES: /demo/student, /demo/teacher, /demo/admin (без авторизации для скриншотов)
    if (rawHash === '#/demo/student' || rawHash === '#demo/student' || pathname === '/demo/student') return { view: 'demo-student' };
    if (rawHash === '#/demo/teacher' || rawHash === '#demo/teacher' || pathname === '/demo/teacher') return { view: 'demo-teacher' };
    if (rawHash === '#/demo/admin' || rawHash === '#demo/admin' || pathname === '/demo/admin') return { view: 'demo-admin' };

    if (hash === '#/login' || hash === '#/auth' || pathname === '/login' || pathname === '/auth') {
      return { view: 'login', mode: 'login' };
    }
    if (hash === '#/register' || pathname === '/register') return { view: 'login', mode: 'register' };
    if (hash === '#/cabinet' || hash === '#/student' || pathname === '/cabinet') return { view: 'cabinet' };
    if (hash === '#/teacher' || pathname === '/teacher') return { view: 'teacher' };
    if (hash === '#/admin' || pathname === '/admin') return { view: 'admin' };
    return { view: 'landing' };
  }, []);

  // Handle URL hash and popstate changes
  useEffect(() => {
    const handleHashChange = () => {
      const parsed = parseHash();
      setCurrentView(parsed.view);
      if (parsed.mode) setLoginMode(parsed.mode);
    };

    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    window.addEventListener('popstate', handleHashChange);
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
      window.removeEventListener('popstate', handleHashChange);
    };
  }, [parseHash]);

  // Enforce Access Control Route Guards (Rule 3)
  useEffect(() => {
    if (authLoading) return; // Wait until session is determined from database

    // DEMO: Demo cabinets bypass authentication and guards for screenshots
    if (currentView === 'demo-student' || currentView === 'demo-teacher' || currentView === 'demo-admin') {
      return;
    }

    // 1. Not logged in guard
    if (currentView === 'admin' || currentView === 'teacher' || currentView === 'cabinet') {
      if (!user) {
        setAccessNotice('Нет доступа. Пожалуйста, войдите в аккаунт.');
        setCurrentView('login');
        window.location.hash = '#/login';
        return;
      }
    }

    // Admin can open all 3 windows (/admin, /teacher, /cabinet) for testing (Rule 4)
    if (isAdmin) {
      return;
    }

    // 2. Student guards: cannot open /teacher or /admin
    if (userRole === 'student') {
      if (currentView === 'admin' || currentView === 'teacher') {
        setAccessNotice('Нет доступа. Вы перенаправлены в свой кабинет ученика.');
        setCurrentView('cabinet');
        window.location.hash = '#/cabinet';
      }
    }

    // 3. Teacher guards: cannot open /admin
    if (userRole === 'teacher') {
      if (currentView === 'admin') {
        setAccessNotice('Нет доступа к панели администратора. Вы перенаправлены в кабинет преподавателя.');
        setCurrentView('teacher');
        window.location.hash = '#/teacher';
      } else if (currentView === 'cabinet') {
        setCurrentView('teacher');
        window.location.hash = '#/teacher';
      }
    }
  }, [currentView, user, userRole, isAdmin, authLoading]);

  // Auto-dismiss accessNotice after 5 seconds
  useEffect(() => {
    if (!accessNotice) return;
    const timer = setTimeout(() => {
      setAccessNotice(null);
    }, 5000);
    return () => clearTimeout(timer);
  }, [accessNotice]);

  const handleSelectPackage = async (pkg: PackageType) => {
    setSelectedPackage(pkg);
    if (!user) {
      setLoginMode('register');
      setCurrentView('login');
      window.location.hash = '#/register';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      await enrollInPackage(pkg);
    }
  };

  const handleEnterCabinet = () => {
    if (!user) {
      setLoginMode('login');
      setCurrentView('login');
      window.location.hash = '#/login';
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      let target: 'admin' | 'teacher' | 'cabinet' = 'cabinet';
      if (userRole === 'admin') target = 'admin';
      else if (userRole === 'teacher') target = 'teacher';

      setCurrentView(target);
      window.location.hash = `#/${target}`;
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleNavClick = (anchorId: string) => {
    if (currentView !== 'landing') {
      setCurrentView('landing');
      window.location.hash = '#/';
      setTimeout(() => {
        const el = document.getElementById(anchorId);
        if (el) el.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      const el = document.getElementById(anchorId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Rule 3: Redirect strictly based on database role
  const handleLoginSuccess = (role: UserRole) => {
    setAccessNotice(null);
    if (role === 'admin') {
      setCurrentView('admin');
      window.location.hash = '#/admin';
    } else if (role === 'teacher') {
      setCurrentView('teacher');
      window.location.hash = '#/teacher';
    } else {
      setCurrentView('cabinet');
      window.location.hash = '#/cabinet';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF5F5] text-neutral-900 font-sans selection:bg-[#E2B4B4] selection:text-neutral-900">
      {/* Access Denied Notification Banner */}
      {accessNotice && (
        <div className="bg-[#B86868] text-white px-4 py-3 text-xs sm:text-sm font-bold shadow-md transition-all animate-in fade-in slide-in-from-top-2">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <AlertTriangle className="w-4 h-4 shrink-0 text-white" />
              <span>{accessNotice}</span>
            </div>
            <button
              onClick={() => setAccessNotice(null)}
              className="p-1 hover:bg-white/20 rounded-full transition-colors cursor-pointer"
              aria-label="Закрыть уведомление"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Top Navbar with Admin View-As Switcher */}
      <Navbar
        currentView={
          currentView === 'demo-student'
            ? 'cabinet'
            : currentView === 'demo-teacher'
            ? 'teacher'
            : currentView === 'demo-admin'
            ? 'admin'
            : currentView
        }
        setCurrentView={(view) => {
          setCurrentView(view);
          if (view === 'landing') window.location.hash = '#/';
          else if (view === 'login') window.location.hash = '#/login';
          else if (view === 'cabinet') window.location.hash = '#/cabinet';
          else if (view === 'teacher') window.location.hash = '#/teacher';
          else if (view === 'admin') window.location.hash = '#/admin';
        }}
        onOpenConfig={() => setConfigModalOpen(true)}
      />

      {/* Main Page Content Body */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <>
            <Hero
              onSelectPackage={() => handleNavClick('packages')}
              onEnterCabinet={handleEnterCabinet}
            />
            <AboutCourse />
            <TeacherSection />
            <PackagesSection onSelectPackage={handleSelectPackage} />
            <FAQSection />
          </>
        )}

        {currentView === 'login' && (
          <LoginPage
            initialMode={loginMode}
            selectedPackage={selectedPackage}
            onBackToHome={() => {
              setCurrentView('landing');
              window.location.hash = '#/';
            }}
            onSuccess={handleLoginSuccess}
          />
        )}

        {/* Window 1: /cabinet (student) */}
        {currentView === 'cabinet' && (
          <StudentCabinet
            onBackToLanding={() => {
              setCurrentView('landing');
              window.location.hash = '#/';
            }}
          />
        )}

        {/* Window 2: /teacher (teacher) */}
        {currentView === 'teacher' && <TeacherCabinet />}

        {/* Window 3: /admin (admin) */}
        {currentView === 'admin' && <AdminPanel />}

        {/* DEMO, удалить после скриншотов - Страница 1: /demo/student (Кабинет ученика) */}
        {currentView === 'demo-student' && (
          <div>
            <DemoNavBanner
              currentDemo="student"
              onNavigate={(v) => {
                if (v === 'home') {
                  setCurrentView('landing');
                  window.location.hash = '#/';
                } else {
                  setCurrentView(`demo-${v}` as AppView);
                  window.location.hash = `#/demo/${v}`;
                }
              }}
            />
            <DemoStudentCabinet
              onBackToLanding={() => {
                setCurrentView('landing');
                window.location.hash = '#/';
              }}
            />
          </div>
        )}

        {/* DEMO, удалить после скриншотов - Страница 2: /demo/teacher (Кабинет преподавателя) */}
        {currentView === 'demo-teacher' && (
          <div>
            <DemoNavBanner
              currentDemo="teacher"
              onNavigate={(v) => {
                if (v === 'home') {
                  setCurrentView('landing');
                  window.location.hash = '#/';
                } else {
                  setCurrentView(`demo-${v}` as AppView);
                  window.location.hash = `#/demo/${v}`;
                }
              }}
            />
            <DemoTeacherCabinet />
          </div>
        )}

        {/* DEMO, удалить после скриншотов - Страница 3: /demo/admin (Кабинет администратора) */}
        {currentView === 'demo-admin' && (
          <div>
            <DemoNavBanner
              currentDemo="admin"
              onNavigate={(v) => {
                if (v === 'home') {
                  setCurrentView('landing');
                  window.location.hash = '#/';
                } else {
                  setCurrentView(`demo-${v}` as AppView);
                  window.location.hash = `#/demo/${v}`;
                }
              }}
            />
            <DemoAdminPanel />
          </div>
        )}
      </main>

      {/* Footer */}
      <Footer onNavClick={handleNavClick} />

      {/* Modals & Interactive Overlays */}
      <FloatingSurprisePlane />
      <PaymentModal />
      <SupabaseConfigModal
        isOpen={configModalOpen}
        onClose={() => setConfigModalOpen(false)}
      />
    </div>
  );
};

export default function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <MainLayout />
      </AuthProvider>
    </LanguageProvider>
  );
}
