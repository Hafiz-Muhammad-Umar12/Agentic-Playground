# 📱 AI Pose Camera — Frontend (React Native / Expo)

Real-time AI pose coaching app built with **Expo**, **React Native**, **WebSocket**, and **SVG overlay rendering**.

---

## 📁 Project Structure

```
frontend/
├── app/
│   ├── _layout.tsx                  # Root navigation layout
│   ├── index.tsx                    # Entry redirect (auth check)
│   └── screens/
│       ├── LoginScreen.tsx          # JWT login
│       ├── RegisterScreen.tsx       # User registration
│       ├── HomeScreen.tsx           # Style mode selector + dashboard
│       ├── CameraScreen.tsx         # MAIN: live camera + pose overlay
│       ├── SessionSummaryScreen.tsx # Post-session stats
│       └── HistoryScreen.tsx        # Past pose history
│
├── components/
│   ├── Overlay/
│   │   └── PoseOverlay.tsx          # SVG skeleton + ghost pose renderer
│   └── UI/
│       ├── SuggestionPanel.tsx      # Blur panel with real-time suggestions
│       └── ScoreRing.tsx            # Circular score indicator
│
├── services/
│   ├── api.ts                       # Axios instance with JWT interceptor
│   ├── authStore.ts                 # Zustand auth state
│   └── poseStore.ts                 # Zustand pose/session/WS state
│
├── app.json                         # Expo config (permissions etc.)
├── babel.config.js
├── tsconfig.json
└── package.json
```

---

## ⚙️ Setup

### 1. Install dependencies
```bash
npm install
# or
yarn install
```

### 2. Set your backend IP
Edit `services/api.ts`:
```ts
export const BASE_URL = 'http://YOUR_BACKEND_IP:8000';
export const WS_URL   = 'ws://YOUR_BACKEND_IP:8000';
```

### 3. Run the app
```bash
npx expo start
```
Scan QR code with **Expo Go** app on your phone.

---

## 📲 App Flow

```
Login / Register
      ↓
   Home Screen
   (Pick Style Mode)
      ↓
  Camera Screen
  ┌─────────────────────────────┐
  │  Live Camera Feed           │
  │  + SVG Skeleton Overlay     │
  │  + Ghost "Next Pose"        │
  │  + Score Ring (top right)   │
  │  + Suggestion Panel (bottom)│
  │  + WS connection indicator  │
  └─────────────────────────────┘
      ↓
Session Summary
(Score, frames, duration, grade)
      ↓
   History Screen
```

---

## 🔌 WebSocket Data Flow

```
CameraScreen
  → Every 100ms: sendFrame(landmarks[])
  → WebSocket → Backend analyzes
  → Backend responds:
      { posture_score, detected_pose, suggestions, next_pose_name, feedback }
  → Updates UI instantly
```

---

## 🎨 Style Modes

| Mode | Description |
|------|-------------|
| 📸 Instagram | Social media model poses |
| 💼 LinkedIn | Professional headshots |
| ✌️ Casual | Natural everyday poses |
| 💪 Fitness | Athletic / gym poses |
| 👔 Professional | Corporate authority poses |

---

## 🛠️ Tech Stack

| Library | Use |
|---------|-----|
| Expo + Expo Router | App framework + file-based routing |
| expo-camera | Live camera feed |
| react-native-svg | SVG skeleton overlay rendering |
| expo-blur | Frosted glass suggestion panel |
| expo-linear-gradient | Background gradients |
| Zustand | Global state (auth + pose) |
| Axios | HTTP requests to backend |
| WebSocket (native) | Real-time pose streaming |
| AsyncStorage | JWT token persistence |

---

## 🚀 Production Notes

### Replace simulated landmarks with real MediaPipe:
In `CameraScreen.tsx`, find `generateSimulatedLandmarks()` and replace with:
```ts
// Use react-native-vision-camera + MediaPipe frame processors
// or send raw base64 frames to backend for processing
```

### For physical device testing:
- Make sure backend and phone are on the **same WiFi network**
- Use your machine's local IP (e.g. `192.168.1.x`) not `localhost`
