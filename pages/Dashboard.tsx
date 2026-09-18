import React, { useState, useEffect } from 'react';
import { Customer, ActivityLog, CalendarEvent, DailyActivityReport } from '../types';
import { mockDb } from '../services/mockDb';
import { useAuth } from '../context/AuthContext';
import { LeadDetailsModal } from '../components/leads/LeadDetailsModal';
import { 
  Phone, MessageSquare, MapPin, DollarSign, 
  Calendar, CheckCircle2, Clock, Users, 
  ArrowRight, AlertCircle, TrendingUp, Award, 
  ShieldCheck, FileText, ChevronRight, UserPlus
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Customer[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);

  const loadData = async () => {
    const fetchedLeads = await mockDb.getCustomers();
    setLeads(fetchedLeads);

    const fetchedActs = await mockDb.getActivities();
    setActivities(fetchedActs);

    const fetchedEvents = await mockDb.getCalendarEvents();
    setEvents(fetchedEvents);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openLead = (leadId: string) => {
    setSelectedLeadId(leadId);
    setIsDetailsOpen(true);
  };

  // KPIs
  const totalLeads = leads.length;
  const unassignedLeads = leads.filter(l => l.status === 'New / Unassigned');
  const wonDeals = leads.filter(l => l.status === 'Closed - Won / Deal Booked');
  const totalSalesVolume = wonDeals.reduce((sum, l) => sum + (l.dealInfo?.dealValue || l.budget || 0), 0);
  const activeNegotiations = leads.filter(l => l.status === 'Negotiation / Offer Stage');
  
  // Today's Follow-ups & Overdue
  const todayStr = new Date().toISOString().split('T')[0];
  const myLeads = user?.role === 'agent' ? leads.filter(l => l.agentId === user.id) : leads;
  
  const todayFollowUps = myLeads.filter(l => l.nextFollowUpDate === todayStr);
  const overdueFollowUps = myLeads.filter(l => l.nextFollowUpDate && l.nextFollowUpDate < todayStr && !l.status.includes('Closed'));

  const todayVisits = events.filter(e => e.date === todayStr && e.type === 'site_visit');

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-gradient-to-r from-red-950/40 via-zinc-950 to-zinc-950 p-6 rounded-3xl border border-red-500/20 shadow-2xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-red-600/20 text-red-400 border border-red-500/30">
              {user?.role === 'admin' ? 'Executive Director Mode' : 'Agent Command Center'}
            </span>
            <span className="text-zinc-500 text-xs">• {new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' })}</span>
          </div>
          <h1 className="text-2xl font-bold text-white font-display">
            Welcome back, {user?.name || 'Director'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1 max-w-xl">
            {user?.role === 'admin' 
              ? 'Real-time overview of agent performance, client pipeline velocity, and active property negotiations.'
              : 'Here are your scheduled client follow-ups, pending site visits, and active negotiations for today.'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/customers"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/30 transition-all"
          >
            <Users size={15} /> Open Pipeline Board
          </Link>
          <Link
            to="/whatsapp"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-lg shadow-emerald-600/30 transition-all"
          >
            <MessageSquare size={15} /> WhatsApp Hub
          </Link>
        </div>
      </div>

      {/* OVERDUE & UNASSIGNED ALERT BANNERS */}
      {(overdueFollowUps.length > 0 || unassignedLeads.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Overdue Follow-ups */}
          {overdueFollowUps.length > 0 && (
            <div className="p-4 bg-amber-950/40 rounded-2xl border border-amber-500/30 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-amber-900/60 text-amber-400 rounded-xl mt-0.5">
                  <AlertCircle size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-amber-300 uppercase tracking-wider">
                    {overdueFollowUps.length} Overdue Client Follow-Ups
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    Clients awaiting contact callback: {overdueFollowUps.slice(0, 2).map(l => l.name).join(', ')}...
                  </p>
                </div>
              </div>
              <Link
                to="/customers"
                className="px-3 py-1.5 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold whitespace-nowrap border border-amber-500/30"
              >
                Review Now
              </Link>
            </div>
          )}

          {/* Unassigned Leads */}
          {unassignedLeads.length > 0 && (
            <div className="p-4 bg-red-950/40 rounded-2xl border border-red-500/30 flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-900/60 text-red-400 rounded-xl mt-0.5">
                  <UserPlus size={18} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-red-300 uppercase tracking-wider">
                    {unassignedLeads.length} Unassigned Leads Waiting
                  </h3>
                  <p className="text-xs text-zinc-300 mt-0.5">
                    Inbound leads require immediate agent assignment to maintain fast response SLAs.
                  </p>
                </div>
              </div>
              <Link
                to="/customers"
                className="px-3 py-1.5 rounded-lg bg-red-500/20 hover:bg-red-500/30 text-red-300 text-xs font-semibold whitespace-nowrap border border-red-500/30"
              >
                Assign Leads
              </Link>
            </div>
          )}
        </div>
      )}

      {/* KPI METRIC CARDS */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-5 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-zinc-500">
            <span className="text-[11px] uppercase font-bold tracking-wider">Pipeline Leads</span>
            <Users size={16} />
          </div>
          <div className="text-2xl font-bold text-white">{totalLeads}</div>
          <span className="text-[11px] text-zinc-400 block">{unassignedLeads.length} unassigned</span>
        </div>

        <div className="p-5 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-emerald-500">
            <span className="text-[11px] uppercase font-bold tracking-wider">Closed - Won Volume</span>
            <DollarSign size={16} />
          </div>
          <div className="text-2xl font-bold text-emerald-400">{formatCurrency(totalSalesVolume)}</div>
          <span className="text-[11px] text-zinc-400 block">{wonDeals.length} deals closed</span>
        </div>

        <div className="p-5 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-amber-500">
            <span className="text-[11px] uppercase font-bold tracking-wider">Active Negotiations</span>
            <TrendingUp size={16} />
          </div>
          <div className="text-2xl font-bold text-amber-400">{activeNegotiations.length}</div>
          <span className="text-[11px] text-zinc-400 block">High closing probability</span>
        </div>

        <div className="p-5 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 space-y-1">
          <div className="flex items-center justify-between text-blue-500">
            <span className="text-[11px] uppercase font-bold tracking-wider">Site Visits Today</span>
            <MapPin size={16} />
          </div>
          <div className="text-2xl font-bold text-blue-400">{todayVisits.length}</div>
          <span className="text-[11px] text-zinc-400 block">Scheduled on-site</span>
        </div>
      </div>

      {/* MAIN TWO-COLUMN DASHBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT 2 COLUMNS: Today's Tasks & Urgent Leads */}
        <div className="lg:col-span-2 space-y-6">
          {/* Today's Follow-up Agenda */}
          <div className="bg-zinc-950/80 rounded-2xl border border-zinc-800/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <Clock size={16} className="text-amber-400" /> Today's Follow-Up Checklist
              </h2>
              <span className="text-xs text-zinc-500">{todayFollowUps.length} scheduled for today</span>
            </div>

            {todayFollowUps.length > 0 ? (
              <div className="space-y-2.5">
                {todayFollowUps.map(lead => (
                  <div
                    key={lead.id}
                    onClick={() => openLead(lead.id)}
                    className="p-3.5 bg-zinc-900/60 hover:bg-zinc-900 rounded-xl border border-zinc-800/80 hover:border-zinc-700 transition-all flex items-center justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-white">{lead.name}</span>
                        <span className="text-[10px] text-zinc-400 font-mono">{lead.phone}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        {lead.interestedProject || 'Any Project'} • Stage: <strong className="text-zinc-300">{lead.status}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-amber-400">{lead.nextFollowUpTime || '10:00 AM'}</span>
                      <ChevronRight size={14} className="text-zinc-600" />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic py-3">No specific follow-ups scheduled for today.</p>
            )}
          </div>

          {/* Today's Scheduled Site Visits */}
          <div className="bg-zinc-950/80 rounded-2xl border border-zinc-800/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <MapPin size={16} className="text-blue-400" /> Today's Site Visits & Walkthroughs
              </h2>
              <Link to="/calendar" className="text-xs text-blue-400 hover:underline">View Calendar</Link>
            </div>

            {todayVisits.length > 0 ? (
              <div className="space-y-2.5">
                {todayVisits.map(ev => (
                  <div key={ev.id} className="p-3.5 bg-blue-950/20 rounded-xl border border-blue-500/20 flex items-center justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-white">{ev.title}</h3>
                      <p className="text-[11px] text-zinc-400 mt-0.5">
                        Client: <strong className="text-blue-300">{ev.clientName || 'VIP Buyer'}</strong> • Agent: {ev.agentName}
                      </p>
                    </div>
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-blue-950 text-blue-400 border border-blue-500/30">
                      {ev.time}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-zinc-500 italic py-3">No site visits scheduled for today.</p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Recent CRM Activity Stream */}
        <div className="space-y-6">
          <div className="bg-zinc-950/80 rounded-2xl border border-zinc-800/80 p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                <TrendingUp size={16} className="text-red-500" /> Recent Activity Stream
              </h2>
              <Link to="/activities" className="text-xs text-red-400 hover:underline">View All</Link>
            </div>

            <div className="space-y-3">
              {activities.slice(0, 7).map(act => (
                <div key={act.id} className="p-3 bg-zinc-900/40 rounded-xl border border-zinc-800/60 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white truncate max-w-[170px]">{act.title}</span>
                    <span className="text-[10px] text-zinc-500">{new Date(act.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] text-zinc-400 line-clamp-2">{act.description}</p>
                  <span className="text-[10px] text-zinc-500 block pt-0.5">By {act.agentName}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Lead Details Drawer */}
      <LeadDetailsModal
        leadId={selectedLeadId}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedLeadId(null);
        }}
        onLeadUpdated={loadData}
      />
    </div>
  );
};
