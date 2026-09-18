import React, { useState, useEffect } from 'react';
import { CalendarEvent, HolidayOrLeave } from '../types';
import { mockDb } from '../services/mockDb';
import { useAuth } from '../context/AuthContext';
import { 
  Calendar as CalendarIcon, Plus, MapPin, Phone, 
  Users, CheckCircle2, Clock, Calculator, ShieldCheck, 
  ChevronLeft, ChevronRight, AlertCircle, Sun, Coffee
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const CalendarManagement: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [holidays, setHolidays] = useState<HolidayOrLeave[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'agenda'>('month');

  // Modals
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const [isAddHolidayOpen, setIsAddHolidayOpen] = useState(false);

  // New Event Form
  const [evTitle, setEvTitle] = useState('');
  const [evType, setEvType] = useState<'site_visit' | 'call' | 'meeting'>('site_visit');
  const [evDate, setEvDate] = useState(new Date().toISOString().split('T')[0]);
  const [evTime, setEvTime] = useState('11:00 AM');
  const [evClient, setEvClient] = useState('');
  const [evProject, setEvProject] = useState('');
  const [evNotes, setEvNotes] = useState('');

  // New Holiday/Leave Form
  const [holName, setHolName] = useState('');
  const [holType, setHolType] = useState<'public_holiday' | 'office_holiday' | 'agent_leave'>('public_holiday');
  const [holStart, setHolStart] = useState(new Date().toISOString().split('T')[0]);
  const [holEnd, setHolEnd] = useState(new Date().toISOString().split('T')[0]);
  const [holAgentName, setHolAgentName] = useState('');

  const loadData = async () => {
    const fetchedEvents = await mockDb.getCalendarEvents();
    setEvents(fetchedEvents);

    const fetchedHolidays = await mockDb.getHolidaysAndLeaves();
    setHolidays(fetchedHolidays);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!evTitle.trim()) return;

    await mockDb.addCalendarEvent({
      title: evTitle,
      type: evType,
      date: evDate,
      time: evTime,
      clientName: evClient || undefined,
      projectName: evProject || undefined,
      agentId: user?.id || 'agent-1',
      agentName: user?.name || 'Agent',
      notes: evNotes
    });

    setIsAddEventOpen(false);
    setEvTitle('');
    setEvClient('');
    setEvProject('');
    setEvNotes('');
    await loadData();
  };

  const handleAddHoliday = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!holName.trim()) return;

    await mockDb.addHolidayOrLeave({
      name: holName,
      type: holType,
      startDate: holStart,
      endDate: holEnd,
      isRecurringWeekly: false,
      agentName: holType === 'agent_leave' ? (holAgentName || user?.name || 'Agent') : undefined,
      status: 'Approved'
    });

    setIsAddHolidayOpen(false);
    setHolName('');
    await loadData();
  };

  // Calendar Calculation for Month View
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Live Working Days Calculation for Current Month
  const currentMonthHolidays = holidays.filter(h => {
    const start = new Date(h.startDate);
    return start.getFullYear() === year && start.getMonth() === month;
  });

  // Calculate weekends
  let weekendDays = 0;
  for (let d = 1; d <= daysInMonth; d++) {
    const dayOfWeek = new Date(year, month, d).getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) weekendDays++;
  }

  const publicHolidayDays = currentMonthHolidays.filter((h: any) => h.type === 'public_holiday' || h.type === 'office_holiday' || h.type === 'public' || h.type === 'office').length;
  const leaveDays = currentMonthHolidays.filter((h: any) => h.type === 'agent_leave' || h.type === 'vacation' || h.type === 'sick').length;
  const standardWorkingDays = daysInMonth - weekendDays - publicHolidayDays;
  const effectiveWorkingDays = Math.max(0, standardWorkingDays - leaveDays);

  return (
    <div className="space-y-6">
      {/* Title & Top Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display flex items-center gap-3">
            Site Visits & Working Days Calendar
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-blue-950/80 text-blue-400 border border-blue-500/30">
              {events.length} Scheduled Events
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage client site inspections, follow-up calls, public holidays, and live working day calculations for fair appraisal.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAddHolidayOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-all"
          >
            <Sun size={14} /> + Holiday / Leave
          </button>
          <button
            onClick={() => setIsAddEventOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition-all"
          >
            <Plus size={14} /> Schedule Event
          </button>
        </div>
      </div>

      {/* WORKING DAYS CALCULATOR BANNER */}
      <div className="p-5 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 rounded-2xl border border-zinc-800/80 shadow-xl">
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
          <div className="flex items-center gap-2 text-zinc-200 text-xs font-bold uppercase tracking-wider">
            <Calculator size={16} className="text-blue-400" />
            <span>Monthly Appraisal Metrics: {monthNames[month]} {year}</span>
          </div>
          <span className="text-[11px] text-zinc-500">Auto-adjusted for official holidays & agent leaves</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800/80 text-center">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Total Days</span>
            <span className="text-lg font-bold text-white">{daysInMonth}</span>
          </div>

          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800/80 text-center">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Weekend Offs</span>
            <span className="text-lg font-bold text-zinc-400">{weekendDays}</span>
          </div>

          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800/80 text-center">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Public Holidays</span>
            <span className="text-lg font-bold text-purple-400">{publicHolidayDays}</span>
          </div>

          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800/80 text-center">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Approved Leaves</span>
            <span className="text-lg font-bold text-amber-400">{leaveDays}</span>
          </div>

          <div className="p-3 bg-zinc-900/80 rounded-xl border border-zinc-800/80 text-center">
            <span className="text-[10px] text-zinc-500 block uppercase font-bold">Standard Days</span>
            <span className="text-lg font-bold text-zinc-300">{standardWorkingDays}</span>
          </div>

          <div className="p-3 bg-blue-950/40 rounded-xl border border-blue-500/30 text-center shadow-lg">
            <span className="text-[10px] text-blue-400 block uppercase font-bold">Effective Days</span>
            <span className="text-lg font-bold text-blue-300">{effectiveWorkingDays} Days</span>
          </div>
        </div>
      </div>

      {/* CALENDAR CONTROLS & MONTH GRID */}
      <div className="bg-zinc-950/80 rounded-2xl border border-zinc-800/80 p-5 space-y-4">
        {/* Navigation Bar */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold text-white font-display">
              {monthNames[month]} {year}
            </h2>
            <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
              <button
                onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <ChevronLeft size={16} />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-2.5 py-1 text-xs text-zinc-300 font-semibold hover:bg-zinc-800 rounded-lg"
              >
                Today
              </button>
              <button
                onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500 hidden sm:inline">Legends:</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-400 border border-blue-500/30">Site Visits</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-950 text-amber-400 border border-amber-500/30">Calls</span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-950 text-purple-400 border border-purple-500/30">Holidays</span>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-zinc-500 uppercase tracking-wider py-2 border-b border-zinc-800">
          <span>Sun</span>
          <span>Mon</span>
          <span>Tue</span>
          <span>Wed</span>
          <span>Thu</span>
          <span>Fri</span>
          <span>Sat</span>
        </div>

        {/* Month Day Cells */}
        <div className="grid grid-cols-7 gap-2">
          {/* Empty prefix boxes */}
          {[...Array(firstDayIndex)].map((_, i) => (
            <div key={`empty-${i}`} className="h-28 rounded-xl bg-zinc-900/20 border border-zinc-900/40 p-2 opacity-30"></div>
          ))}

          {/* Actual days */}
          {[...Array(daysInMonth)].map((_, i) => {
            const dayNum = i + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const isToday = new Date().toISOString().split('T')[0] === dateStr;

            const dayEvents = events.filter(e => e.date === dateStr);
            const dayHolidays = holidays.filter(h => h.startDate <= dateStr && h.endDate >= dateStr);

            return (
              <div 
                key={dayNum}
                className={`h-28 rounded-xl border p-2 flex flex-col justify-between transition-colors overflow-hidden ${
                  isToday 
                    ? 'bg-zinc-900/90 border-blue-500/50 shadow-[0_0_12px_rgba(59,130,246,0.15)]' 
                    : 'bg-zinc-900/40 border-zinc-800/80 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className={`text-xs font-bold ${isToday ? 'text-blue-400' : 'text-zinc-400'}`}>
                    {dayNum}
                  </span>
                  {dayHolidays.length > 0 && (
                    <span className="w-2 h-2 rounded-full bg-purple-400" title={dayHolidays[0].name}></span>
                  )}
                </div>

                {/* Event Tags */}
                <div className="space-y-1 overflow-y-auto max-h-[72px]">
                  {dayHolidays.map(hol => (
                    <div key={hol.id} className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-950/70 text-purple-300 truncate border border-purple-500/30">
                      🏖️ {hol.name}
                    </div>
                  ))}

                  {dayEvents.map(ev => {
                    const isVisit = ev.type === 'site_visit';
                    return (
                      <div
                        key={ev.id}
                        className={`px-1.5 py-0.5 rounded text-[9px] font-medium truncate border ${
                          isVisit 
                            ? 'bg-blue-950/70 text-blue-300 border-blue-500/30' 
                            : 'bg-amber-950/70 text-amber-300 border-amber-500/30'
                        }`}
                        title={`${ev.title} (${ev.time})`}
                      >
                        {ev.time} {ev.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* MODAL: ADD EVENT */}
      <AnimatePresence>
        {isAddEventOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c0c0c] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Schedule Calendar Event</h3>
                <button onClick={() => setIsAddEventOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleAddEvent} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 font-medium">Event Title *</label>
                  <input
                    type="text"
                    required
                    value={evTitle}
                    onChange={(e) => setEvTitle(e.target.value)}
                    placeholder="e.g. Sunset Villa Walkthrough"
                    className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Event Type</label>
                    <select
                      value={evType}
                      onChange={(e) => setEvType(e.target.value as any)}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="site_visit">Site Visit / Inspection</option>
                      <option value="call">Scheduled Phone Call</option>
                      <option value="meeting">In-Office Meeting</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Date</label>
                    <input
                      type="date"
                      value={evDate}
                      onChange={(e) => setEvDate(e.target.value)}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Time</label>
                    <input
                      type="text"
                      value={evTime}
                      onChange={(e) => setEvTime(e.target.value)}
                      placeholder="e.g. 11:00 AM"
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Client Name</label>
                    <input
                      type="text"
                      value={evClient}
                      onChange={(e) => setEvClient(e.target.value)}
                      placeholder="e.g. Arthur Pendelton"
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-medium">Notes & Preparation</label>
                  <textarea
                    rows={2}
                    value={evNotes}
                    onChange={(e) => setEvNotes(e.target.value)}
                    placeholder="Prepare printed price breakdown and floor plan..."
                    className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white"
                  />
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddEventOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-xs font-bold text-white shadow-lg"
                  >
                    Save Event to Calendar
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: ADD HOLIDAY / LEAVE */}
      <AnimatePresence>
        {isAddHolidayOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0c0c0c] border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-white">Record Holiday / Agent Leave</h3>
                <button onClick={() => setIsAddHolidayOpen(false)} className="text-zinc-500 hover:text-white">✕</button>
              </div>

              <form onSubmit={handleAddHoliday} className="space-y-4">
                <div>
                  <label className="text-xs text-zinc-400 font-medium">Holiday / Leave Title *</label>
                  <input
                    type="text"
                    required
                    value={holName}
                    onChange={(e) => setHolName(e.target.value)}
                    placeholder="e.g. Labor Day / Annual Vacation"
                    className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Type</label>
                    <select
                      value={holType}
                      onChange={(e) => setHolType(e.target.value as any)}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                    >
                      <option value="public_holiday">Public / National Holiday</option>
                      <option value="office_holiday">Office Company Holiday</option>
                      <option value="agent_leave">Agent Approved Leave</option>
                    </select>
                  </div>

                  {holType === 'agent_leave' && (
                    <div>
                      <label className="text-xs text-zinc-400 font-medium">Agent Name</label>
                      <input
                        type="text"
                        value={holAgentName}
                        onChange={(e) => setHolAgentName(e.target.value)}
                        placeholder="Agent Name"
                        className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                      />
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Start Date</label>
                    <input
                      type="date"
                      value={holStart}
                      onChange={(e) => setHolStart(e.target.value)}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-medium">End Date</label>
                    <input
                      type="date"
                      value={holEnd}
                      onChange={(e) => setHolEnd(e.target.value)}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white"
                    />
                  </div>
                </div>

                <div className="pt-2 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsAddHolidayOpen(false)}
                    className="px-4 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white shadow-lg"
                  >
                    Save Holiday / Leave
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
