import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { useState, useEffect, useCallback } from 'react';
import { Trophy, Swords, Target, TrendingUp, Clock } from 'lucide-react-native';
import { fetchBattleHistory, fetchScoreSummary, ScoreSummary } from '@/services/supabase';
import { BattleRecord } from '@/types/pokemon';
import { TypeBadge } from '@/components/TypeBadge';

export default function StatsScreen() {
  const [history, setHistory] = useState<BattleRecord[]>([]);
  const [summary, setSummary] = useState<ScoreSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    const [hist, summ] = await Promise.all([
      fetchBattleHistory(50),
      fetchScoreSummary(),
    ]);
    setHistory(hist);
    setSummary(summ);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRefresh = () => {
    setRefreshing(true);
    loadData();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#DC2626" />
        <Text style={styles.loadingText}>Loading stats...</Text>
      </SafeAreaView>
    );
  }

  const winRate = summary?.winRate ?? 0;
  const winRateColor = winRate >= 60 ? '#16A34A' : winRate >= 40 ? '#F59E0B' : '#EF4444';

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor="#DC2626" />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Battle Statistics</Text>
          <Text style={styles.headerSubtitle}>Your Pokémon battle record</Text>
        </View>

        {/* Score Cards */}
        <View style={styles.scoreCardsRow}>
          <View style={[styles.scoreCard, { backgroundColor: '#FEF2F2' }]}>
            <View style={[styles.scoreIcon, { backgroundColor: '#DC2626' }]}>
              <Trophy size={20} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.scoreValue}>{summary?.playerWins ?? 0}</Text>
            <Text style={styles.scoreLabel}>Your Wins</Text>
          </View>

          <View style={[styles.scoreCard, { backgroundColor: '#F5F3FF' }]}>
            <View style={[styles.scoreIcon, { backgroundColor: '#7C3AED' }]}>
              <Swords size={20} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.scoreValue}>{summary?.botWins ?? 0}</Text>
            <Text style={styles.scoreLabel}>Bot Wins</Text>
          </View>

          <View style={[styles.scoreCard, { backgroundColor: '#EFF6FF' }]}>
            <View style={[styles.scoreIcon, { backgroundColor: '#2563EB' }]}>
              <Target size={20} color="#fff" strokeWidth={2} />
            </View>
            <Text style={styles.scoreValue}>{summary?.totalBattles ?? 0}</Text>
            <Text style={styles.scoreLabel}>Total</Text>
          </View>
        </View>

        {/* Win Rate Card */}
        <View style={styles.winRateCard}>
          <View style={styles.winRateHeader}>
            <TrendingUp size={18} color="#6B7280" strokeWidth={2} />
            <Text style={styles.winRateTitle}>Win Rate</Text>
          </View>
          <Text style={[styles.winRateValue, { color: winRateColor }]}>{winRate}%</Text>
          <View style={styles.winRateBarContainer}>
            <View
              style={[
                styles.winRateBarFill,
                { width: `${winRate}%`, backgroundColor: winRateColor },
              ]}
            />
          </View>
        </View>

        {/* Battle History */}
        <View style={styles.historySection}>
          <Text style={styles.historyTitle}>Recent Battles</Text>

          {history.length === 0 ? (
            <View style={styles.emptyState}>
              <Clock size={40} color="#D1D5DB" strokeWidth={1.5} />
              <Text style={styles.emptyStateText}>No battles yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Start your first battle to see your record here
              </Text>
            </View>
          ) : (
            history.map((record) => {
              const isWin = record.winner === 'player';
              return (
                <View key={record.id} style={styles.historyCard}>
                  <View
                    style={[
                      styles.historyResultBadge,
                      { backgroundColor: isWin ? '#16A34A' : '#EF4444' },
                    ]}
                  >
                    <Text style={styles.historyResultText}>
                      {isWin ? 'W' : 'L'}
                    </Text>
                  </View>
                  <View style={styles.historyContent}>
                    <View style={styles.historyMatchup}>
                      <Text style={styles.historyPokemonName}>{record.player_pokemon}</Text>
                      <Text style={styles.historyVs}>vs</Text>
                      <Text style={styles.historyPokemonName}>{record.bot_pokemon}</Text>
                    </View>
                    <Text style={styles.historyMeta}>
                      {record.total_turns} turns · {isWin ? 'Victory' : 'Defeat'}
                    </Text>
                  </View>
                  <Text style={styles.historyDate}>
                    {new Date(record.created_at).toLocaleDateString()}
                  </Text>
                </View>
              );
            })
          )}
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 20,
  },
  headerTitle: {
    fontFamily: 'Outfit-Bold',
    fontSize: 24,
    color: '#1F2937',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontFamily: 'Outfit-Regular',
    fontSize: 14,
    color: '#6B7280',
  },
  scoreCardsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 16,
  },
  scoreCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
  },
  scoreIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  scoreValue: {
    fontFamily: 'Outfit-Bold',
    fontSize: 28,
    color: '#1F2937',
  },
  scoreLabel: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: '#6B7280',
  },
  winRateCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  winRateHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  winRateTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: '#6B7280',
  },
  winRateValue: {
    fontFamily: 'Outfit-Bold',
    fontSize: 36,
    marginBottom: 12,
  },
  winRateBarContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#E5E7EB',
    borderRadius: 5,
    overflow: 'hidden',
  },
  winRateBarFill: {
    height: '100%',
    borderRadius: 5,
  },
  historySection: {
    paddingHorizontal: 16,
  },
  historyTitle: {
    fontFamily: 'Outfit-Bold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 14,
  },
  emptyState: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 40,
    alignItems: 'center',
    gap: 10,
  },
  emptyStateText: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 16,
    color: '#6B7280',
  },
  emptyStateSubtext: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: '#9CA3AF',
    textAlign: 'center',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  historyResultBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  historyResultText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 16,
    color: '#fff',
  },
  historyContent: {
    flex: 1,
  },
  historyMatchup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 3,
  },
  historyPokemonName: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 14,
    color: '#1F2937',
  },
  historyVs: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  historyMeta: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: '#9CA3AF',
  },
  historyDate: {
    fontFamily: 'Outfit-Regular',
    fontSize: 11,
    color: '#D1D5DB',
  },
});
