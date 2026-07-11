import React from 'react';
import { motion } from 'motion/react';
import { Suit } from '../types';
import { getSuitSymbol, getSuitNameZh } from '../utils/deck';

interface SuitSelectorProps {
  onSelect: (suit: Suit) => void;
}

export const SuitSelector: React.FC<SuitSelectorProps> = ({ onSelect }) => {
  const suits: { id: Suit; label: string; color: string; hoverColor: string; bg: string; icon: string }[] = [
    {
      id: 'H',
      label: '红心',
      color: 'text-red-500',
      hoverColor: 'hover:bg-red-50 hover:text-red-600 hover:border-red-400',
      bg: 'bg-red-500/10 border-red-500/20',
      icon: '♥',
    },
    {
      id: 'D',
      label: '方块',
      color: 'text-orange-500',
      hoverColor: 'hover:bg-orange-50 hover:text-orange-600 hover:border-orange-400',
      bg: 'bg-orange-500/10 border-orange-500/20',
      icon: '♦',
    },
    {
      id: 'C',
      label: '梅花',
      color: 'text-slate-800 dark:text-slate-200',
      hoverColor: 'hover:bg-slate-100 hover:text-slate-900 hover:border-slate-400',
      bg: 'bg-slate-500/10 border-slate-500/20',
      icon: '♣',
    },
    {
      id: 'S',
      label: '黑桃',
      color: 'text-slate-900 dark:text-slate-100',
      hoverColor: 'hover:bg-slate-200 hover:text-slate-950 hover:border-slate-500',
      bg: 'bg-slate-900/10 border-slate-900/20',
      icon: '♠',
    },
  ];

  return (
    <div id="suit-selector-overlay" className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 10 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-md w-full shadow-2xl text-center"
      >
        <div className="mb-2 inline-flex items-center justify-center w-12 h-12 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 font-extrabold text-xl animate-pulse">
          8
        </div>
        <h3 className="text-xl sm:text-2xl font-black text-slate-100 mt-2 tracking-tight">
          万能 8 点！选择一个新花色
        </h3>
        <p className="text-xs sm:text-sm text-slate-400 mt-1 mb-6">
          所有玩家接下来的出牌必须匹配你指定的这个花色，或打出另一个 8 点。
        </p>

        {/* 4 Quadrants for Suits */}
        <div className="grid grid-cols-2 gap-4">
          {suits.map((suitItem) => (
            <button
              key={suitItem.id}
              id={`select-suit-${suitItem.id}`}
              onClick={() => onSelect(suitItem.id)}
              className={`
                ${suitItem.color} 
                ${suitItem.bg} 
                ${suitItem.hoverColor}
                flex flex-col items-center justify-center 
                p-5 rounded-2xl border-2 transition-all duration-200 
                transform hover:scale-105 active:scale-95 cursor-pointer
                group shadow-sm hover:shadow-lg
              `}
            >
              <span className="text-4xl sm:text-5xl font-bold mb-1 transition-transform group-hover:scale-110">
                {suitItem.icon}
              </span>
              <span className="text-sm font-semibold tracking-wide text-slate-300 group-hover:text-slate-100">
                {suitItem.label} ({suitItem.id})
              </span>
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};
