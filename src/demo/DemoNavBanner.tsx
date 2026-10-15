/* DEMO, удалить после скриншотов */
import React from 'react';
import { Camera, User, GraduationCap, ShieldCheck, ArrowLeft } from 'lucide-react';

interface DemoNavBannerProps {
  currentDemo: 'student' | 'teacher' | 'admin';
  onNavigate: (view: 'student' | 'teacher' | 'admin' | 'home') => void;
}

export const DemoNavBanner: React.FC<DemoNavBannerProps> = ({ currentDemo, onNavigate }) => {
  return (
    <div className="bg-neutral-900 text-white border-b border-neutral-800 sticky top-0 z-40 shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
        {/* Left: Mode Badge */}
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#B86868] text-white font-black text-[11px] uppercase tracking-wider shadow-xs">
            <Camera className="w-3.5 h-3.5" />
            <span>Демо-режим для презентации</span>
          </span>
          <span className="hidden sm:inline text-neutral-400 font-medium">
            (Авторизация не требуется · данные смоделированы)
          </span>
        </div>

        {/* Center: Switcher between 3 cabinets */}
        <div className="flex items-center gap-1.5 bg-neutral-800/90 p-1 rounded-2xl border border-neutral-700">
          <button
            onClick={() => onNavigate('student')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentDemo === 'student'
                ? 'bg-[#B86868] text-white shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-700/60'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Ученик</span>
          </button>

          <button
            onClick={() => onNavigate('teacher')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentDemo === 'teacher'
                ? 'bg-[#B86868] text-white shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-700/60'
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Преподаватель</span>
          </button>

          <button
            onClick={() => onNavigate('admin')}
            className={`px-3 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
              currentDemo === 'admin'
                ? 'bg-[#B86868] text-white shadow-xs'
                : 'text-neutral-300 hover:text-white hover:bg-neutral-700/60'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Администратор</span>
          </button>
        </div>

        {/* Right: Return to main website */}
        <div>
          <button
            onClick={() => onNavigate('home')}
            className="inline-flex items-center gap-1 text-neutral-400 hover:text-white transition-colors font-medium px-2 py-1 rounded-lg hover:bg-neutral-800 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>На сайт</span>
          </button>
        </div>
      </div>
    </div>
  );
};
