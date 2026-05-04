import { create } from 'zustand';
import api from './api';
import { WS_URL } from './api';

export type StyleMode = 'instagram' | 'linkedin' | 'casual' | 'fitness' | 'professional';

interface Suggestion {
  direction: string;
  angle?: number;
  confidence: number;
  body_part: string;
}

interface PoseAnalysis {
  frame_number: number;
  posture_score: number;
  detected_pose: string;
  suggestions: Suggestion[];
  next_pose_name: string;
  feedback: string;
}

interface PoseState {
  sessionUuid: string | null;
  styleMode: StyleMode;
  isSessionActive: boolean;
  currentAnalysis: PoseAnalysis | null;
  wsConnected: boolean;
  ws: WebSocket | null;
  frameCount: number;
  history: any[];

  setStyleMode: (mode: StyleMode) => void;
  startSession: () => Promise<void>;
  endSession: () => Promise<any>;
  connectWebSocket: () => void;
  disconnectWebSocket: () => void;
  sendFrame: (landmarks: any[]) => void;
  fetchHistory: () => Promise<void>;
}

export const usePoseStore = create<PoseState>((set, get) => ({
  sessionUuid: null,
  styleMode: 'casual',
  isSessionActive: false,
  currentAnalysis: null,
  wsConnected: false,
  ws: null,
  frameCount: 0,
  history: [],

  setStyleMode: (mode) => set({ styleMode: mode }),

  startSession: async () => {
    const { styleMode } = get();
    try {
      const res = await api.post('/ai/suggest', { style_mode: styleMode });
      set({ sessionUuid: res.data.session_uuid || 'demo-session', isSessionActive: true, frameCount: 0 });
    } catch (e) {
      console.error('Failed to start session:', e);
      // Fallback for demo if backend fails
      set({ sessionUuid: 'demo-session', isSessionActive: true, frameCount: 0 });
    }
  },

  endSession: async () => {
    const { sessionUuid, ws } = get();
    if (ws) ws.close();
    set({ isSessionActive: false, sessionUuid: null, wsConnected: false, ws: null });
    return { message: "Session ended" };
  },

  connectWebSocket: () => {
    const { sessionUuid } = get();
    
    try {
      // ✅ FIXED URL: Changed from /ws/pose/uuid to /ws/stream
      const ws = new WebSocket(`${WS_URL}/ws/stream`);

      ws.onopen = () => {
        set({ wsConnected: true });
        console.log('✅ WebSocket connected');
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          if (data.posture_score !== undefined) {
            set({ currentAnalysis: data });
          }
        } catch (e) {
          console.warn('WS parse error:', e);
        }
      };

      ws.onerror = (e) => console.error('WS error:', e);

      ws.onclose = () => {
        set({ wsConnected: false });
        console.log('🔌 WebSocket disconnected');
      };

      set({ ws });
    } catch (e) {
      console.error('WebSocket connection failed:', e);
    }
  },

  disconnectWebSocket: () => {
    const { ws } = get();
    if (ws) ws.close();
    set({ ws: null, wsConnected: false });
  },

  sendFrame: (landmarks) => {
    const { ws, wsConnected, styleMode, frameCount } = get();
    if (!ws || !wsConnected || ws.readyState !== WebSocket.OPEN) return;
    
    const payload = JSON.stringify({
      landmarks,
      frame_number: frameCount,
      style_mode: styleMode,
    });
    ws.send(payload);
    set({ frameCount: frameCount + 1 });
  },

  fetchHistory: async () => {
    try {
      const res = await api.get('/user/user/history');
      set({ history: res.data || [] });
    } catch (e) {
      console.error('History fetch failed:', e);
    }
  },
}));
