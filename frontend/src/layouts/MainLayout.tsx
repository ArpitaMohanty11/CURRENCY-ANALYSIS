import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '../components/Header';
import { Sidebar } from '../components/Sidebar';
import { TickerTape } from '../components/TickerTape';
import { useCurrencyStore } from '../store/useCurrencyStore';

export const MainLayout: React.FC = () => {
  const { startLiveUpdates } = useCurrencyStore();

  useEffect(() => {
    const cleanup = startLiveUpdates();
    return cleanup;
  }, []);

  return (
    <div className="min-h-screen bg-[#070e1c] text-slate-100 flex flex-col font-sans">
      <Header />
      <TickerTape />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 lg:p-6 bg-gradient-to-b from-[#070e1c] via-[#081020] to-[#070e1c]">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
