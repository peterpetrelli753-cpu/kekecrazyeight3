import React from 'react';
import { X, HelpCircle, BookOpen, Star, Info } from 'lucide-react';
import { motion } from 'motion/react';

interface GameRulesProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GameRules: React.FC<GameRulesProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div id="rules-overlay" className="fixed inset-0 bg-slate-950/85 backdrop-blur-md flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-lg w-full max-h-[85vh] overflow-y-auto shadow-2xl relative text-slate-100"
      >
        {/* Close Button */}
        <button
          id="close-rules-btn"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 p-2 bg-slate-800/50 hover:bg-slate-800 rounded-full cursor-pointer transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="flex items-center gap-2 mb-6">
          <BookOpen className="w-6 h-6 text-yellow-500" />
          <h2 className="text-2xl font-black tracking-tight text-slate-100">
            游戏规则说明 (Rules Guide)
          </h2>
        </div>

        {/* Contents */}
        <div className="space-y-5 text-sm leading-relaxed text-slate-300">
          <div>
            <h3 className="font-extrabold text-slate-100 text-base mb-1.5 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              1. 核心目标
            </h3>
            <p>
              这是一个经典的纸牌游戏《克克疯狂 8 点》(Crazy Eights)。你的最终目标是<strong>最先出完所有的手牌</strong>。每一局游戏获胜后，你将赢得对手手中剩余纸牌的点数总和。
            </p>
          </div>

          <div>
            <h3 className="font-extrabold text-slate-100 text-base mb-1.5 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              2. 准备与发牌
            </h3>
            <p>
              游戏使用一副标准 52 张扑克牌（无大小王）。初始状态，你和 AI 对手<strong>各分发 8 张牌</strong>。其余的纸牌面朝下放置作为摸牌堆（Draw Pile），翻开第一张作为弃牌堆（Discard Pile）的初始牌。
            </p>
          </div>

          <div>
            <h3 className="font-extrabold text-slate-100 text-base mb-1.5 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              3. 出牌逻辑
            </h3>
            <p>
              玩家与 AI 轮流出牌。你打出的牌必须满足以下条件之一：
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>出的牌在<strong>花色 (Suit)</strong>上与弃牌堆顶部的牌相同。</li>
              <li>出的牌在<strong>点数 (Rank)</strong>上与弃牌堆顶部的牌相同。</li>
              <li>任意时候打出数字<strong>“8”</strong>（万能牌/Wild Card）。</li>
            </ul>
          </div>

          <div>
            <h3 className="font-extrabold text-slate-100 text-base mb-1.5 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              4. 万能“8”点 (Crazy 8s)
            </h3>
            <p>
              数字<strong>“8”</strong>是特殊的万用牌。可以在任何你想出牌的回合打出，无论弃牌堆顶是什么。打出 8 之后，你必须<strong>指定一个新的花色</strong>（红心、方块、梅花、黑桃）。下一位玩家必须打出该指定花色的牌，或者打出另一张“8”。
            </p>
          </div>

          <div>
            <h3 className="font-extrabold text-slate-100 text-base mb-1.5 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              5. 摸牌与跳过
            </h3>
            <p>
              若手牌中没有合法的牌可出，则必须点击摸牌堆<strong>摸一张牌</strong>：
            </p>
            <ul className="list-disc pl-5 mt-1 space-y-1">
              <li>若摸上的牌<strong>可以立即打出</strong>，你可以选择直接打出它，或者保留在手牌中直接结束回合（Pass）。</li>
              <li>若摸上的牌<strong>仍无法打出</strong>，你的回合结束，轮到对手出牌。</li>
              <li>若摸牌堆已完全抽空，则你自动<strong>跳过（Pass）</strong>这一回合。</li>
            </ul>
          </div>

          <div>
            <h3 className="font-extrabold text-slate-100 text-base mb-1.5 flex items-center gap-1.5">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              6. 计分分值 (Scoring)
            </h3>
            <p>
              每轮胜者会获得输家手中所剩卡牌的总积分。卡牌分值计算如下：
            </p>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs font-mono bg-slate-950/50 p-2.5 rounded-xl border border-slate-800">
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-yellow-400 font-extrabold">数字 8</span>
                <span>50 分</span>
              </div>
              <div className="flex justify-between border-b border-slate-800 pb-1">
                <span className="text-slate-200">K, Q, J, 10</span>
                <span>10 分</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-200">A (王牌)</span>
                <span>1 分</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-200">2 ~ 9</span>
                <span>面值分</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <button
          id="rules-got-it-btn"
          onClick={onClose}
          className="mt-6 w-full py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-2xl cursor-pointer transition-colors"
        >
          我明白了，开始战斗！
        </button>
      </motion.div>
    </div>
  );
};
