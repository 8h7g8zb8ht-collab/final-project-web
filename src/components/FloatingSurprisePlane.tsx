import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslation } from '../context/LanguageContext';

interface Sparkle {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  delay: number;
}

const PHRASES: Record<'ru' | 'tj' | 'en', string[]> = {
  ru: [
    'Лети к мечте ✨',
    'Твори без рамок 🎨',
    'Дизайн начинается с первого шага 🚀',
    'Вдохновение уже рядом 💡',
  ],
  tj: [
    'Ба сӯи орзу парвоз кун ✨',
    'Бе маҳдудият эҷод кун 🎨',
    'Дизайн аз қадами аввал оғоз мешавад 🚀',
    'Илҳом аллакай дар паҳлӯи шумост 💡',
  ],
  en: [
    'Fly to your dream ✨',
    'Create without limits 🎨',
    'Design starts with the first step 🚀',
    'Inspiration is already here 💡',
  ],
};

export const FloatingSurprisePlane: React.FC = () => {
  const { language } = useTranslation();
  const langKey: 'ru' | 'tj' | 'en' =
    language === 'tj' ? 'tj' : language === 'en' ? 'en' : 'ru';

  const [phraseIndex, setPhraseIndex] = useState(0);
  const [bubbleText, setBubbleText] = useState<string | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [showRipples, setShowRipples] = useState(false);
  const [sparkles, setSparkles] = useState<Sparkle[]>([]);

  const bubbleTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const animTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const sparkleIdCounter = useRef(0);

  // Clean up timers on unmount
  useEffect(() => {
    return () => {
      if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
      if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    };
  }, []);

  const handleClick = useCallback(() => {
    // If mid-flight, prevent spam clicks from breaking the animation sequence
    if (isAnimating) return;

    setIsAnimating(true);
    setShowRipples(true);

    // Pick phrase and advance index
    const currentList = PHRASES[langKey];
    const phrase = currentList[phraseIndex % currentList.length];
    setPhraseIndex((prev) => (prev + 1) % currentList.length);
    setBubbleText(phrase);

    // Reset bubble timer
    if (bubbleTimeoutRef.current) clearTimeout(bubbleTimeoutRef.current);
    bubbleTimeoutRef.current = setTimeout(() => {
      setBubbleText(null);
    }, 2800);

    // Generate random silver/pink sparkles around the button
    const colors = ['#FFFFFF', '#FFE4E6', '#F472B6', '#E2B4B4', '#CBD5E1'];
    const newSparkles: Sparkle[] = Array.from({ length: 8 }).map(() => {
      sparkleIdCounter.current += 1;
      const angle = Math.random() * Math.PI * 2;
      const distance = 25 + Math.random() * 45;
      return {
        id: sparkleIdCounter.current,
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance,
        size: 3 + Math.random() * 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        delay: Math.random() * 0.15,
      };
    });
    setSparkles(newSparkles);

    // Animation ends after 1.5s
    if (animTimeoutRef.current) clearTimeout(animTimeoutRef.current);
    animTimeoutRef.current = setTimeout(() => {
      setIsAnimating(false);
      setShowRipples(false);
      setSparkles([]);
    }, 1500);
  }, [isAnimating, langKey, phraseIndex]);

  return (
    <>
      {/* Inline styles for custom keyframe animations */}
      <style>{`
        @keyframes surpriseFloat {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
          }
          50% {
            transform: translateY(-4px) rotate(1deg);
          }
        }

        @keyframes surprisePulseGlow {
          0%, 100% {
            box-shadow: 0 4px 18px rgba(226, 180, 180, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.8) inset;
          }
          50% {
            box-shadow: 0 6px 26px rgba(244, 114, 182, 0.55), 0 0 12px rgba(255, 255, 255, 0.9), 0 0 0 1.5px rgba(255, 255, 255, 0.95) inset;
          }
        }

        @keyframes surprisePlaneFlight {
          0% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
          15% {
            transform: translate(3px, 4px) rotate(-10deg) scale(0.92);
          }
          35% {
            transform: translate(-14px, -28px) rotate(-22deg) scale(1.12);
          }
          55% {
            transform: translate(-30px, -65px) rotate(-8deg) scale(1.18);
          }
          75% {
            transform: translate(-16px, -24px) rotate(12deg) scale(0.96);
          }
          90% {
            transform: translate(0px, -4px) rotate(3deg) scale(1.02);
          }
          100% {
            transform: translate(0, 0) rotate(0deg) scale(1);
            opacity: 1;
          }
        }

        @keyframes surpriseRipple {
          0% {
            transform: scale(0.85);
            opacity: 0.85;
          }
          100% {
            transform: scale(2.1);
            opacity: 0;
          }
        }

        @keyframes surpriseSparkleParticle {
          0% {
            transform: translate(0, 0) scale(0);
            opacity: 1;
          }
          60% {
            opacity: 1;
          }
          100% {
            transform: translate(var(--tx), var(--ty)) scale(1.2);
            opacity: 0;
          }
        }

        @keyframes surpriseBubbleIn {
          0% {
            opacity: 0;
            transform: translateY(6px) scale(0.92);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
      `}</style>

      {/* Fixed container in bottom right */}
      <div
        className="fixed z-40 right-[14px] bottom-[14px] sm:right-[20px] sm:bottom-[20px] select-none pointer-events-auto"
        style={{
          touchAction: 'manipulation',
        }}
      >
        {/* Message bubble appearing next to/above the button */}
        {bubbleText && (
          <div
            className="absolute bottom-full right-0 mb-3 pointer-events-none transition-all duration-300"
            style={{
              animation: 'surpriseBubbleIn 0.28s cubic-bezier(0.16, 1, 0.3, 1) forwards',
            }}
          >
            <div
              className="relative px-3.5 py-2 rounded-2xl text-xs sm:text-sm font-medium text-neutral-800 shadow-xl whitespace-nowrap border border-white/80"
              style={{
                background: 'rgba(255, 255, 255, 0.94)',
                backdropFilter: 'blur(10px)',
                WebkitBackdropFilter: 'blur(10px)',
                boxShadow:
                  '0 10px 25px -4px rgba(226, 180, 180, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.9) inset',
              }}
            >
              {bubbleText}
              {/* Little speech bubble tail pointing down to button */}
              <div
                className="absolute -bottom-1.5 right-5 w-3 h-3 rotate-45 border-r border-b border-white/80"
                style={{
                  background: 'rgba(255, 255, 255, 0.94)',
                }}
              />
            </div>
          </div>
        )}

        {/* Surprise Button */}
        <div className="relative flex items-center justify-center">
          {/* Ripple wave on click */}
          {showRipples && (
            <span
              className="absolute inset-0 rounded-full pointer-events-none"
              style={{
                background: 'radial-gradient(circle, rgba(244, 114, 182, 0.5) 0%, rgba(226, 180, 180, 0) 70%)',
                animation: 'surpriseRipple 0.9s ease-out forwards',
              }}
            />
          )}

          {/* Sparkles on click */}
          {sparkles.map((sp) => (
            <span
              key={sp.id}
              className="absolute pointer-events-none rounded-full"
              style={
                {
                  '--tx': `${sp.x}px`,
                  '--ty': `${sp.y}px`,
                  width: `${sp.size}px`,
                  height: `${sp.size}px`,
                  backgroundColor: sp.color,
                  boxShadow: `0 0 6px ${sp.color}`,
                  animation: `surpriseSparkleParticle 0.75s ease-out ${sp.delay}s forwards`,
                } as React.CSSProperties
              }
            />
          ))}

          <button
            type="button"
            onClick={handleClick}
            aria-label="Сюрприз: бумажный самолётик Airy Plane"
            className="relative w-[44px] h-[44px] sm:w-[52px] sm:h-[52px] rounded-full flex items-center justify-center cursor-pointer transition-transform duration-200 hover:scale-105 active:scale-95 focus:outline-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(255, 245, 245, 0.95) 0%, rgba(254, 226, 226, 0.85) 50%, rgba(251, 207, 232, 0.8) 100%)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
              border: '2px solid rgba(255, 255, 255, 0.95)',
              animation: 'surprisePulseGlow 3s ease-in-out infinite',
            }}
          >
            {/* Plane wrapper with gentle idle floating OR click flight animation */}
            <div
              className="w-full h-full flex items-center justify-center pointer-events-none"
              style={{
                animation: isAnimating
                  ? 'surprisePlaneFlight 1.4s cubic-bezier(0.25, 1, 0.5, 1) forwards'
                  : 'surpriseFloat 3.5s ease-in-out infinite',
              }}
            >
              {/* Chrome/silver SVG Paper Plane matching site style */}
              <svg
                viewBox="0 0 48 48"
                className="w-[24px] h-[24px] sm:w-[28px] sm:h-[28px] drop-shadow-sm transition-transform duration-300"
                style={{
                  filter: 'drop-shadow(0 2px 4px rgba(184, 104, 104, 0.25))',
                }}
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  {/* Top wing facet (lightest chrome highlight) */}
                  <linearGradient id="surpriseWingTop" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#FFFFFF" />
                    <stop offset="45%" stopColor="#F1F5F9" />
                    <stop offset="100%" stopColor="#CBD5E1" />
                  </linearGradient>

                  {/* Underside fold (soft silver gradient) */}
                  <linearGradient id="surpriseWingBottom" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#E2E8F0" />
                    <stop offset="55%" stopColor="#94A3B8" />
                    <stop offset="100%" stopColor="#64748B" />
                  </linearGradient>

                  {/* Keel center fold (deeper shadow facet) */}
                  <linearGradient id="surpriseKeel" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#CBD5E1" />
                    <stop offset="60%" stopColor="#64748B" />
                    <stop offset="100%" stopColor="#475569" />
                  </linearGradient>
                </defs>

                {/* Main top wing surface */}
                <polygon
                  points="40,8 10,26 23,29"
                  fill="url(#surpriseWingTop)"
                  stroke="#FFFFFF"
                  strokeWidth="0.6"
                  strokeLinejoin="round"
                />

                {/* Bottom left wing surface */}
                <polygon
                  points="40,8 23,29 20,40"
                  fill="url(#surpriseWingBottom)"
                  stroke="#CBD5E1"
                  strokeWidth="0.5"
                  strokeLinejoin="round"
                />

                {/* Center fold crease / shadow */}
                <polygon
                  points="23,29 20,40 28,33"
                  fill="url(#surpriseKeel)"
                  stroke="#64748B"
                  strokeWidth="0.4"
                  strokeLinejoin="round"
                />

                {/* Accent highlight streak */}
                <line
                  x1="40"
                  y1="8"
                  x2="23"
                  y2="29"
                  stroke="#FFFFFF"
                  strokeWidth="0.8"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          </button>
        </div>
      </div>
    </>
  );
};
