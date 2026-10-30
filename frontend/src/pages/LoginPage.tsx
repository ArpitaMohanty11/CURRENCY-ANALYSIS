import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/useAuthStore';
import { Lock, Mail, ArrowRight, ShieldCheck, UserCheck } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, isLoading, error } = useAuthStore();

  const [email, setEmail] = useState('trader@currencyanalysis.com');
  const [password, setPassword] = useState('trader123');
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleQuickLogin = async (role: 'trader' | 'admin') => {
    const creds = role === 'admin'
      ? { e: 'admin@currencyanalysis.com', p: 'admin123' }
      : { e: 'trader@currencyanalysis.com', p: 'trader123' };
    setEmail(creds.e); 
    setPassword(creds.p);
    const ok = await login(creds.e, creds.p);
    if (ok) {
      navigate('/dashboard');
    }
  };

  const handleGoogleLogin = async () => {
    setGoogleLoading(true);
    try {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      // Browser will redirect — no further action needed here
    } catch {
      setGoogleLoading(false);
    }
  };

  return (
    <div className="glass-panel p-8 rounded-2xl border border-[#1c2a47] shadow-2xl">
      <div className="mb-6 text-center">
        <h2 className="text-2xl font-bold text-white tracking-tight">Access Terminal</h2>
        <p className="text-xs text-slate-400 font-mono mt-1">
          Authenticate using your institutional credentials
        </p>
      </div>

      {/* Quick Demo Fillers */}
      <div className="mb-6 p-3 rounded-xl bg-[#070e1c] border border-[#1c2a47]">
        <div className="text-[10px] font-mono text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" />
          <span>Instant One-Click Demo Access</span>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => handleQuickLogin('trader')}
            className="px-3 py-2 rounded-lg bg-[#111d33] hover:bg-[#1a2c4e] border border-[#1c2a47] text-xs font-mono text-cyan-300 font-semibold transition-all text-left"
          >
            <div>Trader Desk</div>
            <div className="text-[10px] text-slate-500 font-normal">trader@currencyanalysis</div>
          </button>
          <button
            type="button"
            onClick={() => handleQuickLogin('admin')}
            className="px-3 py-2 rounded-lg bg-[#111d33] hover:bg-[#1a2c4e] border border-[#1c2a47] text-xs font-mono text-amber-300 font-semibold transition-all text-left"
          >
            <div>Admin Terminal</div>
            <div className="text-[10px] text-slate-500 font-normal">admin@currencyanalysis</div>
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs font-mono">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Work Email</label>
          <div className="relative">
            <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-[#070e1c] border border-[#1c2a47] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="trader@institution.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-mono text-slate-400 mb-1.5 uppercase">Security Password</label>
          <div className="relative">
            <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-[#070e1c] border border-[#1c2a47] rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full mt-2 py-3 rounded-xl bg-linear-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-black font-mono font-bold text-xs shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
        >
          {isLoading ? (
            <span>Connecting Terminal...</span>
          ) : (
            <>
              <span>AUTHENTICATE & ENTER</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      {/* Divider */}
      <div className="my-5 flex items-center gap-3">
        <div className="flex-1 h-px bg-[#1c2a47]" />
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">or</span>
        <div className="flex-1 h-px bg-[#1c2a47]" />
      </div>

      {/* Google OAuth Button */}
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={googleLoading}
        className="w-full py-2.5 rounded-xl bg-[#070e1c] hover:bg-[#111d33] border border-[#1c2a47] hover:border-slate-500 text-white text-xs font-mono font-semibold flex items-center justify-center gap-2.5 transition-all disabled:opacity-50"
      >
        {googleLoading ? (
          <>
            <div className="w-3.5 h-3.5 border border-white border-t-transparent rounded-full animate-spin" />
            <span>Redirecting to Google…</span>
          </>
        ) : (
          <>
            {/* Google "G" logo */}
            <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            <span>Continue with Google</span>
          </>
        )}
      </button>

      <div className="mt-6 pt-4 border-t border-[#1c2a47] text-center text-xs text-slate-400">
        New institutional member?{' '}
        <Link to="/register" className="text-cyan-400 hover:underline font-semibold font-mono">
          Register New Account
        </Link>
      </div>
    </div>
  );
};
