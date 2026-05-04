import React, { useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  ScrollView, SafeAreaView, Alert
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { useAuthStore } from '../../services/authStore';
import { usePoseStore, StyleMode } from '../../services/poseStore';

const STYLE_MODES: { id: StyleMode; emoji: string; label: string; desc: string; color: string }[] = [
  { id: 'instagram',    emoji: '📸', label: 'Instagram',    desc: 'Social media model poses',    color: '#E1306C' },
  { id: 'linkedin',     emoji: '💼', label: 'LinkedIn',     desc: 'Professional headshots',       color: '#0A66C2' },
  { id: 'casual',       emoji: '✌️', label: 'Casual',       desc: 'Natural everyday poses',       color: '#00FFB2' },
  { id: 'fitness',      emoji: '💪', label: 'Fitness',      desc: 'Athletic & gym poses',         color: '#FF6B35' },
  { id: 'professional', emoji: '👔', label: 'Professional', desc: 'Corporate authority poses',    color: '#8B5CF6' },
];

export default function HomeScreen() {
  const { user, logout }                = useAuthStore();
  const { styleMode, setStyleMode, startSession, fetchHistory, history } = usePoseStore();

  useEffect(() => { fetchHistory(); }, []);

  const handleStart = async () => {
    try {
      await startSession();
      router.push('/screens/CameraScreen');
    } catch (e) {
      Alert.alert('Error', 'Could not start session. Check your backend connection.');
    }
  };

  const handleLogout = async () => {
    await logout();
    router.replace('/screens/LoginScreen');
  };

  return (
    <LinearGradient colors={['#0a0a0a', '#111827']} style={styles.container}>
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.greeting}>Hello, {user?.username || 'Poser'} 👋</Text>
              <Text style={styles.subGreeting}>Ready to strike a pose?</Text>
            </View>
            <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
              <Text style={styles.logoutText}>Logout</Text>
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{history.length}</Text>
              <Text style={styles.statLabel}>Sessions</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>
                {history.length > 0
                  ? Math.round(history.reduce((a: any, h: any) => a + (h.score || 0), 0) / history.length)
                  : '--'}
              </Text>
              <Text style={styles.statLabel}>Avg Score</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNum}>{styleMode.charAt(0).toUpperCase() + styleMode.slice(1)}</Text>
              <Text style={styles.statLabel}>Mode</Text>
            </View>
          </View>

          {/* Style Mode Selector */}
          <Text style={styles.sectionTitle}>Choose Style Mode</Text>
          <View style={styles.modeGrid}>
            {STYLE_MODES.map((mode) => (
              <TouchableOpacity
                key={mode.id}
                style={[styles.modeCard, styleMode === mode.id && { borderColor: mode.color, borderWidth: 2 }]}
                onPress={() => setStyleMode(mode.id)}
              >
                <Text style={styles.modeEmoji}>{mode.emoji}</Text>
                <Text style={[styles.modeLabel, styleMode === mode.id && { color: mode.color }]}>{mode.label}</Text>
                <Text style={styles.modeDesc}>{mode.desc}</Text>
                {styleMode === mode.id && (
                  <View style={[styles.selectedDot, { backgroundColor: mode.color }]} />
                )}
              </TouchableOpacity>
            ))}
          </View>

          {/* Start Button */}
          <TouchableOpacity style={styles.startBtn} onPress={handleStart}>
            <LinearGradient colors={['#00FFB2', '#00CC8E']} style={styles.startGradient}>
              <Text style={styles.startText}>🎬  Start Pose Session</Text>
            </LinearGradient>
          </TouchableOpacity>

          {/* History Button */}
          <TouchableOpacity style={styles.historyBtn} onPress={() => router.push('/screens/HistoryScreen')}>
            <Text style={styles.historyText}>📊 View Pose History</Text>
          </TouchableOpacity>

        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container:    { flex: 1 },
  scroll:       { padding: 24, paddingBottom: 48 },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28 },
  greeting:     { fontSize: 26, fontWeight: '800', color: '#fff' },
  subGreeting:  { fontSize: 14, color: '#6B7280', marginTop: 4 },
  logoutBtn:    { backgroundColor: '#1F2937', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20 },
  logoutText:   { color: '#9CA3AF', fontSize: 13 },
  statsRow:     { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard:     { flex: 1, backgroundColor: '#1F2937', borderRadius: 16, padding: 16, alignItems: 'center' },
  statNum:      { fontSize: 22, fontWeight: '800', color: '#00FFB2' },
  statLabel:    { fontSize: 11, color: '#6B7280', marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#fff', marginBottom: 16 },
  modeGrid:     { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  modeCard:     { width: '47%', backgroundColor: '#1F2937', borderRadius: 18, padding: 18, borderWidth: 1, borderColor: '#374151', position: 'relative' },
  modeEmoji:    { fontSize: 28, marginBottom: 8 },
  modeLabel:    { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 4 },
  modeDesc:     { fontSize: 12, color: '#6B7280', lineHeight: 16 },
  selectedDot:  { position: 'absolute', top: 12, right: 12, width: 8, height: 8, borderRadius: 4 },
  startBtn:     { borderRadius: 18, overflow: 'hidden', marginBottom: 16 },
  startGradient:{ padding: 20, alignItems: 'center' },
  startText:    { color: '#000', fontWeight: '800', fontSize: 18, letterSpacing: 0.3 },
  historyBtn:   { backgroundColor: '#1F2937', borderRadius: 18, padding: 18, alignItems: 'center' },
  historyText:  { color: '#9CA3AF', fontWeight: '600', fontSize: 16 },
});
