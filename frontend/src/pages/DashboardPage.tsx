import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { useWatchlistStore } from '../store/useWatchlistStore';
import { api } from '../services/api';
import { MetricCard } from '../components/MetricCard';
import { Sparkline } from '../components/Sparkline';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Cpu,
  BarChart3,
  BellRing,
  ArrowUpRight,
  RefreshCw,
  Globe,
  SlidersHorizontal,
  ChevronRight,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { CurrencyStrength, AIInsight, HistoricalTrends } from '../types';

export const DashboardPage: React.FC = () => {
  const { rates, topMovers, selectedPair, setSelectedPair, isLiveConnected, lastUpdated } = useCurrencyStore();
  const { watchlists, alerts, fetchWatchlists, fetchAlerts } = useWatchlistStore();

  const [strengthList, setStrengthList] = useState<CurrencyStrength[]>([]);
  const [aiInsights, setAiInsights] = useState<AIInsight[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);
  const [chartMetrics, setChartMetrics] = useState<any>(null);
  const [timeframe, setTimeframe] = useState<string>('30D');
  const [chartType, setChartType] = useState<'area' | 'line'>('area');
  const [loadingChart, setLoadingChart] = useState(false);

  useEffect(() => {
    fetchWatchlists();
    fetchAlerts();

    const loadAnalytics = async () => {
      try {
        const [strRes, aiRes] = await Promise.all([
          api.analytics.getStrength(),
          api.analytics.getAIInsights(),
        ]);
        setStrengthList(strRes);
        setAiInsights(aiRes.insights);
      } catch (err) {
        console.error('Failed to load initial analytics:', err);
      }
    };
    loadAnalytics();
  }, []);

  // Fetch chart data when selectedPair or timeframe changes
  useEffect(() => {
    const loadChart = async () => {
      setLoadingChart(true);
      try {
        const res: HistoricalTrends = await api.analytics.getHistorical(selectedPair, timeframe);
        setChartData(res.rates);
        setChartMetrics(res.metrics);
      } catch (err) {
        console.error('Failed to load chart data:', err);
      } finally {
        setLoadingChart(false);
      }
    };
    loadChart();
  }, [selectedPair, timeframe]);

  const currentRateObj = rates.find((r) => r.pair === selectedPair) || {
    pair: selectedPair,
    rate: 1.0845,
    bid: 1.0844,
    ask: 1.0846,
    high_24h: 1.0890,
    low_24h: 1.0810,
    change_24h: 0.0035,
    change_pct_24h: 0.32,
  };

  const defaultWatchlist = watchlists.find((w) => w.is_default) || watchlists[0];

  return (
    <div className="space-y-6">
      {/* Top Terminal Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2a47] pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white">
              Institutional FX Intelligence Terminal
            </h1>
            <span className="flex items-center gap-1 text-[11px] font-mono px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-dot" />
              LIVE FEED
            </span>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Last tick update: <span className="text-slate-200">{lastUpdated}</span> · Automated spread sync every 15s
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/converter"
            className="px-3 py-1.5 rounded-lg bg-[#0c1527] hover:bg-[#14213d] border border-[#1c2a47] text-xs font-mono text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>FX Converter</span>
          </Link>
          <Link
            to="/alerts"
            className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Create Alert</span>
          </Link>
        </div>
      </div>

      {/* Top 4 Market Overview Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="US Dollar Index (DXY)"
          value="104.28"
          subtitle="Broad Dollar Benchmark"
          changePct={0.18}
          badge="MACRO"
          glowColor="cyan"
          sparklineData={[103.8, 103.9, 104.1, 104.05, 104.2, 104.15, 104.28]}
        />
        <MetricCard
          title="FX Volatility Index (CVIX)"
          value="8.42%"
          subtitle="Implied 30-Day Regime"
          changePct={-0.45}
          badge="VOL"
          glowColor="emerald"
          sparklineData={[9.2, 9.0, 8.8, 8.9, 8.6, 8.5, 8.42]}
        />
        <MetricCard
          title="Market Breadth"
          value={topMovers ? `${topMovers.market_overview.advances} / ${topMovers.market_overview.declines}` : "14 / 6"}
          subtitle="Advancing vs Declining Crosses"
          badge="LIQUIDITY"
          glowColor="cyan"
          icon={<Globe className="w-4 h-4 text-cyan-400" />}
        />
        <MetricCard
          title="Active Price Triggers"
          value={alerts.length}
          subtitle="Monitoring Live Market Feed"
          badge="APScheduler"
          glowColor="amber"
          icon={<Zap className="w-4 h-4 text-amber-400" />}
        />
      </div>

      {/* Main Interactive Chart & Quick Order Depth Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Interactive Recharts Multi-Timeframe Chart */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-[#1c2a47] flex flex-col justify-between">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1c2a47] pb-4 mb-4">
            <div className="flex items-center gap-3">
              <select
                value={selectedPair}
                onChange={(e) => setSelectedPair(e.target.value)}
                className="bg-[#070e1c] border border-[#1c2a47] text-white text-base font-bold font-mono px-3 py-1.5 rounded-lg focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                {rates.map((r) => (
                  <option key={r.pair} value={r.pair}>
                    {r.pair} — {r.rate.toFixed(4)}
                  </option>
                ))}
              </select>

              <div className="flex items-baseline gap-2">
                <span className="font-mono text-2xl font-bold text-white">
                  {currentRateObj.rate.toFixed(4)}
                </span>
                <span
                  className={`font-mono text-xs font-semibold flex items-center gap-0.5 ${
                    currentRateObj.change_pct_24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {currentRateObj.change_pct_24h >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                  {currentRateObj.change_pct_24h >= 0 ? '+' : ''}
                  {currentRateObj.change_pct_24h.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Timeframe & Chart Style Selectors */}
            <div className="flex items-center gap-2">
              <div className="flex bg-[#070e1c] border border-[#1c2a47] rounded-lg p-0.5 text-xs font-mono">
                {['24H', '7D', '30D', '90D', '1Y'].map((tf) => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`px-2.5 py-1 rounded transition-colors ${
                      timeframe === tf ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>

              <div className="hidden sm:flex bg-[#070e1c] border border-[#1c2a47] rounded-lg p-0.5 text-xs font-mono">
                <button
                  onClick={() => setChartType('area')}
                  className={`px-2 py-1 rounded ${
                    chartType === 'area' ? 'bg-[#1c2a47] text-cyan-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  Area
                </button>
                <button
                  onClick={() => setChartType('line')}
                  className={`px-2 py-1 rounded ${
                    chartType === 'line' ? 'bg-[#1c2a47] text-cyan-300 font-bold' : 'text-slate-400'
                  }`}
                >
                  Line
                </button>
              </div>
            </div>
          </div>

          {/* Chart Metrics Banner */}
          {chartMetrics && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4 p-2.5 rounded-lg bg-[#070e1c]/80 border border-[#1c2a47]/60 text-[11px] font-mono">
              <div>
                <span className="text-slate-500">Period High: </span>
                <span className="text-slate-200 font-semibold">{chartMetrics.period_high}</span>
              </div>
              <div>
                <span className="text-slate-500">Period Low: </span>
                <span className="text-slate-200 font-semibold">{chartMetrics.period_low}</span>
              </div>
              <div>
                <span className="text-slate-500">Vol (Ann): </span>
                <span className="text-cyan-400 font-semibold">{chartMetrics.annualized_volatility}%</span>
              </div>
              <div>
                <span className="text-slate-500">Return: </span>
                <span className={chartMetrics.period_return_pct >= 0 ? 'text-emerald-400 font-semibold' : 'text-rose-400 font-semibold'}>
                  {chartMetrics.period_return_pct >= 0 ? '+' : ''}{chartMetrics.period_return_pct}%
                </span>
              </div>
            </div>
          )}

          {/* Recharts Component */}
          <div className="w-full h-72 sm:h-80">
            {loadingChart ? (
              <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-400">
                <RefreshCw className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
                Streaming historical exchange rates...
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="rateGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1c2a47" opacity={0.6} />
                  <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                  <YAxis
                    domain={['auto', 'auto']}
                    stroke="#64748b"
                    tick={{ fontSize: 10, fontFamily: 'monospace' }}
                    tickFormatter={(v) => v.toFixed(3)}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0c1527',
                      borderColor: '#1c2a47',
                      borderRadius: '8px',
                      color: '#f8fafc',
                      fontFamily: 'monospace',
                      fontSize: '11px',
                    }}
                    formatter={(val: any) => [Number(val).toFixed(5), 'Spot Rate']}
                  />
                  <Area
                    type="monotone"
                    dataKey="close"
                    stroke="#06b6d4"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill={chartType === 'area' ? 'url(#rateGradient)' : 'none'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Institutional Bid / Ask Spread & Live Depth Card */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-[#1c2a47] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Institutional Order Flow
              </span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-1.5 py-0.5 rounded">
                Tier-1 Liquidity
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 rounded-xl bg-[#070e1c] border border-emerald-950">
                <span className="text-[10px] font-mono text-emerald-400 uppercase font-semibold">Institutional Bid</span>
                <div className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
                  {currentRateObj.bid ? currentRateObj.bid.toFixed(4) : currentRateObj.rate.toFixed(4)}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">Size: 45.2M EUR</div>
              </div>

              <div className="p-3 rounded-xl bg-[#070e1c] border border-rose-950">
                <span className="text-[10px] font-mono text-rose-400 uppercase font-semibold">Institutional Ask</span>
                <div className="text-xl font-mono font-bold text-rose-400 mt-0.5">
                  {currentRateObj.ask ? currentRateObj.ask.toFixed(4) : (currentRateObj.rate * 1.0002).toFixed(4)}
                </div>
                <div className="text-[10px] font-mono text-slate-500 mt-1">Size: 38.6M EUR</div>
              </div>
            </div>

            {/* Depth Bars Visualizer */}
            <div className="space-y-2 mb-5">
              <div className="text-[10px] font-mono text-slate-400 uppercase flex justify-between">
                <span>Book Depth</span>
                <span>Spread: {(currentRateObj.ask - currentRateObj.bid).toFixed(5)}</span>
              </div>
              <div className="w-full bg-[#070e1c] h-3 rounded-full overflow-hidden flex border border-[#1c2a47]">
                <div className="bg-emerald-500/80 h-full w-[54%]" title="Buyer Depth 54%" />
                <div className="bg-rose-500/80 h-full w-[46%]" title="Seller Depth 46%" />
              </div>
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-emerald-400">Buyers 54%</span>
                <span className="text-rose-400">Sellers 46%</span>
              </div>
            </div>

            {/* Range 24h Gauge */}
            <div className="space-y-1.5 p-3 rounded-xl bg-[#070e1c] border border-[#1c2a47] text-xs font-mono">
              <div className="flex justify-between text-slate-400 text-[11px]">
                <span>24h Low: {currentRateObj.low_24h?.toFixed(4)}</span>
                <span>24h High: {currentRateObj.high_24h?.toFixed(4)}</span>
              </div>
              <div className="w-full bg-[#16223b] h-1.5 rounded-full overflow-hidden">
                <div className="bg-cyan-400 h-full rounded-full w-[65%]" />
              </div>
            </div>
          </div>

          <Link
            to="/analytics"
            className="mt-4 w-full py-2.5 rounded-xl bg-[#111d33] hover:bg-[#1a2c4e] border border-[#1c2a47] text-cyan-300 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Launch Technical Indicators & Heatmap</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Row: Top Movers & Currency Strength Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Top Gainers & Losers */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-[#1c2a47]">
          <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Top 24h Foreign Exchange Movers
            </span>
            <span className="text-[10px] font-mono text-slate-400">Real-Time Ticks</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Gainers */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400 font-semibold mb-2">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>TOP GAINERS</span>
              </div>
              <div className="space-y-2">
                {topMovers?.top_gainers.slice(0, 4).map((g) => (
                  <div
                    key={g.pair}
                    onClick={() => setSelectedPair(g.pair)}
                    className="p-2.5 rounded-lg bg-[#070e1c] hover:bg-[#14213d] border border-[#1c2a47]/60 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-slate-200">{g.pair}</div>
                      <div className="font-mono text-[11px] text-slate-400">{g.rate.toFixed(4)}</div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-400 text-xs font-mono font-bold">
                        +{g.change_pct_24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Losers */}
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono text-rose-400 font-semibold mb-2">
                <TrendingDown className="w-3.5 h-3.5" />
                <span>TOP LOSERS</span>
              </div>
              <div className="space-y-2">
                {topMovers?.top_losers.slice(0, 4).map((l) => (
                  <div
                    key={l.pair}
                    onClick={() => setSelectedPair(l.pair)}
                    className="p-2.5 rounded-lg bg-[#070e1c] hover:bg-[#14213d] border border-[#1c2a47]/60 cursor-pointer flex items-center justify-between transition-colors"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-slate-200">{l.pair}</div>
                      <div className="font-mono text-[11px] text-slate-400">{l.rate.toFixed(4)}</div>
                    </div>
                    <div className="text-right">
                      <span className="inline-block px-1.5 py-0.5 rounded bg-rose-950/80 text-rose-400 text-xs font-mono font-bold">
                        {l.change_pct_24h.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Currency Strength Rankings */}
        <div className="lg:col-span-6 glass-panel p-5 rounded-2xl border border-[#1c2a47]">
          <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Currency Relative Strength Index (CSI)
            </span>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-1.5 py-0.5 rounded">
              G10 + Major Matrix
            </span>
          </div>

          <div className="space-y-2.5">
            {strengthList.slice(0, 5).map((item) => (
              <div
                key={item.currency}
                className="p-2.5 rounded-lg bg-[#070e1c] border border-[#1c2a47]/60 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div className="w-6 h-6 rounded bg-[#16223b] flex items-center justify-center font-mono text-xs font-bold text-slate-300">
                    #{item.rank}
                  </div>
                  <div>
                    <span className="font-mono font-bold text-xs text-white mr-2">{item.currency}</span>
                    <span className="text-[11px] text-slate-400 hidden sm:inline">{item.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  {/* Progress bar */}
                  <div className="w-24 sm:w-32 bg-[#16223b] h-2 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        item.score >= 60 ? 'bg-emerald-400' : item.score >= 40 ? 'bg-cyan-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${item.score}%` }}
                    />
                  </div>

                  <div className="w-12 text-right font-mono text-xs font-bold text-white">
                    {item.score.toFixed(1)}
                  </div>

                  <span
                    className={`text-[10px] font-mono px-1.5 py-0.5 rounded font-semibold w-24 text-center ${
                      item.sentiment.includes('Bullish')
                        ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80'
                        : item.sentiment.includes('Bearish')
                        ? 'bg-rose-950/80 text-rose-400 border border-rose-800/80'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.sentiment}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row: AI Insights & Watchlist Quick Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* AI Macro Insights */}
        <div className="lg:col-span-8 glass-panel p-5 rounded-2xl border border-[#1c2a47]">
          <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                AI FX Macro & Central Bank Insights
              </span>
            </div>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
              High Confidence Feed
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {aiInsights.slice(0, 4).map((insight) => (
              <div
                key={insight.id}
                className="p-4 rounded-xl bg-[#070e1c] border border-[#1c2a47] hover:border-cyan-500/40 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                    {insight.currency_pair}
                  </span>
                  <div className="flex items-center gap-1.5 text-[10px] font-mono">
                    <span
                      className={`px-1.5 py-0.2 rounded font-semibold ${
                        insight.sentiment === 'Bullish'
                          ? 'text-emerald-400 bg-emerald-950'
                          : insight.sentiment === 'Bearish'
                          ? 'text-rose-400 bg-rose-950'
                          : 'text-slate-400 bg-slate-800'
                      }`}
                    >
                      {insight.sentiment}
                    </span>
                    <span className="text-slate-500 font-normal">{insight.published_at}</span>
                  </div>
                </div>

                <h4 className="text-xs font-bold text-slate-200 mb-1.5 leading-snug">
                  {insight.title}
                </h4>
                <p className="text-[11px] text-slate-400 leading-relaxed font-normal">
                  {insight.summary}
                </p>

                <div className="mt-3 pt-2 border-t border-[#1c2a47]/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
                  <span>Confidence: {insight.confidence_score}%</span>
                  <span className="text-cyan-400 hover:underline cursor-pointer flex items-center gap-0.5">
                    Impact: {insight.impact_level}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Watchlist Quick Summary */}
        <div className="lg:col-span-4 glass-panel p-5 rounded-2xl border border-[#1c2a47] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Watchlist Summary
              </span>
              <Link to="/watchlists" className="text-[11px] font-mono text-cyan-400 hover:underline">
                Manage ({watchlists.length})
              </Link>
            </div>

            <div className="space-y-2.5">
              {defaultWatchlist?.items && defaultWatchlist.items.length > 0 ? (
                defaultWatchlist.items.slice(0, 5).map((item) => (
                  <div
                    key={item.id}
                    onClick={() => setSelectedPair(item.pair)}
                    className="p-2.5 rounded-lg bg-[#070e1c] hover:bg-[#14213d] border border-[#1c2a47]/60 flex items-center justify-between cursor-pointer transition-colors"
                  >
                    <div>
                      <div className="font-mono font-bold text-xs text-white">{item.pair}</div>
                      <div className="text-[10px] font-mono text-slate-400">Added {new Date(item.added_at).toLocaleDateString()}</div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono text-xs font-semibold text-slate-200">
                        {item.rate_info ? item.rate_info.rate.toFixed(4) : '1.0845'}
                      </div>
                      <div
                        className={`text-[10px] font-mono ${
                          (item.rate_info?.change_pct_24h || 0) >= 0 ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {(item.rate_info?.change_pct_24h || 0) >= 0 ? '+' : ''}
                        {(item.rate_info?.change_pct_24h || 0.25).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs font-mono text-slate-500">
                  No pairs added to default watchlist yet.
                </div>
              )}
            </div>
          </div>

          <Link
            to="/watchlists"
            className="mt-4 w-full py-2.5 rounded-xl bg-[#111d33] hover:bg-[#1a2c4e] border border-[#1c2a47] text-cyan-300 font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span>Create Custom Portfolios</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};
