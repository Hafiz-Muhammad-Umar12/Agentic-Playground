import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

interface Props {
  score: number;
  size?: number;
}

export default function ScoreRing({ score, size = 80 }: Props) {
  const radius    = (size - 10) / 2;
  const circumf   = 2 * Math.PI * radius;
  const progress  = (score / 100) * circumf;
  const color     = score >= 80 ? '#00FFB2' : score >= 60 ? '#FFD700' : '#FF4444';

  return (
    <View style={styles.container}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke="#1F2937" strokeWidth={8} fill="transparent"
        />
        <Circle
          cx={size / 2} cy={size / 2} r={radius}
          stroke={color} strokeWidth={8} fill="transparent"
          strokeDasharray={`${progress} ${circumf}`}
          strokeLinecap="round"
          rotation="-90"
          origin={`${size / 2}, ${size / 2}`}
        />
      </Svg>
      <View style={[styles.center, { width: size, height: size }]}>
        <Text style={[styles.score, { color }]}>{Math.round(score)}</Text>
        <Text style={styles.label}>pts</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', alignItems: 'center', justifyContent: 'center' },
  center:    { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  score:     { fontSize: 22, fontWeight: '800' },
  label:     { fontSize: 10, color: '#6B7280', fontWeight: '600' },
});
