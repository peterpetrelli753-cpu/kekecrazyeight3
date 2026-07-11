import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, GamePhase, GameLogEntry, GameStats, GameSettings, Suit } from '../types';
import { 
  createDeck, 
  shuffle, 
  getCardPoints, 
  isValidPlay, 
  getBestAIMove, 
  chooseBestAISuit,
  getSuitSymbol,
  getSuitNameZh
} from '../utils/deck';
import { playSound } from '../utils/sounds';
import { CardView } from './CardView';
import { SuitSelector } from './SuitSelector';
import { GameOverModal } from './GameOverModal';
import { GameRules } from './GameRules';
import { 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  RotateCcw, 
  History, 
  Flame, 
  Cpu, 
  User, 
  Sparkles,
  Layers,
  ArrowRight,
  TrendingUp,
  Award,
  Zap
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'crazy_eights_stats_v1';

const INITIAL_STATS: GameStats = {
  playerWins: 0,
  aiWins: 0,
  playerScore: 0,
  aiScore: 0,
  gamesPlayed: 0,
  streak: 0,
  bestStreak: 0,
};

export const GameBoard: React.FC = () => {
  // Game state
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [aiHand, setAiHand] = useState<Card[]>([]);
  const [discardPile, setDiscardPile] = useState<Card[]>([]);
  const [activeSuit, setActiveSuit] = useState<Suit>('H');
  const [gamePhase, setGamePhase] = useState<GamePhase>('start_screen');
  const [logs, setLogs] = useState<GameLogEntry[]>([]);
  const [winner, setWinner] = useState<'player' | 'ai' | null>(null);
  
  // Player state tracking inside the turn
  const [playerHasDrawn, setPlayerHasDrawn] = useState<boolean>(false);
  const [justDrawnCard, setJustDrawnCard] = useState<Card | null>(null);

  // Stats & Settings
  const [stats, setStats] = useState<GameStats>(INITIAL_STATS);
  const [settings, setSettings] = useState<GameSettings>({
    soundEnabled: true,
    aiSpeedMs: 1200,
    cardsStyle: 'modern'
  });
  
  const [isRulesOpen, setIsRulesOpen] = useState<boolean>(false);
  const [isLogDrawerOpen, setIsLogDrawerOpen] = useState<boolean>(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Load stats from local storage on mount
  useEffect(() => {
    try {
      const savedStats = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (savedStats) {
        setStats(JSON.parse(savedStats));
      }
    } catch (e) {
      console.error('Failed to load stats', e);
    }
  }, []);

  // Save stats to local storage when changed
  const saveStats = (newStats: GameStats) => {
    setStats(newStats);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newStats));
    } catch (e) {
      console.error('Failed to save stats', e);
    }
  };

  // Add a log entry
  const addLog = (sender: 'player' | 'ai' | 'system', message: string) => {
    const newEntry: GameLogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      sender,
      message,
      timestamp: new Date()
    };
    setLogs(prev => [newEntry, ...prev]);
  };

  // Scroll logs to top/bottom
  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Start dealing sequence
  const startNewGame = () => {
    playSound.playShuffle(settings.soundEnabled);
    
    // Create and shuffle full deck
    const freshDeck = shuffle(createDeck());
    
    // Deal 8 cards to each player
    const pHand = freshDeck.splice(0, 8);
    const aHand = freshDeck.splice(0, 8);
    
    // Draw initial discard pile card (ensure it is NOT an 8 to avoid starting-state confusion)
    let initialDiscardIndex = 0;
    while (initialDiscardIndex < freshDeck.length && freshDeck[initialDiscardIndex].rank === '8') {
      initialDiscardIndex++;
    }
    
    // If we have to skip any 8s, swap them to the bottom
    if (initialDiscardIndex > 0 && initialDiscardIndex < freshDeck.length) {
      const firstNonEight = freshDeck[initialDiscardIndex];
      freshDeck.splice(initialDiscardIndex, 1);
      freshDeck.unshift(firstNonEight);
    }
    
    const initialDiscard = freshDeck.shift() as Card;
    
    setDeck(freshDeck);
    setPlayerHand(pHand);
    setAiHand(aHand);
    setDiscardPile([initialDiscard]);
    setActiveSuit(initialDiscard.suit);
    setWinner(null);
    setPlayerHasDrawn(false);
    setJustDrawnCard(null);
    
    // Reset logs
    const startMessage = `游戏开始！发牌完毕。弃牌堆首张为 ${initialDiscard.rank} ${getSuitSymbol(initialDiscard.suit)}`;
    setLogs([{
      id: 'init',
      sender: 'system',
      message: startMessage,
      timestamp: new Date()
    }]);

    setGamePhase('player_turn');
  };

  // Check if hand is empty and handle win state
  const checkWinCondition = (hand: Card[], side: 'player' | 'ai') => {
    if (hand.length === 0) {
      setWinner(side);
      setGamePhase('game_over');
      
      const newGamesPlayed = stats.gamesPlayed + 1;
      let newPlayerWins = stats.playerWins;
      let newAiWins = stats.aiWins;
      let newPlayerScore = stats.playerScore;
      let newAiScore = stats.aiScore;
      let newStreak = stats.streak;
      let newBestStreak = stats.bestStreak;

      if (side === 'player') {
        playSound.playSuccess(settings.soundEnabled);
        newPlayerWins += 1;
        newStreak += 1;
        if (newStreak > newBestStreak) {
          newBestStreak = newStreak;
        }
        // Calculate points
        const points = aiHand.reduce((sum, card) => sum + getCardPoints(card), 0);
        newPlayerScore += points;
        addLog('system', `🎉 你赢了这一局！获得积分：${points}分！`);
      } else {
        playSound.playFailure(settings.soundEnabled);
        newAiWins += 1;
        newStreak = 0; // Reset streak
        // Calculate points
        const points = playerHand.reduce((sum, card) => sum + getCardPoints(card), 0);
        newAiScore += points;
        addLog('system', `🤖 AI 赢了这一局。AI获得积分：${points}分。`);
      }

      saveStats({
        playerWins: newPlayerWins,
        aiWins: newAiWins,
        playerScore: newPlayerScore,
        aiScore: newAiScore,
        gamesPlayed: newGamesPlayed,
        streak: newStreak,
        bestStreak: newBestStreak,
      });

      return true;
    }
    return false;
  };

  // Handle playing a card from the Player's hand
  const handlePlayerPlay = (card: Card) => {
    if (gamePhase !== 'player_turn') return;
    
    const topCard = discardPile[discardPile.length - 1];
    if (!isValidPlay(card, topCard, activeSuit)) {
      return; // Invalid play
    }

    // Play card
    const updatedHand = playerHand.filter(c => c.id !== card.id);
    const updatedDiscard = [...discardPile, card];
    
    setPlayerHand(updatedHand);
    setDiscardPile(updatedDiscard);
    setJustDrawnCard(null);

    // If card is an '8'
    if (card.rank === '8') {
      playSound.playWildPlay(settings.soundEnabled);
      addLog('player', `打出了 8 ${getSuitSymbol(card.suit)} ♣️♦️♥️♠️ (万能牌)`);
      setGamePhase('suit_selection'); // Enter suit selection phase
    } else {
      playSound.playCardPlay(settings.soundEnabled);
      addLog('player', `打出了 ${card.rank} ${getSuitSymbol(card.suit)}`);
      
      setActiveSuit(card.suit);
      
      const isWon = checkWinCondition(updatedHand, 'player');
      if (!isWon) {
        setPlayerHasDrawn(false);
        setGamePhase('ai_turn');
      }
    }
  };

  // Handle player wild suit selection
  const handlePlayerSuitSelect = (suit: Suit) => {
    setActiveSuit(suit);
    addLog('player', `指定了新花色：${getSuitNameZh(suit)} ${getSuitSymbol(suit)}`);
    
    const isWon = checkWinCondition(playerHand, 'player');
    if (!isWon) {
      setPlayerHasDrawn(false);
      setGamePhase('ai_turn');
    }
  };

  // Player draws a card
  const handlePlayerDraw = () => {
    if (gamePhase !== 'player_turn') return;
    if (deck.length === 0) {
      // Deck empty -> Pass turn
      addLog('system', '摸牌堆已空，你只能跳过本回合 (Pass)。');
      setPlayerHasDrawn(false);
      setGamePhase('ai_turn');
      return;
    }

    // Draw card
    const updatedDeck = [...deck];
    const drawnCard = updatedDeck.shift() as Card;
    const updatedHand = [...playerHand, drawnCard];

    setDeck(updatedDeck);
    setPlayerHand(updatedHand);
    setPlayerHasDrawn(true);
    setJustDrawnCard(drawnCard);
    
    playSound.playCardDraw(settings.soundEnabled);
    addLog('player', `从牌堆摸了一张牌 [${drawnCard.rank} ${getSuitSymbol(drawnCard.suit)}]`);

    // Check if the drawn card is playable
    const topCard = discardPile[discardPile.length - 1];
    const isPlayable = isValidPlay(drawnCard, topCard, activeSuit);

    if (!isPlayable) {
      // Auto pass after 1.5s delay to let user see what they drew
      addLog('system', '摸到的牌不匹配，自动结束回合。');
      setTimeout(() => {
        if (gamePhase === 'player_turn') {
          setPlayerHasDrawn(false);
          setJustDrawnCard(null);
          setGamePhase('ai_turn');
        }
      }, 1500);
    }
  };

  // Player passes manually after drawing
  const handlePlayerPass = () => {
    if (gamePhase !== 'player_turn' || !playerHasDrawn) return;
    addLog('player', '选择保留手牌，跳过本回合 (Pass)。');
    setPlayerHasDrawn(false);
    setJustDrawnCard(null);
    setGamePhase('ai_turn');
  };

  // AI Turn Logic loop
  useEffect(() => {
    if (gamePhase !== 'ai_turn') return;

    let timer = setTimeout(() => {
      const topCard = discardPile[discardPile.length - 1];
      const bestMove = getBestAIMove(aiHand, topCard, activeSuit);

      if (bestMove) {
        // AI can play!
        const updatedHand = aiHand.filter(c => c.id !== bestMove.id);
        const updatedDiscard = [...discardPile, bestMove];

        setAiHand(updatedHand);
        setDiscardPile(updatedDiscard);

        if (bestMove.rank === '8') {
          playSound.playWildPlay(settings.soundEnabled);
          const aiChosenSuit = chooseBestAISuit(updatedHand);
          setActiveSuit(aiChosenSuit);
          addLog('ai', `🤖 AI 打出万能 8 并指定花色：${getSuitNameZh(aiChosenSuit)} ${getSuitSymbol(aiChosenSuit)}`);
        } else {
          playSound.playCardPlay(settings.soundEnabled);
          setActiveSuit(bestMove.suit);
          addLog('ai', `🤖 AI 打出了 ${bestMove.rank} ${getSuitSymbol(bestMove.suit)}`);
        }

        const isWon = checkWinCondition(updatedHand, 'ai');
        if (!isWon) {
          setGamePhase('player_turn');
        }
      } else {
        // AI has to draw
        if (deck.length === 0) {
          addLog('ai', '🤖 AI 无牌可出，摸牌堆为空，AI选择跳过本回合。');
          setGamePhase('player_turn');
        } else {
          const updatedDeck = [...deck];
          const drawnCard = updatedDeck.shift() as Card;
          const updatedHand = [...aiHand, drawnCard];

          setDeck(updatedDeck);
          setAiHand(updatedHand);
          playSound.playCardDraw(settings.soundEnabled);
          addLog('ai', '🤖 AI 无合法牌可出，摸了一张牌。');

          // Evaluate if newly drawn card is playable
          const isPlayable = isValidPlay(drawnCard, topCard, activeSuit);
          if (isPlayable) {
            // AI plays it immediately!
            setTimeout(() => {
              const postDrawHand = updatedHand.filter(c => c.id !== drawnCard.id);
              const postDrawDiscard = [...discardPile, drawnCard];

              setAiHand(postDrawHand);
              setDiscardPile(postDrawDiscard);

              if (drawnCard.rank === '8') {
                playSound.playWildPlay(settings.soundEnabled);
                const aiChosenSuit = chooseBestAISuit(postDrawHand);
                setActiveSuit(aiChosenSuit);
                addLog('ai', `🤖 AI 摸牌并立刻打出万能 8，指定花色：${getSuitNameZh(aiChosenSuit)} ${getSuitSymbol(aiChosenSuit)}`);
              } else {
                playSound.playCardPlay(settings.soundEnabled);
                setActiveSuit(drawnCard.suit);
                addLog('ai', `🤖 AI 摸牌并立刻打出了 ${drawnCard.rank} ${getSuitSymbol(drawnCard.suit)}`);
              }

              const isWon = checkWinCondition(postDrawHand, 'ai');
              if (!isWon) {
                setGamePhase('player_turn');
              }
            }, 1000);
          } else {
            addLog('ai', '🤖 AI 摸牌后仍无法出牌，自动跳过。');
            setGamePhase('player_turn');
          }
        }
      }
    }, settings.aiSpeedMs);

    return () => clearTimeout(timer);
  }, [gamePhase, aiHand, discardPile, activeSuit, deck]);

  // Check if player has any valid moves
  const topCard = discardPile[discardPile.length - 1];
  const hasValidMoves = playerHand.some(card => isValidPlay(card, topCard, activeSuit));

  // Render main board
  return (
    <div id="game-board-container" className="min-h-screen bg-gradient-to-b from-slate-50 via-zinc-100 to-slate-200 flex flex-col justify-between overflow-x-hidden text-slate-800 relative font-sans">
      
      {/* Decorative Felt Background Subtle Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.85),rgba(241,245,249,0.75))] pointer-events-none" />

      {/* Header Panel */}
      <header id="game-header" className="relative z-10 w-full max-w-7xl mx-auto px-4 py-3 sm:py-4 flex items-center justify-between border-b border-slate-200 bg-white/70 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-yellow-500 flex items-center justify-center font-black text-slate-950 text-xl shadow-lg rotate-[-6deg] hover:rotate-0 transition-transform">
            8
          </div>
          <div>
            <h1 className="text-sm sm:text-base font-black tracking-wider uppercase text-slate-900">
              克克疯狂 8 点
            </h1>
            <p className="text-[10px] text-emerald-600 font-mono tracking-widest hidden sm:block">
              CRAZY EIGHTS CASINO
            </p>
          </div>
        </div>

        {/* Global Stats Scoreboard */}
        <div className="flex items-center gap-4 sm:gap-6">
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">玩家积分</span>
              <span className="text-xs sm:text-sm font-black text-amber-600 font-mono">{stats.playerScore}分</span>
            </div>
            <div className="h-6 w-[1px] bg-slate-200" />
            <div className="text-center">
              <span className="text-[10px] text-slate-500 block font-bold uppercase tracking-wider">胜负比</span>
              <span className="text-xs sm:text-sm font-black text-slate-800 font-mono">
                {stats.playerWins} <span className="text-slate-400 font-normal">W</span> - {stats.aiWins} <span className="text-slate-400 font-normal">L</span>
              </span>
            </div>
            {stats.streak > 0 && (
              <>
                <div className="h-6 w-[1px] bg-slate-200" />
                <div className="flex items-center gap-1 bg-yellow-100 border border-yellow-300 px-2 py-0.5 rounded-full text-yellow-700 text-[10px] font-black tracking-wide animate-pulse">
                  <Flame className="w-3.5 h-3.5 fill-current" />
                  <span>{stats.streak} 连胜</span>
                </div>
              </>
            )}
          </div>

          {/* Quick Config Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {/* Audio Toggle */}
            <button
              id="sound-toggle-btn"
              onClick={() => setSettings(prev => ({ ...prev, soundEnabled: !prev.soundEnabled }))}
              className="p-2 hover:bg-slate-100 active:scale-95 rounded-xl cursor-pointer transition-colors text-slate-600 hover:text-slate-900"
              title="声音开关"
            >
              {settings.soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>
            {/* Rules Button */}
            <button
              id="rules-toggle-btn"
              onClick={() => setIsRulesOpen(true)}
              className="p-2 hover:bg-slate-100 active:scale-95 rounded-xl cursor-pointer transition-colors text-slate-600 hover:text-slate-900"
              title="规则指南"
            >
              <HelpCircle className="w-4 h-4" />
            </button>
            {/* Restart Button */}
            <button
              id="quick-restart-btn"
              onClick={startNewGame}
              className="p-2 hover:bg-slate-100 active:scale-95 rounded-xl cursor-pointer transition-colors text-slate-600 hover:text-slate-900"
              title="重新洗牌"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Board Table Playfield */}
      {gamePhase === 'start_screen' ? (
        // Playfield Welcome Screen
        <div id="welcome-screen" className="flex-1 flex flex-col items-center justify-center p-6 relative z-10">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="text-center max-w-md w-full bg-white/90 border border-slate-200/80 rounded-3xl p-8 shadow-2xl backdrop-blur-md text-slate-800"
          >
            <div className="relative inline-block mb-4">
              <motion.div 
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                className="w-16 h-22 bg-gradient-to-br from-red-500 to-red-600 rounded-xl shadow-lg border border-red-400 flex items-center justify-center text-4xl font-extrabold transform -translate-x-4 rotate-[-12deg] text-white"
              >
                ♥
              </motion.div>
              <div className="absolute top-0 left-4 w-16 h-22 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl shadow-xl border border-yellow-300 flex items-center justify-center text-4xl font-black text-slate-950 transform rotate-[12deg]">
                8
              </div>
            </div>

            <h2 className="text-3xl font-black tracking-tight mb-2 text-slate-900">
              克克疯狂 8 点
            </h2>
            <p className="text-sm text-slate-500 mb-6 font-medium">
              经典好玩的扑克牌《Crazy Eights》隆重登场！匹配数字或花色，打出万能的 8 点掌控牌局，赢取最高积分！
            </p>

            <div className="space-y-3">
              <button
                id="start-match-btn"
                onClick={startNewGame}
                className="w-full py-4 bg-gradient-to-r from-yellow-500 to-amber-500 hover:from-yellow-600 hover:to-amber-600 text-slate-950 font-black rounded-2xl shadow-lg hover:shadow-yellow-500/20 active:scale-98 transition-all cursor-pointer"
              >
                开始新对局 (Battle AI)
              </button>
              <button
                id="view-rules-initial-btn"
                onClick={() => setIsRulesOpen(true)}
                className="w-full py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-2xl cursor-pointer transition-colors"
              >
                规则与分值指南
              </button>
            </div>

            {/* Quick stats on welcome */}
            {stats.gamesPlayed > 0 && (
              <div className="mt-6 border-t border-slate-200 pt-4 text-xs text-slate-500 flex justify-around">
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-black">对局数</span>
                  <span className="text-sm font-bold text-slate-700">{stats.gamesPlayed}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-black">胜率</span>
                  <span className="text-sm font-bold text-slate-700">
                    {Math.round((stats.playerWins / stats.gamesPlayed) * 100)}%
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400 uppercase font-black">最高连胜</span>
                  <span className="text-sm font-bold text-slate-700">{stats.bestStreak}</span>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      ) : (
        // Playfield Game Screen
        <div id="active-playfield" className="flex-1 flex flex-col justify-between p-4 relative z-10 max-w-7xl w-full mx-auto">
          
          {/* TOP AREA: AI Opponent Hand */}
          <div id="ai-opponent-area" className="w-full flex flex-col items-center gap-1.5 py-1">
            <div className="flex items-center gap-2 bg-white/80 border border-slate-200 backdrop-blur-xs px-3 py-1.5 rounded-full shadow-md">
              <div className="relative">
                <div className={`w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600 ${gamePhase === 'ai_turn' ? 'ring-2 ring-yellow-400 animate-pulse' : ''}`}>
                  <Cpu className="w-4 h-4" />
                </div>
                {gamePhase === 'ai_turn' && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-yellow-500"></span>
                  </span>
                )}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-slate-800">AI 疯狂荷官</span>
                  {gamePhase === 'ai_turn' && (
                    <span className="text-[10px] text-amber-600 animate-pulse font-bold">思考中...</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-500 flex items-center gap-1">
                  <span>剩余手牌:</span>
                  <span className="font-mono font-bold text-amber-600 text-xs">{aiHand.length} 张</span>
                </div>
              </div>
            </div>

            {/* AI Hand Representation */}
            <div className="flex -space-x-10 sm:-space-x-12 justify-center py-2 max-w-full overflow-hidden">
              <AnimatePresence>
                {aiHand.map((card, index) => (
                  <CardView
                    key={card.id}
                    card={card}
                    faceDown={true}
                    size="sm"
                    index={index}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* MIDDLE AREA: Discard Pile & Draw Pile Table */}
          <div id="felt-table-action" className="flex-1 flex flex-col sm:flex-row items-center justify-center gap-10 sm:gap-16 py-4 md:py-6 relative">
            
            {/* Draw Pile (Left) */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                {deck.length > 0 ? (
                  <button
                    id="draw-deck-card-btn"
                    onClick={handlePlayerDraw}
                    disabled={gamePhase !== 'player_turn' || playerHasDrawn}
                    className={`
                      relative block transition-all rounded-lg sm:rounded-xl 
                      ${gamePhase === 'player_turn' && !playerHasDrawn && !hasValidMoves
                        ? 'ring-4 ring-yellow-400 animate-bounce cursor-pointer hover:brightness-110 shadow-yellow-400/20' 
                        : gamePhase === 'player_turn' && !playerHasDrawn
                        ? 'cursor-pointer hover:brightness-105 hover:scale-102 hover:shadow-lg shadow-black/10'
                        : 'opacity-80 pointer-events-none'
                      }
                    `}
                  >
                    {/* Visual deck stack height using multiple card-back borders */}
                    <div className="absolute top-1.5 left-1.5 w-16 h-24 sm:w-20 sm:h-30 md:w-24 md:h-36 bg-slate-200 rounded-[inherit] border border-slate-300 -z-30 transform translate-x-1.5 translate-y-1.5" />
                    <div className="absolute top-0.5 left-0.5 w-16 h-24 sm:w-20 sm:h-30 md:w-24 md:h-36 bg-slate-100 rounded-[inherit] border border-slate-250 -z-20 transform translate-x-0.5 translate-y-0.5" />
                    <CardView
                      card={{ id: 'deck-back', suit: 'H', rank: 'A' }}
                      faceDown={true}
                      animate={false}
                    />
                    
                    {/* Prompt Badge to Draw */}
                    {gamePhase === 'player_turn' && !playerHasDrawn && !hasValidMoves && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-yellow-400 text-slate-950 text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg border border-yellow-300 flex items-center gap-0.5 tracking-wider whitespace-nowrap animate-bounce">
                        <Zap className="w-3 h-3 fill-current" />
                        请摸牌
                      </div>
                    )}
                  </button>
                ) : (
                  // Empty deck placeholder
                  <div className="w-16 h-24 sm:w-20 sm:h-30 md:w-24 md:h-36 border-2 border-dashed border-slate-300 rounded-lg sm:rounded-xl flex items-center justify-center text-slate-400 text-xs font-bold text-center p-2">
                    摸牌堆已空
                  </div>
                )}
                
                {/* Deck Card Count */}
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white/95 border border-slate-200 px-3 py-0.5 rounded-full text-[10px] text-slate-600 font-mono font-bold tracking-wider whitespace-nowrap shadow-md">
                  摸牌堆: {deck.length}张
                </div>
              </div>
            </div>

            {/* Discard Pile (Right) */}
            <div className="flex flex-col items-center gap-2">
              <div className="relative">
                {discardPile.length > 0 ? (
                  <div className="relative">
                    {/* Shadow cards underneath discard top */}
                    {discardPile.length > 2 && (
                      <div className="absolute inset-0 transform -rotate-6 translate-x-1 translate-y-0.5 opacity-40 -z-20">
                        <CardView card={discardPile[discardPile.length - 3]} animate={false} />
                      </div>
                    )}
                    {discardPile.length > 1 && (
                      <div className="absolute inset-0 transform rotate-3 translate-x-0.5 translate-y-1.5 opacity-60 -z-10">
                        <CardView card={discardPile[discardPile.length - 2]} animate={false} />
                      </div>
                    )}
                    {/* Top Discard Card */}
                    <div className="relative z-0">
                      <CardView 
                        card={discardPile[discardPile.length - 1]} 
                        animate={true}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="w-16 h-24 sm:w-20 sm:h-30 md:w-24 md:h-36 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400">
                    空弃牌堆
                  </div>
                )}

                {/* Active Suit and Rank badge indicator */}
                <div className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 bg-white/95 border border-slate-200 px-3 py-1 rounded-full text-xs font-extrabold tracking-wider whitespace-nowrap shadow-lg flex items-center gap-1.5">
                  <span className="text-slate-400 text-[10px]">有效花色:</span>
                  <span className={`text-base leading-none ${activeSuit === 'H' || activeSuit === 'D' ? 'text-red-500' : 'text-slate-800'}`}>
                    {getSuitSymbol(activeSuit)}
                  </span>
                  <span className="text-[10px] font-bold text-slate-600">{getSuitNameZh(activeSuit)}</span>
                  
                  {/* Wild sparkling star icon for wild state */}
                  {discardPile.length > 0 && discardPile[discardPile.length - 1].rank === '8' && (
                    <span className="w-2 h-2 rounded-full bg-yellow-400 animate-ping absolute -top-0.5 -right-0.5" />
                  )}
                </div>
              </div>
            </div>

            {/* Custom Wild Suit Sparkles overlay when 8 is active */}
            {discardPile.length > 0 && discardPile[discardPile.length - 1].rank === '8' && (
              <div className="absolute -top-6 text-center animate-pulse flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-800 text-[11px] font-extrabold px-4 py-1 rounded-full backdrop-blur-xs shadow-sm">
                <Sparkles className="w-3.5 h-3.5 fill-current text-yellow-600" />
                <span>万能 8 点加持：当前花色指定为 {getSuitNameZh(activeSuit)} {getSuitSymbol(activeSuit)}！</span>
              </div>
            )}
          </div>

          {/* BOTTOM AREA: Active Player Hand */}
          <div id="player-active-area" className="w-full flex flex-col items-center gap-2">
            
            {/* Player Hand Instructions & Indicators */}
            <div className="w-full max-w-xl flex items-center justify-between px-4">
              <div className="flex items-center gap-1.5 bg-white/80 border border-slate-200/60 px-2.5 py-1 rounded-full shadow-xs">
                <div className="w-5 h-5 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center text-emerald-700 font-bold text-[10px]">
                  你
                </div>
                <span className="text-xs font-bold text-slate-700">
                  我的手牌 ({playerHand.length}张)
                </span>
              </div>

              {/* Action hints or warning */}
              <div className="flex items-center gap-2">
                {/* Pass option after draw */}
                {gamePhase === 'player_turn' && playerHasDrawn && (
                  <motion.button
                    id="pass-turn-btn"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    onClick={handlePlayerPass}
                    className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-slate-950 font-black text-xs rounded-full cursor-pointer shadow-md transition-colors flex items-center gap-1"
                  >
                    <span>无牌可出，结束回合</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </motion.button>
                )}

                {/* Warning badge for 1 card left */}
                {playerHand.length === 1 && (
                  <div className="bg-red-100 border border-red-300 text-red-700 px-3 py-1 rounded-full text-[10px] font-black tracking-widest uppercase animate-bounce">
                    🚨 最后一牌！🚨
                  </div>
                )}
              </div>
            </div>

            {/* Fanned Player Cards */}
            <div className="w-full max-w-3xl flex justify-center py-4 px-6 overflow-x-auto min-h-[160px] relative scrollbar-thin">
              <div className="flex -space-x-8 sm:-space-x-12 pb-4 pt-2">
                <AnimatePresence>
                  {playerHand.map((card, index) => {
                    const isPlay = gamePhase === 'player_turn' && isValidPlay(card, topCard, activeSuit);
                    
                    // Curved fan-out calculation
                    const midIndex = (playerHand.length - 1) / 2;
                    const offset = index - midIndex;
                    const rotate = offset * 4.5; // Rotational fan tilt
                    const translateY = Math.abs(offset) * 2; // Curve downwards at edges
                    
                    return (
                      <div
                        key={card.id}
                        className="transition-transform duration-200"
                        style={{
                          transform: `rotate(${rotate}deg) translateY(${translateY}px)`,
                          zIndex: index,
                        }}
                      >
                        <CardView
                          card={card}
                          isPlayable={isPlay}
                          onClick={() => handlePlayerPlay(card)}
                          index={index}
                        />
                      </div>
                    );
                  })}
                </AnimatePresence>
              </div>
            </div>
            
            {/* Draw notification alert banner */}
            {justDrawnCard && (
              <div className="text-xs text-center font-bold text-amber-700 bg-amber-50 px-4 py-1.5 rounded-full border border-amber-200 animate-fade-in">
                你摸到了：[{justDrawnCard.rank} {getSuitSymbol(justDrawnCard.suit)}]
              </div>
            )}
          </div>
        </div>
      )}

      {/* FOOTER ACTION / RECENT PLAY LOG BAR */}
      <footer id="game-logs-footer" className="relative z-10 w-full bg-white/80 border-t border-slate-200 p-3 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 shadow-inner">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-emerald-600" />
          <span className="font-bold text-slate-700">对局动态：</span>
          <div className="flex items-center gap-1 overflow-hidden text-slate-600">
            {logs.length > 0 ? (
              <span className="truncate font-medium">{logs[0].message}</span>
            ) : (
              <span>等待新对局开始...</span>
            )}
          </div>
        </div>

        {/* Show history logs drawer trigger */}
        <button
          id="toggle-drawer-btn"
          onClick={() => setIsLogDrawerOpen(!isLogDrawerOpen)}
          className="flex items-center gap-1 px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-full cursor-pointer transition-colors"
        >
          查看完整动态 ({logs.length})
        </button>
      </footer>

      {/* FULL MATCH HISTORY LOG DRAWER */}
      {isLogDrawerOpen && (
        <div id="logs-drawer" className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex justify-end z-50">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            className="w-full max-w-sm bg-white border-l border-slate-200 h-full p-6 flex flex-col justify-between shadow-2xl"
          >
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200">
                <div className="flex items-center gap-1.5 text-slate-850 font-black">
                  <History className="w-5 h-5 text-emerald-600" />
                  <span>战局完整记录</span>
                </div>
                <button
                  id="close-drawer-btn"
                  onClick={() => setIsLogDrawerOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-full cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Logs loop */}
              <div className="space-y-3.5 max-h-[70vh] overflow-y-auto pr-1">
                {logs.length === 0 ? (
                  <p className="text-slate-450 text-center py-10">暂无任何对局动态。</p>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="text-xs pb-2 border-b border-slate-100">
                      <div className="flex items-center justify-between text-[10px] text-slate-400 font-mono mb-0.5">
                        <span className={`font-bold uppercase ${
                          log.sender === 'player' ? 'text-amber-600' : log.sender === 'ai' ? 'text-blue-600' : 'text-slate-500'
                        }`}>
                          {log.sender === 'player' ? '你' : log.sender === 'ai' ? 'AI荷官' : '系统'}
                        </span>
                        <span>{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                      </div>
                      <p className="text-slate-700 font-medium">{log.message}</p>
                    </div>
                  ))
                )}
                <div ref={logsEndRef} />
              </div>
            </div>

            <button
              id="clear-logs-btn"
              onClick={() => setLogs([])}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-750 font-bold rounded-xl cursor-pointer"
            >
              清空动态记录
            </button>
          </motion.div>
        </div>
      )}

      {/* OVERLAY: Wild Suit Selection Modal */}
      {gamePhase === 'suit_selection' && (
        <SuitSelector
          onSelect={handlePlayerSuitSelect}
        />
      )}

      {/* OVERLAY: GameOver Winners */}
      {gamePhase === 'game_over' && winner && (
        <GameOverModal
          winner={winner}
          playerHand={playerHand}
          aiHand={aiHand}
          stats={stats}
          onRestart={startNewGame}
        />
      )}

      {/* OVERLAY: Game Rules Guide */}
      <GameRules
        isOpen={isRulesOpen}
        onClose={() => setIsRulesOpen(false)}
      />
    </div>
  );
};
