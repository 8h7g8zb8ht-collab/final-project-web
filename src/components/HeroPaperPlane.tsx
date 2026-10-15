import React from 'react';
import { motion } from 'motion/react';
import heroAirplaneImg from '../assets/images/hero_chrome_airplane_1791198376792.jpg';

export interface HeroPaperPlaneProps {
  className?: string;
}

export const HeroPaperPlane: React.FC<HeroPaperPlaneProps> = ({ className = '' }) => {
  return (
    <motion.div
      animate={{ y: [0, -8, 0], rotate: [0, 1, 0] }}
      transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
      className={`relative group cursor-pointer ${className}`}
    >
      <div
        className="w-44 h-44 sm:w-64 sm:h-64 md:w-80 md:h-80 rounded-full border-4 border-white/90 shadow-2xl overflow-hidden bg-gradient-to-br from-[#FFEAEA] to-[#E8BDBD] transition-transform duration-500 group-hover:scale-105"
        style={{
          boxShadow: '0 20px 45px -10px rgba(232, 180, 180, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.7) inset',
        }}
      >
        <img
          src={heroAirplaneImg}
          alt="Школа графического дизайна"
          className="w-full h-full object-cover select-none pointer-events-none transition-transform duration-700 group-hover:scale-105"
          loading="eager"
        />
      </div>
    </motion.div>
  );
};
