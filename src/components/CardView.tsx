import React from 'react';
import { motion } from 'motion/react';
import { Card, Suit } from '../types';
import { getSuitSymbol } from '../utils/deck';

interface CardViewProps {
  card: Card;
  faceDown?: boolean;
  onClick?: () => void;
  isPlayable?: boolean;
  size?: 'sm' | 'md' | 'lg';
  index?: number; // Used for fan-out offset animations
  animate?: boolean;
}

export const CardView: React.FC<CardViewProps> = ({
  card,
  faceDown = false,
  onClick,
  isPlayable = false,
  size = 'md',
  index = 0,
  animate = true,
}) => {
  const { suit, rank } = card;
  const isRed = suit === 'H' || suit === 'D';

  // Crisp custom SVG paths for card suits
  const renderSuitSvg = (suitType: Suit, className = 'w-full h-full') => {
    switch (suitType) {
      case 'H': // Hearts
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
          </svg>
        );
      case 'D': // Diamonds
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2L2 12l10 10 10-10L12 2z" />
          </svg>
        );
      case 'C': // Clubs
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 8a3 3 0 00-3-3 3 3 0 00-3 3c0 1.25.77 2.32 1.86 2.75C6.42 11.41 5 12.83 5 14.5A2.5 2.5 0 007.5 17h1.62c.42 1.42 1.18 2.65 2.88 3v-2.5h1.62a2.5 2.5 0 002.5-2.5c0-1.67-1.42-3.09-2.86-3.75C14.23 10.32 15 9.25 15 8a3 3 0 00-3-3zM12 11.5c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5z" />
            <path d="M12 2c-3.31 0-6 2.69-6 6 0 2.22 1.21 4.15 3 5.19A6.974 6.974 0 005 19.5c0 .28.22.5.5.5h13c.28 0 .5-.22.5-.5a6.974 6.974 0 00-4-6.31c1.79-1.04 3-2.97 3-5.19 0-3.31-2.69-6-6-6zm0 15c-1.1 0-2-.9-2-2h4c0 1.1-.9 2-2 2z" className="hidden" />
            {/* Standard club silhouette */}
            <path d="M12 9a2.5 2.5 0 10-2.5-2.5c0 .13.02.26.04.38A3 3 0 107 11.5c0 .2.02.39.06.58A3.5 3.5 0 1011 15.5h2a3.5 3.5 0 103.94-3.42c.04-.19.06-.38.06-.58a3 3 0 10-2.54-4.62c.02-.12.04-.25.04-.38A2.5 2.5 0 1012 9zm-1 6.5v3a1 1 0 002 0v-3h-2z" />
          </svg>
        );
      case 'S': // Spades
        return (
          <svg className={className} viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2C9 6.5 5 9.5 5 13a7 7 0 0013.92 1H13v3.5a1.5 1.5 0 003 0V14c0-3.5-4-6.5-7-12zm-2.5 16v2.5a1 1 0 002 0V18h-2z" className="hidden" />
            {/* Standard spade silhouette */}
            <path d="M12 2C11.5 2.3 8 7 8 11.5c0 2.5 2 4.5 4.5 4.5s4.5-2 4.5-4.5C17 7 13.5 2.3 12 2zm-1.5 13.5v3.5a1 1 0 002 0v-3.5h-2z" />
          </svg>
        );
    }
  };

  // Class selection based on size
  const sizeClasses = {
    sm: 'w-12 h-18 text-[10px] rounded-md shadow-sm',
    md: 'w-16 h-24 sm:w-20 sm:h-30 md:w-24 md:h-36 text-xs sm:text-sm rounded-lg shadow-md',
    lg: 'w-24 h-36 sm:w-28 sm:h-40 md:w-32 md:h-46 text-sm sm:text-base rounded-xl shadow-lg',
  };

  const suitColorClass = isRed ? 'text-red-600' : 'text-slate-800';

  // Inner card contents for face-up cards
  const renderCardFace = () => (
    <div className={`w-full h-full bg-white relative flex flex-col justify-between p-1.5 sm:p-2 border border-slate-200 select-none overflow-hidden rounded-[inherit] ${suitColorClass}`}>
      {/* Top Left Index */}
      <div className="flex flex-col items-center leading-none">
        <span className="font-sans font-bold tracking-tight text-sm sm:text-base">{rank}</span>
        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5">
          {renderSuitSvg(suit)}
        </div>
      </div>

      {/* Large Center Emblem */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-90">
        <div className="w-8 h-8 sm:w-12 sm:h-12 md:w-14 md:h-14 transform transition-transform duration-300">
          {renderSuitSvg(suit)}
        </div>
      </div>

      {/* Bottom Right Index */}
      <div className="flex flex-col items-center leading-none self-end transform rotate-180">
        <span className="font-sans font-bold tracking-tight text-sm sm:text-base">{rank}</span>
        <div className="w-3.5 h-3.5 sm:w-4 sm:h-4 mt-0.5">
          {renderSuitSvg(suit)}
        </div>
      </div>

      {/* Custom numerical indicators for 8 wild state */}
      {rank === '8' && (
        <div className="absolute top-1 right-1.5 bg-yellow-400 text-slate-900 text-[8px] px-1 font-sans rounded-full font-extrabold shadow-xs">
          WILD
        </div>
      )}
    </div>
  );

  // Inner card contents for face-down cards (stunning card back texture)
  const renderCardBack = () => (
    <div className="w-full h-full bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 border border-slate-700 relative p-1.5 sm:p-2 select-none rounded-[inherit]">
      <div className="w-full h-full border border-indigo-500/30 rounded-xs flex items-center justify-center relative overflow-hidden">
        {/* Intricate Geometric Grid Accent */}
        <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:8px_8px] pointer-events-none" />
        
        {/* Centered Golden Frame / Emblem */}
        <div className="w-7 h-7 sm:w-9 sm:h-9 md:w-12 md:h-12 border border-yellow-500/40 rounded-full flex items-center justify-center bg-indigo-900/40 shadow-inner">
          <span className="text-yellow-400 text-xs sm:text-sm md:text-lg font-black tracking-tight font-mono select-none">8</span>
        </div>

        {/* Diagonal corner highlights */}
        <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-yellow-500/40" />
        <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-yellow-500/40" />
        <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-yellow-500/40" />
        <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-yellow-500/40" />
      </div>
    </div>
  );

  // Combine motion settings
  const baseAnimation = animate ? {
    initial: { scale: 0.9, y: 15, opacity: 0 },
    animate: { scale: 1, y: 0, opacity: 1 },
    exit: { scale: 0.8, y: -20, opacity: 0 },
    whileHover: isPlayable && !faceDown ? { 
      y: -14, 
      scale: 1.08,
      shadow: '0 20px 25px -5px rgba(0, 0, 0, 0.25), 0 10px 10px -5px rgba(0, 0, 0, 0.2)' 
    } : {},
  } : {};

  return (
    <motion.div
      id={`card-${card.id}`}
      {...baseAnimation}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      onClick={() => isPlayable && !faceDown && onClick ? onClick() : undefined}
      className={`
        ${sizeClasses[size]} 
        relative 
        cursor-pointer 
        transition-all 
        duration-200 
        ${faceDown ? 'pointer-events-none' : ''}
        ${isPlayable && !faceDown ? 'ring-3 ring-amber-400/80 shadow-lg shadow-amber-400/20 active:scale-95' : ''}
        ${!isPlayable && !faceDown && onClick ? 'opacity-55 filter saturate-50 hover:opacity-75 transition-opacity' : ''}
        flex-shrink-0
      `}
      style={{
        transformStyle: 'preserve-3d',
      }}
    >
      {faceDown ? renderCardBack() : renderCardFace()}
    </motion.div>
  );
};
