import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Svg, { Circle, Line, Text as SvgText } from 'react-native-svg';

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get('window');

// MediaPipe connections (pairs of landmark indices)
const POSE_CONNECTIONS = [
  [11, 12], // shoulders
  [11, 13], [13, 15], // left arm
  [12, 14], [14, 16], // right arm
  [11, 23], [12, 24], // torso sides
  [23, 24], // hips
  [23, 25], [25, 27], // left leg
  [24, 26], [26, 28], // right leg
  [0, 11],  [0, 12],  // head to shoulders
];

// Key landmarks to show dots
const KEY_LANDMARKS = [0, 11, 12, 13, 14, 15, 16, 23, 24, 25, 26, 27, 28];

interface Landmark {
  x: number;
  y: number;
  z?: number;
  visibility?: number;
}

interface Props {
  landmarks: Landmark[];
  nextPoseLandmarks?: Landmark[] | null;
  score: number;
  width?: number;
  height?: number;
}

export default function PoseOverlay({
  landmarks,
  nextPoseLandmarks,
  score,
  width = SCREEN_W,
  height = SCREEN_H,
}: Props) {
  if (!landmarks || landmarks.length < 10) return null;

  const toX = (lm: Landmark) => lm.x * width;
  const toY = (lm: Landmark) => lm.y * height;

  // Color based on score
  const scoreColor = score >= 80 ? '#00FFB2' : score >= 60 ? '#FFD700' : '#FF4444';

  return (
    <View style={[styles.overlay, { width, height }]} pointerEvents="none">
      <Svg width={width} height={height}>

        {/* ── Ghost / Next Pose (behind current) ── */}
        {nextPoseLandmarks && nextPoseLandmarks.length > 10 &&
          POSE_CONNECTIONS.map(([a, b], i) => {
            const lmA = nextPoseLandmarks[a];
            const lmB = nextPoseLandmarks[b];
            if (!lmA || !lmB) return null;
            return (
              <Line
                key={`ghost-${i}`}
                x1={toX(lmA)} y1={toY(lmA)}
                x2={toX(lmB)} y2={toY(lmB)}
                stroke="#ffffff"
                strokeWidth={2}
                strokeOpacity={0.25}
                strokeDasharray="8,6"
              />
            );
          })
        }

        {/* ── Current Pose Skeleton Lines ── */}
        {POSE_CONNECTIONS.map(([a, b], i) => {
          const lmA = landmarks[a];
          const lmB = landmarks[b];
          if (!lmA || !lmB) return null;
          const visible = (lmA.visibility ?? 1) > 0.5 && (lmB.visibility ?? 1) > 0.5;
          return (
            <Line
              key={`line-${i}`}
              x1={toX(lmA)} y1={toY(lmA)}
              x2={toX(lmB)} y2={toY(lmB)}
              stroke={scoreColor}
              strokeWidth={visible ? 3 : 1.5}
              strokeOpacity={visible ? 0.9 : 0.4}
            />
          );
        })}

        {/* ── Joint Dots ── */}
        {KEY_LANDMARKS.map((idx) => {
          const lm = landmarks[idx];
          if (!lm) return null;
          const visible = (lm.visibility ?? 1) > 0.5;
          return (
            <Circle
              key={`dot-${idx}`}
              cx={toX(lm)}
              cy={toY(lm)}
              r={visible ? 7 : 4}
              fill={scoreColor}
              fillOpacity={visible ? 0.95 : 0.4}
              stroke="#000"
              strokeWidth={1.5}
            />
          );
        })}

        {/* ── Score Badge ── */}
        <SvgText
          x={width - 20}
          y={50}
          textAnchor="end"
          fill={scoreColor}
          fontSize="28"
          fontWeight="bold"
        >
          {Math.round(score)}
        </SvgText>
        <SvgText
          x={width - 20}
          y={72}
          textAnchor="end"
          fill="#ffffff"
          fontSize="12"
          fillOpacity={0.7}
        >
          SCORE
        </SvgText>

      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
  },
});
