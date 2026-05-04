import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Dimensions, Alert, SafeAreaView, Platform
} from 'react-native';
import { CameraView, useCameraPermissions, CameraType } from 'expo-camera';
import { router } from 'expo-router';
import { usePoseStore } from '../../services/poseStore';
import PoseOverlay from '../../components/Overlay/PoseOverlay';
import SuggestionPanel from '../../components/UI/SuggestionPanel';
import ScoreRing from '../../components/UI/ScoreRing';
import api from '../../services/api';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// ─── Simulated landmarks for demo/testing without MediaPipe ───
// In production, replace with real MediaPipe output from VisionCamera
function generateSimulatedLandmarks(frameNum: number) {
  const wobble = Math.sin(frameNum * 0.05) * 0.02;
  return [
    { x: 0.5,   y: 0.08 + wobble, z: 0, visibility: 0.99 }, // nose (0)
    { x: 0.48,  y: 0.07, z: 0, visibility: 0.9 },
    { x: 0.52,  y: 0.07, z: 0, visibility: 0.9 },
    { x: 0.46,  y: 0.07, z: 0, visibility: 0.8 },
    { x: 0.54,  y: 0.07, z: 0, visibility: 0.8 },
    { x: 0.45,  y: 0.08, z: 0, visibility: 0.7 },
    { x: 0.55,  y: 0.08, z: 0, visibility: 0.7 },
    { x: 0.44,  y: 0.10, z: 0, visibility: 0.6 },
    { x: 0.56,  y: 0.10, z: 0, visibility: 0.6 },
    { x: 0.48,  y: 0.09, z: 0, visibility: 0.5 },
    { x: 0.52,  y: 0.09, z: 0, visibility: 0.5 },
    { x: 0.38 + wobble, y: 0.28, z: 0, visibility: 0.99 }, // left shoulder (11)
    { x: 0.62 - wobble, y: 0.28, z: 0, visibility: 0.99 }, // right shoulder (12)
    { x: 0.33,  y: 0.42, z: 0, visibility: 0.95 }, // left elbow (13)
    { x: 0.67,  y: 0.42, z: 0, visibility: 0.95 }, // right elbow (14)
    { x: 0.30,  y: 0.55, z: 0, visibility: 0.90 }, // left wrist (15)
    { x: 0.70,  y: 0.55, z: 0, visibility: 0.90 }, // right wrist (16)
    { x: 0.30,  y: 0.57, z: 0, visibility: 0.7 },
    { x: 0.70,  y: 0.57, z: 0, visibility: 0.7 },
    { x: 0.30,  y: 0.59, z: 0, visibility: 0.6 },
    { x: 0.70,  y: 0.59, z: 0, visibility: 0.6 },
    { x: 0.30,  y: 0.61, z: 0, visibility: 0.5 },
    { x: 0.70,  y: 0.61, z: 0, visibility: 0.5 },
    { x: 0.42,  y: 0.60, z: 0, visibility: 0.99 }, // left hip (23)
    { x: 0.58,  y: 0.60, z: 0, visibility: 0.99 }, // right hip (24)
    { x: 0.42,  y: 0.75, z: 0, visibility: 0.95 }, // left knee (25)
    { x: 0.58,  y: 0.75, z: 0, visibility: 0.95 }, // right knee (26)
    { x: 0.42,  y: 0.90, z: 0, visibility: 0.90 }, // left ankle (27)
    { x: 0.58,  y: 0.90, z: 0, visibility: 0.90 }, // right ankle (28)
  ];
}

export default function CameraScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('front');
  const [isRecording, setIsRecording] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [landmarks, setLandmarks] = useState<any[]>([]);

  const {
    sessionUuid, styleMode, currentAnalysis,
    wsConnected, connectWebSocket, disconnectWebSocket,
    sendFrame, endSession, frameCount
  } = usePoseStore();

  const frameInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const timerInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const localFrame    = useRef(0);

  // Request camera permission
  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  // Connect WebSocket when screen loads
  useEffect(() => {
    if (sessionUuid) {
      connectWebSocket();
    }
    return () => {
      disconnectWebSocket();
      stopFrameLoop();
    };
  }, [sessionUuid]);

  const startFrameLoop = useCallback(() => {
    setIsRecording(true);

    // Session timer
    timerInterval.current = setInterval(() => {
      setSessionTime((t) => t + 1);
    }, 1000);

    // Send frames every 100ms (10 FPS to backend)
    frameInterval.current = setInterval(() => {
      // In production: extract real landmarks from VisionCamera + MediaPipe
      // Here we use simulated landmarks for demo
      const lms = generateSimulatedLandmarks(localFrame.current);
      setLandmarks(lms);
      sendFrame(lms);
      localFrame.current += 1;
    }, 100);
  }, [sendFrame]);

  const stopFrameLoop = () => {
    if (frameInterval.current) clearInterval(frameInterval.current);
    if (timerInterval.current) clearInterval(timerInterval.current);
    frameInterval.current = null;
    timerInterval.current = null;
    setLandmarks([]);
  };

  const handleEnd = async () => {
    stopFrameLoop();
    setIsRecording(false);
    const summary = await endSession();
    router.replace({ pathname: '/screens/SessionSummaryScreen', params: { summary: JSON.stringify(summary) } });
  };

  const formatTime = (s: number) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (!permission) return <View style={styles.container} />;
  if (!permission.granted) {
    return (
      <View style={styles.permissionContainer}>
        <Text style={styles.permText}>Camera permission required</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const score = currentAnalysis?.posture_score ?? 0;
  const suggestions = currentAnalysis?.suggestions ?? [];
  const feedback = currentAnalysis?.feedback ?? 'Waiting for pose data...';
  const nextPoseName = currentAnalysis?.next_pose_name;
  const detectedPose = currentAnalysis?.detected_pose;
  // @ts-ignore - target_landmarks comes from backend now
  const targetLandmarks = currentAnalysis?.target_landmarks;

  return (
    <View style={styles.container}>

      {/* Camera Feed */}
      <CameraView
        style={StyleSheet.absoluteFillObject}
        facing={facing}
      />

      {/* Pose Skeleton Overlay */}
      <PoseOverlay
        landmarks={landmarks}
        nextPoseLandmarks={targetLandmarks}
        score={score}
        width={SCREEN_W}
        height={SCREEN_H}
      />

      {/* Top HUD */}
      <SafeAreaView style={styles.topHUD}>
        <View style={styles.hudRow}>
          {/* Back button */}
          <TouchableOpacity style={styles.backBtn} onPress={() => { stopFrameLoop(); disconnectWebSocket(); router.back(); }}>
            <Text style={styles.backText}>✕</Text>
          </TouchableOpacity>

          {/* Timer + WS status */}
          <View style={styles.timerBox}>
            <View style={[styles.wsDot, { backgroundColor: wsConnected ? '#00FFB2' : '#FF4444' }]} />
            <Text style={styles.timerText}>{formatTime(sessionTime)}</Text>
          </View>

          {/* Score Ring */}
          <ScoreRing score={score} size={72} />
        </View>

        {/* Style Mode Badge */}
        <View style={styles.modeBadge}>
          <Text style={styles.modeText}>{styleMode.toUpperCase()}</Text>
        </View>
      </SafeAreaView>

      {/* Camera Flip */}
      <TouchableOpacity
        style={styles.flipBtn}
        onPress={() => setFacing(facing === 'front' ? 'back' : 'front')}
      >
        <Text style={styles.flipText}>🔄</Text>
      </TouchableOpacity>

      {/* Start / Stop Recording */}
      <View style={styles.recordArea}>
        {!isRecording ? (
          <TouchableOpacity style={styles.recordBtn} onPress={startFrameLoop}>
            <View style={styles.recordInner} />
          </TouchableOpacity>
        ) : (
          <TouchableOpacity style={styles.stopBtn} onPress={handleEnd}>
            <View style={styles.stopInner} />
          </TouchableOpacity>
        )}
        <Text style={styles.recordLabel}>{isRecording ? 'Tap to End Session' : 'Tap to Start'}</Text>
      </View>

      {/* Suggestions Panel */}
      {isRecording && (
        <SuggestionPanel
          suggestions={suggestions}
          feedback={feedback}
          nextPoseName={nextPoseName}
          detectedPose={detectedPose}
        />
      )}

    </View>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: '#000' },
  permissionContainer: { flex: 1, backgroundColor: '#0a0a0a', justifyContent: 'center', alignItems: 'center', padding: 32 },
  permText:            { color: '#fff', fontSize: 18, textAlign: 'center', marginBottom: 24 },
  permBtn:             { backgroundColor: '#00FFB2', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 14 },
  permBtnText:         { color: '#000', fontWeight: '800', fontSize: 16 },
  topHUD:              { position: 'absolute', top: 0, left: 0, right: 0, padding: 16 },
  hudRow:              { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  backBtn:             { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(0,0,0,0.6)', alignItems: 'center', justifyContent: 'center' },
  backText:            { color: '#fff', fontSize: 18, fontWeight: '700' },
  timerBox:            { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: 'rgba(0,0,0,0.6)', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 },
  wsDot:               { width: 8, height: 8, borderRadius: 4 },
  timerText:           { color: '#fff', fontSize: 16, fontWeight: '700', fontVariant: ['tabular-nums'] },
  modeBadge:           { alignSelf: 'center', marginTop: 10, backgroundColor: 'rgba(0,255,178,0.15)', paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: '#00FFB2' },
  modeText:            { color: '#00FFB2', fontSize: 11, fontWeight: '800', letterSpacing: 2 },
  flipBtn:             { position: 'absolute', right: 24, top: '45%', backgroundColor: 'rgba(0,0,0,0.6)', width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center' },
  flipText:            { fontSize: 22 },
  recordArea:          { position: 'absolute', bottom: 180, left: 0, right: 0, alignItems: 'center' },
  recordBtn:           { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#00FFB2', alignItems: 'center', justifyContent: 'center' },
  recordInner:         { width: 56, height: 56, borderRadius: 28, backgroundColor: '#00FFB2' },
  stopBtn:             { width: 76, height: 76, borderRadius: 38, borderWidth: 4, borderColor: '#FF4444', alignItems: 'center', justifyContent: 'center' },
  stopInner:           { width: 32, height: 32, borderRadius: 6, backgroundColor: '#FF4444' },
  recordLabel:         { color: 'rgba(255,255,255,0.7)', fontSize: 13, marginTop: 10 },
});
