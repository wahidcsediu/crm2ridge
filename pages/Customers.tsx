import React, { useState, useEffect } from 'react';
import { Customer, PipelineStage, PIPELINE_STAGES, LeadCategory, LeadSource, PriorityLevel } from '../types';
import { mockDb } from '../services/mockDb';
import { useAuth } from '../context/AuthContext';
import { KanbanBoard } from '../components/leads/KanbanBoard';
import { LeadDetailsModal } from '../components/leads/LeadDetailsModal';
import { AddLeadModal } from '../components/leads/AddLeadModal';
import { ImportLeadsModal } from '../components/leads/ImportLeadsModal';
import { 
  Kanban, List, Search, Filter, Plus, Upload, 
  Phone, MessageSquare, MapPin, User, Building, 
  DollarSign, ArrowUpDown, ChevronDown, CheckSquare, RefreshCw, X
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Customers: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Customer[]>([]);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterSource, setFilterSource] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  const [filterAgent, setFilterAgent] = useState<string>('all');

  // Modals
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  // Quick Assignment for Multiple or Single
  const [agents, setAgents] = useState<{ id: string; name: string }[]>([]);

  const loadData = async () => {
    const fetchedLeads = await mockDb.getCustomers();
    setLeads(fetchedLeads);

    const fetchedAgents = await mockDb.getAgents();
    setAgents(fetchedAgents.map(a => ({ id: a.id, name: a.name })));
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenLead = (lead: Customer) => {
    setSelectedLeadId(lead.id);
    setIsDetailsOpen(true);
  };

  const handleQuickAssign = async (leadId: string, agentId: string) => {
    const targetAgent = agents.find(a => a.id === agentId);
    if (targetAgent) {
      await mockDb.updateCustomer(leadId, {
        agentId: targetAgent.id,
        agentName: targetAgent.name
      }, user || undefined);
      loadData();
    }
  };

  // Filtered Leads
  const filteredLeads = leads.filter(lead => {
    const matchSearch = searchTerm === '' || 
      lead.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lead.phone.includes(searchTerm) ||
      (lead.interestedProject && lead.interestedProject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.agentName && lead.agentName.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchStage = filterStage === 'all' || lead.status === filterStage;
    const matchCategory = filterCategory === 'all' || lead.category === filterCategory;
    const matchSource = filterSource === 'all' || lead.source === filterSource;
    const matchPriority = filterPriority === 'all' || lead.priority === filterPriority;
    const matchAgent = filterAgent === 'all' || lead.agentId === filterAgent;

    return matchSearch && matchStage && matchCategory && matchSource && matchPriority && matchAgent;
  });

  const formatCurrency = (val: number) => {
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Master Action Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white font-display flex items-center gap-3">
            Lead Management & Pipeline
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-red-950/80 text-red-400 border border-red-500/30">
              {leads.length} Total Records
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            End-to-end client journey tracking across the full 11-stage sales funnel with live WhatsApp & activity audit.
          </p>
        </div>

        {/* View switcher and Create buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              onClick={() => setViewMode('kanban')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'kanban' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Kanban size={14} /> Pipeline Kanban
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                viewMode === 'table' ? 'bg-red-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <List size={14} /> Data Table
            </button>
          </div>

          <button
            onClick={() => setIsImportOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-all"
          >
            <Upload size={14} /> Bulk Import
          </button>

          <button
            onClick={() => setIsAddOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-lg shadow-red-600/20 transition-all"
          >
            <Plus size={14} /> Register Lead
          </button>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="bg-zinc-950/80 p-4 rounded-2xl border border-zinc-800/80 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Box */}
          <div className="lg:col-span-2 relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search lead name, phone, project, agent..."
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
            />
          </div>

          {/* Stage Filter */}
          <div>
            <select
              value={filterStage}
              onChange={(e) => setFilterStage(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
            >
              <option value="all">All Pipeline Stages</option>
              {PIPELINE_STAGES.map(st => (
                <option key={st} value={st}>{st}</option>
              ))}
            </select>
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
            >
              <option value="all">All Categories</option>
              <option value="Prospective Client">Prospective Client</option>
              <option value="Outbound Lead">Outbound Lead</option>
              <option value="Inbound Lead">Inbound Lead</option>
              <option value="VIP Investor">VIP Investor</option>
            </select>
          </div>

          {/* Source Filter */}
          <div>
            <select
              value={filterSource}
              onChange={(e) => setFilterSource(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
            >
              <option value="all">All Lead Sources</option>
              <option value="WhatsApp">WhatsApp</option>
              <option value="Website Inquiry">Website Inquiry</option>
              <option value="Facebook Ads">Facebook Ads</option>
              <option value="Google Search">Google Search</option>
              <option value="Referral">Referral</option>
              <option value="Property Expo">Property Expo</option>
              <option value="Broker Network">Broker Network</option>
            </select>
          </div>

          {/* Agent Filter */}
          <div>
            <select
              value={filterAgent}
              onChange={(e) => setFilterAgent(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-zinc-200 focus:outline-none focus:border-red-500"
            >
              <option value="all">All Assigned Agents</option>
              {agents.map(ag => (
                <option key={ag.id} value={ag.id}>{ag.name}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Filter Quick Reset */}
        {(filterStage !== 'all' || filterCategory !== 'all' || filterSource !== 'all' || filterPriority !== 'all' || filterAgent !== 'all' || searchTerm) && (
          <div className="flex items-center gap-2 pt-1">
            <span className="text-[11px] text-zinc-400">Active filters:</span>
            <button
              onClick={() => {
                setFilterStage('all');
                setFilterCategory('all');
                setFilterSource('all');
                setFilterPriority('all');
                setFilterAgent('all');
                setSearchTerm('');
              }}
              className="text-[11px] text-red-400 hover:text-red-300 flex items-center gap-1 font-medium underline"
            >
              <X size={12} /> Clear all filters ({filteredLeads.length} matches)
            </button>
          </div>
        )}
      </div>

      {/* Main View Display */}
      {viewMode === 'kanban' ? (
        <KanbanBoard
          leads={filteredLeads}
          onSelectLead={handleOpenLead}
          onRefresh={loadData}
        />
      ) : (
        /* TABLE VIEW */
        <div className="bg-zinc-950/80 rounded-2xl border border-zinc-800/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-zinc-900/60 text-zinc-400 uppercase tracking-wider font-semibold border-b border-zinc-800">
                <tr>
                  <th className="p-4">Client Name & Info</th>
                  <th className="p-4">Category / Source</th>
                  <th className="p-4">Pipeline Stage</th>
                  <th className="p-4">Budget</th>
                  <th className="p-4">Assigned Agent</th>
                  <th className="p-4">Activity Log</th>
                  <th className="p-4">Next Follow-Up</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {filteredLeads.map(lead => (
                  <tr 
                    key={lead.id} 
                    onClick={() => handleOpenLead(lead)}
                    className="hover:bg-zinc-900/50 cursor-pointer transition-colors"
                  >
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{lead.name}</div>
                      <div className="text-zinc-400 text-[11px] flex items-center gap-2 mt-0.5">
                        <span>{lead.phone}</span>
                        {lead.interestedProject && (
                          <span className="text-zinc-500">• {lead.interestedProject}</span>
                        )}
                      </div>
                    </td>

                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-zinc-900 text-zinc-300 border border-zinc-800 block w-fit">
                        {lead.category}
                      </span>
                      <span className="text-[10px] text-zinc-500 block mt-1">{lead.source}</span>
                    </td>

                    <td className="p-4">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-semibold bg-zinc-900 text-zinc-200 border border-zinc-700 whitespace-nowrap">
                        {lead.status}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="font-bold text-emerald-400 text-sm">
                        {formatCurrency(lead.budget)}
                      </span>
                      <span className="text-[10px] text-zinc-500 block">{lead.projectType || 'Property'}</span>
                    </td>

                    <td className="p-4" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={lead.agentId || ''}
                        onChange={(e) => handleQuickAssign(lead.id, e.target.value)}
                        className="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-xs text-zinc-300 focus:outline-none focus:border-red-500"
                      >
                        <option value="">Unassigned</option>
                        {agents.map(ag => (
                          <option key={ag.id} value={ag.id}>{ag.name}</option>
                        ))}
                      </select>
                    </td>

                    <td className="p-4 text-zinc-400">
                      <div className="flex items-center gap-2.5 text-[11px]">
                        <span className="flex items-center gap-1" title="Calls">
                          <Phone size={12} className="text-zinc-500" /> {lead.callCount || 0}
                        </span>
                        <span className="flex items-center gap-1" title="WhatsApp">
                          <MessageSquare size={12} className="text-emerald-500" /> {lead.whatsappCount || 0}
                        </span>
                        <span className="flex items-center gap-1" title="Site Visits">
                          <MapPin size={12} className="text-blue-500" /> {lead.siteVisitCount || 0}
                        </span>
                      </div>
                    </td>

                    <td className="p-4">
                      {lead.nextFollowUpDate ? (
                        <div className="text-amber-400 text-[11px] font-medium">
                          {lead.nextFollowUpDate}
                          {lead.nextFollowUpTime && <span className="text-zinc-500 block text-[10px]">{lead.nextFollowUpTime}</span>}
                        </div>
                      ) : (
                        <span className="text-zinc-600 text-[11px]">None scheduled</span>
                      )}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenLead(lead);
                        }}
                        className="px-3 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold border border-zinc-700 transition-all"
                      >
                        Open Profile
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      <LeadDetailsModal
        leadId={selectedLeadId}
        isOpen={isDetailsOpen}
        onClose={() => {
          setIsDetailsOpen(false);
          setSelectedLeadId(null);
        }}
        onLeadUpdated={loadData}
      />

      <AddLeadModal
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onLeadAdded={loadData}
      />

      <ImportLeadsModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onLeadsImported={loadData}
      />
    </div>
  );
};
