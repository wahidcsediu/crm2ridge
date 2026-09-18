import React, { useState, useEffect, useMemo } from 'react';
import { ActivityLog, DailyActivityReport, ActivityType, CalendarEvent, HolidayOrLeave } from '../types';
import { mockDb } from '../services/mockDb';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar as CalendarIcon, Clock, Phone, MessageSquare, MapPin, 
  DollarSign, FileText, CheckCircle2, Star, Filter, Plus, 
  ChevronLeft, ChevronRight, User, ShieldCheck, TrendingUp,
  AlertCircle, Building, Award, Search, Check, X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const AgentActivities: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  // Selected Agent filter (locked to user.id if agent)
  const [selectedAgentId, setSelectedAgentId] = useState<string>(isAdmin ? 'all' : (user?.id || 'agent-1'));
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);

  // Calendar State
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

  // Data States
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [dars, setDars] = useState<DailyActivityReport[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [holidays, setHolidays] = useState<HolidayOrLeave[]>([]);
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');

  // Modals
  const [isDarModalOpen, setIsDarModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [reviewingDar, setReviewingDar] = useState<DailyActivityReport | null>(null);
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewComments, setReviewComments] = useState('');

  // DAR Form fields
  const [darCheckIn, setDarCheckIn] = useState('09:00 AM');
  const [darCheckOut, setDarCheckOut] = useState('06:00 PM');
  const [darCalls, setDarCalls] = useState(15);
  const [darWa, setDarWa] = useState(20);
  const [darVisits, setDarVisits] = useState(2);
  const [darVisitHours, setDarVisitHours] = useState(3);
  const [darNegotiations, setDarNegotiations] = useState(1);
  const [darDeals, setDarDeals] = useState(0);
  const [darSummary, setDarSummary] = useState('');
  const [darKeyAccomplishments, setDarKeyAccomplishments] = useState('');
  const [darPending, setDarPending] = useState('');

  // Schedule Visit / Event Form fields
  const [evTitle, setEvTitle] = useState('');
  const [evType, setEvType] = useState<'site_visit' | 'call' | 'meeting'>('site_visit');
  const [evTime, setEvTime] = useState('11:00 AM');
  const [evClient, setEvClient] = useState('');
  const [evProject, setEvProject] = useState('');
  const [evNotes, setEvNotes] = useState('');

  const loadData = async () => {
    // RBAC: If agent, strictly pass agentId to fetch only their activities & data
    const agentFilter = isAdmin ? (selectedAgentId === 'all' ? undefined : selectedAgentId) : user?.id;

    const [allActs, allDars, allEvents, allHolidays, allAgents] = await Promise.all([
      mockDb.getActivities({ agentId: agentFilter }),
      mockDb.getDARs(),
      mockDb.getCalendarEvents(),
      mockDb.getHolidaysAndLeaves(),
      mockDb.getAgents()
    ]);

    setActivities(allActs);
    setAgents(allAgents.map(a => ({ id: a.id, name: a.name })));

    // Filter DARs and Events by RBAC
    if (isAdmin) {
      if (selectedAgentId !== 'all') {
        setDars(allDars.filter(d => d.agentId === selectedAgentId));
        setEvents(allEvents.filter(e => e.agentId === selectedAgentId));
      } else {
        setDars(allDars);
        setEvents(allEvents);
      }
    } else {
      setDars(allDars.filter(d => d.agentId === user?.id));
      setEvents(allEvents.filter(e => e.agentId === user?.id));
    }

    setHolidays(allHolidays);
  };

  useEffect(() => {
    loadData();
  }, [selectedAgentId, user?.id]);

  // Calendar Calculation for Month View
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDateStr(today.toISOString().split('T')[0]);
  };

  // Month Statistics for Live Fair Working Days
  const monthHolidays = holidays.filter(h => {
    const start = new Date(h.startDate);
    return start.getFullYear() === year && start.getMonth() === month;
  });

  let weekendDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month, d).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) weekendDays++;
  }

  const publicHolidayDays = monthHolidays.filter((h: any) => h.type === 'public_holiday' || h.type === 'office_holiday' || h.type === 'public' || h.type === 'office').length;
  const leaveDays = monthHolidays.filter((h: any) => h.type === 'agent_leave' || h.type === 'vacation' || h.type === 'sick').length;
  const standardWorkingDays = Math.max(0, daysInMonth - weekendDays - publicHolidayDays);
  const effectiveWorkingDays = Math.max(0, standardWorkingDays - leaveDays);

  // Activities, Visits, and DAR for the currently selected date
  const selectedDateActivities = useMemo(() => {
    return activities.filter(act => {
      const actDate = act.timestamp ? act.timestamp.split('T')[0] : '';
      const matchDate = actDate === selectedDateStr;
      const matchType = selectedTypeFilter === 'all' || act.type === selectedTypeFilter;
      return matchDate && matchType;
    });
  }, [activities, selectedDateStr, selectedTypeFilter]);

  const selectedDateEvents = useMemo(() => {
    return events.filter(e => e.date === selectedDateStr);
  }, [events, selectedDateStr]);

  const selectedDateDar = useMemo(() => {
    return dars.find(d => d.date === selectedDateStr);
  }, [dars, selectedDateStr]);

  const handleDARSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await mockDb.submitDAR({
      agentId: user?.id || 'agent-1',
      agentName: user?.name || 'Agent',
      date: selectedDateStr,
      checkInTime: darCheckIn,
      checkOutTime: darCheckOut,
      leadsWorked: darCalls + darWa,
      callsCompleted: darCalls,
      whatsappSent: darWa,
      siteVisitsCompleted: darVisits,
      siteVisitHours: darVisitHours,
      negotiationsConducted: darNegotiations,
      dealsWon: darDeals,
      summaryNotes: darSummary || 'Client outbound calls and property walkthroughs completed.',
      keyAccomplishments: darKeyAccomplishments || 'Progressed deal discussions with prospective buyers.',
      pendingTasksTomorrow: darPending || 'Follow up with scheduled visit clients.'
    });

    setIsDarModalOpen(false);
    await loadData();
  };

  const handleScheduleVisit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitle.trim()) return;

    await mockDb.addCalendarEvent({
      title: evTitle,
      type: evType,
      date: selectedDateStr,
      time: evTime,
      clientName: evClient || undefined,
      projectName: evProject || undefined,
      agentId: user?.id || 'agent-1',
      agentName: user?.name || 'Agent',
      notes: evNotes
    });

    setIsEventModalOpen(false);
    setEvTitle('');
    setEvClient('');
    setEvProject('');
    setEvNotes('');
    await loadData();
  };

  const handleReviewDar = async (darId: string) => {
    await mockDb.reviewDAR(darId, {
      reviewedBy: user?.id || 'admin-1',
      reviewerName: user?.name || 'Manager',
      status: 'Approved',
      rating: reviewRating,
      comments: reviewComments || 'Approved with satisfactory daily progress.'
    });

    setReviewingDar(null);
    setReviewComments('');
    await loadData();
  };

  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'call': return <Phone size={14} className="text-amber-400" />;
      case 'whatsapp_message':
      case 'whatsapp_material_sent': return <MessageSquare size={14} className="text-emerald-400" />;
      case 'site_visit_scheduled':
      case 'site_visit_completed': return <MapPin size={14} className="text-blue-400" />;
      case 'negotiation': return <DollarSign size={14} className="text-yellow-400" />;
      case 'deal_closed_won': return <TrendingUp size={14} className="text-emerald-400" />;
      case 'daily_activity_report': return <FileText size={14} className="text-purple-400" />;
      default: return <Clock size={14} className="text-zinc-400" />;
    }
  };

  // Activity counts for the selected date
  const dateCallCount = selectedDateActivities.filter(a => a.type === 'call').length;
  const dateWaCount = selectedDateActivities.filter(a => a.type.startsWith('whatsapp')).length;
  const dateVisitCount = selectedDateActivities.filter(a => a.type.startsWith('site_visit')).length;
  const dateNegotiationCount = selectedDateActivities.filter(a => a.type === 'negotiation').length;

  return (
    <div className="space-y-6">
      {/* Top Header & Role Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-white font-display">
              Activity & Date-Wise Calendar
            </h1>
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-950/80 text-red-400 border border-red-500/30">
              {isAdmin ? 'System Admin (All Agents)' : 'My Agent Feed'}
            </span>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Click any date on the calendar to view logged activities, scheduled site visits, and submit or review Daily Activity Reports (DAR).
          </p>
        </div>

        {/* Action Buttons & Agent Filter */}
        <div className="flex items-center gap-3 flex-wrap">
          {isAdmin ? (
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-800">
              <User size={14} className="text-zinc-400" />
              <select
                value={selectedAgentId}
                onChange={(e) => setSelectedAgentId(e.target.value)}
                className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer"
              >
                <option value="all" className="bg-zinc-900 text-white">All Agents (Overview)</option>
                {agents.map(a => (
                  <option key={a.id} value={a.id} className="bg-zinc-900 text-white">
                    {a.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="flex items-center gap-2 bg-zinc-900/80 px-3 py-1.5 rounded-xl border border-zinc-800 text-xs text-zinc-300">
              <ShieldCheck size={14} className="text-emerald-400" />
              <span>Viewing: <strong className="text-white">{user?.name}</strong></span>
            </div>
          )}

          <button
            onClick={() => setIsEventModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md transition-all"
          >
            <Plus size={14} /> Schedule Visit
          </button>

          <button
            onClick={() => setIsDarModalOpen(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-600/20 transition-all"
          >
            <FileText size={14} /> Submit DAR
          </button>
        </div>
      </div>

      {/* Month Working Days Summary Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Month Total Days</span>
          <span className="text-lg font-bold text-white mt-0.5 block">{daysInMonth} Days</span>
        </div>
        <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Weekend Days</span>
          <span className="text-lg font-bold text-zinc-300 mt-0.5 block">{weekendDays} Days</span>
        </div>
        <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Public Holidays</span>
          <span className="text-lg font-bold text-amber-400 mt-0.5 block">{publicHolidayDays} Days</span>
        </div>
        <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Approved Leaves</span>
          <span className="text-lg font-bold text-purple-400 mt-0.5 block">{leaveDays} Days</span>
        </div>
        <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Standard Working Days</span>
          <span className="text-lg font-bold text-blue-400 mt-0.5 block">{standardWorkingDays} Days</span>
        </div>
        <div className="p-3.5 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
          <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Effective Working Days</span>
          <span className="text-lg font-bold text-emerald-400 mt-0.5 block">{effectiveWorkingDays} Days</span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN LAYOUT: Left Calendar / Right Date Deep Dive */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* LEFT: Interactive Monthly Calendar Grid (5 Columns on Large) */}
        <div className="lg:col-span-5 bg-zinc-950/90 rounded-2xl border border-zinc-800/80 p-5 shadow-xl space-y-4">
          {/* Calendar Month Navigation */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarIcon size={18} className="text-red-500" />
              <h2 className="text-base font-bold text-white font-display">
                {monthNames[month]} {year}
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Previous Month"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={handleToday}
                className="px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-bold transition-colors"
              >
                Today
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
                title="Next Month"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          {/* Day of Week Headers */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d, i) => (
              <div key={d} className={`text-[10px] font-bold uppercase py-1 ${i === 0 || i === 6 ? 'text-red-400/80' : 'text-zinc-500'}`}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Empty slots before first day of month */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-16 rounded-xl bg-zinc-900/20 border border-transparent opacity-30" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const dayNum = i + 1;
              const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
              const isSelected = dateStr === selectedDateStr;
              const isToday = dateStr === new Date().toISOString().split('T')[0];

              // Count activities on this date
              const dayActs = activities.filter(a => a.timestamp && a.timestamp.split('T')[0] === dateStr);
              const dayEvents = events.filter(e => e.date === dateStr);
              const dayDar = dars.find(d => d.date === dateStr);

              return (
                <button
                  key={dateStr}
                  onClick={() => setSelectedDateStr(dateStr)}
                  className={`h-16 p-1.5 rounded-xl text-left flex flex-col justify-between transition-all border relative ${
                    isSelected
                      ? 'bg-red-950/70 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.3)] ring-1 ring-red-500'
                      : isToday
                      ? 'bg-zinc-900/90 border-zinc-700 text-white'
                      : 'bg-zinc-900/40 hover:bg-zinc-900/80 border-zinc-800/60 text-zinc-300'
                  }`}
                >
                  <div className="flex justify-between items-center w-full">
                    <span className={`text-xs font-bold ${isSelected ? 'text-red-400' : isToday ? 'text-white' : 'text-zinc-400'}`}>
                      {dayNum}
                    </span>
                    {dayDar && (
                      <span title={`DAR ${dayDar.status || 'Submitted'}`} className="w-1.5 h-1.5 rounded-full bg-purple-400" />
                    )}
                  </div>

                  {/* Badges / Dots */}
                  <div className="flex items-center gap-1 flex-wrap">
                    {dayActs.length > 0 && (
                      <span className="px-1 py-0.2 rounded text-[9px] font-bold bg-zinc-800 text-zinc-300">
                        {dayActs.length} act
                      </span>
                    )}
                    {dayEvents.length > 0 && (
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-400" title={`${dayEvents.length} scheduled visits`} />
                    )}
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-purple-400" /> DAR Logged
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-blue-400" /> Scheduled Visit
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-red-500" /> Selected Day
            </span>
          </div>
        </div>

        {/* RIGHT: Selected Date Deep Dive Timeline & Activity Stream (7 Columns) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Selected Date Header & Quick Summary */}
          <div className="p-4 bg-zinc-950/90 rounded-2xl border border-zinc-800/80 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-red-500" />
                <h3 className="text-base font-bold text-white font-display">
                  {new Date(selectedDateStr + 'T00:00:00').toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                {selectedDateActivities.length} activities logged • {selectedDateEvents.length} scheduled visits • {selectedDateDar ? `DAR Status: ${selectedDateDar.status || 'Submitted'}` : 'No DAR submitted'}
              </p>
            </div>

            {/* Quick Filter */}
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-zinc-500" />
              <select
                value={selectedTypeFilter}
                onChange={(e) => setSelectedTypeFilter(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-200 rounded-xl px-2.5 py-1.5 focus:outline-none focus:border-red-500"
              >
                <option value="all">All Types</option>
                <option value="call">Phone Calls</option>
                <option value="whatsapp_message">WhatsApp Messages</option>
                <option value="site_visit_completed">Site Visits Done</option>
                <option value="negotiation">Negotiations</option>
                <option value="deal_closed_won">Deals Won</option>
              </select>
            </div>
          </div>

          {/* Quick KPI stats on selected date */}
          <div className="grid grid-cols-4 gap-2">
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 text-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Calls</span>
              <span className="text-base font-bold text-amber-400 mt-0.5 block">{dateCallCount}</span>
            </div>
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 text-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">WhatsApp</span>
              <span className="text-base font-bold text-emerald-400 mt-0.5 block">{dateWaCount}</span>
            </div>
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 text-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Visits</span>
              <span className="text-base font-bold text-blue-400 mt-0.5 block">{dateVisitCount}</span>
            </div>
            <div className="p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 text-center">
              <span className="text-[10px] text-zinc-500 uppercase font-bold block">Negotiations</span>
              <span className="text-base font-bold text-yellow-400 mt-0.5 block">{dateNegotiationCount}</span>
            </div>
          </div>

          {/* Scheduled Events & Site Visits for this date */}
          {selectedDateEvents.length > 0 && (
            <div className="p-4 bg-blue-950/20 rounded-2xl border border-blue-500/20 space-y-2">
              <span className="text-xs font-bold text-blue-400 flex items-center gap-1.5">
                <MapPin size={14} /> Scheduled Visits & Calendar Events ({selectedDateEvents.length})
              </span>
              <div className="space-y-2">
                {selectedDateEvents.map(ev => (
                  <div key={ev.id} className="p-3 bg-zinc-900/80 rounded-xl border border-blue-500/10 flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-white">{ev.title}</h4>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {ev.time} • {ev.clientName || 'General Client'} • {ev.projectName || 'Ridge Park Listing'}
                      </p>
                      {ev.notes && <p className="text-[10px] text-zinc-500 italic mt-0.5">{ev.notes}</p>}
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-950 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                      {ev.type.replace('_', ' ')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Daily Activity Report (DAR) Card on Selected Date */}
          {selectedDateDar ? (
            <div className="p-4 bg-purple-950/20 rounded-2xl border border-purple-500/30 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText size={16} className="text-purple-400" />
                  <h4 className="text-sm font-bold text-white">Daily Activity Report (DAR)</h4>
                  <span className="px-2 py-0.5 rounded-full bg-purple-950 text-purple-300 text-[10px] font-bold border border-purple-500/30">
                    {selectedDateDar.status || 'Submitted'}
                  </span>
                </div>
                {selectedDateDar.rating && (
                  <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                    <Star size={13} fill="currentColor" /> {selectedDateDar.rating}/5
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs bg-black/40 p-2.5 rounded-xl border border-purple-500/10">
                <div>
                  <span className="text-[10px] text-zinc-500 block">Check-in/Out</span>
                  <span className="text-zinc-200 font-medium">{selectedDateDar.checkInTime} - {selectedDateDar.checkOutTime}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Calls / WhatsApp</span>
                  <span className="text-zinc-200 font-medium">{selectedDateDar.callsCompleted} / {selectedDateDar.whatsappSent}</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Site Visits</span>
                  <span className="text-zinc-200 font-medium">{selectedDateDar.siteVisitsCompleted} ({selectedDateDar.siteVisitHours} hrs)</span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block">Deals Won</span>
                  <span className="text-emerald-400 font-bold">{selectedDateDar.dealsWon}</span>
                </div>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/50 p-2.5 rounded-xl border border-white/5">
                <strong className="text-zinc-400 block text-[10px] uppercase font-bold mb-0.5">Summary:</strong>
                {selectedDateDar.summaryNotes}
              </p>

              {/* Manager Review info or button */}
              {isAdmin && selectedDateDar.status !== 'Approved' && (
                <div className="pt-2 border-t border-purple-500/20 flex justify-end">
                  <button
                    onClick={() => {
                      setReviewingDar(selectedDateDar);
                      setReviewRating(5);
                    }}
                    className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-xs font-bold transition-colors"
                  >
                    Grade & Approve DAR
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 bg-zinc-950/60 rounded-2xl border border-dashed border-zinc-800 text-center space-y-2">
              <FileText size={20} className="text-zinc-600 mx-auto" />
              <p className="text-xs text-zinc-400">No Daily Activity Report (DAR) logged for this date.</p>
              <button
                onClick={() => setIsDarModalOpen(true)}
                className="px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-white rounded-lg text-xs font-bold transition-colors"
              >
                + Submit DAR for {selectedDateStr}
              </button>
            </div>
          )}

          {/* Activities Stream for Selected Date */}
          <div className="bg-zinc-950/90 rounded-2xl border border-zinc-800/80 p-4 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Clock size={13} className="text-red-400" />
              Logged Activities Timeline ({selectedDateActivities.length})
            </h4>

            {selectedDateActivities.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No activity logs recorded on {selectedDateStr}.
              </div>
            ) : (
              <div className="space-y-2.5">
                {selectedDateActivities.map(act => (
                  <motion.div
                    key={act.id}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-zinc-900/60 hover:bg-zinc-900 border border-white/5 flex items-start gap-3 transition-all"
                  >
                    <div className="p-2 rounded-xl bg-black/40 border border-white/5 flex-shrink-0">
                      {getActivityIcon(act.type)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h5 className="text-xs font-bold text-white truncate">
                          {act.title}
                        </h5>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          {act.timestamp ? new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">{act.description}</p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-zinc-500">
                        <span>Agent: <strong className="text-zinc-300">{act.agentName}</strong></span>
                        {act.leadName && <span>• Client: <strong className="text-zinc-300">{act.leadName}</strong></span>}
                        {act.outcome && <span>• Outcome: <strong className="text-emerald-400">{act.outcome}</strong></span>}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DAR Submission Modal */}
      <AnimatePresence>
        {isDarModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg p-6 space-y-4 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText size={16} className="text-red-500" />
                  Submit DAR for {selectedDateStr}
                </h3>
                <button onClick={() => setIsDarModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleDARSubmit} className="space-y-3 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-semibold">Check-in Time</label>
                    <input
                      type="text"
                      value={darCheckIn}
                      onChange={(e) => setDarCheckIn(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-semibold">Check-out Time</label>
                    <input
                      type="text"
                      value={darCheckOut}
                      onChange={(e) => setDarCheckOut(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div>
                    <label className="block text-zinc-400 mb-1">Calls Done</label>
                    <input
                      type="number"
                      value={darCalls}
                      onChange={(e) => setDarCalls(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">WhatsApp Sent</label>
                    <input
                      type="number"
                      value={darWa}
                      onChange={(e) => setDarWa(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Site Visits</label>
                    <input
                      type="number"
                      value={darVisits}
                      onChange={(e) => setDarVisits(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1">Visit Hours</label>
                    <input
                      type="number"
                      value={darVisitHours}
                      onChange={(e) => setDarVisitHours(Number(e.target.value))}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Daily Summary & Client Conversations</label>
                  <textarea
                    value={darSummary}
                    onChange={(e) => setDarSummary(e.target.value)}
                    placeholder="Briefly state leads prospected, client feedback, and key discussions..."
                    rows={2}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 custom-scrollbar"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Key Accomplishments</label>
                  <textarea
                    value={darKeyAccomplishments}
                    onChange={(e) => setDarKeyAccomplishments(e.target.value)}
                    placeholder="E.g. progressed negotiation on 3-BHK luxury unit..."
                    rows={2}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-red-500 custom-scrollbar"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsDarModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold"
                  >
                    Save & Submit DAR
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Schedule Visit Modal */}
      <AnimatePresence>
        {isEventModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <MapPin size={16} className="text-blue-500" />
                  Schedule Visit / Event ({selectedDateStr})
                </h3>
                <button onClick={() => setIsEventModalOpen(false)} className="text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleScheduleVisit} className="space-y-3 text-xs">
                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={evTitle}
                    onChange={(e) => setEvTitle(e.target.value)}
                    placeholder="e.g. Sunset Villa Walkthrough & Inspection"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-zinc-400 mb-1 font-semibold">Event Type</label>
                    <select
                      value={evType}
                      onChange={(e: any) => setEvType(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    >
                      <option value="site_visit">Site Visit</option>
                      <option value="meeting">In-Person Meeting</option>
                      <option value="call">Scheduled Call</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-zinc-400 mb-1 font-semibold">Time</label>
                    <input
                      type="text"
                      value={evTime}
                      onChange={(e) => setEvTime(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Client Name</label>
                  <input
                    type="text"
                    value={evClient}
                    onChange={(e) => setEvClient(e.target.value)}
                    placeholder="e.g. Mr. Robert Johnson"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Project / Property</label>
                  <input
                    type="text"
                    value={evProject}
                    onChange={(e) => setEvProject(e.target.value)}
                    placeholder="e.g. Ridge Park Tower B"
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsEventModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    Schedule Event
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Admin DAR Review Modal */}
      <AnimatePresence>
        {reviewingDar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl"
            >
              <div className="flex justify-between items-center pb-2 border-b border-zinc-800">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Award size={16} className="text-purple-400" />
                  Review & Approve DAR
                </h3>
                <button onClick={() => setReviewingDar(null)} className="text-zinc-500 hover:text-white">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <span className="text-zinc-400 block font-semibold">Agent:</span>
                  <p className="text-white font-bold text-sm">{reviewingDar.agentName}</p>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Performance Rating (1-5 Stars)</label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className={`p-2 rounded-xl border transition-all ${
                          reviewRating >= star
                            ? 'bg-amber-950/60 border-amber-500 text-amber-400'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-600'
                        }`}
                      >
                        <Star size={16} fill={reviewRating >= star ? 'currentColor' : 'none'} />
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-zinc-400 mb-1 font-semibold">Manager Feedback & Feedback Notes</label>
                  <textarea
                    value={reviewComments}
                    onChange={(e) => setReviewComments(e.target.value)}
                    placeholder="Enter appraisal comments or instructions for the agent..."
                    rows={3}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3 text-white focus:outline-none focus:border-purple-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setReviewingDar(null)}
                    className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleReviewDar(reviewingDar.id)}
                    className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold flex items-center gap-1.5"
                  >
                    <Check size={14} /> Approve & Save Rating
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
