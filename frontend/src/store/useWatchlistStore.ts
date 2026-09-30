import { create } from 'zustand';
import { Watchlist, Alert, AlertHistory, Report } from '../types';
import { api } from '../services/api';

interface WatchlistState {
  watchlists: Watchlist[];
  alerts: Alert[];
  alertHistory: AlertHistory[];
  reports: Report[];
  isLoading: boolean;
  fetchWatchlists: () => Promise<void>;
  createWatchlist: (name: string, description?: string) => Promise<void>;
  addPairToWatchlist: (watchlistId: string, base: string, target: string) => Promise<void>;
  removeItemFromWatchlist: (watchlistId: string, itemId: string) => Promise<void>;
  deleteWatchlist: (watchlistId: string) => Promise<void>;
  fetchAlerts: () => Promise<void>;
  createAlert: (base: string, target: string, type: string, targetRate: number) => Promise<void>;
  toggleAlert: (alertId: string, isActive: boolean) => Promise<void>;
  deleteAlert: (alertId: string) => Promise<void>;
  fetchAlertHistory: () => Promise<void>;
  fetchReports: () => Promise<void>;
  generateReport: (title: string, reportType: string, format: string) => Promise<void>;
}

export const useWatchlistStore = create<WatchlistState>((set, get) => ({
  watchlists: [],
  alerts: [],
  alertHistory: [],
  reports: [],
  isLoading: false,

  fetchWatchlists: async () => {
    try {
      const data = await api.watchlists.getAll();
      set({ watchlists: data });
    } catch (err) {
      console.warn('Failed to load watchlists:', err);
    }
  },

  createWatchlist: async (name, description) => {
    try {
      await api.watchlists.create(name, description);
      await get().fetchWatchlists();
    } catch (err) {
      console.error('Failed to create watchlist:', err);
    }
  },

  addPairToWatchlist: async (watchlistId, base, target) => {
    try {
      await api.watchlists.addItem(watchlistId, base, target);
      await get().fetchWatchlists();
    } catch (err) {
      console.error('Failed to add pair to watchlist:', err);
    }
  },

  removeItemFromWatchlist: async (watchlistId, itemId) => {
    try {
      await api.watchlists.removeItem(watchlistId, itemId);
      await get().fetchWatchlists();
    } catch (err) {
      console.error('Failed to remove item:', err);
    }
  },

  deleteWatchlist: async (watchlistId) => {
    try {
      await api.watchlists.delete(watchlistId);
      await get().fetchWatchlists();
    } catch (err) {
      console.error('Failed to delete watchlist:', err);
    }
  },

  fetchAlerts: async () => {
    try {
      const data = await api.alerts.getAll();
      set({ alerts: data });
    } catch (err) {
      console.warn('Failed to load alerts:', err);
    }
  },

  createAlert: async (base, target, type, targetRate) => {
    try {
      await api.alerts.create({
        base_currency: base,
        target_currency: target,
        trigger_type: type,
        target_rate: targetRate,
      });
      await get().fetchAlerts();
    } catch (err) {
      console.error('Failed to create alert:', err);
    }
  },

  toggleAlert: async (alertId, isActive) => {
    try {
      await api.alerts.toggle(alertId, isActive);
      await get().fetchAlerts();
    } catch (err) {
      console.error('Failed to toggle alert:', err);
    }
  },

  deleteAlert: async (alertId) => {
    try {
      await api.alerts.delete(alertId);
      await get().fetchAlerts();
    } catch (err) {
      console.error('Failed to delete alert:', err);
    }
  },

  fetchAlertHistory: async () => {
    try {
      const data = await api.alerts.getHistory();
      set({ alertHistory: data });
    } catch (err) {
      console.warn('Failed to load alert history:', err);
    }
  },

  fetchReports: async () => {
    try {
      const data = await api.reports.getAll();
      set({ reports: data });
    } catch (err) {
      console.warn('Failed to load reports:', err);
    }
  },

  generateReport: async (title, reportType, format) => {
    try {
      await api.reports.generate({ title, report_type: reportType, format });
      await get().fetchReports();
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  },
}));
