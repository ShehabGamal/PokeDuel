import { createClient } from '@supabase/supabase-js';
import { BattleRecord } from '@/types/pokemon';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface BattleScoreInsert {
  player_pokemon: string;
  bot_pokemon: string;
  winner: 'player' | 'bot';
  player_hp_remaining: number;
  bot_hp_remaining: number;
  total_turns: number;
}

export async function saveBattleResult(result: BattleScoreInsert): Promise<void> {
  const { error } = await supabase.from('battle_scores').insert(result);
  if (error) {
    console.error('Failed to save battle result:', error.message);
  }
}

export async function fetchBattleHistory(limit = 20): Promise<BattleRecord[]> {
  const { data, error } = await supabase
    .from('battle_scores')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Failed to fetch battle history:', error.message);
    return [];
  }

  return (data ?? []) as BattleRecord[];
}

export interface ScoreSummary {
  totalBattles: number;
  playerWins: number;
  botWins: number;
  winRate: number;
}

export async function fetchScoreSummary(): Promise<ScoreSummary> {
  const { data, error } = await supabase
    .from('battle_scores')
    .select('winner');

  if (error) {
    console.error('Failed to fetch score summary:', error.message);
    return { totalBattles: 0, playerWins: 0, botWins: 0, winRate: 0 };
  }

  const totalBattles = data?.length ?? 0;
  const playerWins = data?.filter((r) => r.winner === 'player').length ?? 0;
  const botWins = data?.filter((r) => r.winner === 'bot').length ?? 0;
  const winRate = totalBattles > 0 ? Math.round((playerWins / totalBattles) * 100) : 0;

  return { totalBattles, playerWins, botWins, winRate };
}
