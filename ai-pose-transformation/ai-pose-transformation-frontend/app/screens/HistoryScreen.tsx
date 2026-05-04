import React, { useEffect } from 'react';
import {
  View, Text, FlatList, StyleSheet,
  TouchableOpacity, SafeAreaView, ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';
import { usePoseStore } from '../../services/poseStore';

export default function HistoryScreen() {
  const { history, fetchHistory } = usePoseStore();
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    (async () => {
      await fetchHistory();
      setLoading(false);
    })();
  }, []);

  const getScoreColor = (score: number) =>
    score >= 80 ? '#00FFB2' : score >= 60 ? '#FFD700' : '#FF4444';

  return (
    <LinearGradient colors={['#0a0a0a', '#111827']} style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.back}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Pose History</Text>
          <View style={{ width: 60 }} />
        </View>

        {loading ? (
          <ActivityIndicator color="#00FFB2" style={{ marginTop: 48 }} />
        ) : history.length === 0 ? (
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>📭</Text>
            <Text style={styles.emptyText}>No pose sessions yet</Text>
            <Text style={styles.emptySubText}>Start your first session!</Text>
          </View>
        ) : (
          <FlatList
            data={history}
            keyExtractor={(item) => String(item.id)}
            contentContainerStyle={{ padding: 20, gap: 14 }}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardLeft}>
                  <Text style={styles.poseName}>{(item.pose_name || 'Unknown Pose').replace(/_/g, ' ')}</Text>
                  <Text style={styles.styleMode}>{item.style_mode?.toUpperCase()}</Text>
                  <Text style={styles.date}>{new Date(item.created_at).toLocaleDateString()}</Text>
                </View>
                <View style={styles.cardRight}>
                  <Text style={[styles.score, { color: getScoreColor(item.score || 0) }]}>
                    {Math.round(item.score || 0)}
                  </Text>
                  <Text style={styles.scoreLabel}>pts</Text>
                </View>
              </View>
            )}
          />
        )}
      </SafeAreaView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  header:       { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20 },
  back:         { color: '#00FFB2', fontSize: 16, fontWeight: '600' },
  title:        { color: '#fff', fontSize: 20, fontWeight: '800' },
  empty:        { flex: 1, alignItems: 'center', justifyContent: 'center' },
  emptyEmoji:   { fontSize: 56, marginBottom: 16 },
  emptyText:    { color: '#fff', fontSize: 20, fontWeight: '700' },
  emptySubText: { color: '#6B7280', fontSize: 14, marginTop: 8 },
  card:         { backgroundColor: '#1F2937', borderRadius: 18, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardLeft:     { flex: 1 },
  poseName:     { color: '#fff', fontSize: 16, fontWeight: '700', textTransform: 'capitalize', marginBottom: 6 },
  styleMode:    { color: '#00FFB2', fontSize: 11, fontWeight: '700', letterSpacing: 1, marginBottom: 4 },
  date:         { color: '#6B7280', fontSize: 12 },
  cardRight:    { alignItems: 'center' },
  score:        { fontSize: 32, fontWeight: '900' },
  scoreLabel:   { color: '#6B7280', fontSize: 12, fontWeight: '600' },
});
