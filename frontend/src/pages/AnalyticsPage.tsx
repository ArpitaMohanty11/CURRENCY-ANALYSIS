import React, { useState, useEffect } from 'react';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { api } from '../services/api';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Activity,
  Layers,
  Sliders,
  RefreshCw,
  Compass,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { TechnicalIndicators, HistoricalTrends } from '../types';

export const AnalyticsPage: React.FC = () => {
  const { selectedPair, setSelectedPair, rates } = useCurrencyStore();
  const [indicators, setIndicators] = useState<TechnicalIndicators | null>(null);
  const [trends, setTrends] = useState<HistoricalTrends | null>(null);
  const [correlations, setCorrelations] = useState<{ currencies: string[]; matrix: Record<string, Record<string, number>> } | null>(null);
  const [comparePair, setComparePair] = useState<string>('GBP/USD');
  const [compareTrends, setCompareTrends] = useState<HistoricalTrends | null>(null);
  const [timeframe, setTimeframe] = useState<string>('30D');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [indRes, trendsRes, corrRes, compRes] = await Promise.all([
          api.analytics.getIndicators(selectedPair),
          api.analytics.getHistorical(selectedPair, timeframe),
          api.analytics.getCorrelations(),
          api.analytics.getHistorical(comparePair, timeframe),
        ]);
        setIndicators(indRes);
        setTrends(trendsRes);
        setCorrelations(corrRes);
        setCompareTrends(compRes);
      } catch (err) {
        console.error('Failed to load analytics:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedPair, comparePair, timeframe]);

  // Combine trend data for multi-currency comparison chart
  const combinedChartData = trends?.rates.map((point, index) => {
    const compPoint = compareTrends?.rates[index];
    // Normalize to base 100 for comparison
    const baseFirst = trends.rates[0]?.close || 1;
    const compFirst = compareTrends?.rates[0]?.close || 1;
    return {
      date: point.date,
      [selectedPair]: Number(((point.close / baseFirst) * 100).toFixed(2)),
      [comparePair]: compPoint ? Number(((compPoint.close / compFirst) * 100).toFixed(2)) : 100,
      volume: point.volume,
    };
  }) || [];

  return (
    <div className="space-y-6">
      {/* Title & Pair Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2a47] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
            <span>Advanced Quantitative Currency Analytics</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
              ALGO READY
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Statistical distribution, technical indicators, correlation matrices, and normalized comparative return curves
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#070e1c] border border-[#1c2a47] rounded-lg p-1">
            <span className="text-slate-400 text-xs font-mono pl-2">Primary:</span>
            <select
              value={selectedPair}
              onChange={(e) => setSelectedPair(e.target.value)}
              className="bg-transparent text-white font-mono font-bold text-xs p-1 focus:outline-none cursor-pointer"
            >
              {rates.map((r) => (
                <option key={r.pair} value={r.pair} className="bg-[#070e1c]">
                  {r.pair}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-[#070e1c] border border-[#1c2a47] rounded-lg p-1">
            <span className="text-slate-400 text-xs font-mono pl-2">Compare:</span>
            <select
              value={comparePair}
              onChange={(e) => setComparePair(e.target.value)}
              className="bg-transparent text-cyan-400 font-mono font-bold text-xs p-1 focus:outline-none cursor-pointer"
            >
              {rates.map((r) => (
                <option key={r.pair} value={r.pair} className="bg-[#070e1c]">
                  {r.pair}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Technical Indicators Ribbon */}
      {indicators && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="glass-panel p-3.5 rounded-xl border border-[#1c2a47]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">RSI (14-Period)</span>
            <div className="text-lg font-mono font-bold text-white mt-1">{indicators.rsi_14}</div>
            <div className="text-[10px] font-mono text-cyan-400 mt-0.5">
              {indicators.rsi_14 > 70 ? 'Overbought' : indicators.rsi_14 < 30 ? 'Oversold' : 'Neutral Range'}
            </div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-[#1c2a47]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">SMA 20 vs SMA 50</span>
            <div className="text-lg font-mono font-bold text-emerald-400 mt-1">Bullish Cross</div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">SMA20: {indicators.sma_20}</div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-[#1c2a47]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">SMA 200 (Long Term)</span>
            <div className="text-lg font-mono font-bold text-slate-200 mt-1">{indicators.sma_200}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">Institutional Benchmark</div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-[#1c2a47]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Bollinger Bands</span>
            <div className="text-xs font-mono font-bold text-white mt-1">U: {indicators.bollinger_upper}</div>
            <div className="text-[10px] font-mono text-slate-500">L: {indicators.bollinger_lower}</div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-[#1c2a47]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">MACD / Signal</span>
            <div className="text-lg font-mono font-bold text-cyan-400 mt-1">+{indicators.macd}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">Sig: +{indicators.signal_line}</div>
          </div>

          <div className="glass-panel p-3.5 rounded-xl border border-[#1c2a47] flex flex-col justify-between">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Consensus Signal</span>
            <div className="text-lg font-mono font-extrabold text-emerald-400 mt-0.5 flex items-center gap-1">
              <Zap className="w-4 h-4 fill-emerald-400 text-emerald-400" />
              <span>{indicators.summary_signal}</span>
            </div>
            <div className="text-[10px] font-mono text-slate-500">Technical Synthesis</div>
          </div>
        </div>
      )}

      {/* Comparative Performance Chart */}
      <div className="glass-panel p-5 rounded-2xl border border-[#1c2a47]">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#1c2a47] pb-4 mb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Normalized Comparative Return (Base 100 Index)
            </span>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Comparing <span className="text-cyan-400 font-semibold">{selectedPair}</span> vs{' '}
              <span className="text-amber-400 font-semibold">{comparePair}</span> over {timeframe}
            </p>
          </div>

          <div className="flex bg-[#070e1c] border border-[#1c2a47] rounded-lg p-0.5 text-xs font-mono">
            {['7D', '30D', '90D', '1Y'].map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-3 py-1 rounded transition-colors ${
                  timeframe === tf ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {tf}
              </button>
            ))}
          </div>
        </div>

        <div className="w-full h-80">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={combinedChartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="compareGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1c2a47" opacity={0.6} />
              <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0c1527',
                  borderColor: '#1c2a47',
                  borderRadius: '8px',
                  color: '#f8fafc',
                  fontFamily: 'monospace',
                  fontSize: '11px',
                }}
              />
              <Legend wrapperStyle={{ fontFamily: 'monospace', fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey={selectedPair} stroke="#06b6d4" strokeWidth={2} fill="url(#primaryGrad)" />
              <Area type="monotone" dataKey={comparePair} stroke="#f59e0b" strokeWidth={2} fill="url(#compareGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row: Volume Histogram & Correlation Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Volume Distribution */}
        <div className="lg:col-span-5 glass-panel p-5 rounded-2xl border border-[#1c2a47]">
          <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Institutional Turnover Volume
            </span>
            <span className="text-[10px] font-mono text-slate-400">Daily EUR/USD equivalent</span>
          </div>

          <div className="w-full h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={combinedChartData.slice(-14)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1c2a47" opacity={0.5} />
                <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} />
                <YAxis stroke="#64748b" tick={{ fontSize: 10, fontFamily: 'monospace' }} tickFormatter={(v) => `${(v / 1e6).toFixed(1)}M`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0c1527',
                    borderColor: '#1c2a47',
                    borderRadius: '8px',
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                  formatter={(val: any) => [`${(Number(val) / 1e6).toFixed(2)}M`, 'Volume']}
                />
                <Bar dataKey="volume" fill="#0284c7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right: Empirical FX Correlation Heatmap */}
        <div className="lg:col-span-7 glass-panel p-5 rounded-2xl border border-[#1c2a47]">
          <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Empirical FX Correlation Matrix (vs USD)
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
              Pearson Coefficients
            </span>
          </div>

          {correlations && (
            <div className="overflow-x-auto">
              <table className="w-full text-center font-mono text-xs border-collapse">
                <thead>
                  <tr className="border-b border-[#1c2a47]">
                    <th className="p-2 text-left text-slate-400 text-[11px]">PAIR</th>
                    {correlations.currencies.map((c) => (
                      <th key={c} className="p-2 text-slate-300 text-[11px] font-bold">
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {correlations.currencies.map((rowCurr) => (
                    <tr key={rowCurr} className="border-b border-[#1c2a47]/40 hover:bg-[#14213d]/40">
                      <td className="p-2 text-left font-bold text-white text-[11px]">{rowCurr}</td>
                      {correlations.currencies.map((colCurr) => {
                        const val = correlations.matrix[rowCurr]?.[colCurr] ?? 0;
                        const bgStyle =
                          val === 1
                            ? 'bg-cyan-900/60 text-cyan-200'
                            : val >= 0.7
                            ? 'bg-emerald-950/80 text-emerald-300 font-semibold'
                            : val >= 0.3
                            ? 'bg-emerald-950/40 text-emerald-400'
                            : val <= -0.4
                            ? 'bg-rose-950/80 text-rose-300 font-semibold'
                            : val < 0
                            ? 'bg-rose-950/40 text-rose-400'
                            : 'bg-slate-900 text-slate-400';

                        return (
                          <td key={colCurr} className={`p-2 rounded text-[11px] ${bgStyle}`}>
                            {val.toFixed(2)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
