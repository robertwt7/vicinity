import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface MarkerPinProps {
  emoji: string;
  color: string;
  pulse?: boolean;
}

export default function MarkerPin({ emoji, color }: MarkerPinProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.ring, { borderColor: color + '44' }]} />
      <View style={[styles.bubble, { backgroundColor: color, shadowColor: color }]}>
        <Text style={styles.emoji}>{emoji}</Text>
      </View>
      <View style={[styles.tip, { borderTopColor: color }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  ring: {
    position: 'absolute',
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 2,
    top: -7,
  },
  bubble: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2.5,
    borderColor: 'rgba(255,255,255,0.22)',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.55,
    shadowRadius: 8,
    elevation: 8,
  },
  emoji: {
    fontSize: 20,
    textAlign: 'center',
  },
  tip: {
    width: 0,
    height: 0,
    borderLeftWidth: 7,
    borderRightWidth: 7,
    borderTopWidth: 9,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginTop: -2,
  },
});
