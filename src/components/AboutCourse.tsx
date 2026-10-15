import React, { useState } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { Clock, Globe, ChevronDown, ChevronUp, Layers, Compass, CheckCircle2, FolderHeart, Sparkles, Palette, Briefcase, ListOrdered } from 'lucide-react';
import { TeacherWorksCarousel } from './TeacherWorksCarousel';

interface WeekData {
  week: number;
  title: string;
  topics?: string[];
  project?: string;
  desc: string;
}

interface TakeawayItem {
  title: string;
  desc: string;
}

export const AboutCourse: React.FC = () => {
  const { t, language } = useTranslation();
  const [isSyllabusOpen, setIsSyllabusOpen] = useState<boolean>(false);
  const [activeWeek, setActiveWeek] = useState<number | null>(null);

  const rawWeeks = t('about.weeks');
  const weeks: WeekData[] = Array.isArray(rawWeeks) ? rawWeeks : [];

  const rawTakeaways = t('about.takeaways');
  const takeaways: TakeawayItem[] = Array.isArray(rawTakeaways) ? rawTakeaways : [];

  const weekLabel = language === 'tj' ? 'Ҳафтаи' : language === 'en' ? 'Week' : 'Неделя';
  const projectLabel = language === 'tj' ? 'Лоиҳа:' : language === 'en' ? 'Project:' : 'Проект:';
  const topicsLabel = language === 'tj' ? 'Мавзӯъҳо:' : language === 'en' ? 'Topics:' : 'Темы:';

  return (
    <section id="about" className="pt-7 sm:pt-8 pb-20 sm:pb-28 relative scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F3DEDE] text-neutral-800 text-xs font-semibold uppercase tracking-wider mb-3">
            <Compass className="w-3.5 h-3.5 text-[#B86868]" />
            <span>{t('about.tag')}</span>
          </div>
          <h2 className="text-3xl sm:text-5xl font-black text-neutral-900 tracking-tight leading-tight">
            {t('about.title')}
          </h2>
          <p className="mt-4 text-base sm:text-lg text-neutral-600">
            {t('about.subtitle')}
          </p>

          {/* Quick Info Tags: 1.5 Months (6 weeks) & Online */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs sm:text-sm font-semibold text-neutral-700">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#E8D4D4] shadow-2xs">
              <Clock className="w-4 h-4 text-[#B86868]" />
              <span>{t('about.duration')}</span>
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-[#E8D4D4] shadow-2xs">
              <Globe className="w-4 h-4 text-[#B86868]" />
              <span>{t('about.format')}</span>
            </div>
          </div>
        </div>

        {/* Teacher Works Carousel & Module Summary Cards */}
        <TeacherWorksCarousel />

        {/* 6-Week Curriculum Breakdown - Compact Accordion Tab */}
        <div className="max-w-3xl mx-auto mb-20">
          {/* Main Toggle Accordion Tab */}
          <button
            type="button"
            onClick={() => setIsSyllabusOpen((prev) => !prev)}
            aria-expanded={isSyllabusOpen}
            className="w-full bg-white/95 backdrop-blur-md rounded-2xl sm:rounded-full border border-[#E8D4D4] hover:border-[#D6A9A9] shadow-sm hover:shadow-md transition-all duration-300 p-3 sm:px-6 sm:py-3.5 flex items-center justify-between gap-3 text-left cursor-pointer group"
          >
            {/* Left: List Icon */}
            <div className="w-10 h-10 rounded-xl sm:rounded-full bg-[#FAF0F0] text-[#B86868] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200 shadow-2xs">
              <ListOrdered className="w-5 h-5 text-[#B86868]" />
            </div>

            {/* Center: Title & Hint */}
            <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center sm:justify-center gap-0.5 sm:gap-2.5">
              <span className="text-sm sm:text-base font-extrabold text-neutral-900 group-hover:text-[#9A4646] transition-colors truncate sm:overflow-visible">
                {t('about.syllabus_tab_title')}
              </span>
              <span className="hidden sm:inline-block text-neutral-300 text-sm">·</span>
              <span className="text-[11px] sm:text-xs font-medium text-neutral-500 group-hover:text-neutral-700 transition-colors">
                {isSyllabusOpen ? t('about.syllabus_tab_hint_close') : t('about.syllabus_tab_hint_open')}
              </span>
            </div>

            {/* Right: Chevron Arrow */}
            <div className="flex items-center gap-1.5 shrink-0">
              <div
                className={`w-8 h-8 rounded-full bg-[#FAF5F5] group-hover:bg-[#F3DEDE] flex items-center justify-center text-neutral-600 transition-transform duration-400 ease-in-out ${
                  isSyllabusOpen ? 'rotate-180 bg-[#F3DEDE] text-[#B86868]' : ''
                }`}
              >
                <ChevronDown className="w-4 h-4 transition-transform" />
              </div>
            </div>
          </button>

          {/* Collapsible Content */}
          <div
            className={`transition-all duration-400 ease-in-out overflow-hidden ${
              isSyllabusOpen ? 'max-h-[3000px] opacity-100 mt-5' : 'max-h-0 opacity-0 mt-0 pointer-events-none'
            }`}
            style={{
              transitionDuration: '400ms',
              transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)',
            }}
          >
            <div className="space-y-2.5 pt-1">
              {weeks.map((week) => {
                const isWeekOpen = activeWeek === week.week;
                return (
                  <div
                    key={week.week}
                    className={`rounded-2xl transition-all duration-200 border overflow-hidden ${
                      isWeekOpen
                        ? 'bg-white border-[#E0BCBC] shadow-sm ring-1 ring-[#E8CECE]'
                        : 'bg-white/90 border-[#EFE0E0] hover:bg-white hover:border-[#E8CECE]'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => setActiveWeek(isWeekOpen ? null : week.week)}
                      className="w-full flex items-center justify-between p-3.5 sm:p-4 text-left cursor-pointer group/week"
                    >
                      <div className="flex items-center gap-3 sm:gap-4 min-w-0">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-xs shrink-0 transition-colors ${
                            isWeekOpen
                              ? 'bg-neutral-900 text-white shadow-xs'
                              : 'bg-[#F4E3E3] text-neutral-800 group-hover/week:bg-[#EBD2D2]'
                          }`}
                        >
                          0{week.week}
                        </div>
                        <div className="min-w-0">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#B86868] block">
                            {weekLabel} {week.week}
                          </span>
                          <h3 className="text-sm sm:text-base font-bold text-neutral-900 truncate">
                            {week.title}
                          </h3>
                        </div>
                      </div>
                      <div className="p-1 text-neutral-400 group-hover/week:text-neutral-700 shrink-0">
                        <ChevronDown
                          className={`w-4 h-4 transition-transform duration-200 ${
                            isWeekOpen ? 'rotate-180 text-neutral-900' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {isWeekOpen && (
                      <div className="px-4 pb-4 pt-2 text-xs sm:text-sm text-neutral-700 leading-relaxed border-t border-[#F8EFEF] space-y-3 bg-[#FAF8F8]/40">
                        {/* Topics */}
                        {week.topics && week.topics.length > 0 && (
                          <div>
                            <div className="text-[11px] font-black uppercase tracking-wider text-neutral-400 mb-1.5">
                              {topicsLabel}
                            </div>
                            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-xs sm:text-[13px]">
                              {week.topics.map((topic, tIdx) => (
                                <li key={tIdx} className="flex items-start gap-2 text-neutral-800">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#B86868] mt-1.5 shrink-0" />
                                  <span>{topic}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Project for the week */}
                        {week.project && (
                          <div className="p-2.5 sm:p-3 rounded-xl bg-[#FAF3F3] border border-[#ECD1D1] flex items-center gap-2.5">
                            <div className="p-1 bg-[#B86868] text-white rounded-md shrink-0">
                              <Sparkles className="w-3 h-3" />
                            </div>
                            <div className="flex flex-wrap items-center gap-1.5 text-xs">
                              <span className="font-black uppercase tracking-wider text-[#B86868]">
                                {projectLabel}
                              </span>
                              <span className="font-semibold text-neutral-900">
                                {week.project}
                              </span>
                            </div>
                          </div>
                        )}

                        {/* Description summary */}
                        <p className="text-[11px] sm:text-xs text-neutral-500 italic">
                          {week.desc}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Block: "ЧТО ВЫ ПОЛУЧИТЕ" (What You Will Get) */}
        <div className="max-w-5xl mx-auto bg-white rounded-3xl p-8 sm:p-12 border border-[#E8D4D4] shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#F5DDDD]/60 to-transparent rounded-full blur-2xl pointer-events-none" />

          <div className="text-center max-w-2xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F3DEDE] text-neutral-800 text-xs font-semibold uppercase tracking-wider mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#B86868]" />
              <span>{t('about.takeaways_tag') || 'Результат курса'}</span>
            </div>
            <h3 className="text-2xl sm:text-4xl font-black text-neutral-900 font-display">
              {t('about.takeaways_title') || 'Что вы получите'}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-neutral-600">
              {t('about.takeaways_subtitle') || 'Практические результаты обучения, готовые к презентации заказчикам и работодателям'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {takeaways.map((item, idx) => {
              const icons = [
                <FolderHeart key="1" className="w-5 h-5 text-[#B86868]" />,
                <Briefcase key="2" className="w-5 h-5 text-[#B86868]" />,
                <Palette key="3" className="w-5 h-5 text-[#B86868]" />,
                <CheckCircle2 key="4" className="w-5 h-5 text-[#B86868]" />
              ];

              return (
                <div
                  key={idx}
                  className="p-6 rounded-2xl bg-[#FAF5F5] border border-[#EAE0E0] hover:border-[#D6A9A9] transition-all flex items-start gap-4"
                >
                  <div className="w-11 h-11 rounded-2xl bg-white shadow-2xs border border-[#EAD4D4] flex items-center justify-center shrink-0">
                    {icons[idx % icons.length]}
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-neutral-900">
                      {item.title}
                    </h4>
                    <p className="mt-1 text-xs sm:text-sm text-neutral-600 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
