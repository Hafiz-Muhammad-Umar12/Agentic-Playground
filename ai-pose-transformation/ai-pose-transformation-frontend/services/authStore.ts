import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

interface User {
  id: number;
  username: string;
  email: string;
  full_name?: string;
  profile_image?: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (username: string, email: string, password: string, full_name?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loadToken: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  loading: false,
  error: null,

  loadToken: async () => {
    try {
      const token = await AsyncStorage.getItem('access_token');
      const userStr = await AsyncStorage.getItem('user');
      let user = null;
      if (userStr && userStr !== 'undefined') {
        user = JSON.parse(userStr);
      }
      if (token) set({ token, user });
    } catch (e) {
      console.error('Failed to load token/user:', e);
    }
  },

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const res = await api.post('/user/user/login', { email, password });
      const { token, message } = res.data;
      // Backend returns 'token' instead of 'access_token'
      await AsyncStorage.setItem('access_token', token);
      // If user data isn't returned, we'll store a placeholder or handle it
      const userPlaceholder = { email, username: email.split('@')[0] };
      await AsyncStorage.setItem('user', JSON.stringify(userPlaceholder));
      
      set({ token, user: userPlaceholder, loading: false });
      return true;
    } catch (e: any) {
      set({ error: e.response?.data?.detail || 'Login failed', loading: false });
      return false;
    }
  },

  register: async (username, email, password, full_name) => {
    set({ loading: true, error: null });
    try {
      await api.post('/user/user/register', { username, email, password, full_name });
      set({ loading: false });
      return true;
    } catch (e: any) {
      set({ error: e.response?.data?.detail || 'Registration failed', loading: false });
      return false;
    }
  },

  logout: async () => {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('user');
    set({ token: null, user: null });
  },
}));
