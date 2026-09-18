import React, { useEffect, useState, useMemo } from 'react';
import { db, mockDb } from '../services/mockDb';
import { Agent, Customer, DailyActivityReport, ActivityLog } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { MonthControl } from '../components/ui/MonthControl';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { 
  Trash2, UserPlus, ShieldCheck, ShieldBan, Mail, KeyRound, 
  Award, MessageCircle, Target, Pencil, Coins, X, User,
  TrendingUp, FileText, CheckCircle2, Phone, MapPin
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../context/ChatContext';
import { useDateFilter } from '../context/DateFilterContext';
import { useAuth } from '../context/AuthContext';

export const Agents: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const [agents, setAgents] = useState<Agent[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const { openChatWith } = useChat();
  
  const { startDate, endDate, activeMonthName } = useDateFilter();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [credentialsId, setCredentialsId] = useState<string | null>(null);
  const [credForm, setCredForm] = useState({ email: '', password: '' });
  const [editRateId, setEditRateId] = useState<string | null>(null);
  const [newRate, setNewRate] = useState<number>(0);
  const [targetAgentId, setTargetAgentId] = useState<string | null>(null);
  const [targetValue, setTargetValue] = useState<number>(0);

  // Agent's individual profile data
  const [agentDars, setAgentDars] = useState<DailyActivityReport[]>([]);
  const [agentActivities, setAgentActivities] = useState<ActivityLog[]>([]);

  const fetchAgents = async () => {
    setLoading(true);
    const agentsData = await db.getAgents(startDate, endDate);
    const customersData = await db.getCustomers();
    setAgents(agentsData);
    setCustomers(customersData);

    if (!isAdmin && user) {
      const [allDars, allActs] = await Promise.all([
        mockDb.getDARs(),
        mockDb.getActivities({ agentId: user.id })
      ]);
      setAgentDars(allDars.filter(d => d.agentId === user.id));
      setAgentActivities(allActs);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
  }, [startDate, endDate, user?.id]);

  const handleCreate = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    await db.createAgent({ name: newName, email: newEmail, password: newPassword }); 
    setShowAdd(false); 
    setNewName(''); setNewEmail(''); setNewPassword('');
    fetchAgents(); 
  };

  const openCredentialsModal = (agent: Agent) => {
    setCredentialsId(agent.id);
    setCredForm({ email: agent.email, password: '' });
  };

  const handleUpdateCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!credentialsId) return;
    if (credForm.email) await db.updateAgent(credentialsId, { email: credForm.email });
    if (credForm.password.trim()) await db.resetAgentPassword(credentialsId, credForm.password);
    setCredentialsId(null);
    fetchAgents();
  };

  const openRateModal = (agent: Agent) => {
    setEditRateId(agent.id);
    setNewRate(agent.commissionRate);
  };

  const handleUpdateRate = async (e: React.FormEvent) => { 
    e.preventDefault(); 
    if (editRateId) {
      await db.updateAgentCommission(editRateId, newRate); 
      setEditRateId(null); 
      fetchAgents();
    } 
  };

  const openTargetModal = (agent: Agent) => {
    setTargetAgentId(agent.id);
    const existing = agent.targets?.find(t => t.startDate === startDate && t.endDate === endDate);
    setTargetValue(existing ? existing.target : 0);
  };

  const handleUpdateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetAgentId) {
      await db.updateAgentTarget(targetAgentId, startDate, endDate, Number(targetValue));
      await fetchAgents();
      setTargetAgentId(null);
    }
  };

  const toggleStatus = async (id: string) => { await db.toggleAgentStatus(id); fetchAgents(); };
  const confirmDelete = async () => { if (deleteId) { await db.deleteAgent(deleteId); setDeleteId(null); fetchAgents(); } };
  
  const isDateInRange = (dateStr: string) => {
    const d = new Date(dateStr).getTime();
    const s = new Date(startDate).getTime();
    const e = new Date(endDate).getTime();
    return d >= s && d <= e;
  };

  if (loading) return <Loader />;

  // ----------------------------------------------------
  // NON-ADMIN VIEW: SINGLE AGENT PROFILE & APPRAISAL DASHBOARD
  // ----------------------------------------------------
  if (!isAdmin) {
    const myAgent = agents.find(a => a.id === user?.id) || {
      id: user?.id || 'agent-1',
      name: user?.name || 'Agent',
      email: user?.email || 'agent@ridgepark.com',
      commissionRate: 15000,
      active: true,
      targets: []
    };

    const myCustomersInRange = customers.filter(c => c.agentId === myAgent.id && c.status === 'Closed' && isDateInRange(c.updatedAt));
    const pointsInRange = myCustomersInRange.length * 10;
    const revenueInRange = (pointsInRange / 10) * myAgent.commissionRate;
    const relevantTarget = myAgent.targets?.find(t => t.startDate === startDate && t.endDate === endDate);
    const target = relevantTarget?.target || 0;
    const actualSales = myCustomersInRange.length;
    const progress = target > 0 ? Math.min((actualSales / target) * 100, 100) : 0;

    return (
      <div className="space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
          <div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-bold text-white font-display">My Agent Profile & Appraisal</h2>
              <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-950 text-emerald-400 border border-emerald-500/30">
                Active Representative
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Your personalized sales targets, monthly performance scorecards, and DAR submissions for <strong className="text-white">{activeMonthName}</strong>.
            </p>
          </div>
          <MonthControl />
        </div>

        {/* Profile Card & KPI Matrix */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left: User Identity Card */}
          <div className="lg:col-span-4 bg-zinc-950/90 rounded-2xl border border-zinc-800/80 p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-2xl font-bold text-white font-display border border-red-500/30 shadow-lg">
                {myAgent.name.charAt(0)}
              </div>
              <div>
                <h3 className="text-lg font-bold text-white font-display">{myAgent.name}</h3>
                <p className="text-xs text-zinc-400 mt-0.5">{myAgent.email}</p>
                <span className="inline-block mt-1 px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-800 text-zinc-300">
                  Agent ID: {myAgent.id}
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-zinc-800/80 space-y-3 text-xs">
              <div className="flex justify-between items-center text-zinc-400">
                <span>Commission Basis:</span>
                <span className="font-bold text-white">৳{myAgent.commissionRate.toLocaleString()} / 10 pts</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Account Status:</span>
                <span className="font-bold text-emerald-400 flex items-center gap-1">
                  <ShieldCheck size={14} /> Verified & Active
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Direct Admin Desk:</span>
                <button
                  onClick={() => openChatWith('admin-1')}
                  className="px-2.5 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 rounded-lg font-bold flex items-center gap-1.5 transition-colors"
                >
                  <MessageCircle size={12} className="text-red-400" /> Chat with Admin
                </button>
              </div>
            </div>
          </div>

          {/* Right: Target & Revenue Dashboard */}
          <div className="lg:col-span-8 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Monthly Deals Won</span>
                <span className="text-2xl font-bold text-emerald-400 mt-1 block">{actualSales}</span>
                <span className="text-[10px] text-zinc-500 mt-1 block">in {activeMonthName}</span>
              </div>

              <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Commission Points</span>
                <span className="text-2xl font-bold text-amber-400 mt-1 block">{pointsInRange} pts</span>
                <span className="text-[10px] text-zinc-500 mt-1 block">10 pts / closed deal</span>
              </div>

              <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80">
                <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider block">Earned Commission</span>
                <span className="text-2xl font-bold text-white mt-1 block">৳{revenueInRange.toLocaleString()}</span>
                <span className="text-[10px] text-zinc-500 mt-1 block">Paid on appraisal</span>
              </div>
            </div>

            {/* Target Progress Bar */}
            <div className="p-5 bg-zinc-950/90 rounded-2xl border border-zinc-800/80 shadow-xl space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-bold text-white flex items-center gap-2">
                  <Target size={15} className="text-red-500" />
                  Monthly Sales Goal Achievement ({activeMonthName})
                </span>
                <span className="text-xs font-bold text-white font-mono">
                  {actualSales} of {target > 0 ? target : 'Unset'} Deals ({progress.toFixed(0)}%)
                </span>
              </div>

              <div className="w-full h-3 bg-zinc-900 rounded-full overflow-hidden p-0.5 border border-zinc-800">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  className={`h-full rounded-full ${
                    progress >= 100
                      ? 'bg-gradient-to-r from-emerald-500 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                      : 'bg-gradient-to-r from-red-600 to-red-500'
                  }`}
                />
              </div>

              <p className="text-[11px] text-zinc-400 leading-relaxed">
                {target > 0
                  ? `You are currently at ${progress.toFixed(0)}% of your monthly goal. Complete more client walkthroughs and follow-up calls to reach 100%!`
                  : `Monthly goal for ${activeMonthName} will be assigned by your management desk.`}
              </p>
            </div>
          </div>
        </div>

        {/* Recent DAR & Activity Stream */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent DARs */}
          <div className="bg-zinc-950/90 rounded-2xl border border-zinc-800/80 p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FileText size={14} className="text-purple-400" />
              My Recent DAR Submissions ({agentDars.length})
            </h4>

            {agentDars.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No DARs submitted yet. Go to Activity & Calendar to submit today's DAR.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                {agentDars.slice(0, 5).map(dar => (
                  <div key={dar.id} className="p-3 bg-zinc-900/60 rounded-xl border border-white/5 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white">{dar.date}</span>
                      <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 text-[10px] font-bold border border-purple-500/20">
                        {dar.status || 'Submitted'}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{dar.summaryNotes}</p>
                    <div className="flex items-center gap-3 text-[10px] text-zinc-500 pt-1">
                      <span>Calls: <strong className="text-zinc-300">{dar.callsCompleted}</strong></span>
                      <span>Visits: <strong className="text-zinc-300">{dar.siteVisitsCompleted}</strong></span>
                      <span>Deals Won: <strong className="text-emerald-400">{dar.dealsWon}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent Activities */}
          <div className="bg-zinc-950/90 rounded-2xl border border-zinc-800/80 p-5 shadow-xl space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <TrendingUp size={14} className="text-red-400" />
              My Recent Actions & Client Outreach ({agentActivities.length})
            </h4>

            {agentActivities.length === 0 ? (
              <div className="text-center py-8 text-zinc-500 text-xs">
                No activity logs recorded yet.
              </div>
            ) : (
              <div className="space-y-2.5 max-h-72 overflow-y-auto custom-scrollbar">
                {agentActivities.slice(0, 5).map(act => (
                  <div key={act.id} className="p-3 bg-zinc-900/60 rounded-xl border border-white/5 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-bold text-white truncate">{act.title}</span>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {act.timestamp ? new Date(act.timestamp).toLocaleDateString() : ''}
                      </span>
                    </div>
                    <p className="text-[11px] text-zinc-400 line-clamp-1">{act.description}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ----------------------------------------------------
  // ADMIN VIEW: FULL AGENT ROSTER MANAGEMENT
  // ----------------------------------------------------
  return (
    <div className="space-y-8 relative">
      <ConfirmationModal 
        isOpen={!!deleteId} 
        title="Remove Agent" 
        message="Are you sure you want to remove this agent from the system?" 
        onConfirm={confirmDelete} 
        onCancel={() => setDeleteId(null)} 
      />

      <div className="flex flex-col xl:flex-row justify-between items-end xl:items-center gap-4 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-3xl font-bold text-white font-display">Agent Management</h2>
          <p className="text-zinc-400 text-sm mt-1">
            Performance and sales targets for <span className="text-red-500 font-bold">{activeMonthName}</span>
          </p>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
          <MonthControl />
          <Button icon={<UserPlus size={18} />} onClick={() => setShowAdd(!showAdd)}>
            Add Agent
          </Button>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {targetAgentId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm">
              <Card title="Set Monthly Target" className="shadow-2xl border-red-500/20 bg-zinc-900">
                <form onSubmit={handleUpdateTarget} className="mt-2 space-y-4">
                  <div className="p-3 bg-zinc-950 rounded-lg border border-white/5 text-center">
                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Target Period</p>
                    <p className="text-lg font-bold text-white">{activeMonthName}</p>
                  </div>
                  <Input label="Sales Goal (Deals)" type="number" value={targetValue} onChange={(e) => setTargetValue(Number(e.target.value))} required />
                  <div className="flex gap-2">
                    <Button type="submit" className="flex-1">Save Target</Button>
                    <Button type="button" variant="ghost" onClick={() => setTargetAgentId(null)}>Cancel</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}

        {credentialsId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm">
              <Card title="Agent Access Control" className="shadow-2xl border-blue-500/20 bg-zinc-900">
                <form onSubmit={handleUpdateCredentials} className="mt-2 space-y-4">
                  <div className="p-3 bg-blue-900/10 border border-blue-500/20 rounded-xl text-blue-300 text-xs flex items-start gap-2">
                    <KeyRound size={14} className="flex-shrink-0 mt-0.5" />
                    <p>Update login email or reset password. Leave password blank to keep current.</p>
                  </div>
                  <Input label="Agent Email" type="email" value={credForm.email} onChange={(e) => setCredForm({ ...credForm, email: e.target.value })} required />
                  <Input label="New Password" type="text" placeholder="Enter new password" value={credForm.password} onChange={(e) => setCredForm({ ...credForm, password: e.target.value })} />
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1">Update Access</Button>
                    <Button type="button" variant="ghost" onClick={() => setCredentialsId(null)}>Cancel</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}

        {editRateId && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-sm">
              <Card title="Commission Rate" className="shadow-2xl border-green-500/20 bg-zinc-900">
                <form onSubmit={handleUpdateRate} className="mt-2 space-y-4">
                  <div className="p-3 bg-green-900/10 border border-green-500/20 rounded-xl text-green-300 text-xs flex items-start gap-2">
                    <Coins size={14} className="flex-shrink-0 mt-0.5" />
                    <p>Set the monetary value (BDT) for every 10 points earned by this agent.</p>
                  </div>
                  <Input label="Rate per 10 Points (৳)" type="number" value={newRate} onChange={(e) => setNewRate(Number(e.target.value))} required />
                  <div className="flex gap-2 pt-2">
                    <Button type="submit" className="flex-1">Update Rate</Button>
                    <Button type="button" variant="ghost" onClick={() => setEditRateId(null)}>Cancel</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}

        {showAdd && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="w-full max-w-lg">
              <Card title="Add New Agent">
                <form onSubmit={handleCreate} className="space-y-4 mt-4">
                  <Input label="Full Name" value={newName} onChange={e => setNewName(e.target.value)} required />
                  <Input label="Email Address" type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} required />
                  <Input label="Initial Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required />
                  <div className="flex gap-2 pt-4">
                    <Button type="submit" className="flex-1">Create Agent</Button>
                    <Button type="button" variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {agents.length === 0 && (
        <div className="text-center py-12 text-zinc-500 italic">
          No agents found for {activeMonthName}.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {agents.map((agent, idx) => {
            const customersInRange = customers.filter(c => c.agentId === agent.id && c.status === 'Closed' && isDateInRange(c.updatedAt));
            const pointsInRange = customersInRange.length * 10;
            const revenueInRange = (pointsInRange / 10) * agent.commissionRate;
            const relevantTarget = agent.targets?.find(t => t.startDate === startDate && t.endDate === endDate);
            const target = relevantTarget?.target || 0;
            const actualSales = customersInRange.length;
            const progress = target > 0 ? Math.min((actualSales / target) * 100, 100) : 0;

            return (
              <motion.div key={agent.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Card delay={idx * 0.1} className="flex flex-col h-full relative overflow-hidden">
                  <div className="flex justify-between items-start mb-6 relative z-10">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-800 border border-white/5 shadow-inner flex items-center justify-center text-2xl font-bold text-zinc-400 font-display">
                      {agent.name.charAt(0)}
                    </div>
                    <button onClick={() => openChatWith(agent.id)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white">
                      <MessageCircle size={16} />
                    </button>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white font-display">{agent.name}</h3>
                  <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1 mb-6">
                    <Mail size={14} /> {agent.email}
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                    <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5">
                      <div className="flex items-center gap-2 text-yellow-500 mb-1">
                        <Award size={14} />
                        <span className="text-[10px] font-bold uppercase">Pts (Mo)</span>
                      </div>
                      <span className="text-2xl font-bold text-white font-display">{pointsInRange}</span>
                    </div>
                    
                    {/* Revenue Box with Edit Trigger */}
                    <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5 relative group">
                      <div className="flex items-center justify-between mb-1">
                        <div className="flex items-center gap-2 text-green-500">
                          <span className="font-bold">৳</span>
                          <span className="text-[10px] font-bold uppercase">Rev (Mo)</span>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); openRateModal(agent); }}
                          className="opacity-0 group-hover:opacity-100 p-1 hover:bg-zinc-800 rounded text-zinc-500 hover:text-white transition-all"
                          title="Edit Commission Rate"
                        >
                          <Pencil size={10} />
                        </button>
                      </div>
                      <span className="text-2xl font-bold text-white font-display">৳{revenueInRange.toLocaleString()}</span>
                      <div className="text-[9px] text-zinc-600 mt-1 font-mono">Rate: ৳{agent.commissionRate}/10pts</div>
                    </div>
                  </div>

                  <div 
                    className="mb-4 p-3 bg-zinc-900/30 hover:bg-zinc-800/50 rounded-xl border border-white/5 cursor-pointer group transition-colors relative z-10" 
                    onClick={() => openTargetModal(agent)}
                  >
                    <div className="flex justify-between items-end mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1">
                          <Target size={12} /> Monthly Target
                        </span>
                        <Pencil size={10} className="text-blue-500 opacity-50 group-hover:opacity-100" />
                      </div>
                      <span className="text-xs font-bold text-white">{actualSales} / {target > 0 ? target : '-'}</span>
                    </div>
                    <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${progress}%` }} 
                        className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-gradient-to-r from-red-600 to-red-500'}`} 
                      />
                    </div>
                  </div>

                  <div className="mt-auto pt-5 border-t border-white/5 flex justify-between items-center relative z-10">
                    <div className="flex flex-col">
                      <span className="text-[10px] text-zinc-600 uppercase font-bold">Sales</span>
                      <span className="text-white font-bold text-lg">{actualSales}</span>
                    </div>
                    <div className="flex gap-2">
                      <button onClick={(e) => { e.stopPropagation(); openCredentialsModal(agent); }} className="p-2 bg-zinc-800 hover:text-white text-zinc-400 rounded-lg" title="Manage Password & Email">
                        <KeyRound size={16} />
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); toggleStatus(agent.id); }} className="p-2 bg-zinc-800 hover:text-white text-zinc-400 rounded-lg">
                        {agent.active ? <ShieldBan size={16} /> : <ShieldCheck size={16} />}
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); setDeleteId(agent.id); }} className="p-2 bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
};
