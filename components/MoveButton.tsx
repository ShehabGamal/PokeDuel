import { StyleSheet, TouchableOpacity, Text, View, ActivityIndicator } from 'react-native';
import { PokemonMove } from '@/types/pokemon';
import { typeColors } from '@/services/typeColors';
import { TypeBadge } from './TypeBadge';

interface MoveButtonProps {
  move: PokemonMove;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
}

export function MoveButton({ move, onPress, disabled, loading }: MoveButtonProps) {
  return (
    <TouchableOpacity
      style={[styles.button, { borderColor: typeColors[move.type] }, disabled && styles.disabled]}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={typeColors[move.type]} />
      ) : (
        <View style={styles.content}>
          <View style={styles.topRow}>
            <Text style={styles.moveName}>{move.name}</Text>
            <TypeBadge type={move.type} size="small" />
          </View>
          <View style={styles.statsRow}>
            <Text style={styles.statText}>PWR {move.power}</Text>
            <Text style={styles.statText}>ACC {move.accuracy}%</Text>
          </View>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 2,
    paddingVertical: 10,
    paddingHorizontal: 12,
    minHeight: 68,
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  disabled: {
    opacity: 0.4,
  },
  content: {
    gap: 6,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  moveName: {
    fontFamily: 'Outfit-Bold',
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  statText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 11,
    color: '#888',
  },
});
