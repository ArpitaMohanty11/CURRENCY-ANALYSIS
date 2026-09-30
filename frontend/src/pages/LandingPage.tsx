import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
  Zap,
  BarChart3,
  Globe2,
  Cpu,
  Layers,
  CheckCircle2,
  RefreshCw,
  Bell,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [fromCurr, setFromCurr] = useState('USD');
  const [toCurr, setToCurr] = useState('EUR');
  const [amount, setAmount] = useState('10000');

  const demoRates: Record<string, number> = {
    'USD-EUR': 0.9245,
    'EUR-USD': 1.0816,
    'USD-GBP': 0.7892,
    'USD-JPY': 154.32,
    'USD-INR': 86.42,
  };
  const key = `${fromCurr}-${toCurr}`;
  const rate = demoRates[key] || 0.9245;
  const converted = (parseFloat(amount || '0') * rate).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <div className="min-h-screen bg-[#070e1c] text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navbar */}
      <nav className="h-20 border-b border-[#1c2a47] px-6 lg:px-12 flex items-center justify-between sticky top-0 bg-[#070e1c]/90 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-xl tracking-tight text-white font-mono">
              Currency<span className="text-cyan-400">Lens</span>
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-mono font-bold tracking-widest uppercase bg-cyan-950 text-cyan-300 border border-cyan-800 px-1.5 py-0.5 rounded">
              INSTITUTIONAL
            </span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-xs font-mono text-slate-400">
          <a href="#features" className="hover:text-cyan-400 transition-colors">CAPABILITIES</a>
          <a href="#converter" className="hover:text-cyan-400 transition-colors">LIVE CONVERTER</a>
          <a href="#terminal" className="hover:text-cyan-400 transition-colors">TERMINAL</a>
          <a href="#pricing" className="hover:text-cyan-400 transition-colors">ACCESS TIERS</a>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="px-4 py-2 rounded-lg text-xs font-mono font-semibold text-slate-300 hover:text-white hover:bg-[#111d33] transition-colors"
          >
            SIGN IN
          </Link>
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono font-bold bg-cyan-500 hover:bg-cyan-400 text-black transition-all shadow-lg shadow-cyan-500/25"
          >
            <span>LAUNCH TERMINAL</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative px-6 lg:px-12 pt-16 pb-24 max-w-7xl mx-auto w-full flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/70 border border-cyan-800 text-cyan-300 text-xs font-mono mb-8">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-live-dot" />
          <span>Real-Time High-Frequency FX Analytics & AI Macro Insights</span>
        </div>

        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-5xl leading-tight">
          Next-Generation <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500">Foreign Exchange</span> Intelligence
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl font-normal leading-relaxed">
          Engineered for algorithmic traders, corporate treasuries, and macro analysts. Real-time institutional liquidity feeds, predictive currency strength matrices, and automated volatility alerts.
        </p>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link
            to="/dashboard"
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl font-mono text-sm font-bold bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black shadow-xl shadow-cyan-500/25 transition-all transform hover:-translate-y-0.5"
          >
            <span>EXPLORE PRO TERMINAL</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/login"
            className="px-6 py-3.5 rounded-xl font-mono text-sm font-semibold bg-[#0c1527] hover:bg-[#14213d] border border-[#1c2a47] text-slate-200 transition-all"
          >
            DEMO ACCESS (TRADER/ADMIN)
          </Link>
        </div>

        {/* Live Converter Interactive Widget */}
        <div id="converter" className="mt-16 w-full max-w-3xl glass-panel p-6 sm:p-8 rounded-2xl border border-[#1c2a47] shadow-2xl text-left relative overflow-hidden">
          <div className="flex items-center justify-between border-b border-[#1c2a47] pb-4 mb-6">
            <div className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
                Institutional Real-Time Conversion Simulator
              </span>
            </div>
            <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-live-dot" />
              SPOT SPREAD: 0.0002
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-7 gap-4 items-center">
            <div className="sm:col-span-3">
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">You Send</label>
              <div className="flex bg-[#070e1c] border border-[#1c2a47] rounded-xl overflow-hidden focus-within:border-cyan-500">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-transparent px-4 py-3 text-lg font-mono font-bold text-white focus:outline-none"
                />
                <select
                  value={fromCurr}
                  onChange={(e) => setFromCurr(e.target.value)}
                  className="bg-[#0c1527] border-l border-[#1c2a47] px-3 font-mono font-bold text-cyan-400 text-sm focus:outline-none cursor-pointer"
                >
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                </select>
              </div>
            </div>

            <div className="sm:col-span-1 flex justify-center py-2 sm:py-0">
              <button
                onClick={() => {
                  setFromCurr(toCurr);
                  setToCurr(fromCurr);
                }}
                className="w-9 h-9 rounded-full bg-[#111d33] border border-[#1c2a47] hover:border-cyan-400 text-slate-300 hover:text-cyan-400 flex items-center justify-center transition-colors"
                title="Swap Currencies"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>

            <div className="sm:col-span-3">
              <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1.5">Recipient Receives</label>
              <div className="flex bg-[#070e1c] border border-[#1c2a47] rounded-xl overflow-hidden">
                <div className="w-full px-4 py-3 text-lg font-mono font-bold text-emerald-400 truncate">
                  {converted}
                </div>
                <select
                  value={toCurr}
                  onChange={(e) => setToCurr(e.target.value)}
                  className="bg-[#0c1527] border-l border-[#1c2a47] px-3 font-mono font-bold text-emerald-400 text-sm focus:outline-none cursor-pointer"
                >
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="INR">INR</option>
                </select>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-[#1c2a47]/60 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400">
            <div>
              Rate: <span className="text-slate-200 font-semibold">1 {fromCurr} = {rate} {toCurr}</span>
            </div>
            <Link to="/converter" className="text-cyan-400 hover:underline flex items-center gap-1">
              <span>Open Advanced Multi-Currency Matrix</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </section>

      {/* Institutional Features Grid */}
      <section id="features" className="py-20 border-t border-[#1c2a47] bg-[#050b17] px-6 lg:px-12">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs font-mono text-cyan-400 uppercase tracking-widest">
              FINANCIAL ARCHITECTURE
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-white mt-2">
              Built for Institutional Precision
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Low-latency data pipeline, deep statistical models, and cross-asset correlation analysis.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl border border-[#1c2a47] hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-cyan-950 border border-cyan-800 flex items-center justify-center mb-5 text-cyan-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Currency Strength Matrix</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Multi-pair relative strength algorithm ranking G10 and emerging currencies across multiple timeframes with real-time sentiment scoring.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[#1c2a47] hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-indigo-950 border border-indigo-800 flex items-center justify-center mb-5 text-indigo-400">
                <Cpu className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">AI Macro Sentiment Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Automated NLP parsing of central bank policy statements, interest rate expectations, and geopolitical risk factors mapped to currency impact.
              </p>
            </div>

            <div className="glass-panel p-6 rounded-2xl border border-[#1c2a47] hover:border-cyan-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-950 border border-emerald-800 flex items-center justify-center mb-5 text-emerald-400">
                <Bell className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Sub-Second Price Alerts</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Trigger alerts on price boundaries, percentage volatility spikes, and moving average crossovers via background APScheduler monitoring.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1c2a47] py-12 px-6 lg:px-12 bg-[#070e1c] text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          © 2026 CurrencyLens Institutional FX. All rights reserved.
        </div>
        <div className="flex items-center gap-6 text-slate-400">
          <Link to="/login" className="hover:text-cyan-400">Terminal Access</Link>
          <Link to="/dashboard" className="hover:text-cyan-400">Dashboard</Link>
          <Link to="/settings" className="hover:text-cyan-400">Documentation</Link>
        </div>
      </footer>
    </div>
  );
};
