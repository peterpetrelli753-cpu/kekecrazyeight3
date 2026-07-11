import { Card, Suit, Rank } from '../types';

export const SUITS: Suit[] = ['H', 'D', 'C', 'S'];
export const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

// Create a standard 52-card deck
export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({
        id: `${suit}-${rank}`,
        suit,
        rank
      });
    }
  }
  return deck;
}

// Fisher-Yates Shuffle
export function shuffle(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const temp = shuffled[i];
    shuffled[i] = shuffled[j];
    shuffled[j] = temp;
  }
  return shuffled;
}

// Get standard card score values
export function getCardPoints(card: Card): number {
  if (card.rank === '8') return 50;
  if (['K', 'Q', 'J', '10'].includes(card.rank)) return 10;
  if (card.rank === 'A') return 1;
  return parseInt(card.rank, 10);
}

// Check if a card is valid to play on top of the discard pile
export function isValidPlay(card: Card, topCard: Card, activeSuit: Suit): boolean {
  // An 8 is always a valid play in Crazy Eights
  if (card.rank === '8') return true;
  
  // Otherwise, must match either active suit or top card's rank
  return card.suit === activeSuit || card.rank === topCard.rank;
}

// Count occurrences of each suit in hand (ignoring 8s)
export function countSuits(hand: Card[]): Record<Suit, number> {
  const counts: Record<Suit, number> = { H: 0, D: 0, C: 0, S: 0 };
  for (const card of hand) {
    if (card.rank !== '8') {
      counts[card.suit]++;
    }
  }
  return counts;
}

// AI chooses the best suit to declare when playing an 8 (its most common suit)
export function chooseBestAISuit(hand: Card[]): Suit {
  const counts = countSuits(hand);
  let bestSuit: Suit = 'H';
  let maxCount = -1;
  
  for (const suit of SUITS) {
    if (counts[suit] > maxCount) {
      maxCount = counts[suit];
      bestSuit = suit;
    }
  }
  
  // If AI hand is empty or only contains 8s, just pick a random suit or the first one
  return bestSuit;
}

// AI logic to determine the absolute best card to play
export function getBestAIMove(hand: Card[], topCard: Card, activeSuit: Suit): Card | null {
  // Get all playable cards
  const playable = hand.filter(card => isValidPlay(card, topCard, activeSuit));
  
  if (playable.length === 0) return null;
  
  // Separate 8s from regular cards. AI prefers to save 8s for emergencies.
  const regularPlayable = playable.filter(card => card.rank !== '8');
  const eightsPlayable = playable.filter(card => card.rank === '8');
  
  if (regularPlayable.length > 0) {
    // Strategic AI: Play the card matching the suit AI holds the most of in its hand.
    // This maximizes the chances of AI being able to play on its next turns.
    const counts = countSuits(hand);
    
    let bestCard = regularPlayable[0];
    let maxSuitCount = -1;
    
    for (const card of regularPlayable) {
      // Find how many cards of this card's suit the AI holds
      const suitCount = counts[card.suit];
      if (suitCount > maxSuitCount) {
        maxSuitCount = suitCount;
        bestCard = card;
      }
    }
    
    return bestCard;
  }
  
  // If no regular playable cards, but we have an '8', play the '8'
  if (eightsPlayable.length > 0) {
    return eightsPlayable[0];
  }
  
  return null;
}

// Localize suit characters
export function getSuitSymbol(suit: Suit): string {
  switch (suit) {
    case 'H': return '♥';
    case 'D': return '♦';
    case 'C': return '♣';
    case 'S': return '♠';
  }
}

// Get readable Chinese name of the suit
export function getSuitNameZh(suit: Suit): string {
  switch (suit) {
    case 'H': return '红心';
    case 'D': return '方块';
    case 'C': return '梅花';
    case 'S': return '黑桃';
  }
}

// Get readable rank Chinese label
export function getRankLabelZh(rank: Rank): string {
  return rank;
}
