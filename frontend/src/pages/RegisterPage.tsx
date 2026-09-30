import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Lock, Mail, User, ArrowRight, ShieldCheck } from 'lucide-react';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { register, isLoading, error } = useAuthStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'trader' | 'analyst'>('trader');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await register({
      full_name: fullName,
      email,
      password,
      role,
    });
    if (success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="glass-panel p-8 rounded-2xl border border-[#1c2a47] shadow-2xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Register Terminal Account</h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Deploy an institutional workspace with full API access
        </p>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Full Legal Name</label>
          <div className="relative">
            <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full bg-[#070e1c] border border-[#1c2a47] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="e.g. Dharmendra Vance"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Corporate Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#070e1c] border border-[#1c2a47] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="trader@institution.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Password (min 6 characters)</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#070e1c] border border-[#1c2a47] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="••••••••"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Terminal Role Profile</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setRole('trader')}
              className={`p-2.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
                role === 'trader'
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                  : 'bg-[#070e1c] border-[#1c2a47] text-slate-400'
              }`}
            >
              FX Trader
            </button>
            <button
              type="button"
              onClick={() => setRole('analyst')}
              className={`p-2.5 rounded-xl border text-xs font-mono font-semibold transition-all ${
                role === 'analyst'
                  ? 'bg-cyan-500/10 border-cyan-500 text-cyan-300'
                  : 'bg-[#070e1c] border-[#1c2a47] text-slate-400'
              }`}
            >
              Macro Analyst
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <span>Creating Workspace...</span>
          ) : (
            <>
              <span>CREATE ACCOUNT & LAUNCH</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6 pt-4 border-t border-[#1c2a47] text-center text-xs text-slate-400">
        Already registered?{' '}
        <Link to="/login" className="text-cyan-400 hover:underline font-semibold font-mono">
          Sign In Here
        </Link>
      </div>
    </div>
  );
};
