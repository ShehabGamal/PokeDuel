export type PokemonType =
  | 'normal' | 'fire' | 'water' | 'electric' | 'grass' | 'ice'
  | 'fighting' | 'poison' | 'ground' | 'flying' | 'psychic' | 'bug'
  | 'rock' | 'ghost' | 'dragon' | 'dark' | 'steel' | 'fairy';

export interface PokemonMove {
  name: string;
  power: number;
  type: PokemonType;
  accuracy: number;
}

export interface Pokemon {
  id: number;
  name: string;
  types: PokemonType[];
  sprite: string;
  officialArtwork: string;
  baseHp: number;
  baseAttack: number;
  baseDefense: number;
  baseSpeed: number;
  maxHp: number;
  currentHp: number;
  moves: PokemonMove[];
  cry?: string;
}

export interface BattleState {
  playerPokemon: Pokemon | null;
  botPokemon: Pokemon | null;
  currentTurn: 'player' | 'bot';
  turnCount: number;
  battleLog: string[];
  isOver: boolean;
  winner: 'player' | 'bot' | null;
  playerScore: number;
  botScore: number;
  isAnimating: boolean;
}

export interface BattleRecord {
  id: string;
  player_pokemon: string;
  bot_pokemon: string;
  winner: 'player' | 'bot';
  player_hp_remaining: number;
  bot_hp_remaining: number;
  total_turns: number;
  created_at: string;
}
