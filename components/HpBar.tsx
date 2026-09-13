import { StyleSheet, View, Text } from 'react-native';
import { useEffect, useState } from 'react';

interface HpBarProps {
  currentHp: number;
  maxHp: number;
  label?: string;
  align?: 'left' | 'right';
}

export function HpBar({ currentHp, maxHp, label, align = 'left' }: HpBarProps) {
  const [displayedHp, setDisplayedHp] = useState(currentHp);

  useEffect(() => {
    setDisplayedHp(currentHp);
  }, [currentHp]);

  const percentage = Math.max(0, (displayedHp / maxHp) * 100);

  const barColor =
    percentage > 50 ? '#4CAF50' : percentage > 20 ? '#FFA726' : '#EF5350';

  return (
    <View style={[styles.container, align === 'right' && styles.containerRight]}>
      {label && (
        <Text style={[styles.label, align === 'right' && styles.labelRight]}>
          {label}
        </Text>
      )}
      <View style={styles.barContainer}>
        <View
          style={[
            styles.barFill,
            {
              width: `${percentage}%`,
              backgroundColor: barColor,
            },
            align === 'right' && styles.barFillRight,
          ]}
        />
      </View>
      <Text style={[styles.hpText, align === 'right' && styles.hpTextRight]}>
        {Math.max(0, Math.round(displayedHp))} / {maxHp} HP
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  containerRight: {
    alignItems: 'flex-end',
  },
  label: {
    fontFamily: 'Outfit-Bold',
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  labelRight: {
    textAlign: 'right',
  },
  barContainer: {
    width: '100%',
    height: 14,
    backgroundColor: '#E0E0E0',
    borderRadius: 7,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#333',
  },
  barFill: {
    height: '100%',
    borderRadius: 5,
  },
  barFillRight: {
    marginLeft: 'auto',
  },
  hpText: {
    fontFamily: 'Outfit-Regular',
    fontSize: 12,
    color: '#666',
    marginTop: 3,
  },
  hpTextRight: {
    textAlign: 'right',
  },
});
