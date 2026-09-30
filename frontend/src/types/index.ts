export interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'user' | 'trader' | 'analyst' | 'admin';
  is_active: boolean;
  created_at: string;
  preferences?: UserPreferences;
}

export interface UserPreferences {
  base_currency: string;
  theme: string;
  refresh_interval_seconds: number;
  notification_email: boolean;
  notification_in_app: boolean;
}

export interface Currency {
  code: string;
  name: string;
  symbol: string;
  country: string;
  flag_url?: string;
  category: string;
  is_active: boolean;
}

export interface ExchangeRate {
  id?: string;
  base_currency: string;
  target_currency: string;
  pair: string;
  rate: number;
  bid: number;
  ask: number;
  high_24h: number;
  low_24h: number;
  change_24h: number;
  change_pct_24h: number;
  timestamp: string;
}

export interface TopMovers {
  top_gainers: ExchangeRate[];
  top_losers: ExchangeRate[];
  market_overview: {
    total_tracked_pairs: number;
    advances: number;
    declines: number;
    unchanged: number;
    average_volatility_pct: number;
    dxy_index: number;
    dxy_change_pct: number;
    market_regime: string;
    last_sync: string;
  };
}

export interface ConvertResult {
  from_currency: string;
  to_currency: string;
  amount: number;
  rate: number;
  converted_amount: number;
  bid: number;
  ask: number;
  spread: number;
  timestamp: string;
}

export interface MultiConvertResult {
  base_currency: string;
  amount: number;
  results: {
    currency: string;
    rate: number;
    converted_amount: number;
    change_pct_24h: number;
  }[];
  timestamp: string;
}

export interface CurrencyStrength {
  currency: string;
  name: string;
  score: number;
  rank: number;
  change_24h: number;
  sentiment: string;
}

export interface HistoricalRatePoint {
  timestamp: string;
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface HistoricalTrends {
  pair: string;
  period: string;
  rates: HistoricalRatePoint[];
  metrics: {
    period_high: number;
    period_low: number;
    period_average: number;
    std_deviation: number;
    period_return_pct: number;
    annualized_volatility: number;
    sharpe_ratio: number;
  };
}

export interface TechnicalIndicators {
  pair: string;
  rsi_14: number;
  sma_20: number;
  sma_50: number;
  sma_200: number;
  volatility_30d: number;
  bollinger_upper: number;
  bollinger_middle: number;
  bollinger_lower: number;
  macd: number;
  signal_line: number;
  summary_signal: 'BUY' | 'NEUTRAL' | 'SELL';
}

export interface AIInsight {
  id: string;
  title: string;
  category: string;
  sentiment: 'Bullish' | 'Bearish' | 'Neutral';
  impact_level: 'HIGH' | 'MEDIUM' | 'LOW';
  currency_pair: string;
  summary: string;
  published_at: string;
  confidence_score: number;
}

export interface WatchlistItem {
  id: string;
  watchlist_id: string;
  base_currency: string;
  target_currency: string;
  pair: string;
  added_at: string;
  rate_info?: ExchangeRate;
}

export interface Watchlist {
  id: string;
  user_id: string;
  name: string;
  description?: string;
  is_default: boolean;
  created_at: string;
  updated_at: string;
  items: WatchlistItem[];
}

export interface Alert {
  id: string;
  user_id: string;
  base_currency: string;
  target_currency: string;
  pair: string;
  trigger_type: 'ABOVE' | 'BELOW' | 'PCT_CHANGE_UP' | 'PCT_CHANGE_DOWN';
  target_rate: number;
  current_rate?: number;
  is_active: boolean;
  triggered_count: number;
  last_triggered_at?: string;
  created_at: string;
}

export interface AlertHistory {
  id: string;
  alert_id: string;
  user_id: string;
  base_currency: string;
  target_currency: string;
  pair: string;
  triggered_rate: number;
  target_rate: number;
  message: string;
  created_at: string;
}

export interface Report {
  id: string;
  user_id: string;
  title: string;
  report_type: string;
  format: string;
  file_url?: string;
  parameters: Record<string, any>;
  status: string;
  created_at: string;
  data_preview?: Record<string, any>;
}

export interface SystemHealth {
  status: string;
  version: string;
  uptime_seconds: number;
  database: string;
  rates_cached_count: number;
  active_alerts_count: number;
  active_users_count: number;
  scheduler_running: boolean;
  timestamp: string;
}

export interface AuditLog {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  ip_address?: string;
  details: Record<string, any>;
  created_at: string;
}
