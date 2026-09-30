import axios from 'axios';
import {
  User,
  Currency,
  ExchangeRate,
  TopMovers,
  ConvertResult,
  MultiConvertResult,
  CurrencyStrength,
  HistoricalTrends,
  TechnicalIndicators,
  AIInsight,
  Watchlist,
  WatchlistItem,
  Alert,
  AlertHistory,
  Report,
  SystemHealth,
  AuditLog,
  UserPreferences,
} from '../types';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor for JWT Bearer token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('currencylens_token') || 'demo-trader-token';
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor for 401 handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token if invalid, or allow demo fallback
      if (localStorage.getItem('currencylens_token')) {
        console.warn('Session expired or unauthorized.');
      }
    }
    return Promise.reject(error);
  }
);

export const api = {
  // Authentication
  auth: {
    login: async (email: string, password: string): Promise<{ access_token: string; user: User }> => {
      const res = await apiClient.post('/auth/login', { email, password });
      return res.data;
    },
    register: async (payload: { email: string; password: string; full_name: string; role?: string }): Promise<{ access_token: string; user: User }> => {
      const res = await apiClient.post('/auth/register', payload);
      return res.data;
    },
    getMe: async (): Promise<User> => {
      const res = await apiClient.get('/auth/me');
      return res.data;
    },
    updatePreferences: async (preferences: Partial<UserPreferences>): Promise<UserPreferences> => {
      const res = await apiClient.put('/auth/preferences', preferences);
      return res.data;
    },
  },

  // Currencies & Rates
  currencies: {
    getAll: async (): Promise<Currency[]> => {
      const res = await apiClient.get('/currencies');
      return res.data;
    },
    getRates: async (): Promise<ExchangeRate[]> => {
      const res = await apiClient.get('/currencies/rates');
      return res.data;
    },
    getTopMovers: async (): Promise<TopMovers> => {
      const res = await apiClient.get('/currencies/top-movers');
      return res.data;
    },
    convert: async (from_currency: string, to_currency: string, amount: number): Promise<ConvertResult> => {
      const res = await apiClient.post('/currencies/convert', { from_currency, to_currency, amount });
      return res.data;
    },
    multiConvert: async (base_currency: string, amount: number, target_currencies: string[]): Promise<MultiConvertResult> => {
      const res = await apiClient.post('/currencies/multi-convert', { base_currency, amount, target_currencies });
      return res.data;
    },
    getPair: async (base: string, target: string): Promise<ExchangeRate> => {
      const res = await apiClient.get(`/currencies/pairs/${base}/${target}`);
      return res.data;
    },
  },

  // Analytics & AI
  analytics: {
    getStrength: async (): Promise<CurrencyStrength[]> => {
      const res = await apiClient.get('/analytics/strength');
      return res.data;
    },
    getHistorical: async (pair: string = 'EUR/USD', period: string = '30D'): Promise<HistoricalTrends> => {
      const res = await apiClient.get('/analytics/historical', { params: { pair, period } });
      return res.data;
    },
    getCorrelations: async (): Promise<{ currencies: string[]; matrix: Record<string, Record<string, number>> }> => {
      const res = await apiClient.get('/analytics/correlations');
      return res.data;
    },
    getIndicators: async (pair: string = 'EUR/USD'): Promise<TechnicalIndicators> => {
      const res = await apiClient.get('/analytics/indicators', { params: { pair } });
      return res.data;
    },
    getAIInsights: async (): Promise<{ insights: AIInsight[]; market_sentiment_score: number; dxy_forecast: string }> => {
      const res = await apiClient.get('/analytics/ai-insights');
      return res.data;
    },
  },

  // Watchlists
  watchlists: {
    getAll: async (): Promise<Watchlist[]> => {
      const res = await apiClient.get('/watchlists');
      return res.data;
    },
    create: async (name: string, description?: string, is_default: boolean = false): Promise<Watchlist> => {
      const res = await apiClient.post('/watchlists', { name, description, is_default });
      return res.data;
    },
    addItem: async (watchlistId: string, baseCurrency: string, targetCurrency: string): Promise<WatchlistItem> => {
      const res = await apiClient.post(`/watchlists/${watchlistId}/items`, {
        base_currency: baseCurrency,
        target_currency: targetCurrency,
      });
      return res.data;
    },
    removeItem: async (watchlistId: string, itemId: string): Promise<void> => {
      await apiClient.delete(`/watchlists/${watchlistId}/items/${itemId}`);
    },
    delete: async (watchlistId: string): Promise<void> => {
      await apiClient.delete(`/watchlists/${watchlistId}`);
    },
  },

  // Alerts
  alerts: {
    getAll: async (): Promise<Alert[]> => {
      const res = await apiClient.get('/alerts');
      return res.data;
    },
    create: async (payload: { base_currency: string; target_currency: string; trigger_type: string; target_rate: number }): Promise<Alert> => {
      const res = await apiClient.post('/alerts', payload);
      return res.data;
    },
    toggle: async (alertId: string, isActive: boolean): Promise<Alert> => {
      const res = await apiClient.patch(`/alerts/${alertId}/toggle`, null, { params: { is_active: isActive } });
      return res.data;
    },
    delete: async (alertId: string): Promise<void> => {
      await apiClient.delete(`/alerts/${alertId}`);
    },
    getHistory: async (): Promise<AlertHistory[]> => {
      const res = await apiClient.get('/alerts/history');
      return res.data;
    },
  },

  // Reports
  reports: {
    getAll: async (): Promise<Report[]> => {
      const res = await apiClient.get('/reports');
      return res.data;
    },
    generate: async (payload: { title: string; report_type: string; format: string; parameters?: Record<string, any> }): Promise<Report> => {
      const res = await apiClient.post('/reports/generate', payload);
      return res.data;
    },
    getCsvUrl: (): string => `${API_BASE_URL}/reports/export/csv`,
  },

  // Admin
  admin: {
    getHealth: async (): Promise<SystemHealth> => {
      const res = await apiClient.get('/admin/health');
      return res.data;
    },
    getLogs: async (): Promise<AuditLog[]> => {
      const res = await apiClient.get('/admin/logs');
      return res.data;
    },
    getUsers: async (): Promise<any[]> => {
      const res = await apiClient.get('/admin/users');
      return res.data;
    },
    getJobs: async (): Promise<any[]> => {
      const res = await apiClient.get('/admin/jobs');
      return res.data;
    },
    triggerSync: async (): Promise<any> => {
      const res = await apiClient.post('/admin/jobs/sync/trigger');
      return res.data;
    },
  },
};
