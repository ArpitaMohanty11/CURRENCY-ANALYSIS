import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from '../store/useAuthStore';

/**
 * AuthCallbackPage
 * Supabase redirects the user here after the Google OAuth flow completes.
 * We pick up the session, forward the Supabase access token to our backend,
 * and let the backend issue its own app JWT before redirecting to /dashboard.
 */
export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { loginWithGoogle } = useAuthStore();
  const [statusMsg, setStatusMsg] = useState('Completing sign-in…');

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase writes the session into the URL hash / search params.
        // getSession() resolves it from there automatically.
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error || !session?.access_token) {
          setStatusMsg('Authentication failed. Redirecting…');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        setStatusMsg('Verifying identity…');
        const success = await loginWithGoogle(session.access_token);

        if (success) {
          navigate('/dashboard', { replace: true });
        } else {
          setStatusMsg('Sign-in failed. Redirecting…');
          setTimeout(() => navigate('/login'), 2000);
        }
      } catch {
        setStatusMsg('Unexpected error. Redirecting…');
        setTimeout(() => navigate('/login'), 2000);
      }
    };

    handleCallback();
  }, [loginWithGoogle, navigate]);

  return (
    <div className="min-h-screen bg-[#040c18] flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* Spinner */}
        <div className="w-10 h-10 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm font-mono text-slate-400">{statusMsg}</p>
      </div>
    </div>
  );
};
