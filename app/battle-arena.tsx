import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect, useRef } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { ChevronLeft, Swords, RotateCcw, Home } from 'lucide-react-native';
import { Pokemon, PokemonType } from '@/types/pokemon';
import { fetchPokemon } from '@/services/pokeApi';
import { calculateDamage, pickBotMove, applyDamage, whoGoesFirst } from '@/services/battleLogic';
import { saveBattleResult } from '@/services/supabase';
import { HpBar } from '@/components/HpBar';
import { MoveButton } from '@/components/MoveButton';
import { TypeBadge } from '@/components/TypeBadge';
import { BattleSprite } from '@/components/BattleSprite';

type BattlePhase = 'loading' | 'fighting' | 'ended';

export default function BattleArenaScreen() {
  const { playerPokemonId, botPokemonId } = useLocalSearchParams<{
    playerPokemonId: string;
    botPokemonId: string;
  }>();
  const router = useRouter();

  const [phase, setPhase] = useState<BattlePhase>('loading');
  const [playerPokemon, setPlayerPokemon] = useState<Pokemon | null>(null);
  const [botPokemon, setBotPokemon] = useState<Pokemon | null>(null);
  const [turn, setTurn] = useState<'player' | 'bot'>('player');
  const [turnCount, setTurnCount] = useState(0);
  const [battleLog, setBattleLog] = useState<string[]>([]);
  const [winner, setWinner] = useState<'player' | 'bot' | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [playerAttacking, setPlayerAttacking] = useState(false);
  const [botAttacking, setBotAttacking] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [botHit, setBotHit] = useState(false);
  const [lastDamage, setLastDamage] = useState<{
    target: 'player' | 'bot';
    amount: number;
    isCrit: boolean;
    effectiveness: number;
  } | null>(null);
  const logRef = useRef<ScrollView>(null);

  // Refs that always hold the latest Pokémon state — avoids stale closures
  const playerRef = useRef<Pokemon | null>(null);
  const botRef = useRef<Pokemon | null>(null);
  const turnCountRef = useRef(0);
  const phaseRef = useRef<BattlePhase>('loading');
  const isOverRef = useRef(false);

  useEffect(() => { playerRef.current = playerPokemon; }, [playerPokemon]);
  useEffect(() => { botRef.current = botPokemon; }, [botPokemon]);
  useEffect(() => { turnCountRef.current = turnCount; }, [turnCount]);
  useEffect(() => { phaseRef.current = phase; }, [phase]);

  const addLog = (msg: string) => {
    setBattleLog((prev) => [...prev, msg]);
  };

  // Core move execution — reads from refs so it always has fresh data
  const executeMove = async (
    attacker: 'player' | 'bot',
    moveName: string,
    movePower: number,
    moveType: PokemonType,
    moveAccuracy: number
  ): Promise<boolean> => {
    const attackerPokemon = attacker === 'player' ? playerRef.current! : botRef.current!;
    const defenderPokemon = attacker === 'player' ? botRef.current! : playerRef.current!;

    const result = calculateDamage(attackerPokemon, defenderPokemon, {
      name: moveName,
      power: movePower,
      type: moveType,
      accuracy: moveAccuracy,
    });

    addLog(result.label);

    if (!result.missed && result.damage > 0) {
      if (attacker === 'player') {
        setPlayerAttacking(true);
        setTimeout(() => setPlayerAttacking(false), 400);
      } else {
        setBotAttacking(true);
        setTimeout(() => setBotAttacking(false), 400);
      }

      await new Promise((resolve) => setTimeout(resolve, 300));

      const updatedDefender = applyDamage(defenderPokemon, result.damage);

      if (attacker === 'player') {
        setBotPokemon(updatedDefender);
        botRef.current = updatedDefender;
        setBotHit(true);
        setTimeout(() => setBotHit(false), 350);
      } else {
        setPlayerPokemon(updatedDefender);
        playerRef.current = updatedDefender;
        setPlayerHit(true);
        setTimeout(() => setPlayerHit(false), 350);
      }

      setLastDamage({
        target: attacker === 'player' ? 'bot' : 'player',
        amount: result.damage,
        isCrit: result.isCrit,
        effectiveness: result.effectiveness,
      });
      setTimeout(() => setLastDamage(null), 2000);

      if (updatedDefender.currentHp <= 0) {
        addLog(`${updatedDefender.name} fainted!`);
        const battleWinner = attacker;
        isOverRef.current = true;
        setWinner(battleWinner);
        setPhase('ended');
        phaseRef.current = 'ended';

        await saveBattleResult({
          player_pokemon: playerRef.current!.name,
          bot_pokemon: botRef.current!.name,
          winner: battleWinner,
          player_hp_remaining: battleWinner === 'player' ? playerRef.current!.currentHp : 0,
          bot_hp_remaining: battleWinner === 'bot' ? botRef.current!.currentHp : 0,
          total_turns: turnCountRef.current,
        });
        return true;
      }
    }

    return false;
  };

  // Bot's turn — called directly, not via effect
  const doBotTurn = async () => {
    if (isOverRef.current) return;

    setIsProcessing(true);
    addLog('Bot is choosing a move...');

    await new Promise((resolve) => setTimeout(resolve, 1200));
    if (isOverRef.current) {
      setIsProcessing(false);
      return;
    }

    const bot = botRef.current!;
    const player = playerRef.current!;

    const botMove = pickBotMove(bot, player);
    const newTurnCount = turnCountRef.current + 1;
    turnCountRef.current = newTurnCount;
    setTurnCount(newTurnCount);

    const ended = await executeMove('bot', botMove.name, botMove.power, botMove.type, botMove.accuracy);
    if (ended) {
      setIsProcessing(false);
      return;
    }

    setTurn('player');
    setIsProcessing(false);
  };

  // Load both Pokémon, then kick off the battle
  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [player, bot] = await Promise.all([
          fetchPokemon(playerPokemonId),
          fetchPokemon(botPokemonId),
        ]);
        if (cancelled) return;

        playerRef.current = player;
        botRef.current = bot;
        setPlayerPokemon(player);
        setBotPokemon(bot);

        const first = whoGoesFirst(player, bot);
        setTurn(first);
        setPhase('fighting');
        phaseRef.current = 'fighting';
        setBattleLog([
          `${player.name} vs ${bot.name}!`,
          `${first === 'player' ? player.name : bot.name} is faster and goes first!`,
        ]);

        // If the bot goes first, trigger its turn after a short delay
        if (first === 'bot') {
          setTimeout(() => {
            if (!cancelled && !isOverRef.current) doBotTurn();
          }, 1500);
        }
      } catch (e) {
        console.error('Failed to load battle Pokémon', e);
      }
    })();

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [playerPokemonId, botPokemonId]);

  // Player picks a move
  const handlePlayerMove = async (moveIndex: number) => {
    if (!playerPokemon || !botPokemon || isProcessing || turn !== 'player' || phase !== 'fighting') return;

    setIsProcessing(true);
    const move = playerPokemon.moves[moveIndex];
    const newTurnCount = turnCountRef.current + 1;
    turnCountRef.current = newTurnCount;
    setTurnCount(newTurnCount);

    const ended = await executeMove('player', move.name, move.power, move.type, move.accuracy);
    if (ended) {
      setIsProcessing(false);
      return;
    }

    // Hand off to bot
    setTurn('bot');
    // Small delay so the UI shows "Bot Thinking..." before the bot acts
    setTimeout(() => doBotTurn(), 200);
  };

  const handleRematch = () => {
    router.replace('/(tabs)/battle');
  };

  const handleGoHome = () => {
    router.push('/');
  };

  if (phase === 'loading' || !playerPokemon || !botPokemon) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Preparing the arena...</Text>
      </SafeAreaView>
    );
  }

  if (phase === 'ended') {
    const isWin = winner === 'player';
    return (
      <SafeAreaView style={styles.endScreenContainer}>
        <View style={styles.endContent}>
          <View style={[styles.endResultBadge, { backgroundColor: isWin ? '#16A34A' : '#EF4444' }]}>
            <Text style={styles.endResultEmoji}>{isWin ? '🎉' : '💀'}</Text>
          </View>

          <Text style={[styles.endTitle, { color: isWin ? '#16A34A' : '#EF4444' }]}>
            {isWin ? 'Victory!' : 'Defeated...'}
          </Text>

          <Text style={styles.endSubtitle}>
            {isWin
              ? `${playerPokemon.name} won the battle in ${turnCount} turns!`
              : `${botPokemon.name} was too strong. Try again!`}
          </Text>

          <View style={styles.endMatchup}>
            <View style={styles.endPokemon}>
              <Text style={styles.endPokemonLabel}>Your Fighter</Text>
              <Text style={styles.endPokemonName}>{playerPokemon.name}</Text>
              <Text style={styles.endPokemonHp}>{playerPokemon.currentHp} HP left</Text>
            </View>
            <Text style={styles.endVs}>vs</Text>
            <View style={styles.endPokemon}>
              <Text style={styles.endPokemonLabel}>Opponent</Text>
              <Text style={styles.endPokemonName}>{botPokemon.name}</Text>
              <Text style={styles.endPokemonHp}>{botPokemon.currentHp} HP left</Text>
            </View>
          </View>

          <View style={styles.endActions}>
            <TouchableOpacity style={styles.rematchButton} onPress={handleRematch} activeOpacity={0.8}>
              <RotateCcw size={20} color="#fff" strokeWidth={2.5} />
              <Text style={styles.rematchText}>Rematch</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.homeButton} onPress={handleGoHome} activeOpacity={0.8}>
              <Home size={20} color="#6B7280" strokeWidth={2.5} />
              <Text style={styles.homeText}>Home</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity style={styles.headerButton} onPress={handleGoHome}>
          <ChevronLeft size={22} color="#fff" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          Turn {turnCount} · {turn === 'player' ? 'Your Move' : 'Bot Thinking...'}
        </Text>
        <View style={{ width: 30 }} />
      </View>

      {/* Battle Arena */}
      <View style={styles.arena}>
        {/* Bot Section (Top) */}
        <View style={styles.botSection}>
          <View style={styles.botInfo}>
            <View style={styles.pokemonNameRow}>
              <Text style={styles.pokemonName}>{botPokemon.name}</Text>
              <View style={styles.typeBadges}>
                {botPokemon.types.map((t) => (
                  <TypeBadge key={t} type={t} size="small" />
                ))}
              </View>
            </View>
            <HpBar
              currentHp={botPokemon.currentHp}
              maxHp={botPokemon.maxHp}
              align="right"
            />
          </View>
          <View style={styles.botSpriteContainer}>
            <BattleSprite pokemon={botPokemon} side="bot" isAttacking={botAttacking} isHit={botHit} />
            {lastDamage?.target === 'bot' && (
              <View style={styles.damagePopup}>
                <Text style={[
                  styles.damageText,
                  lastDamage.isCrit && styles.damageCrit,
                  lastDamage.effectiveness === 0 && styles.damageNoEffect,
                ]}>
                  -{lastDamage.amount}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* VS Divider */}
        <View style={styles.vsDivider}>
          <View style={styles.vsLine} />
          <View style={styles.vsCircle}>
            <Swords size={18} color="#fff" strokeWidth={2.5} />
          </View>
          <View style={styles.vsLine} />
        </View>

        {/* Player Section (Bottom) */}
        <View style={styles.playerSection}>
          <View style={styles.playerSpriteContainer}>
            <BattleSprite pokemon={playerPokemon} side="player" isAttacking={playerAttacking} isHit={playerHit} />
            {lastDamage?.target === 'player' && (
              <View style={styles.damagePopup}>
                <Text style={[
                  styles.damageText,
                  lastDamage.isCrit && styles.damageCrit,
                  lastDamage.effectiveness === 0 && styles.damageNoEffect,
                ]}>
                  -{lastDamage.amount}
                </Text>
              </View>
            )}
          </View>
          <View style={styles.playerInfo}>
            <View style={styles.pokemonNameRow}>
              <Text style={styles.pokemonName}>{playerPokemon.name}</Text>
              <View style={styles.typeBadges}>
                {playerPokemon.types.map((t) => (
                  <TypeBadge key={t} type={t} size="small" />
                ))}
              </View>
            </View>
            <HpBar
              currentHp={playerPokemon.currentHp}
              maxHp={playerPokemon.maxHp}
              align="left"
            />
          </View>
        </View>
      </View>

      {/* Battle Log */}
      <View style={styles.battleLogContainer}>
        <ScrollView
          ref={logRef}
          style={styles.battleLog}
          contentContainerStyle={styles.battleLogContent}
          showsVerticalScrollIndicator={false}
          onContentSizeChange={() => {
            logRef.current?.scrollToEnd({ animated: true });
          }}
        >
          {battleLog.map((msg, i) => (
            <Text
              key={i}
              style={[
                styles.logText,
                i === battleLog.length - 1 && styles.logTextLatest,
              ]}
            >
              {msg}
            </Text>
          ))}
        </ScrollView>
      </View>

      {/* Move Selection */}
      <View style={styles.movesContainer}>
        {turn === 'player' && !isProcessing ? (
          <View style={styles.movesGrid}>
            {playerPokemon.moves.map((move, i) => (
              <MoveButton
                key={i}
                move={move}
                onPress={() => handlePlayerMove(i)}
              />
            ))}
          </View>
        ) : (
          <View style={styles.thinkingContainer}>
            <ActivityIndicator size="small" color="#7C3AED" />
            <Text style={styles.thinkingText}>
              {isProcessing ? 'Processing turn...' : 'Bot is choosing a move...'}
            </Text>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1A1A2E',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1A1A2E',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: '#9CA3AF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
  },
  headerButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: '#fff',
  },
  arena: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 8,
  },
  botSection: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
  },
  botInfo: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
    padding: 12,
  },
  botSpriteContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pokemonNameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    flexWrap: 'wrap',
    gap: 4,
  },
  pokemonName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 15,
    color: '#1F2937',
  },
  typeBadges: {
    flexDirection: 'row',
    gap: 4,
  },
  vsDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  vsLine: {
    flex: 1,
    height: 2,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  vsCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#DC2626',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 8,
  },
  playerSection: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
  },
  playerSpriteContainer: {
    width: 140,
    height: 140,
    alignItems: 'center',
    justifyContent: 'center',
  },
  playerInfo: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 14,
    padding: 12,
  },
  damagePopup: {
    position: 'absolute',
    top: 10,
    alignSelf: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 8,
  },
  damageText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 18,
    color: '#FBBF24',
  },
  damageCrit: {
    color: '#EF4444',
    fontSize: 22,
  },
  damageNoEffect: {
    color: '#9CA3AF',
    fontSize: 14,
  },
  battleLogContainer: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    marginHorizontal: 16,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    maxHeight: 80,
    marginBottom: 8,
  },
  battleLog: {
    flex: 1,
  },
  battleLogContent: {
    gap: 2,
  },
  logText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: '#9CA3AF',
    lineHeight: 17,
  },
  logTextLatest: {
    color: '#FBBF24',
    fontFamily: 'Outfit-SemiBold',
  },
  movesContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 4,
  },
  movesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  thinkingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    paddingVertical: 24,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
  },
  thinkingText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: '#C4B5FD',
  },
  endScreenContainer: {
    flex: 1,
    backgroundColor: '#1A1A2E',
    justifyContent: 'center',
  },
  endContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  endResultBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  endResultEmoji: {
    fontSize: 36,
  },
  endTitle: {
    fontFamily: 'Outfit-Bold',
    fontSize: 32,
    marginBottom: 12,
  },
  endSubtitle: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 32,
    lineHeight: 22,
  },
  endMatchup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 32,
    width: '100%',
  },
  endPokemon: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  endPokemonLabel: {
    fontFamily: 'Outfit-Regular',
    fontSize: 11,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  endPokemonName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 16,
    color: '#fff',
  },
  endPokemonHp: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  endVs: {
    fontFamily: 'Outfit-Bold',
    fontSize: 14,
    color: '#6B7280',
  },
  endActions: {
    flexDirection: 'row',
    gap: 12,
    width: '100%',
  },
  rematchButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    borderRadius: 14,
  },
  rematchText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 16,
    color: '#fff',
  },
  homeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingVertical: 16,
    borderRadius: 14,
  },
  homeText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 15,
    color: '#D1D5DB',
  },
});
