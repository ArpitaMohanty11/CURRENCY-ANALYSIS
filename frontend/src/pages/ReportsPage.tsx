import React, { useState, useEffect } from 'react';
import { useWatchlistStore } from '../store/useWatchlistStore';
import { useCurrencyStore } from '../store/useCurrencyStore';
import { api } from '../services/api';
import {
  FileText,
  Download,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  Printer,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const ReportsPage: React.FC = () => {
  const { reports, fetchReports, generateReport } = useWatchlistStore();
  const { rates } = useCurrencyStore();

  const [title, setTitle] = useState('Institutional Daily FX & Macro Brief');
  const [reportType, setReportType] = useState('DAILY_WRAP');
  const [format, setFormat] = useState('PDF');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchReports();
  }, []);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      await generateReport(title, reportType, format);
      setTitle('Macro FX Liquidity & Volatility Digest');
    } catch (err) {
      console.error('Failed to generate report:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExportLivePDF = (reportTitle: string = 'Currency Analysis Daily FX Report') => {
    const doc = new jsPDF();

    // Dark sleek header
    doc.setFillColor(7, 14, 28);
    doc.rect(0, 0, 210, 40, 'F');

    doc.setTextColor(6, 182, 212);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Currency Analysis', 14, 20);

    doc.setTextColor(241, 245, 249);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('INSTITUTIONAL FOREIGN EXCHANGE INTELLIGENCE TERMINAL', 14, 28);

    doc.setFontSize(8);
    doc.setTextColor(148, 163, 184);
    doc.text(`Generated: ${new Date().toUTCString()}`, 140, 28);

    // Section Title
    doc.setFontSize(14);
    doc.setTextColor(15, 23, 42);
    doc.setFont('helvetica', 'bold');
    doc.text(reportTitle, 14, 52);

    // Market Overview
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(71, 85, 105);
    doc.text(
      'This institutional brief encapsulates real-time exchange rates, market volatility, and order flow metrics across G10 and major currency pairs.',
      14,
      60
    );

    // Rates Table
    const tableRows = rates.slice(0, 15).map((r) => [
      r.pair,
      r.rate.toFixed(4),
      r.bid.toFixed(4),
      r.ask.toFixed(4),
      `${r.change_pct_24h >= 0 ? '+' : ''}${r.change_pct_24h.toFixed(2)}%`,
      r.high_24h.toFixed(4),
      r.low_24h.toFixed(4),
    ]);

    autoTable(doc, {
      startY: 68,
      head: [['Currency Cross', 'Spot Rate', 'Bid', 'Ask', '24h Change', '24h High', '24h Low']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [12, 21, 39], textColor: [6, 182, 212], fontStyle: 'bold' },
      styles: { fontSize: 8, font: 'helvetica' },
    });

    // Save PDF
    doc.save(`${reportTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`);
  };

  const handleDownloadCSV = () => {
    window.open(api.reports.getCsvUrl(), '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#1c2a47] pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-white flex items-center gap-2.5">
            <span>Intelligence Reports & Executive Exports</span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950/80 border border-cyan-800 text-cyan-300">
              PDF & CSV COMPLIANT
            </span>
          </h1>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Institutional summaries, compliance audit logs, and automated risk analysis digests
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadCSV}
            className="px-3.5 py-2 rounded-xl bg-[#0c1527] hover:bg-[#14213d] border border-[#1c2a47] text-xs font-mono text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Live CSV</span>
          </button>
          <button
            onClick={() => handleExportLivePDF()}
            className="px-3.5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-mono font-bold flex items-center gap-1.5 shadow-md shadow-cyan-500/20 transition-all"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Export Instant PDF</span>
          </button>
        </div>
      </div>

      {/* Generator Card */}
      <div className="glass-panel p-5 rounded-2xl border border-[#1c2a47]">
        <div className="flex items-center gap-2 pb-3 mb-4 border-b border-[#1c2a47]">
          <Sparkles className="w-4 h-4 text-cyan-400" />
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Generate Customized Intelligence Report
          </span>
        </div>

        <form onSubmit={handleGenerate} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
          <div className="lg:col-span-2">
            <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Report Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#070e1c] border border-[#1c2a47] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] font-mono text-slate-400 uppercase mb-1">Report Category</label>
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="w-full bg-[#070e1c] border border-[#1c2a47] rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
            >
              <option value="DAILY_WRAP">Daily FX Market Wrap</option>
              <option value="WEEKLY_VOLATILITY">Weekly Volatility Index</option>
              <option value="CORRELATION_MATRIX">Cross-Asset Correlation</option>
              <option value="CURRENCY_PERFORMANCE">G10 Performance Summary</option>
            </select>
          </div>

          <div>
            <button
              type="submit"
              disabled={isGenerating}
              className="w-full py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-mono font-bold text-xs shadow-md shadow-cyan-500/20 flex items-center justify-center gap-1.5 transition-all disabled:opacity-50"
            >
              {isGenerating ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Compiling...</span>
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4" />
                  <span>GENERATE REPORT</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Historical Generated Reports Archive */}
      <div className="glass-panel p-5 rounded-2xl border border-[#1c2a47]">
        <div className="flex items-center justify-between border-b border-[#1c2a47] pb-3 mb-4">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-slate-300">
            Generated Reports Archive ({reports.length})
          </span>
          <span className="text-[10px] font-mono text-slate-400">Institutional Cloud Repository</span>
        </div>

        <div className="space-y-3">
          {reports.map((report) => (
            <div
              key={report.id}
              className="p-4 rounded-xl bg-[#070e1c] border border-[#1c2a47] hover:border-cyan-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-cyan-950/80 border border-cyan-800 text-cyan-400 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-mono font-bold text-xs text-white">{report.title}</h3>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400 mt-0.5">
                    <span>Type: {report.report_type}</span>
                    <span>·</span>
                    <span>Format: {report.format}</span>
                    <span>·</span>
                    <span>Status: <span className="text-emerald-400 font-bold">{report.status}</span></span>
                    <span>·</span>
                    <span>{new Date(report.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleExportLivePDF(report.title)}
                  className="px-3 py-1.5 rounded-lg bg-[#111d33] hover:bg-[#1a2c4e] border border-[#1c2a47] text-xs font-mono text-cyan-300 font-semibold flex items-center gap-1.5 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
