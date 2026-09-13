import { StyleSheet, View, Image } from 'react-native';
import { useEffect, useRef } from 'react';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSequence,
  withTiming,
  withRepeat,
  Easing,
  cancelAnimation,
} from 'react-native-reanimated';
import { Pokemon } from '@/types/pokemon';

interface BattleSpriteProps {
  pokemon: Pokemon;
  side: 'player' | 'bot';
  isAttacking?: boolean;
  isHit?: boolean;
}

export function BattleSprite({ pokemon, side, isAttacking, isHit }: BattleSpriteProps) {
  const translateX = useSharedValue(0);
  const opacity = useSharedValue(1);
  const scale = useSharedValue(1);

  useEffect(() => {
    if (isAttacking) {
      const direction = side === 'player' ? 60 : -60;
      translateX.value = withSequence(
        withTiming(direction, { duration: 200, easing: Easing.out(Easing.ease) }),
        withTiming(0, { duration: 200, easing: Easing.in(Easing.ease) })
      );
    }
  }, [isAttacking]);

  useEffect(() => {
    if (isHit) {
      opacity.value = withSequence(
        withTiming(0.3, { duration: 80 }),
        withTiming(1, { duration: 80 }),
        withTiming(0.3, { duration: 80 }),
        withTiming(1, { duration: 80 })
      );

      scale.value = withSequence(
        withTiming(0.9, { duration: 100, easing: Easing.in(Easing.ease) }),
        withTiming(1, { duration: 150, easing: Easing.out(Easing.elastic(1)) })
      );
    }
  }, [isHit]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { scaleX: side === 'bot' ? -1 : 1 },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  return (
    <View style={styles.container}>
      <Animated.Image
        source={{ uri: pokemon.officialArtwork || pokemon.sprite }}
        style={[styles.image, animatedStyle]}
        resizeMode="contain"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 140,
    height: 140,
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
