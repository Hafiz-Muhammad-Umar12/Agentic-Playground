import React from 'react';
import { View, Text, StyleSheet, ScrollView, Animated } from 'react-native';
import { BlurView } from 'expo-blur';

interface Suggestion {
  direction: string;
  body_part: string;
  confidence: number;
  angle?: number;
}

interface Props {
  suggestions: Suggestion[];
  feedback: string;
  nextPoseName?: string;
  detectedPose?: string;
}

const BODY_PART_ICONS: Record<string, string> = {
  shoulders: '🦴',
  hips:      '⬡',
  head:      '👤',
  arms:      '💪',
  posture:   '↕️',
  core:      '🔥',
};

export default function SuggestionPanel({ suggestions, feedback, nextPoseName, detectedPose }: Props) {
  return (
    <View style={styles.container}>
      <BlurView intensity={60} tint="dark" style={styles.blur}>

        {/* Detected Pose */}
        {detectedPose && (
          <View style={styles.poseRow}>
            <Text style={styles.poseLabel}>DETECTED</Text>
            <Text style={styles.poseName}>{detectedPose.replace('_', ' ').toUpperCase()}</Text>
          </View>
        )}

        {/* Feedback */}
        <Text style={styles.feedback}>{feedback}</Text>

        {/* Next Pose Target */}
        {nextPoseName && (
          <View style={styles.nextPoseRow}>
            <Text style={styles.nextLabel}>NEXT GOAL →</Text>
            <Text style={styles.nextPose}>{nextPoseName.replace(/_/g, ' ')}</Text>
          </View>
        )}

        {/* Suggestions */}
        {suggestions.length > 0 && (
          <View style={styles.suggestionsBox}>
            {suggestions.slice(0, 3).map((s, i) => (
              <View key={i} style={styles.suggestionRow}>
                <Text style={styles.bodyIcon}>{BODY_PART_ICONS[s.body_part] || '📍'}</Text>
                <View style={styles.suggestionText}>
                  <Text style={styles.direction}>{s.direction}</Text>
                  {s.angle !== undefined && (
                    <Text style={styles.angle}>{s.angle}°</Text>
                  )}
                </View>
                {/* Confidence bar */}
                <View style={styles.confBar}>
                  <View style={[styles.confFill, { width: `${s.confidence * 100}%` as any }]} />
                </View>
              </View>
            ))}
          </View>
        )}

      </BlurView>
    </View>
  );
}

const styles = StyleSheet.create({
  container:      { position: 'absolute', bottom: 0, left: 0, right: 0 },
  blur:           { padding: 20, paddingBottom: 36 },
  poseRow:        { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 8 },
  poseLabel:      { color: '#6B7280', fontSize: 10, fontWeight: '700', letterSpacing: 1.5 },
  poseName:       { color: '#00FFB2', fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  feedback:       { color: '#fff', fontSize: 15, fontWeight: '600', marginBottom: 10 },
  nextPoseRow:    { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 14, backgroundColor: 'rgba(0,255,178,0.1)', padding: 10, borderRadius: 10 },
  nextLabel:      { color: '#00FFB2', fontSize: 10, fontWeight: '700', letterSpacing: 1 },
  nextPose:       { color: '#fff', fontSize: 13, fontWeight: '700', textTransform: 'capitalize' },
  suggestionsBox: { gap: 10 },
  suggestionRow:  { flexDirection: 'row', alignItems: 'center', gap: 10 },
  bodyIcon:       { fontSize: 18, width: 28 },
  suggestionText: { flex: 1 },
  direction:      { color: '#fff', fontSize: 13, fontWeight: '500' },
  angle:          { color: '#9CA3AF', fontSize: 11 },
  confBar:        { width: 50, height: 4, backgroundColor: '#374151', borderRadius: 2, overflow: 'hidden' },
  confFill:       { height: '100%', backgroundColor: '#00FFB2', borderRadius: 2 },
});
