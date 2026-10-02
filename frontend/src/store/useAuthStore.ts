import { create } from 'zustand';
import { User, UserPreferences } from '../types';
import { api } from '../services/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: { email: string; password: string; full_name: string; role?: string }) => Promise<boolean>;
  logout: () => void;
  fetchMe: () => Promise<void>;
  updatePreferences: (prefs: Partial<UserPreferences>) => Promise<void>;
}

const storedToken = localStorage.getItem('currency_analysis_token');

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: storedToken,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.auth.login(email, password);
      localStorage.setItem('currency_analysis_token', res.access_token);
      set({
        user: res.user,
        token: res.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Invalid email or password.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.auth.register(payload);
      localStorage.setItem('currency_analysis_token', res.access_token);
      set({
        user: res.user,
        token: res.access_token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    } catch (err: any) {
      const msg = err.response?.data?.detail || 'Registration failed. Please try again.';
      set({ error: msg, isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('currency_analysis_token');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  fetchMe: async () => {
    const token = get().token;
    if (!token) return;
    try {
      const user = await api.auth.getMe();
      set({ user, isAuthenticated: true });
    } catch (err) {
      // Token invalid or expired — force logout
      localStorage.removeItem('currency_analysis_token');
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  updatePreferences: async (prefs) => {
    try {
      const updated = await api.auth.updatePreferences(prefs);
      const current = get().user;
      if (current) {
        set({ user: { ...current, preferences: updated } });
      }
    } catch (err) {
      console.error('Failed to save preferences:', err);
    }
  },
}));
