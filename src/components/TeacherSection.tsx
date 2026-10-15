import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { TEACHER_CONFIG } from '../config/teacherConfig';
import { GraduationCap, Briefcase, CheckCircle2, ArrowRight, Sparkles, User } from 'lucide-react';

export const TeacherSection: React.FC = () => {
  const { t, language } = useTranslation();
  const [imageError, setImageError] = useState<boolean>(false);

  // Teacher name is centralized in TEACHER_CONFIG (Cyrillic for RU/TJ, Latin for EN)
  const teacherName = TEACHER_CONFIG.getName(language);

  // Retrieve translated pills and paragraphs
  const rawPills = t('teacher.pills');
  const pills: string[] = Array.isArray(rawPills) ? rawPills : [];

  const rawParagraphs = t('teacher.paragraphs');
  const paragraphs: string[] = Array.isArray(rawParagraphs) ? rawParagraphs : [];

  // Helper icons for the 3 pills
  const pillIcons = [
    <GraduationCap key="0" className="w-4 h-4 text-[#B86868] shrink-0" />,
    <Briefcase key="1" className="w-4 h-4 text-[#B86868] shrink-0" />,
    <CheckCircle2 key="2" className="w-4 h-4 text-[#B86868] shrink-0" />,
  ];

  const handleScrollToPackages = (e: React.MouseEvent) => {
    e.preventDefault();
    const el = document.getElementById('packages');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      window.location.hash = '#packages';
    }
  };

  return (
    <section id="teacher" className="py-20 sm:py-28 bg-[#F5E8E8]/70 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 bg-white/50 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* On mobile: Photo on top (col 1), text below (col 2). On desktop: Photo on left (col-span-5), text on right (col-span-7) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-center">
          
          {/* LEFT COLUMN: Photo of the instructor (/public/images/teacher.jpg) */}
          <div className="lg:col-span-5 flex justify-center">
            <div className="relative w-full max-w-sm sm:max-w-md">
              {/* Arch card portrait frame */}
              <div className="relative rounded-t-[4.5rem] rounded-b-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[3/4] bg-neutral-200">
                {imageError ? (
                  /* Rule 4: If image failed to load or missing, show exact gray block with "Фото преподавателя" */
                  <div className="w-full h-full bg-neutral-200 flex flex-col items-center justify-center p-6 text-center text-neutral-500">
                    <div className="w-16 h-16 rounded-full bg-neutral-300/80 flex items-center justify-center text-neutral-500 mb-3 shadow-inner">
                      <User className="w-8 h-8" />
                    </div>
                    <span className="text-sm sm:text-base font-semibold text-neutral-600">
                      Фото преподавателя
                    </span>
                  </div>
                ) : (
                  <img
                    src="https://nxjvilozfngrohfxbxhu.supabase.co/storage/v1/object/public/site-images/IMAGE%202026-10-06%2011:30:43%20PM.jpg"
                    alt={teacherName}
                    className="w-full h-full object-cover object-top"
                    referrerPolicy="no-referrer"
                    onError={() => setImageError(true)}
                  />
                )}

                {/* Subtle overlay card at the bottom of the photo */}
                <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-white/80 shadow-md">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#F3DEDE] text-[#B86868] flex items-center justify-center shrink-0">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-black text-neutral-900 truncate">
                        {teacherName}
                      </p>
                      <p className="text-[11px] font-semibold text-[#B86868] truncate">
                        {t('teacher.role')}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Decorative floating accent */}
              <div className="hidden sm:flex absolute -top-3 -right-3 w-12 h-12 rounded-full chrome-surface shadow-lg items-center justify-center border-2 border-white">
                <Sparkles className="w-5 h-5 text-slate-700" />
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Instructor bio, title, pills, and full text */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tag badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#EBD0D0] text-neutral-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-[#B86868]" />
              <span>{t('teacher.tag')}</span>
            </div>

            {/* Header: Name and Role */}
            <div className="space-y-1.5">
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-neutral-900 font-display tracking-tight leading-tight">
                {teacherName}
              </h2>
              <p className="text-lg sm:text-xl font-bold text-[#B86868]">
                {t('teacher.role')}
              </p>
            </div>

            {/* 3 Short Pills under role */}
            <div className="flex flex-wrap gap-2.5 pt-1 pb-1">
              {pills.map((pill, idx) => (
                <div
                  key={idx}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs sm:text-sm font-bold bg-white text-neutral-800 border border-[#E5C9C9] shadow-2xs hover:border-[#B86868] transition-colors"
                >
                  {pillIcons[idx % pillIcons.length]}
                  <span>{pill}</span>
                </div>
              ))}
            </div>

            {/* Main bio text paragraphs */}
            <div className="space-y-4 text-sm sm:text-base text-neutral-700 leading-relaxed font-normal pt-2">
              {paragraphs.map((p, idx) => (
                <p key={idx} className={idx === 0 ? 'text-base sm:text-lg font-semibold text-neutral-900' : ''}>
                  {p}
                </p>
              ))}
            </div>

            {/* CTA Button: Leads to Packages */}
            <div className="pt-4">
              <a
                href="#packages"
                onClick={handleScrollToPackages}
                className="inline-flex items-center justify-center gap-2.5 px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-full font-bold text-sm sm:text-base shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 transition-all cursor-pointer group"
              >
                <span>{t('teacher.cta_packages')}</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
