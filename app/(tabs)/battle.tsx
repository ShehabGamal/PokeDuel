import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  FlatList,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'expo-router';
import { ChevronLeft, Swords, RefreshCw, Check } from 'lucide-react-native';
import { Pokemon } from '@/types/pokemon';
import { fetchPokemonPool, POKEMON_POOL } from '@/services/pokeApi';
import { PokemonCard } from '@/components/PokemonCard';
import { TypeBadge } from '@/components/TypeBadge';

type Phase = 'loading' | 'select' | 'bot-picking' | 'battle' | 'result';

export default function BattleScreen() {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>('loading');
  const [pool, setPool] = useState<Pokemon[]>([]);
  const [selectedPokemon, setSelectedPokemon] = useState<Pokemon | null>(null);
  const [botPokemon, setBotPokemon] = useState<Pokemon | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadPool = useCallback(async () => {
    try {
      const pokemon = await fetchPokemonPool(POKEMON_POOL);
      setPool(pokemon);
      setPhase('select');
    } catch (e) {
      console.error('Failed to load Pokémon pool', e);
    }
  }, []);

  useEffect(() => {
    loadPool();
  }, [loadPool]);

  const handleSelect = (pokemon: Pokemon) => {
    setSelectedPokemon(pokemon);
  };

  const handleConfirm = () => {
    if (!selectedPokemon) return;

    setPhase('bot-picking');

    // Bot picks a random Pokémon from the pool that isn't the player's pick
    const available = pool.filter((p) => p.id !== selectedPokemon.id);
    const botPick = available[Math.floor(Math.random() * available.length)];
    setBotPokemon(botPick);

    // Simulate thinking delay for drama
    setTimeout(() => {
      router.push({
        pathname: '/battle-arena',
        params: {
          playerPokemonId: String(selectedPokemon.id),
          botPokemonId: String(botPick.id),
        },
      });
    }, 2500);
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setSelectedPokemon(null);
    await loadPool();
    setRefreshing(false);
  };

  const handleReselect = () => {
    setSelectedPokemon(null);
  };

  if (phase === 'loading') {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Loading Pokémon...</Text>
      </SafeAreaView>
    );
  }

  if (phase === 'bot-picking') {
    return (
      <SafeAreaView style={styles.botPickingContainer}>
        <View style={styles.botPickingContent}>
          <View style={styles.thinkingIndicator}>
            <ActivityIndicator size="large" color="#7C3AED" />
          </View>
          <Text style={styles.botPickingTitle}>Bot is choosing...</Text>
          <Text style={styles.botPickingSubtitle}>
            Your opponent is analyzing the roster
          </Text>

          {selectedPokemon && (
            <View style={styles.yourPickPreview}>
              <Text style={styles.yourPickLabel}>Your Fighter</Text>
              <Text style={styles.yourPickName}>{selectedPokemon.name}</Text>
              <View style={styles.yourPickTypes}>
                {selectedPokemon.types.map((t) => (
                  <TypeBadge key={t} type={t} size="small" />
                ))}
              </View>
            </View>
          )}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.push('/')}>
          <ChevronLeft size={22} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Choose Your Fighter</Text>
        <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
          <RefreshCw size={20} color={refreshing ? '#DC2626' : '#6B7280'} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={pool}
        keyExtractor={(item) => String(item.id)}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        columnWrapperStyle={styles.columnWrapper}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#DC2626" />
        }
        renderItem={({ item }) => (
          <PokemonCard
            pokemon={item}
            onSelect={() => handleSelect(item)}
            selected={selectedPokemon?.id === item.id}
            disabled={!!selectedPokemon && selectedPokemon?.id !== item.id}
          />
        )}
      />

      {selectedPokemon && (
        <View style={styles.bottomBar}>
          <View style={styles.selectedPreview}>
            <Text style={styles.selectedLabel}>Selected: </Text>
            <Text style={styles.selectedName}>{selectedPokemon.name}</Text>
          </View>
          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.reselectButton} onPress={handleReselect}>
              <Text style={styles.reselectText}>Change</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.confirmButton} onPress={handleConfirm}>
              <Swords size={18} color="#fff" strokeWidth={2.5} />
              <Text style={styles.confirmText}>Battle!</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    gap: 16,
  },
  loadingText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: '#6B7280',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontFamily: 'Outfit-Bold',
    fontSize: 17,
    color: '#1F2937',
  },
  refreshButton: {
    padding: 4,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  columnWrapper: {
    gap: 12,
    marginBottom: 12,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#E5E7EB',
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 8,
  },
  selectedPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  selectedLabel: {
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  selectedName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 16,
    color: '#1F2937',
  },
  bottomActions: {
    flexDirection: 'row',
    gap: 12,
  },
  reselectButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
  },
  reselectText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 15,
    color: '#6B7280',
  },
  confirmButton: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#DC2626',
  },
  confirmText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 16,
    color: '#fff',
  },
  botPickingContainer: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    justifyContent: 'center',
  },
  botPickingContent: {
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  thinkingIndicator: {
    marginBottom: 24,
  },
  botPickingTitle: {
    fontFamily: 'Outfit-Bold',
    fontSize: 24,
    color: '#7C3AED',
    marginBottom: 8,
  },
  botPickingSubtitle: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: 40,
  },
  yourPickPreview: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 10,
    width: '100%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  yourPickLabel: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    color: '#9CA3AF',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  yourPickName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 22,
    color: '#1F2937',
  },
  yourPickTypes: {
    flexDirection: 'row',
    gap: 8,
  },
});
