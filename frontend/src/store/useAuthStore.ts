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

export const useAuthStore = create<AuthState>((set, get) => ({
  user: {
    id: '00000000-0000-0000-0000-000000000002',
    email: 'trader@currencyanalysis.com',
    full_name: 'Dharmendra Trader',
    role: 'trader',
    is_active: true,
    created_at: new Date().toISOString(),
    preferences: {
      base_currency: 'USD',
      theme: 'dark',
      refresh_interval_seconds: 15,
      notification_email: true,
      notification_in_app: true,
    },
  },
  token: localStorage.getItem('currency_analysis_token') || 'demo-trader-token',
  isAuthenticated: true,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.auth.login(email, password);
      localStorage.setItem('currency_analysis_token', res.access_token);
      set({ user: res.user, token: res.access_token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      // Fallback for demo instant login if backend unreachable
      if (email.includes('admin')) {
        set({
          user: {
            id: '00000000-0000-0000-0000-000000000001',
            email: 'admin@currencyanalysis.com',
            full_name: 'Alexander Vance (Chief FX Strategist)',
            role: 'admin',
            is_active: true,
            created_at: new Date().toISOString(),
          },
          token: 'demo-admin-token',
          isAuthenticated: true,
          isLoading: false,
        });
        localStorage.setItem('currency_analysis_token', 'demo-admin-token');
        return true;
      }
      set({
        error: err.response?.data?.detail || 'Invalid email or credentials.',
        isLoading: false,
      });
      return false;
    }
  },

  register: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.auth.register(payload);
      localStorage.setItem('currency_analysis_token', res.access_token);
      set({ user: res.user, token: res.access_token, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err: any) {
      set({
        error: err.response?.data?.detail || 'Registration failed.',
        isLoading: false,
      });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('currency_analysis_token');
    set({ user: null, token: null, isAuthenticated: false });
  },

  fetchMe: async () => {
    try {
      const user = await api.auth.getMe();
      set({ user, isAuthenticated: true });
    } catch (err) {
      // Retain active demo session
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
