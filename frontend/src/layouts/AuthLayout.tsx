import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Activity, ShieldCheck, Zap } from 'lucide-react';

export const AuthLayout: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#070e1c] text-slate-100 flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting and grid */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-cyan-950/30 via-[#070e1c] to-[#070e1c] pointer-events-none" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Brand Link */}
      <div className="relative z-10 mb-8 text-center">
        <Link to="/" className="inline-flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 via-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/25 group-hover:scale-105 transition-transform">
            <Activity className="w-6 h-6 text-white" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-white font-mono">
            Currency<span className="text-cyan-400">Lens</span>
          </span>
        </Link>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Institutional Foreign Exchange Intelligence Terminal
        </p>
      </div>

      {/* Auth Card Container */}
      <div className="relative z-10 w-full max-w-md">
        <Outlet />
      </div>

      {/* Bottom Features */}
      <div className="relative z-10 mt-8 flex items-center gap-6 text-[11px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Supabase Auth & RLS</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Low-Latency Real-Time Feeds</span>
        </div>
      </div>
    </div>
  );
};
