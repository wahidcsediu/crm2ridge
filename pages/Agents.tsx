
import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../services/mockDb';
import { Agent, Customer } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { MonthControl } from '../components/ui/MonthControl';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { Trash2, UserPlus, ShieldCheck, ShieldBan, Mail, KeyRound, Award, MessageCircle, Target, Pencil, Coins, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChat } from '../context/ChatContext';
import { useDateFilter } from '../context/DateFilterContext';

export const Agents: React.FC = () => {
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

  const fetchAgents = async () => {
    setLoading(true);
    // Filter agents who existed by the endDate of current view
    const agentsData = await db.getAgents(startDate, endDate);
    const customersData = await db.getCustomers();
    setAgents(agentsData);
    setCustomers(customersData);
    setLoading(false);
  };

  useEffect(() => {
    fetchAgents();
  }, [startDate, endDate]);

  const handleCreate = async (e: React.FormEvent) => { 
      e.preventDefault(); 
      await db.createAgent({name:newName, email:newEmail, password:newPassword}); 
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
      if(editRateId){
          await db.updateAgentCommission(editRateId, newRate); 
          setEditRateId(null); 
          fetchAgents();
      } 
  };

  const openTargetModal = (agent: Agent) => {
      setTargetAgentId(agent.id);
      const existing = agent.targets?.find(t => t.startDate === startDate && t.endDate === endDate);
      setTargetValue(existing ? existing.target : 0);
  }

  const handleUpdateTarget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (targetAgentId) {
        await db.updateAgentTarget(targetAgentId, startDate, endDate, Number(targetValue));
        await fetchAgents();
        setTargetAgentId(null);
    }
  }

  const toggleStatus = async (id: string) => { await db.toggleAgentStatus(id); fetchAgents(); };
  const confirmDelete = async () => { if(deleteId){ await db.deleteAgent(deleteId); setDeleteId(null); fetchAgents();} };
  
  const isDateInRange = (dateStr: string) => {
      const d = new Date(dateStr).getTime();
      const s = new Date(startDate).getTime();
      const e = new Date(endDate).getTime();
      return d >= s && d <= e;
  }

  if (loading) return <Loader />;

  return (
    <div className="space-y-8 relative">
      <ConfirmationModal isOpen={!!deleteId} title="Remove Agent" message="Are you sure?" onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />

      <div className="flex flex-col xl:flex-row justify-between items-end xl:items-center gap-4 pb-6 border-b border-white/5">
        <div>
            <h2 className="text-3xl font-bold text-white font-display">Agents</h2>
            <p className="text-zinc-400 text-sm mt-1">Performance for <span className="text-red-500 font-bold">{activeMonthName}</span></p>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
            <MonthControl />
            <Button icon={<UserPlus size={18} />} onClick={() => setShowAdd(!showAdd)}>Add Agent</Button>
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
                     <Input label="Sales Goal" type="number" value={targetValue} onChange={(e) => setTargetValue(Number(e.target.value))} required />
                     <div className="flex gap-2">
                        <Button type="submit" className="flex-1">Save</Button>
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
                            <Input label="Agent Email" type="email" value={credForm.email} onChange={(e) => setCredForm({...credForm, email: e.target.value})} required />
                            <Input label="New Password" type="text" placeholder="Enter new password" value={credForm.password} onChange={(e) => setCredForm({...credForm, password: e.target.value})} />
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
                            <Input label="Full Name" value={newName} onChange={e=>setNewName(e.target.value)} required />
                            <Input label="Email Address" type="email" value={newEmail} onChange={e=>setNewEmail(e.target.value)} required />
                            <Input label="Initial Password" value={newPassword} onChange={e=>setNewPassword(e.target.value)} required />
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
                            <button onClick={() => openChatWith(agent.id)} className="p-2 bg-zinc-800 rounded-lg text-zinc-400 hover:text-white"><MessageCircle size={16} /></button>
                        </div>
                        
                        <h3 className="text-xl font-bold text-white font-display">{agent.name}</h3>
                        <div className="flex items-center gap-2 text-sm text-zinc-500 mt-1 mb-6"><Mail size={14} /> {agent.email}</div>

                        <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                            <div className="bg-zinc-950/50 rounded-xl p-3 border border-white/5">
                                <div className="flex items-center gap-2 text-yellow-500 mb-1"><Award size={14} /><span className="text-[10px] font-bold uppercase">Pts (Mo)</span></div>
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

                        <div className="mb-4 p-3 bg-zinc-900/30 hover:bg-zinc-800/50 rounded-xl border border-white/5 cursor-pointer group transition-colors relative z-10" onClick={() => openTargetModal(agent)}>
                             <div className="flex justify-between items-end mb-1.5">
                                 <div className="flex items-center gap-2">
                                     <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-1"><Target size={12} /> Monthly Target</span>
                                     <Pencil size={10} className="text-blue-500 opacity-50 group-hover:opacity-100" />
                                 </div>
                                 <span className="text-xs font-bold text-white">{actualSales} / {target > 0 ? target : '-'}</span>
                             </div>
                             <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                                 <motion.div initial={{ width: 0 }} animate={{ width: `${progress}%` }} className={`h-full rounded-full ${progress >= 100 ? 'bg-green-500' : 'bg-gradient-to-r from-red-600 to-red-500'}`} />
                             </div>
                        </div>

                         <div className="mt-auto pt-5 border-t border-white/5 flex justify-between items-center relative z-10">
                            <div className="flex flex-col"><span className="text-[10px] text-zinc-600 uppercase font-bold">Sales</span><span className="text-white font-bold text-lg">{actualSales}</span></div>
                            <div className="flex gap-2">
                                <button onClick={(e) => { e.stopPropagation(); openCredentialsModal(agent); }} className="p-2 bg-zinc-800 hover:text-white text-zinc-400 rounded-lg" title="Manage Password & Email"><KeyRound size={16} /></button>
                                <button onClick={(e) => { e.stopPropagation(); toggleStatus(agent.id); }} className="p-2 bg-zinc-800 hover:text-white text-zinc-400 rounded-lg">{agent.active ? <ShieldBan size={16}/>:<ShieldCheck size={16}/>}</button>
                                <button onClick={(e) => { e.stopPropagation(); setDeleteId(agent.id); }} className="p-2 bg-red-900/20 text-red-500 hover:bg-red-600 hover:text-white rounded-lg"><Trash2 size={16} /></button>
                            </div>
                        </div>
                    </Card>
                </motion.div>
            )})}
        </AnimatePresence>
      </div>
    </div>
  );
};
