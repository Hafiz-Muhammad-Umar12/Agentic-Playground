import React from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useLocalSearchParams } from 'expo-router';
import ScoreRing from '../../components/UI/ScoreRing';

export default function SessionSummaryScreen() {
  const params  = useLocalSearchParams();
  const summary = params.summary ? JSON.parse(params.summary as string) : null;

  const score    = summary?.avg_score ?? 0;
  const frames   = summary?.total_frames ?? 0;
  const duration = summary?.duration_sec ?? 0;

  const grade =
    score >= 85 ? { label: 'EXCELLENT', color: '#00FFB2', emoji: '🏆' } :
    score >= 70 ? { label: 'GREAT',     color: '#FFD700', emoji: '⭐' } :
    score >= 55 ? { label: 'GOOD',      color: '#FF9500', emoji: '👍' } :
                  { label: 'KEEP AT IT',color: '#FF4444', emoji: '💪' };

  return (
    <LinearGradient colors={['#0a0a0a', '#111827']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>

          <Text style={styles.title}>Session Complete! 🎉</Text>

          {/* Grade */}
          <View style={[styles.gradeCard, { borderColor: grade.color }]}>
            <Text style={styles.gradeEmoji}>{grade.emoji}</Text>
            <Text style={[styles.gradeLabel, { color: grade.color }]}>{grade.label}</Text>
          </View>

          {/* Score Ring */}
          <View style={styles.scoreArea}>
            <ScoreRing score={score} size={140} />
            <Text style={styles.scoreCaption}>Average Posture Score</Text>
          </View>

          {/* Stats */}
          <View style={styles.statsGrid}>
            {[
              { label: 'Frames Analyzed', value: frames, unit: 'frames' },
              { label: 'Duration',        value: Math.round(duration), unit: 'sec' },
              { label: 'Posture Score',   value: Math.round(score), unit: '/ 100' },
              { label: 'FPS Average',     value: frames > 0 ? Math.round(frames / Math.max(duration, 1)) : 0, unit: 'fps' },
            ].map((stat) => (
              <View key={stat.label} style={styles.statCard}>
                <Text style={styles.statValue}>{stat.value} <Text style={styles.statUnit}>{stat.unit}</Text></Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* Feedback */}
          <View style={styles.feedbackBox}>
            <Text style={styles.feedbackTitle}>💡 Tips for Next Session</Text>
            <Text style={styles.feedbackText}>
              {score >= 80
                ? "Outstanding posture! Try more challenging poses next time to keep improving."
                : score >= 60
                ? "Good foundation! Focus on shoulder alignment and spine straightness for a better score."
                : "Keep practicing! Consistency is key — try shorter sessions more frequently."}
            </Text>
          </View>

          {/* Buttons */}
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.replace('/screens/HomeScreen')}>
            <LinearGradient colors={['#00FFB2', '#00CC8E']} style={styles.btnGradient}>
              <Text style={styles.primaryBtnText}>🏠  Back to Home</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={() => router.replace('/screens/HistoryScreen')}>
            <Text style={styles.secondaryBtnText}>📊 View Full History</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:        { padding: 28, paddingBottom: 48, alignItems: 'center' },
  title:            { fontSize: 28, fontWeight: '800', color: '#fff', marginBottom: 24, textAlign: 'center' },
  gradeCard:        { borderWidth: 2, borderRadius: 20, paddingVertical: 20, paddingHorizontal: 48, alignItems: 'center', marginBottom: 32 },
  gradeEmoji:       { fontSize: 40, marginBottom: 8 },
  gradeLabel:       { fontSize: 22, fontWeight: '900', letterSpacing: 2 },
  scoreArea:        { alignItems: 'center', marginBottom: 32 },
  scoreCaption:     { color: '#6B7280', fontSize: 14, marginTop: 12 },
  statsGrid:        { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 28, width: '100%' },
  statCard:         { width: '47%', backgroundColor: '#1F2937', borderRadius: 16, padding: 18 },
  statValue:        { fontSize: 24, fontWeight: '800', color: '#00FFB2' },
  statUnit:         { fontSize: 13, color: '#6B7280' },
  statLabel:        { fontSize: 12, color: '#9CA3AF', marginTop: 4 },
  feedbackBox:      { backgroundColor: '#1F2937', borderRadius: 18, padding: 20, marginBottom: 28, width: '100%' },
  feedbackTitle:    { color: '#fff', fontWeight: '700', fontSize: 16, marginBottom: 10 },
  feedbackText:     { color: '#9CA3AF', fontSize: 14, lineHeight: 22 },
  primaryBtn:       { width: '100%', borderRadius: 18, overflow: 'hidden', marginBottom: 14 },
  btnGradient:      { padding: 20, alignItems: 'center' },
  primaryBtnText:   { color: '#000', fontWeight: '800', fontSize: 17 },
  secondaryBtn:     { width: '100%', backgroundColor: '#1F2937', borderRadius: 18, padding: 20, alignItems: 'center' },
  secondaryBtnText: { color: '#9CA3AF', fontWeight: '600', fontSize: 16 },
});
