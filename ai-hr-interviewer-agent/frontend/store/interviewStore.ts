import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Message {
  id: string;
  role: 'ai' | 'user';
  content: string;
  timestamp: number;
}

export interface ScoreData {
  score: {
    correctness: number;
    clarity: number;
    depth: number;
    technical_accuracy: number;
    total: number;
  };
  feedback: {
    strengths: string[];
    weaknesses: string[];
    improvements: string[];
  };
}

interface InterviewState {
  sessionId: string | null;
  messages: Message[];
  currentQuestion: string | null;
  isLoading: boolean;
  isEnded: boolean;
  isInitializing: boolean;
  scoreData: ScoreData | null;
  topic: string | null;

  // Actions
  setSessionId: (id: string | null) => void;
  setTopic: (topic: string | null) => void;
  setInitializing: (val: boolean) => void;
  addMessage: (message: Omit<Message, 'id' | 'timestamp'>) => void;
  setCurrentQuestion: (question: string | null) => void;
  setLoading: (loading: boolean) => void;
  setEnded: (ended: boolean) => void;
  setScoreData: (data: ScoreData | null) => void;
  resetInterview: () => void;
}

export const useInterviewStore = create<InterviewState>()(
  persist(
    (set) => ({
      sessionId: null,
      messages: [],
      currentQuestion: null,
      isLoading: false,
      isInitializing: false,
      isEnded: false,
      scoreData: null,
      topic: null,

      setSessionId: (id) => set({ sessionId: id }),
      setTopic: (topic) => set({ topic }),
      setInitializing: (val) => set({ isInitializing: val }),
      addMessage: (message) => 
        set((state) => {
          // Prevent duplicate messages if content and role are identical within a short window
          const lastMsg = state.messages[state.messages.length - 1];
          if (lastMsg && lastMsg.content === message.content && lastMsg.role === message.role) {
            return state;
          }
          return {
            messages: [
              ...state.messages,
              {
                ...message,
                id: Math.random().toString(36).substring(7),
                timestamp: Date.now(),
              },
            ],
          };
        }),
      setCurrentQuestion: (question) => set({ currentQuestion: question }),
      setLoading: (loading) => set({ isLoading: loading }),
      setEnded: (ended) => set({ isEnded: ended }),
      setScoreData: (data) => set({ scoreData: data }),
      resetInterview: () => set({
        sessionId: null,
        messages: [],
        currentQuestion: null,
        isLoading: false,
        isInitializing: false,
        isEnded: false,
        scoreData: null,
        topic: null,
      }),
    }),
    {
      name: 'interview-storage',
    }
  )
);
