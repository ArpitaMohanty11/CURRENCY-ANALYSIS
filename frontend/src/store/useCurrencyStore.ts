import { create } from 'zustand';
import { Currency, ExchangeRate, TopMovers } from '../types';
import { api } from '../services/api';

interface CurrencyState {
  currencies: Currency[];
  rates: ExchangeRate[];
  topMovers: TopMovers | null;
  selectedPair: string;
  isLoading: boolean;
  isLiveConnected: boolean;
  lastUpdated: string;
  fetchCurrencies: () => Promise<void>;
  fetchRates: () => Promise<void>;
  fetchTopMovers: () => Promise<void>;
  setSelectedPair: (pair: string) => void;
  startLiveUpdates: () => () => void;
}

export const useCurrencyStore = create<CurrencyState>((set, get) => ({
  currencies: [],
  rates: [],
  topMovers: null,
  selectedPair: 'EUR/USD',
  isLoading: false,
  isLiveConnected: true,
  lastUpdated: new Date().toLocaleTimeString(),

  fetchCurrencies: async () => {
    try {
      const data = await api.currencies.getAll();
      set({ currencies: data });
    } catch (err) {
      console.warn('Failed to load currencies list:', err);
    }
  },

  fetchRates: async () => {
    try {
      const data = await api.currencies.getRates();
      set({
        rates: data,
        lastUpdated: new Date().toLocaleTimeString(),
        isLiveConnected: true,
      });
    } catch (err) {
      set({ isLiveConnected: false });
    }
  },

  fetchTopMovers: async () => {
    try {
      const data = await api.currencies.getTopMovers();
      set({ topMovers: data });
    } catch (err) {
      console.warn('Failed to load top movers:', err);
    }
  },

  setSelectedPair: (pair: string) => {
    set({ selectedPair: pair });
  },

  startLiveUpdates: () => {
    get().fetchCurrencies();
    get().fetchRates();
    get().fetchTopMovers();

    const interval = setInterval(() => {
      get().fetchRates();
      get().fetchTopMovers();
    }, 10000); // 10s live pulse

    return () => clearInterval(interval);
  },
}));
