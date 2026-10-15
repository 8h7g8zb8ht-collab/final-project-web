import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useTranslation } from '../context/LanguageContext';
import { ChevronLeft, ChevronRight, X, ZoomIn, ImageOff, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

/**
 * Exact teacher works URLs specified by the user, in strict order 1 through 5.
 * Slides 1 & 5 kept as before, slides 2, 3, 4 replaced with user's new URLs.
 * RULE: Do not download, generate, alter or replace these images with AI or stock photos.
 */
export const TEACHER_WORKS: string[] = [
  'https://nxjvilozfngrohfxbxhu.supabase.co/storage/v1/object/public/site-images/IMAGE%202026-10-07%204:34:46%20PM.jpg',
  'https://nxjvilozfngrohfxbxhu.supabase.co/storage/v1/object/public/site-images/Screenshot%202026-10-09%20at%204.22.45%20PM.png',
  'https://nxjvilozfngrohfxbxhu.supabase.co/storage/v1/object/public/site-images/Screenshot%202026-10-09%20at%204.32.08%20PM.png',
  'https://nxjvilozfngrohfxbxhu.supabase.co/storage/v1/object/public/site-images/Screenshot%202026-10-09%20at%204.38.28%20PM.png',
  'https://nxjvilozfngrohfxbxhu.supabase.co/storage/v1/object/public/site-images/Screenshot%202026-10-09%20at%204.37.39%20PM.png',
];

export const TeacherWorksCarousel: React.FC = () => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [lightboxOpen, setLightboxOpen] = useState<boolean>(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);
  const [imageErrors, setImageErrors] = useState<Record<number, boolean>>({});

  // Autoplay and interaction state
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [isTouched, setIsTouched] = useState<boolean>(false);
  const [timerResetKey, setTimerResetKey] = useState<number>(0);

  // Touch swipe handling for mobile
  const touchStartX = useRef<number | null>(null);
  const touchStartY = useRef<number | null>(null);
  const isSwiping = useRef<boolean>(false);
  const minSwipeDistance = 45;

  const resetTimer = useCallback(() => {
    setTimerResetKey((prev) => prev + 1);
  }, []);

  const handlePrev = useCallback(() => {
    resetTimer();
    setCurrentIndex((prev) => (prev === 0 ? TEACHER_WORKS.length - 1 : prev - 1));
  }, [resetTimer]);

  const handleNext = useCallback(() => {
    resetTimer();
    setCurrentIndex((prev) => (prev === TEACHER_WORKS.length - 1 ? 0 : prev + 1));
  }, [resetTimer]);

  const handleLightboxPrev = useCallback(() => {
    setLightboxIndex((prev) => (prev === 0 ? TEACHER_WORKS.length - 1 : prev - 1));
  }, []);

  const handleLightboxNext = useCallback(() => {
    setLightboxIndex((prev) => (prev === TEACHER_WORKS.length - 1 ? 0 : prev + 1));
  }, []);

  // Autoplay: Advance every 4 seconds with smooth fade transition
  // Pauses when cursor is over carousel, when touched, or when lightbox is open
  // Resets timer on manual change and continues after 4 seconds
  useEffect(() => {
    if (isHovered || isTouched || lightboxOpen) {
      return;
    }

    const timer = setTimeout(() => {
      setCurrentIndex((prev) => (prev === TEACHER_WORKS.length - 1 ? 0 : prev + 1));
    }, 4000);

    return () => {
      clearTimeout(timer);
    };
  }, [currentIndex, isHovered, isTouched, lightboxOpen, timerResetKey]);

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setLightboxOpen(false);
      } else if (e.key === 'ArrowLeft') {
        handleLightboxPrev();
      } else if (e.key === 'ArrowRight') {
        handleLightboxNext();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, handleLightboxPrev, handleLightboxNext]);

  // Touch handlers for carousel swipe & tap detection
  const onTouchStart = (e: React.TouchEvent) => {
    setIsTouched(true);
    isSwiping.current = false;
    touchStartX.current = e.targetTouches[0].clientX;
    touchStartY.current = e.targetTouches[0].clientY;
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const currentX = e.targetTouches[0].clientX;
    const currentY = e.targetTouches[0].clientY;
    const deltaX = Math.abs(currentX - touchStartX.current);
    const deltaY = Math.abs(currentY - (touchStartY.current || currentY));
    if (deltaX > 12 && deltaX > deltaY) {
      isSwiping.current = true;
    }
  };

  const onTouchEnd = (e: React.TouchEvent) => {
    setIsTouched(false);
    resetTimer();
    if (touchStartX.current !== null && e.changedTouches && e.changedTouches.length > 0) {
      const currentX = e.changedTouches[0].clientX;
      const distance = touchStartX.current - currentX;
      if (Math.abs(distance) > minSwipeDistance) {
        if (distance > 0) {
          handleNext();
        } else {
          handlePrev();
        }
      }
    }
    touchStartX.current = null;
    touchStartY.current = null;
    // Debounce resetting isSwiping so synthetic click event won't trigger tap action
    setTimeout(() => {
      isSwiping.current = false;
    }, 120);
  };

  const handleSlideClick = () => {
    if (isSwiping.current) return;
    handleNext();
  };

  // Touch handlers for lightbox
  const lightboxTouchStartX = useRef<number | null>(null);
  const onLightboxTouchStart = (e: React.TouchEvent) => {
    lightboxTouchStartX.current = e.targetTouches[0].clientX;
  };

  const onLightboxTouchEnd = (e: React.TouchEvent) => {
    if (lightboxTouchStartX.current === null || !e.changedTouches || e.changedTouches.length === 0) return;
    const currentX = e.changedTouches[0].clientX;
    const distance = lightboxTouchStartX.current - currentX;
    if (Math.abs(distance) > minSwipeDistance) {
      if (distance > 0) {
        handleLightboxNext();
      } else {
        handleLightboxPrev();
      }
    }
    lightboxTouchStartX.current = null;
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const handleImageError = (index: number) => {
    setImageErrors((prev) => ({ ...prev, [index]: true }));
  };

  const worksTitle = t('about.teacher_works_title') || 'Работы преподавателя';
  const comingSoonText = t('about.work_coming_soon') || 'Работа скоро появится';
  const openFullscreenText = t('about.open_fullscreen') || 'Открыть на весь экран';
  const nextWorkText = t('about.next_work') || 'Следующая работа';
  const prevWorkText = t('about.prev_work') || 'Предыдущая работа';
  const clickToNextText = t('about.click_to_next') || 'Кликните для перехода к следующей работе';

  return (
    <div className="mb-16">
      {/* Header over carousel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div className="inline-flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-[#F3DEDE] flex items-center justify-center text-[#B86868] shadow-2xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
              {worksTitle}
            </h3>
            <p className="text-xs text-neutral-500 font-medium">
              {currentIndex + 1} / {TEACHER_WORKS.length}
            </p>
          </div>
        </div>

        {/* Desktop navigation arrows */}
        <div className="hidden sm:flex items-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            aria-label={prevWorkText}
            title={prevWorkText}
            className="w-10 h-10 rounded-full bg-white border border-[#E8D4D4] hover:bg-[#F3DEDE] text-neutral-800 hover:text-[#B86868] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={handleNext}
            aria-label={nextWorkText}
            title={nextWorkText}
            className="w-10 h-10 rounded-full bg-white border border-[#E8D4D4] hover:bg-[#F3DEDE] text-neutral-800 hover:text-[#B86868] flex items-center justify-center transition-colors shadow-2xs cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Carousel Card */}
      <div
        className="relative bg-neutral-100/80 rounded-3xl overflow-hidden border border-neutral-200/80 shadow-lg select-none"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Slide Display Area: aspect-[4/3] sm:aspect-[16/10] */}
        <div
          onClick={handleSlideClick}
          className="relative w-full aspect-[4/3] sm:aspect-[16/10] max-h-[560px] p-3 sm:p-6 bg-gradient-to-b from-neutral-50 to-neutral-100 overflow-hidden cursor-pointer"
          title={clickToNextText}
        >
          {/* Smooth Fade Transition between slides (~0.5s) */}
          <AnimatePresence initial={false}>
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5, ease: 'easeInOut' }}
              className="absolute inset-3 sm:inset-6 flex items-center justify-center pointer-events-none"
            >
              {imageErrors[currentIndex] ? (
                <div className="w-full h-full rounded-2xl bg-neutral-200/90 flex flex-col items-center justify-center text-center p-6 text-neutral-500 border border-neutral-300/60 pointer-events-auto">
                  <ImageOff className="w-10 h-10 mb-3 text-neutral-400" />
                  <p className="text-base sm:text-lg font-semibold text-neutral-700">
                    {comingSoonText}
                  </p>
                </div>
              ) : (
                <img
                  src={TEACHER_WORKS[currentIndex]}
                  alt={`${worksTitle} — слайд ${currentIndex + 1}`}
                  loading="lazy"
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onError={() => handleImageError(currentIndex)}
                  className="w-full h-full object-contain rounded-2xl drop-shadow-xs pointer-events-none select-none"
                  draggable={false}
                />
              )}
            </motion.div>
          </AnimatePresence>

          {/* Dedicated Magnifying Glass button in top-right corner to open fullscreen (no conflict with slide-click) */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              openLightbox(currentIndex);
            }}
            aria-label={openFullscreenText}
            title={openFullscreenText}
            className="absolute top-3 right-3 sm:top-4 sm:right-4 w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-white/90 hover:bg-white text-neutral-800 hover:text-[#B86868] backdrop-blur-md border border-neutral-200/90 shadow-md flex items-center justify-center transition-all hover:scale-110 active:scale-95 cursor-pointer z-20"
          >
            <ZoomIn className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>

          {/* Left Arrow overlay button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label={prevWorkText}
            title={prevWorkText}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-md hover:bg-white text-neutral-800 hover:text-[#B86868] flex items-center justify-center transition-all cursor-pointer z-20"
          >
            <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>

          {/* Right Arrow overlay button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label={nextWorkText}
            title={nextWorkText}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/90 backdrop-blur-md border border-neutral-200/80 shadow-md hover:bg-white text-neutral-800 hover:text-[#B86868] flex items-center justify-center transition-all cursor-pointer z-20"
          >
            <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Bottom Pagination Dots */}
        <div className="py-4 bg-white/90 border-t border-neutral-200/60 flex items-center justify-center gap-2">
          {TEACHER_WORKS.map((_, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  resetTimer();
                  setCurrentIndex(idx);
                }}
                aria-label={`Перейти к слайду ${idx + 1}`}
                className={`transition-all duration-300 rounded-full cursor-pointer ${
                  isActive
                    ? 'w-7 h-2.5 bg-[#B86868]'
                    : 'w-2.5 h-2.5 bg-neutral-300 hover:bg-neutral-400'
                }`}
              />
            );
          })}
        </div>
      </div>

      {/* Program Module Text Cards Under Carousel (No Background Images) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 mt-8">
        {/* Module 1: Weeks 1–3 */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EFE0E0] shadow-sm hover:border-[#E0BCBC] transition-colors flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3DEDE] text-[#B86868] text-xs font-black uppercase tracking-wider mb-3">
              <span>{t('about.program_module_1_title') || 'Недели 1–3'}</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug">
              {t('about.program_module_1_desc') || 'Композиция, сетки и типографика'}
            </h4>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-500">
            <span>Модуль 01</span>
            <span className="text-[#B86868]">Основы дизайна</span>
          </div>
        </div>

        {/* Module 2: Weeks 4–6 */}
        <div className="bg-white rounded-3xl p-6 sm:p-7 border border-[#EFE0E0] shadow-sm hover:border-[#E0BCBC] transition-colors flex flex-col justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F3DEDE] text-[#B86868] text-xs font-black uppercase tracking-wider mb-3">
              <span>{t('about.program_module_2_title') || 'Недели 4–6'}</span>
            </div>
            <h4 className="text-lg sm:text-xl font-bold text-neutral-900 leading-snug">
              {t('about.program_module_2_desc') || 'Photoshop, Illustrator и брендинг'}
            </h4>
          </div>
          <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-500">
            <span>Модуль 02</span>
            <span className="text-[#B86868]">Инструменты и айдентика</span>
          </div>
        </div>
      </div>

      {/* Fullscreen Lightbox Modal */}
      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-6"
          onClick={() => setLightboxOpen(false)}
          onTouchStart={onLightboxTouchStart}
          onTouchEnd={onLightboxTouchEnd}
        >
          {/* Top Bar with Counter and Close Button */}
          <div
            className="w-full max-w-6xl flex items-center justify-between py-3 px-2 text-white z-10"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3">
              <span className="text-sm sm:text-base font-bold text-neutral-200">
                {worksTitle}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 text-xs font-semibold text-neutral-200">
                {lightboxIndex + 1} / {TEACHER_WORKS.length}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setLightboxOpen(false)}
              aria-label="Закрыть"
              className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/25 text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Lightbox Image Container */}
          <div
            className="relative flex-1 w-full max-w-6xl flex items-center justify-center overflow-hidden my-2"
            onClick={(e) => e.stopPropagation()}
          >
            {imageErrors[lightboxIndex] ? (
              <div className="w-full max-w-md p-8 rounded-2xl bg-neutral-900/80 border border-neutral-700 text-center text-neutral-400">
                <ImageOff className="w-12 h-12 mx-auto mb-3 text-neutral-500" />
                <p className="text-base font-semibold">{comingSoonText}</p>
              </div>
            ) : (
              <img
                src={TEACHER_WORKS[lightboxIndex]}
                alt={`${worksTitle} — крупный вид ${lightboxIndex + 1}`}
                className="max-h-[82vh] max-w-full object-contain rounded-xl shadow-2xl"
                referrerPolicy="no-referrer"
              />
            )}

            {/* Prev arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLightboxPrev();
              }}
              aria-label={prevWorkText}
              className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer z-20"
            >
              <ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>

            {/* Next arrow */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                handleLightboxNext();
              }}
              aria-label={nextWorkText}
              className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-11 h-11 sm:w-13 sm:h-13 rounded-full bg-white/15 hover:bg-white/30 text-white backdrop-blur-md flex items-center justify-center transition-colors cursor-pointer z-20"
            >
              <ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
            </button>
          </div>

          {/* Lightbox bottom thumbnails / indicators */}
          <div
            className="flex items-center gap-2 py-2"
            onClick={(e) => e.stopPropagation()}
          >
            {TEACHER_WORKS.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setLightboxIndex(idx)}
                aria-label={`Перейти к слайду ${idx + 1}`}
                className={`transition-all duration-200 rounded-full cursor-pointer ${
                  idx === lightboxIndex
                    ? 'w-6 h-2 bg-white'
                    : 'w-2 h-2 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
