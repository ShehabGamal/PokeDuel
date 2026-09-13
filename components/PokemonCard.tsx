import { StyleSheet, View, Text, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { Pokemon } from '@/types/pokemon';
import { TypeBadge } from './TypeBadge';
import { typeColors } from '@/services/typeColors';

interface PokemonCardProps {
  pokemon: Pokemon;
  onSelect?: () => void;
  selected?: boolean;
  disabled?: boolean;
  loading?: boolean;
}

export function PokemonCard({ pokemon, onSelect, selected, disabled, loading }: PokemonCardProps) {
  const primaryColor = typeColors[pokemon.types[0]];

  return (
    <TouchableOpacity
      style={[
        styles.card,
        { borderColor: selected ? primaryColor : '#E0E0E0' },
        selected && { borderWidth: 3, backgroundColor: `${primaryColor}15` },
        disabled && styles.disabled,
      ]}
      onPress={onSelect}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator color={primaryColor} />
        </View>
      ) : (
        <>
          <View style={[styles.imageContainer, { backgroundColor: `${primaryColor}20` }]}>
            <Image
              source={{ uri: pokemon.officialArtwork || pokemon.sprite }}
              style={styles.image}
              resizeMode="contain"
            />
          </View>

          <Text style={styles.name}>{pokemon.name}</Text>

          <View style={styles.typesRow}>
            {pokemon.types.map((type) => (
              <TypeBadge key={type} type={type} size="small" />
            ))}
          </View>

          <View style={styles.statsRow}>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>HP</Text>
              <Text style={styles.statValue}>{pokemon.baseHp}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>ATK</Text>
              <Text style={styles.statValue}>{pokemon.baseAttack}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>DEF</Text>
              <Text style={styles.statValue}>{pokemon.baseDefense}</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statLabel}>SPD</Text>
              <Text style={styles.statValue}>{pokemon.baseSpeed}</Text>
            </View>
          </View>

          {selected && (
            <View style={[styles.selectedBadge, { backgroundColor: primaryColor }]}>
              <Text style={styles.selectedText}>SELECTED</Text>
            </View>
          )}
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#E0E0E0',
    padding: 12,
    alignItems: 'center',
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 4,
    position: 'relative',
  },
  disabled: {
    opacity: 0.5,
  },
  loadingContainer: {
    height: 180,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 4,
  },
  image: {
    width: '85%',
    height: '85%',
  },
  name: {
    fontFamily: 'Outfit-Bold',
    fontSize: 16,
    color: '#333',
  },
  typesRow: {
    flexDirection: 'row',
    gap: 6,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
  },
  stat: {
    alignItems: 'center',
  },
  statLabel: {
    fontFamily: 'Outfit-Regular',
    fontSize: 10,
    color: '#999',
  },
  statValue: {
    fontFamily: 'Outfit-Bold',
    fontSize: 14,
    color: '#333',
  },
  selectedBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  selectedText: {
    fontFamily: 'Outfit-Bold',
    fontSize: 10,
    color: '#fff',
    letterSpacing: 0.5,
  },
});
