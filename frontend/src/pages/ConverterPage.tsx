import React, { useState, useEffect } from 'react';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { api } from '../services/api';
import {
  RefreshCw,
  ArrowRight,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShieldCheck,
  Zap,
  Layers,
  ArrowUpDown,
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
import { ConvertResult, MultiConvertResult } from '../types';

export const ConverterPage: React.FC = () => {
  const { currencies, rates } = useCurrencyStore();

  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('EUR');
  const [amount, setAmount] = useState('25000');
  const [result, setResult] = useState<ConvertResult | null>(null);
  const [multiResults, setMultiResults] = useState<MultiConvertResult | null>(null);
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const targets = ['EUR', 'GBP', 'JPY', 'CHF', 'AUD', 'CAD', 'INR', 'CNY', 'SGD', 'AED'];

  const handleConvert = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    setLoading(true);
    try {
      const [singleRes, multiRes, histRes] = await Promise.all([
        api.currencies.convert(fromCurr, toCurr, parseFloat(amount)),
        api.currencies.multiConvert(fromCurr, parseFloat(amount), targets),
        api.analytics.getHistorical(`${fromCurr}/${toCurr}`, '30D'),
      ]);
      setResult(singleRes);
      setMultiResults(multiRes);
      setHistoryData(histRes.rates);
    } catch (err) {
      console.error('Convert failed:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleConvert();
  }, [fromCurr, toCurr]);

  const handleSwap = () => {
    const temp = fromCurr;
    setFromCurr(toCurr);
    setToCurr(temp);
  };

  return (
    <div className="space-y-6">
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2a47] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
            <span>Institutional Currency Converter & Multi-Matrix</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-950/80 border border-emerald-800 text-emerald-400">
              ZERO SLIPPAGE SIMULATOR
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time interbank conversion rates with live bid/ask spreads and multi-currency portfolio valuation
          </p>
        </div>
      </div>

      {/* Main Single Converter Card */}
      <div className="glass-panel p-6 sm:p-8 rounded-2xl border border-[#1c2a47] shadow-2xl">
        <div className="grid grid-cols-1 lg:grid-cols-7 gap-4 items-center">
          {/* From */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Source Amount & Currency</label>
            <div className="flex bg-[#070e1c] border border-[#1c2a47] rounded-xl overflow-hidden focus-within:border-cyan-500 transition-colors">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                onBlur={handleConvert}
                className="w-full bg-transparent px-4 py-3.5 text-xl font-mono font-bold text-white focus:outline-none"
                placeholder="0.00"
              />
              <select
                value={fromCurr}
                onChange={(e) => setFromCurr(e.target.value)}
                className="bg-[#0c1527] border-l border-[#1c2a47] px-4 font-mono font-bold text-cyan-400 text-sm focus:outline-none cursor-pointer"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code} className="bg-[#0c1527] text-white">
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Swap Button */}
          <div className="lg:col-span-1 flex justify-center py-2 lg:py-0">
            <button
              onClick={handleSwap}
              className="w-12 h-12 rounded-xl bg-[#111d33] border border-[#1c2a47] hover:border-cyan-400 text-slate-300 hover:text-cyan-400 flex items-center justify-center transition-all shadow-md group"
              title="Swap Currencies"
            >
              <ArrowUpDown className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>

          {/* To */}
          <div className="lg:col-span-3">
            <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Target Conversion Output</label>
            <div className="flex bg-[#070e1c] border border-[#1c2a47] rounded-xl overflow-hidden">
              <div className="w-full px-4 py-3.5 text-xl font-mono font-bold text-emerald-400 truncate">
                {result ? result.converted_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 }) : '...'}
              </div>
              <select
                value={toCurr}
                onChange={(e) => setToCurr(e.target.value)}
                className="bg-[#0c1527] border-l border-[#1c2a47] px-4 font-mono font-bold text-emerald-400 text-sm focus:outline-none cursor-pointer"
              >
                {currencies.map((c) => (
                  <option key={c.code} value={c.code} className="bg-[#0c1527] text-white">
                    {c.code} — {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Spread & Fee Breakdown */}
        {result && (
          <div className="mt-6 pt-5 border-t border-[#1c2a47] grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
            <div>
              <span className="text-slate-500">Execution Spot Rate: </span>
              <div className="text-slate-200 font-bold mt-0.5">1 {fromCurr} = {result.rate.toFixed(5)} {toCurr}</div>
            </div>
            <div>
              <span className="text-slate-500">Bid / Ask Spread: </span>
              <div className="text-slate-200 font-bold mt-0.5">{result.bid.toFixed(4)} / {result.ask.toFixed(4)}</div>
            </div>
            <div>
              <span className="text-slate-500">Estimated Liquidity Fee: </span>
              <div className="text-emerald-400 font-bold mt-0.5">0.00% (Interbank Zero Fee)</div>
            </div>
            <div>
              <span className="text-slate-500">Inverse Cross: </span>
              <div className="text-cyan-400 font-bold mt-0.5">1 {toCurr} = {(1 / result.rate).toFixed(5)} {fromCurr}</div>
            </div>
          </div>
        )}
      </div>

      {/* Historical Conversion Trend Chart */}
      <div className="glass-panel p-5 rounded-2xl border border-[#1c2a47]">
        <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            30-Day Historical Conversion Trend ({fromCurr}/{toCurr})
          </span>
          <span className="text-[10px] font-mono text-cyan-400">Institutional Interbank Settlement</span>
        </div>

        <div className="w-full h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="convertTrend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
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
              <Area type="monotone" dataKey="close" stroke="#10b981" strokeWidth={2} fill="url(#convertTrend)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Multi-Currency Portfolio Matrix */}
      <div className="glass-panel p-5 rounded-2xl border border-[#1c2a47]">
        <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
          <div>
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
              Multi-Currency Basket Valuation
            </span>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Simultaneous conversion of {parseFloat(amount || '0').toLocaleString()} {fromCurr} across 10 major global currencies
            </p>
          </div>
          <span className="text-[10px] font-mono text-slate-400">Live Spot Prices</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {multiResults?.results.map((item) => (
            <div
              key={item.currency}
              className="p-3.5 rounded-xl bg-[#070e1c] border border-[#1c2a47] hover:border-cyan-500/40 transition-colors"
            >
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono font-bold text-sm text-cyan-400">{item.currency}</span>
                <span
                  className={`text-[10px] font-mono font-semibold ${
                    item.change_pct_24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                  }`}
                >
                  {item.change_pct_24h >= 0 ? '+' : ''}{item.change_pct_24h.toFixed(2)}%
                </span>
              </div>
              <div className="text-base font-mono font-bold text-white">
                {item.converted_amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>
              <div className="text-[10px] font-mono text-slate-500 mt-1">
                Rate: {item.rate.toFixed(4)}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
