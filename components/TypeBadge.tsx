import { StyleSheet, View, Text } from 'react-native';
import { PokemonType } from '@/types/pokemon';
import { typeColors, typeIcons } from '@/services/typeColors';

interface TypeBadgeProps {
  type: PokemonType;
  size?: 'small' | 'medium' | 'large';
}

export function TypeBadge({ type, size = 'medium' }: TypeBadgeProps) {
  const sizeStyles =
    size === 'small'
      ? { paddingHorizontal: 8, paddingVertical: 3, fontSize: 11, iconSize: 12 }
      : size === 'large'
      ? { paddingHorizontal: 16, paddingVertical: 8, fontSize: 15, iconSize: 18 }
      : { paddingHorizontal: 12, paddingVertical: 5, fontSize: 13, iconSize: 14 };

  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: typeColors[type], paddingHorizontal: sizeStyles.paddingHorizontal, paddingVertical: sizeStyles.paddingVertical },
      ]}
    >
      <Text style={[styles.icon, { fontSize: sizeStyles.iconSize }]}>{typeIcons[type]}</Text>
      <Text style={[styles.text, { fontSize: sizeStyles.fontSize }]}>{type}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    gap: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  icon: {
    lineHeight: 16,
  },
  text: {
    color: '#fff',
    fontFamily: 'Outfit-Bold',
    textTransform: 'capitalize',
    letterSpacing: 0.5,
  },
});
