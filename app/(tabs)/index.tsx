import { StyleSheet, View, Text, TouchableOpacity, Image, SafeAreaView, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { Swords, Zap, ChevronRight, Trophy } from 'lucide-react-native';

export default function HomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.heroBadge}>
            <Zap size={14} color="#FBBF24" strokeWidth={2.5} />
            <Text style={styles.heroBadgeText}>POKÉMON BATTLE ARENA</Text>
          </View>

          <Text style={styles.heroTitle}>PokéDuel</Text>
          <Text style={styles.heroSubtitle}>
            Pick your Pokémon and face off against an AI opponent in a turn-based battle.
            Use type advantages, manage your moves, and reduce your foe's HP to zero!
          </Text>

          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => router.push('/(tabs)/battle')}
            activeOpacity={0.8}
          >
            <Swords size={22} color="#fff" strokeWidth={2.5} />
            <Text style={styles.ctaButtonText}>Start Battle</Text>
            <ChevronRight size={20} color="#fff" strokeWidth={2.5} />
          </TouchableOpacity>
        </View>

        {/* How to Play Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>How to Play</Text>

          <View style={styles.ruleCard}>
            <View style={[styles.ruleNumber, { backgroundColor: '#DC2626' }]}>
              <Text style={styles.ruleNumberText}>1</Text>
            </View>
            <View style={styles.ruleContent}>
              <Text style={styles.ruleTitle}>Choose Your Pokémon</Text>
              <Text style={styles.ruleDesc}>
                Browse a pool of iconic Pokémon and pick your fighter. Each has unique stats and moves.
              </Text>
            </View>
          </View>

          <View style={styles.ruleCard}>
            <View style={[styles.ruleNumber, { backgroundColor: '#2563EB' }]}>
              <Text style={styles.ruleNumberText}>2</Text>
            </View>
            <View style={styles.ruleContent}>
              <Text style={styles.ruleTitle}>Bot Picks Its Fighter</Text>
              <Text style={styles.ruleDesc}>
                The AI opponent selects its own Pokémon from the remaining pool. It's ready to battle!
              </Text>
            </View>
          </View>

          <View style={styles.ruleCard}>
            <View style={[styles.ruleNumber, { backgroundColor: '#16A34A' }]}>
              <Text style={styles.ruleNumberText}>3</Text>
            </View>
            <View style={styles.ruleContent}>
              <Text style={styles.ruleTitle}>Use Moves Strategically</Text>
              <Text style={styles.ruleDesc}>
                Pick from 4 moves each turn. Type matchups matter — fire beats grass, water beats fire!
                The faster Pokémon attacks first.
              </Text>
            </View>
          </View>

          <View style={styles.ruleCard}>
            <View style={[styles.ruleNumber, { backgroundColor: '#F59E0B' }]}>
              <Text style={styles.ruleNumberText}>4</Text>
            </View>
            <View style={styles.ruleContent}>
              <Text style={styles.ruleTitle}>Win the Battle</Text>
              <Text style={styles.ruleDesc}>
                Reduce your opponent's HP to zero to win. Your battle history and win rate are saved.
              </Text>
            </View>
          </View>
        </View>

        {/* Type Chart Preview */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Type Advantages</Text>
          <View style={styles.typeGrid}>
            <View style={styles.typeRow}>
              <Text style={styles.typeEmoji}>🔥</Text>
              <Text style={styles.typeArrow}>→</Text>
              <Text style={styles.typeEmoji}>🌿</Text>
              <Text style={styles.typeEffect}>Super Effective</Text>
            </View>
            <View style={styles.typeRow}>
              <Text style={styles.typeEmoji}>💧</Text>
              <Text style={styles.typeArrow}>→</Text>
              <Text style={styles.typeEmoji}>🔥</Text>
              <Text style={styles.typeEffect}>Super Effective</Text>
            </View>
            <View style={styles.typeRow}>
              <Text style={styles.typeEmoji}>🌿</Text>
              <Text style={styles.typeArrow}>→</Text>
              <Text style={styles.typeEmoji}>💧</Text>
              <Text style={styles.typeEffect}>Super Effective</Text>
            </View>
            <View style={styles.typeRow}>
              <Text style={styles.typeEmoji}>⚡</Text>
              <Text style={styles.typeArrow}>→</Text>
              <Text style={styles.typeEmoji}>💧</Text>
              <Text style={styles.typeEffect}>Super Effective</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={styles.statsLink}
          onPress={() => router.push('/(tabs)/stats')}
          activeOpacity={0.7}
        >
          <Trophy size={20} color="#F59E0B" strokeWidth={2} />
          <Text style={styles.statsLinkText}>View Battle Statistics</Text>
          <ChevronRight size={18} color="#6B7280" strokeWidth={2} />
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  scrollContent: {
    paddingBottom: 32,
  },
  hero: {
    backgroundColor: '#fff',
    paddingHorizontal: 24,
    paddingTop: 48,
    paddingBottom: 32,
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 5,
  },
  heroBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 16,
  },
  heroBadgeText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 11,
    color: '#92400E',
    letterSpacing: 1,
  },
  heroTitle: {
    fontFamily: 'Pixel',
    fontSize: 28,
    color: '#DC2626',
    marginBottom: 12,
    textAlign: 'center',
  },
  heroSubtitle: {
    fontFamily: 'Outfit-Regular',
    fontSize: 15,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 24,
    maxWidth: 300,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#DC2626',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    shadowColor: '#DC2626',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  ctaButtonText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 18,
    color: '#fff',
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 28,
  },
  sectionTitle: {
    fontFamily: 'Outfit-Bold',
    fontSize: 18,
    color: '#1F2937',
    marginBottom: 16,
  },
  ruleCard: {
    flexDirection: 'row',
    gap: 14,
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  ruleNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  ruleNumberText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 16,
    color: '#fff',
  },
  ruleContent: {
    flex: 1,
  },
  ruleTitle: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 15,
    color: '#1F2937',
    marginBottom: 4,
  },
  ruleDesc: {
    fontFamily: 'Outfit-Regular',
    fontSize: 13,
    color: '#6B7280',
    lineHeight: 19,
  },
  typeGrid: {
    backgroundColor: '#fff',
    borderRadius: 14,
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  typeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  typeEmoji: {
    fontSize: 22,
  },
  typeArrow: {
    fontFamily: 'Outfit-Regular',
    fontSize: 16,
    color: '#9CA3AF',
  },
  typeEffect: {
    fontFamily: 'Outfit-SemiBold',
    fontSize: 13,
    color: '#16A34A',
    marginLeft: 8,
  },
  statsLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 28,
    backgroundColor: '#fff',
    borderRadius: 14,
    paddingVertical: 16,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 4,
    elevation: 2,
  },
  statsLinkText: {
    flex: 1,
    fontFamily: 'Outfit-SemiBold',
    fontSize: 15,
    color: '#1F2937',
  },
});
