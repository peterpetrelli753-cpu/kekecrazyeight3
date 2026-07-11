import React from 'react';
import { motion } from 'motion/react';
import { Card, GameStats } from '../types';
import { getCardPoints, getSuitSymbol } from '../utils/deck';
import { Award, RotateCcw, Zap, Flame } from 'lucide-react';

interface GameOverModalProps {
  winner: 'player' | 'ai';
  playerHand: Card[];
  aiHand: Card[];
  stats: GameStats;
  onRestart: () => void;
}

export const GameOverModal: React.FC<GameOverModalProps> = ({
  winner,
  playerHand,
  aiHand,
  stats,
  onRestart,
}) => {
  const isPlayerWin = winner === 'player';
  
  // Calculate points of remaining cards in opponent's hand
  const remainingCards = isPlayerWin ? aiHand : playerHand;
  const totalPointsAwarded = remainingCards.reduce((sum, card) => sum + getCardPoints(card), 0);

  // Helper to render card badge
  const renderCardBadge = (card: Card) => {
    const isRed = card.suit === 'H' || card.suit === 'D';
    return (
      <div 
        key={card.id} 
        className={`inline-flex items-center gap-1 px-2 py-1 bg-slate-800 border border-slate-700 rounded-lg text-xs font-bold ${
          isRed ? 'text-red-400' : 'text-slate-300'
        }`}
      >
        <span>{card.rank}</span>
        <span>{getSuitSymbol(card.suit)}</span>
        <span className="text-[10px] text-slate-500 font-normal">({getCardPoints(card)}分)</span>
      </div>
    );
  };

  const winRate = stats.gamesPlayed > 0 
    ? Math.round((stats.playerWins / stats.gamesPlayed) * 100) 
    : 0;

  return (
    <div id="game-over-overlay" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 15 }}
        className="bg-slate-900 border-2 border-slate-800 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl my-8"
      >
        {/* Header Header Icon & Animation */}
        <div className="flex flex-col items-center text-center">
          <motion.div
            initial={{ rotate: -10, scale: 0.8 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', damping: 10 }}
            className={`w-20 h-20 rounded-full flex items-center justify-center border-4 ${
              isPlayerWin 
                ? 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400' 
                : 'bg-red-500/10 border-red-500/30 text-red-400'
            }`}
          >
            {isPlayerWin ? (
              <Award className="w-10 h-10 animate-bounce" />
            ) : (
              <RotateCcw className="w-10 h-10" />
            )}
          </motion.div>

          <h2 className={`text-3xl sm:text-4xl font-black mt-4 tracking-tight uppercase ${
            isPlayerWin ? 'text-yellow-400' : 'text-red-400'
          }`}>
            {isPlayerWin ? '大获全胜！🎉' : '败下阵来 🤖'}
          </h2>
          <p className="text-sm text-slate-400 mt-1">
            {isPlayerWin ? '你率先清空了所有手牌！' : 'AI率先出完了所有的牌！'}
          </p>
        </div>

        {/* Score calculations */}
        <div className="mt-6 bg-slate-950/50 border border-slate-800 rounded-2xl p-4">
          <h3 className="text-xs font-black tracking-wider text-slate-500 uppercase mb-3">
            本局计分结算 (对手剩余手牌)
          </h3>
          {remainingCards.length > 0 ? (
            <div>
              <div className="flex flex-wrap gap-2 mb-3">
                {remainingCards.map(renderCardBadge)}
              </div>
              <div className="flex justify-between items-center border-t border-slate-800/80 pt-3">
                <span className="text-sm text-slate-400">
                  {isPlayerWin ? 'AI 剩余手牌点数：' : '你剩余手牌点数：'}
                </span>
                <span className={`text-lg font-black ${isPlayerWin ? 'text-yellow-400' : 'text-red-400'}`}>
                  +{totalPointsAwarded} 分
                </span>
              </div>
            </div>
          ) : (
            <p className="text-sm text-slate-400">对手没有剩余手牌（完美清空）。</p>
          )}
        </div>

        {/* Stats Summary Panel */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
          <div className="bg-slate-800/40 border border-slate-850 p-3 rounded-xl text-center">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">胜/负</span>
            <span className="text-base sm:text-lg font-black text-slate-200">
              {stats.playerWins} <span className="text-xs font-normal text-slate-500">vs</span> {stats.aiWins}
            </span>
          </div>

          <div className="bg-slate-800/40 border border-slate-850 p-3 rounded-xl text-center">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">胜率</span>
            <span className="text-base sm:text-lg font-black text-slate-200">{winRate}%</span>
          </div>

          <div className="bg-slate-800/40 border border-slate-850 p-3 rounded-xl text-center">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">当前连胜</span>
            <span className="text-base sm:text-lg font-black text-yellow-500 flex items-center justify-center gap-1">
              <Flame className="w-4 h-4 fill-current" /> {stats.streak}
            </span>
          </div>

          <div className="bg-slate-800/40 border border-slate-850 p-3 rounded-xl text-center">
            <span className="text-[10px] font-bold text-slate-500 block uppercase">累计积分</span>
            <span className="text-base sm:text-lg font-black text-emerald-400">
              {stats.playerScore} <span className="text-xs font-normal text-slate-500">分</span>
            </span>
          </div>
        </div>

        {/* Replay action */}
        <div className="mt-8 flex flex-col sm:flex-row gap-3">
          <button
            id="play-again-btn"
            onClick={onRestart}
            className="flex-1 flex items-center justify-center gap-2 py-4 px-6 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-950 font-black tracking-wide rounded-2xl shadow-lg hover:shadow-yellow-500/20 active:scale-98 transition-all cursor-pointer"
          >
            <RotateCcw className="w-5 h-5" />
            再来一局 (Play Again)
          </button>
        </div>
      </motion.div>
    </div>
  );
};
