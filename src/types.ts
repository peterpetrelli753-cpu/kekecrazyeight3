export type Suit = 'H' | 'D' | 'C' | 'S'; // Hearts, Diamonds, Clubs, Spades
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

export type GamePhase = 
  | 'start_screen'      // Main menu / entry
  | 'dealing'           // Dealing cards animation
  | 'player_turn'       // Waiting for player action
  | 'ai_turn'           // AI calculation and action
  | 'suit_selection'    // Player played an '8' and is selecting next suit
  | 'game_over';        // Round completed

export interface GameLogEntry {
  id: string;
  sender: 'player' | 'ai' | 'system';
  message: string;
  timestamp: Date;
}

export interface GameStats {
  playerWins: number;
  aiWins: number;
  playerScore: number; // Accumulated opponent's remaining card values on win
  aiScore: number;     // Accumulated player's remaining card values on win
  gamesPlayed: number;
  streak: number;
  bestStreak: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  aiSpeedMs: number; // Delay for AI moves in milliseconds
  cardsStyle: 'classic' | 'modern' | 'minimal';
}
