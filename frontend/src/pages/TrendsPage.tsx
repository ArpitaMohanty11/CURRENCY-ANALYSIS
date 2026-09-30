import React, { useState, useEffect } from 'react';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { api } from '../services/api';
import {
  LineChart,
  Download,
  Calendar,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
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
import { HistoricalTrends } from '../types';

export const TrendsPage: React.FC = () => {
  const { selectedPair, setSelectedPair, rates } = useCurrencyStore();
  const [trends, setTrends] = useState<HistoricalTrends | null>(null);
  const [period, setPeriod] = useState<string>('30D');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchTrends = async () => {
      setLoading(true);
      try {
        const res = await api.analytics.getHistorical(selectedPair, period);
        setTrends(res);
      } catch (err) {
        console.error('Failed to load historical trends:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTrends();
  }, [selectedPair, period]);

  const handleExportCSV = () => {
    if (!trends) return;
    const lines = ['Date,Open,High,Low,Close,Volume'];
    trends.rates.forEach((r) => {
      lines.push(`${r.date},${r.open},${r.high},${r.low},${r.close},${r.volume}`);
    });
    const blob = new Blob([lines.join('\n')], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${selectedPair.replace('/', '_')}_historical_${period}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2a47] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
            <span>Historical FX Rates & Volatility Distribution</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
              AUDIT READY
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Institutional daily open-high-low-close (OHLC) tick records and volatility variance metrics
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 bg-[#070e1c] border border-[#1c2a47] rounded-lg p-1">
            <span className="text-slate-400 text-xs font-mono pl-2">Pair:</span>
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

          <div className="flex bg-[#070e1c] border border-[#1c2a47] rounded-lg p-0.5 text-xs font-mono">
            {['7D', '30D', '90D', '1Y'].map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 rounded transition-colors ${
                  period === p ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400 hover:text-white'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          <button
            onClick={handleExportCSV}
            className="px-3 py-1.5 rounded-lg bg-[#0c1527] hover:bg-[#14213d] border border-[#1c2a47] text-xs font-mono text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Analytics Summary Metric Cards */}
      {trends?.metrics && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-panel p-4 rounded-xl border border-[#1c2a47]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Period High</span>
            <div className="text-xl font-mono font-bold text-white mt-1">{trends.metrics.period_high}</div>
            <div className="text-[10px] font-mono text-emerald-400 mt-0.5">Peak Resistance</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-[#1c2a47]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Period Low</span>
            <div className="text-xl font-mono font-bold text-white mt-1">{trends.metrics.period_low}</div>
            <div className="text-[10px] font-mono text-rose-400 mt-0.5">Base Support</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-[#1c2a47]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Standard Deviation</span>
            <div className="text-xl font-mono font-bold text-cyan-400 mt-1">{trends.metrics.std_deviation}</div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">Price Dispersion</div>
          </div>
          <div className="glass-panel p-4 rounded-xl border border-[#1c2a47]">
            <span className="text-[10px] font-mono text-slate-400 uppercase">Annualized Volatility</span>
            <div className="text-xl font-mono font-bold text-amber-400 mt-1">{trends.metrics.annualized_volatility}%</div>
            <div className="text-[10px] font-mono text-slate-500 mt-0.5">Regime Gauge</div>
          </div>
        </div>
      )}

      {/* Interactive Chart */}
      <div className="glass-panel p-5 rounded-2xl border border-[#1c2a47]">
        <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            {selectedPair} OHLC Close Price Trajectory
          </span>
          <span className="text-[10px] font-mono text-slate-400">Institutional Interbank Feed</span>
        </div>

        <div className="w-full h-72">
          {loading ? (
            <div className="w-full h-full flex items-center justify-center text-xs font-mono text-slate-400">
              <RefreshCw className="w-5 h-5 animate-spin mr-2 text-cyan-400" />
              Loading historical series...
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trends?.rates || []} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="trendsGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
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
                    fontFamily: 'monospace',
                    fontSize: '11px',
                  }}
                />
                <Area type="monotone" dataKey="close" stroke="#06b6d4" strokeWidth={2} fill="url(#trendsGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* OHLC Table */}
      <div className="glass-panel p-5 rounded-2xl border border-[#1c2a47]">
        <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Historical OHLC Daily Settlement Log
          </span>
          <span className="text-[10px] font-mono text-slate-400">Records: {trends?.rates.length || 0}</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full font-mono text-xs text-left">
            <thead>
              <tr className="border-b border-[#1c2a47] text-slate-400 text-[11px]">
                <th className="pb-2">DATE</th>
                <th className="pb-2">OPEN</th>
                <th className="pb-2">HIGH</th>
                <th className="pb-2">LOW</th>
                <th className="pb-2">CLOSE</th>
                <th className="pb-2">VOLUME (EUR)</th>
                <th className="pb-2 text-right">DAILY SPREAD</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1c2a47]/40">
              {trends?.rates.slice().reverse().map((r, i) => (
                <tr key={i} className="hover:bg-[#14213d]/40">
                  <td className="py-2.5 font-bold text-white">{r.date}</td>
                  <td className="py-2.5 text-slate-300">{r.open.toFixed(4)}</td>
                  <td className="py-2.5 text-emerald-400 font-semibold">{r.high.toFixed(4)}</td>
                  <td className="py-2.5 text-rose-400 font-semibold">{r.low.toFixed(4)}</td>
                  <td className="py-2.5 text-white font-bold">{r.close.toFixed(4)}</td>
                  <td className="py-2.5 text-slate-400">{(r.volume / 1e6).toFixed(2)}M</td>
                  <td className="py-2.5 text-right text-slate-400">{(r.high - r.low).toFixed(4)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
