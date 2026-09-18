import React, { useState, useEffect, useMemo } from 'react';
import { PerformanceReport } from '../types';
import { mockDb } from '../services/mockDb';
import { useAuth } from '../context/AuthContext';
import { 
  TrendingUp, BarChart3, Download, Users, 
  Phone, MessageSquare, MapPin, DollarSign, 
  CheckCircle2, XCircle, ArrowRight, Award, PieChart, 
  Filter, Calendar, Printer, ShieldCheck, User, ChevronRight, FileSpreadsheet
} from 'lucide-react';
import { motion } from 'framer-motion';

export const PerformanceReports: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Filter Mode: 'monthly' | 'custom_date'
  const [filterMode, setFilterMode] = useState<'monthly' | 'custom_date'>('monthly');

  // Monthly mode states
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());

  // Date range custom states
  const [startDate, setStartDate] = useState<string>(() => {
    const d = new Date();
    d.setDate(1);
    return d.toISOString().split('T')[0];
  });
  const [endDate, setEndDate] = useState<string>(() => {
    return new Date().toISOString().split('T')[0];
  });

  // Selected Agent for Admin view (locked to user.id for agents)
  const [selectedAgentId, setSelectedAgentId] = useState<string>(isAdmin ? 'all' : (user?.id || 'agent-1'));
  const [agentsList, setAgentsList] = useState<{ id: string; name: string }[]>([]);

  const [report, setReport] = useState<PerformanceReport | null>(null);
  const [activeSubTab, setActiveSubTab] = useState<'agents' | 'funnel' | 'lost'>('agents');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Calculate actual startDate and endDate based on filterMode
  const computedDateRange = useMemo(() => {
    if (filterMode === 'monthly') {
      const start = new Date(selectedYear, selectedMonth, 1);
      const end = new Date(selectedYear, selectedMonth + 1, 0);
      return {
        startDate: start.toISOString().split('T')[0],
        endDate: end.toISOString().split('T')[0],
        label: `${months[selectedMonth]} ${selectedYear}`
      };
    } else {
      return {
        startDate,
        endDate,
        label: `${startDate} to ${endDate}`
      };
    }
  }, [filterMode, selectedYear, selectedMonth, startDate, endDate]);

  const loadData = async () => {
    setIsLoading(true);
    // RBAC: If agent, strictly pass agentId to fetch only their metrics
    const agentFilter = isAdmin ? (selectedAgentId === 'all' ? undefined : selectedAgentId) : user?.id;

    const [data, fetchedAgents] = await Promise.all([
      mockDb.getPerformanceReport({
        startDate: computedDateRange.startDate,
        endDate: computedDateRange.endDate,
        agentId: agentFilter
      }),
      mockDb.getAgents()
    ]);

    setReport(data);
    setAgentsList(fetchedAgents.map(a => ({ id: a.id, name: a.name })));
    setIsLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [computedDateRange.startDate, computedDateRange.endDate, selectedAgentId, user?.id]);

  const formatCurrency = (val: number) => {
    if (val >= 10000000) return `৳${(val / 10000000).toFixed(2)} Cr`;
    if (val >= 100000) return `৳${(val / 100000).toFixed(2)} Lac`;
    if (val >= 1000) return `৳${(val / 1000).toFixed(0)}K`;
    return `৳${val.toLocaleString()}`;
  };

  const handleExportCSV = () => {
    if (!report) return;

    const headers = [
      'Agent Name',
      'Leads Assigned',
      'Calls Completed',
      'WhatsApp Sent',
      'Site Visits Done',
      'Visit Hours',
      'Negotiations',
      'Deals Won',
      'Deals Lost',
      'Total Sales Volume (BDT)',
      'Conversion Rate (%)'
    ];

    const rows = report.agents.map((a: any) => [
      `"${a.agentName}"`,
      a.leadsAssigned,
      a.callsCompleted,
      a.whatsappSent,
      a.siteVisitsCompleted,
      a.siteVisitHours,
      a.negotiationsConducted,
      a.dealsWon,
      a.dealsLost,
      a.totalSalesValue,
      `${Number(a.conversionRate || 0).toFixed(1)}%`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [
      `# RIDGE PARK CRM - PERFORMANCE REPORT (${computedDateRange.label})`,
      `# Generated On: ${new Date().toLocaleString()}`,
      `# Scope: ${isAdmin ? (selectedAgentId === 'all' ? 'All Agents' : 'Selected Agent') : user?.name}`,
      '',
      headers.join(','),
      ...rows.map((e: any[]) => e.join(','))
    ].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `RidgePark_Performance_${computedDateRange.startDate}_to_${computedDateRange.endDate}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  // Quick Presets for Custom Date Range
  const setQuickRange = (preset: 'today' | 'last7' | 'last30' | 'thisQuarter' | 'thisYear') => {
    const today = new Date();
    const endStr = today.toISOString().split('T')[0];
    let start = new Date();

    switch (preset) {
      case 'today':
        break;
      case 'last7':
        start.setDate(today.getDate() - 7);
        break;
      case 'last30':
        start.setDate(today.getDate() - 30);
        break;
      case 'thisQuarter': {
        const qMonth = Math.floor(today.getMonth() / 3) * 3;
        start = new Date(today.getFullYear(), qMonth, 1);
        break;
      }
      case 'thisYear':
        start = new Date(today.getFullYear(), 0, 1);
        break;
    }

    setStartDate(start.toISOString().split('T')[0]);
    setEndDate(endStr);
    setFilterMode('custom_date');
  };

  if (!report && isLoading) {
    return (
      <div className="h-96 flex items-center justify-center text-zinc-400 text-sm">
        Generating Date-Wise Performance Metrics...
      </div>
    );
  }

  if (!report) {
    return (
      <div className="h-96 flex items-center justify-center text-zinc-500 text-sm">
        No performance report data found for the selected period.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Title & Top Actions Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white font-display">
              Performance Analytics & Appraisal Reports
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              {isAdmin ? 'Management Executive View' : 'My Personal Appraisal'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Period: <strong className="text-emerald-400">{computedDateRange.label}</strong> • Analyze sales conversions, call frequency, site visit velocity, and loss root causes.
          </p>
        </div>

        {/* Download & Print Buttons */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold border border-zinc-700 transition-all shadow-md"
          >
            <FileSpreadsheet size={14} className="text-emerald-400" /> Export Excel/CSV
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 text-xs font-bold border border-zinc-700 transition-all shadow-md"
          >
            <Printer size={14} className="text-blue-400" /> Print / Save PDF
          </button>
        </div>
      </div>

      {/* FILTER CONTROL CARD: Monthly Wise vs Custom Date Wise */}
      <div className="p-4 bg-zinc-950/90 rounded-2xl border border-zinc-800/80 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-3 border-b border-zinc-800/80">
          
          {/* Mode Tabs */}
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800 w-fit">
            <button
              onClick={() => setFilterMode('monthly')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'monthly' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Calendar size={13} /> Monthly Wise
            </button>
            <button
              onClick={() => setFilterMode('custom_date')}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filterMode === 'custom_date' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Filter size={13} /> Date Range Wise
            </button>
          </div>

          {/* Quick Range Presets (when in Date Range mode) */}
          {filterMode === 'custom_date' && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-zinc-500 mr-1">Presets:</span>
              <button onClick={() => setQuickRange('today')} className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[11px] rounded-lg text-zinc-300">Today</button>
              <button onClick={() => setQuickRange('last7')} className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[11px] rounded-lg text-zinc-300">Last 7D</button>
              <button onClick={() => setQuickRange('last30')} className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[11px] rounded-lg text-zinc-300">Last 30D</button>
              <button onClick={() => setQuickRange('thisQuarter')} className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[11px] rounded-lg text-zinc-300">Quarter</button>
              <button onClick={() => setQuickRange('thisYear')} className="px-2 py-1 bg-zinc-900 hover:bg-zinc-800 text-[11px] rounded-lg text-zinc-300">This Year</button>
            </div>
          )}

          {/* Agent Selector (Admin only) */}
          {isAdmin ? (
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
              <User size={13} className="text-zinc-400" />
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-zinc-900 text-white">All Agents (Team Funnel)</option>
                {agentsList.map(a => (
                  <option key={a.id} value={a.id} className="bg-zinc-900 text-white">
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-zinc-900/60 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs text-zinc-300">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Restricted To: <strong className="text-white">{user?.name}</strong></span>
            </div>
          )}
        </div>

        {/* Dynamic Controls based on Filter Mode */}
        {filterMode === 'monthly' ? (
          <div className="space-y-3">
            {/* Year Selector */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-zinc-400 font-bold">Year:</span>
              {[2024, 2025, 2026, 2027].map(yr => (
                <button
                  key={yr}
                  onClick={() => setSelectedYear(yr)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                    selectedYear === yr
                      ? 'bg-zinc-800 text-white border border-white/20'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {yr}
                </button>
              ))}
            </div>

            {/* Month Pills */}
            <div className="grid grid-cols-3 sm:grid-cols-6 lg:grid-cols-12 gap-1.5">
              {months.map((mName, idx) => (
                <button
                  key={mName}
                  onClick={() => setSelectedMonth(idx)}
                  className={`py-1.5 px-2 rounded-xl text-xs font-semibold transition-all text-center truncate ${
                    selectedMonth === idx
                      ? 'bg-red-600 text-white font-bold shadow-md shadow-red-600/30 ring-1 ring-red-400'
                      : 'bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200'
                  }`}
                >
                  {mName.slice(0, 3)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          /* Custom Date Range Pickers */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold text-zinc-400 uppercase tracking-wider mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>
          </div>
        )}
      </div>

      {/* SUMMARY KPI ROW FOR CHOSEN DATE PERIOD */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
          <span className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider block">Pipeline Leads</span>
          <span className="text-xl font-bold text-white mt-1 block">{report.totalLeads}</span>
        </div>

        <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
          <span className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider block">Closed Won Deals</span>
          <span className="text-xl font-bold text-emerald-400 mt-1 block">{report.totalWonDeals}</span>
        </div>

        <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
          <span className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider block">Sales Volume</span>
          <span className="text-xl font-bold text-white mt-1 block">{formatCurrency(report.totalSalesVolume)}</span>
        </div>

        <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
          <span className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider block">Avg Deal Size</span>
          <span className="text-xl font-bold text-zinc-200 mt-1 block">{formatCurrency(report.averageDealSize)}</span>
        </div>

        <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
          <span className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider block">Site Visits Done</span>
          <span className="text-xl font-bold text-blue-400 mt-1 block">{report.totalSiteVisits}</span>
        </div>

        <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
          <span className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider block">Conversion Rate</span>
          <span className="text-xl font-bold text-purple-400 mt-1 block">{Number(report.overallConversionRate || 0).toFixed(1)}%</span>
        </div>
      </div>

      {/* Sub-Tab Selector */}
      <div className="flex bg-zinc-900/60 p-1 rounded-2xl border border-zinc-800 w-fit">
        <button
          onClick={() => setActiveSubTab('agents')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'agents' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Award size={14} /> {isAdmin ? 'Agent Leaderboard & Scorecards' : 'My Performance Scorecard'}
        </button>
        <button
          onClick={() => setActiveSubTab('funnel')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'funnel' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <BarChart3 size={14} /> 11-Stage Conversion Funnel
        </button>
        <button
          onClick={() => setActiveSubTab('lost')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
            activeSubTab === 'lost' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <XCircle size={14} /> Deal Loss Root-Cause Analysis
        </button>
      </div>

      {/* TAB CONTENT 1: AGENT SCORECARDS / LEADERBOARD */}
      {activeSubTab === 'agents' && (
        <div className="bg-zinc-950/90 rounded-2xl border border-zinc-800/80 shadow-xl overflow-hidden">
          <div className="p-4 border-b border-zinc-800/80 flex items-center justify-between">
            <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
              <Award size={16} className="text-amber-400" />
              {isAdmin ? 'Agent Activity & Conversion Performance Matrix' : 'My Individual Performance Metrics'}
            </h3>
            <span className="text-xs text-zinc-400 font-mono">
              Period: {computedDateRange.label}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/80 text-zinc-400 text-[10px] uppercase font-bold tracking-wider border-b border-zinc-800">
                <tr>
                  <th className="py-3.5 px-4">Agent Name</th>
                  <th className="py-3.5 px-4 text-center">Leads Assigned</th>
                  <th className="py-3.5 px-4 text-center">Calls</th>
                  <th className="py-3.5 px-4 text-center">WhatsApp</th>
                  <th className="py-3.5 px-4 text-center">Site Visits (Hrs)</th>
                  <th className="py-3.5 px-4 text-center">Negotiations</th>
                  <th className="py-3.5 px-4 text-center">Won / Lost</th>
                  <th className="py-3.5 px-4 text-right">Sales Volume</th>
                  <th className="py-3.5 px-4 text-right">Conversion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/50">
                {report.agents.map((ag: any, idx: number) => {
                  return (
                    <tr key={ag.agentId || idx} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-white flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700 flex items-center justify-center text-[11px] text-zinc-300">
                          {idx + 1}
                        </div>
                        <div>
                          <span>{ag.agentName}</span>
                          {ag.agentId === user?.id && (
                            <span className="ml-2 px-1.5 py-0.2 text-[9px] font-bold rounded bg-red-950 text-red-400 border border-red-500/30">
                              You
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center text-zinc-300 font-semibold">{ag.leadsAssigned}</td>
                      <td className="py-3.5 px-4 text-center text-amber-400 font-semibold">{ag.callsCompleted}</td>
                      <td className="py-3.5 px-4 text-center text-emerald-400 font-semibold">{ag.whatsappSent}</td>
                      <td className="py-3.5 px-4 text-center text-blue-400 font-semibold">{ag.siteVisitsCompleted} ({ag.siteVisitHours}h)</td>
                      <td className="py-3.5 px-4 text-center text-yellow-400 font-semibold">{ag.negotiationsConducted}</td>
                      <td className="py-3.5 px-4 text-center font-bold">
                        <span className="text-emerald-400">{ag.dealsWon}</span> / <span className="text-red-400">{ag.dealsLost}</span>
                      </td>
                      <td className="py-3.5 px-4 text-right font-bold text-white">{formatCurrency(ag.totalSalesValue)}</td>
                      <td className="py-3.5 px-4 text-right">
                        <span className="px-2.5 py-1 rounded-full bg-purple-950/80 text-purple-300 font-bold border border-purple-500/20">
                          {Number(ag.conversionRate || 0).toFixed(1)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: 11-STAGE FUNNEL */}
      {activeSubTab === 'funnel' && (
        <div className="bg-zinc-950/90 rounded-2xl border border-zinc-800/80 shadow-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div>
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <BarChart3 size={16} className="text-blue-400" />
                Comprehensive 11-Stage Pipeline Conversion Funnel
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Drop-off analysis from initial lead creation through property walkthroughs, negotiations, and contract closure.
              </p>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Period: {computedDateRange.label}</span>
          </div>

          <div className="space-y-3 pt-2">
            {report.stageFunnel?.map((st: any, idx: number) => {
              const maxLeads = report.totalLeads > 0 ? report.totalLeads : 1;
              const percentage = (st.count / maxLeads) * 100;
              const widthPct = Math.max(8, Math.min(100, percentage));

              return (
                <div key={st.stage} className="space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-zinc-300 font-bold flex items-center gap-2">
                      <span className="text-[10px] text-zinc-500 font-mono w-4">{idx + 1}.</span>
                      {st.stage}
                    </span>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white">{st.count} leads</span>
                      <span className="text-zinc-400 text-[11px] font-mono">({percentage.toFixed(1)}%)</span>
                    </div>
                  </div>

                  <div className="h-3.5 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${widthPct}%` }}
                      transition={{ duration: 0.5, delay: idx * 0.05 }}
                      className={`h-full rounded-full ${
                        st.stage.includes('Won')
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                          : st.stage.includes('Lost')
                          ? 'bg-gradient-to-r from-red-600 to-red-500'
                          : 'bg-gradient-to-r from-blue-600 to-red-600'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: LOST REASONS ROOT CAUSE */}
      {activeSubTab === 'lost' && (
        <div className="bg-zinc-950/90 rounded-2xl border border-zinc-800/80 shadow-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
            <div>
              <h3 className="text-sm font-bold text-white font-display flex items-center gap-2">
                <XCircle size={16} className="text-red-400" />
                Deal Loss Root-Cause Breakdown
              </h3>
              <p className="text-xs text-zinc-400 mt-0.5">
                Understand why leads dropped off to refine sales training, project pricing, and property marketing.
              </p>
            </div>
            <span className="text-xs text-zinc-400 font-mono">Period: {computedDateRange.label}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-2">
            {Object.entries(report.lostReasonBreakdown || {}).length === 0 ? (
              <div className="col-span-3 text-center py-8 text-zinc-500 text-xs">
                No lost deal reasons recorded for this period.
              </div>
            ) : (
              Object.entries(report.lostReasonBreakdown || {}).map(([reason, count]) => {
                const totalLost = Object.values(report.lostReasonBreakdown || {}).reduce((a, b) => a + b, 0) || 1;
                const percentage = ((count as number) / totalLost) * 100;

                return (
                  <div key={reason} className="p-4 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-2">
                    <div className="flex justify-between items-start">
                      <h4 className="text-xs font-bold text-zinc-200 capitalize">{reason.replace(/_/g, ' ')}</h4>
                      <span className="px-2 py-0.5 rounded-full bg-red-950 text-red-400 text-[10px] font-bold border border-red-500/20">
                        {count} Deals
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-[11px] text-zinc-400">
                      <span>Share of Lost:</span>
                      <span className="font-bold text-white font-mono">{percentage.toFixed(1)}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-950 rounded-full overflow-hidden">
                      <div className="h-full bg-red-600 rounded-full" style={{ width: `${percentage}%` }} />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};
