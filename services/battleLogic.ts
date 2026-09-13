import { Pokemon, PokemonMove } from '@/types/pokemon';
import { getEffectiveness, getEffectivenessLabel } from './typeChart';

export interface DamageResult {
  damage: number;
  effectiveness: number;
  label: string;
  isCrit: boolean;
  missed: boolean;
}

const CRIT_CHANCE = 0.15;

export function calculateDamage(
  attacker: Pokemon,
  defender: Pokemon,
  move: PokemonMove
): DamageResult {
  // Check if move misses
  const hitRoll = Math.random() * 100;
  if (hitRoll > move.accuracy) {
    return {
      damage: 0,
      effectiveness: 1,
      label: `${attacker.name}'s attack missed!`,
      isCrit: false,
      missed: true,
    };
  }

  // Type effectiveness
  const effectiveness = getEffectiveness(move.type, defender.types);
  if (effectiveness === 0) {
    return {
      damage: 0,
      effectiveness: 0,
      label: `${attacker.name} used ${move.name}! It had no effect!`,
      isCrit: false,
      missed: false,
    };
  }

  // Critical hit
  const isCrit = Math.random() < CRIT_CHANCE;
  const critMultiplier = isCrit ? 1.5 : 1;

  // Simplified Pokémon damage formula
  // Damage = ((2 * Level / 5 + 2) * Power * (Attack / Defense) / 50 + 2) * Modifiers
  // Level is treated as 50 for simplicity
  const level = 50;
  const baseDamage =
    ((2 * level) / 5 + 2) * move.power * (attacker.baseAttack / defender.baseDefense);
  const rawDamage = Math.floor(baseDamage / 50 + 2);
  const damage = Math.max(1, Math.floor(rawDamage * effectiveness * critMultiplier));

  const label = `${attacker.name} used ${move.name}!${getEffectivenessLabel(effectiveness)}${isCrit ? ' A critical hit!' : ''}`;

  return {
    damage,
    effectiveness,
    label,
    isCrit,
    missed: false,
  };
}

// Bot AI: picks a move based on expected damage (smart, not random)
export function pickBotMove(bot: Pokemon, player: Pokemon): PokemonMove {
  let bestMove = bot.moves[0];
  let bestScore = -1;

  for (const move of bot.moves) {
    const eff = getEffectiveness(move.type, player.types);
    const score = move.power * eff * (move.accuracy / 100);
    if (score > bestScore) {
      bestScore = score;
      bestMove = move;
    }
  }

  // 25% chance to pick a random move instead (adds unpredictability)
  if (Math.random() < 0.25) {
    const randomIdx = Math.floor(Math.random() * bot.moves.length);
    bestMove = bot.moves[randomIdx];
  }

  return bestMove;
}

export function applyDamage(pokemon: Pokemon, damage: number): Pokemon {
  return {
    ...pokemon,
    currentHp: Math.max(0, pokemon.currentHp - damage),
  };
}

export function whoGoesFirst(player: Pokemon, bot: Pokemon): 'player' | 'bot' {
  if (player.baseSpeed > bot.baseSpeed) return 'player';
  if (bot.baseSpeed > player.baseSpeed) return 'bot';
  // Speed tie — random
  return Math.random() < 0.5 ? 'player' : 'bot';
}
