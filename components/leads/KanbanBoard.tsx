import React, { useState } from 'react';
import { Customer, PipelineStage, PIPELINE_STAGES } from '../../types';
import { mockDb } from '../../services/mockDb';
import { useAuth } from '../../context/AuthContext';
import { 
  Phone, MessageSquare, MapPin, DollarSign, 
  Calendar, AlertCircle, CheckCircle2, ChevronRight,
  User, Building, Clock, MoreVertical, Plus
} from 'lucide-react';
import { motion } from 'framer-motion';

interface KanbanBoardProps {
  leads: Customer[];
  onSelectLead: (lead: Customer) => void;
  onRefresh: () => void;
}

const STAGE_CONFIG: Record<string, { color: string; badge: string; border: string }> = {
  'New / Unassigned': { color: 'text-zinc-300', badge: 'bg-zinc-800 text-zinc-300', border: 'border-zinc-700' },
  'Attempted Contact': { color: 'text-orange-400', badge: 'bg-orange-950/60 text-orange-400', border: 'border-orange-500/30' },
  'Connected / Contacted': { color: 'text-yellow-400', badge: 'bg-yellow-950/60 text-yellow-400', border: 'border-yellow-500/30' },
  'Requirement Collected / Qualified': { color: 'text-cyan-400', badge: 'bg-cyan-950/60 text-cyan-400', border: 'border-cyan-500/30' },
  'Brochure / Details Sent': { color: 'text-purple-400', badge: 'bg-purple-950/60 text-purple-400', border: 'border-purple-500/30' },
  'Profile / Brochure Sent': { color: 'text-purple-400', badge: 'bg-purple-950/60 text-purple-400', border: 'border-purple-500/30' },
  'Inbound Interest / Call Back Received': { color: 'text-indigo-400', badge: 'bg-indigo-950/60 text-indigo-400', border: 'border-indigo-500/30' },
  'Interested / In Discussion': { color: 'text-indigo-400', badge: 'bg-indigo-950/60 text-indigo-400', border: 'border-indigo-500/30' },
  'Follow-up / Warm Stage': { color: 'text-pink-400', badge: 'bg-pink-950/60 text-pink-400', border: 'border-pink-500/30' },
  'Site Visit Scheduled': { color: 'text-blue-400', badge: 'bg-blue-950/60 text-blue-400', border: 'border-blue-500/30' },
  'Site Visit Completed': { color: 'text-teal-400', badge: 'bg-teal-950/60 text-teal-400', border: 'border-teal-500/30' },
  'Negotiation / Offer Stage': { color: 'text-amber-400', badge: 'bg-amber-950/60 text-amber-400', border: 'border-amber-500/30' },
  'Closed - Won / Deal Booked': { color: 'text-emerald-400', badge: 'bg-emerald-950/60 text-emerald-400', border: 'border-emerald-500/30' },
  'Closed - Lost / Cancelled / Cold': { color: 'text-red-400', badge: 'bg-red-950/60 text-red-400', border: 'border-red-500/30' },
};

export const KanbanBoard: React.FC<KanbanBoardProps> = ({
  leads,
  onSelectLead,
  onRefresh
}) => {
  const { user } = useAuth();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dragOverStage, setDragOverStage] = useState<PipelineStage | null>(null);

  const handleDragStart = (e: React.DragEvent, leadId: string) => {
    e.dataTransfer.setData('text/plain', leadId);
    setDraggedLeadId(leadId);
  };

  const handleDragOver = (e: React.DragEvent, stage: PipelineStage) => {
    e.preventDefault();
    if (dragOverStage !== stage) {
      setDragOverStage(stage);
    }
  };

  const handleDrop = async (e: React.DragEvent, targetStage: PipelineStage) => {
    e.preventDefault();
    setDragOverStage(null);
    const leadId = e.dataTransfer.getData('text/plain') || draggedLeadId;
    if (!leadId) return;

    const lead = leads.find(l => l.id === leadId);
    if (lead && lead.status !== targetStage) {
      await mockDb.updateCustomer(leadId, { status: targetStage }, user || undefined);
      onRefresh();
    }
    setDraggedLeadId(null);
  };

  const formatCurrency = (val: number) => {
    if (val >= 1000000) return `$${(val / 1000000).toFixed(1)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}K`;
    return `$${val}`;
  };

  return (
    <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x select-none min-h-[calc(100vh-280px)]">
      {PIPELINE_STAGES.map((stage, idx) => {
        const stageLeads = leads.filter(l => l.status === stage);
        const totalValue = stageLeads.reduce((acc, curr) => acc + (curr.budget || 0), 0);
        const config = STAGE_CONFIG[stage] || STAGE_CONFIG['New / Unassigned'];
        const isTargeted = dragOverStage === stage;

        return (
          <div
            key={stage}
            onDragOver={(e) => handleDragOver(e, stage)}
            onDragLeave={() => setDragOverStage(null)}
            onDrop={(e) => handleDrop(e, stage)}
            className={`w-72 shrink-0 flex flex-col rounded-2xl bg-[#09090b]/90 border transition-all duration-200 ${
              isTargeted 
                ? 'border-red-500 bg-red-950/10 shadow-[0_0_16px_rgba(220,38,38,0.2)]' 
                : 'border-zinc-800/80 hover:border-zinc-700/80'
            }`}
          >
            {/* Stage Header */}
            <div className="p-3.5 border-b border-zinc-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <span className="w-5 h-5 rounded-full bg-zinc-900 border border-zinc-800 text-[10px] font-bold text-zinc-400 flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <h3 className={`text-xs font-bold truncate ${config.color}`} title={stage}>
                  {stage}
                </h3>
              </div>
              <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${config.badge}`}>
                {stageLeads.length}
              </span>
            </div>

            {/* Stage Pipeline Value */}
            <div className="px-3.5 py-1.5 bg-zinc-950/50 border-b border-zinc-800/40 flex items-center justify-between text-[11px]">
              <span className="text-zinc-500">Pipeline Value</span>
              <span className="text-zinc-300 font-semibold">{formatCurrency(totalValue)}</span>
            </div>

            {/* Cards Column */}
            <div className="flex-1 p-2.5 space-y-2.5 overflow-y-auto max-h-[calc(100vh-360px)] min-h-[140px]">
              {stageLeads.map(lead => (
                <div
                  key={lead.id}
                  draggable
                  onDragStart={(e) => handleDragStart(e, lead.id)}
                  onClick={() => onSelectLead(lead)}
                  className="group relative p-3 bg-zinc-900/90 hover:bg-zinc-850 rounded-xl border border-zinc-800 hover:border-red-500/40 cursor-grab active:cursor-grabbing transition-all shadow-md hover:shadow-lg space-y-2.5"
                >
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="truncate">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-white group-hover:text-red-400 transition-colors truncate">
                          {lead.name}
                        </span>
                        {lead.priority === 'Urgent' && (
                          <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" title="Urgent Priority" />
                        )}
                        {lead.priority === 'High' && (
                          <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" title="High Priority" />
                        )}
                      </div>
                      <span className="text-[10px] text-zinc-400 block truncate mt-0.5">
                        {lead.interestedProject || 'Any Project'} • {lead.projectType || 'Villa'}
                      </span>
                    </div>

                    <span className="text-[11px] font-bold text-emerald-400 shrink-0">
                      {formatCurrency(lead.budget)}
                    </span>
                  </div>

                  {/* Badges / Follow up */}
                  <div className="flex items-center justify-between text-[10px] text-zinc-400 pt-1 border-t border-zinc-800/60">
                    <span className="flex items-center gap-1 truncate max-w-[120px]">
                      <User size={11} className="text-zinc-500 shrink-0" />
                      <span className="truncate">{lead.agentName || 'Unassigned'}</span>
                    </span>

                    {lead.nextFollowUpDate ? (
                      <span className="flex items-center gap-1 text-amber-400/90 font-medium">
                        <Clock size={11} />
                        {lead.nextFollowUpDate.slice(5)}
                      </span>
                    ) : (
                      <span className="text-zinc-600">No date</span>
                    )}
                  </div>

                  {/* Activity Counters on Card */}
                  <div className="flex items-center gap-3 text-[10px] text-zinc-500 pt-0.5">
                    <span className="flex items-center gap-1" title="Calls">
                      <Phone size={10} className={lead.callCount ? 'text-zinc-300' : 'text-zinc-600'} />
                      {lead.callCount || 0}
                    </span>
                    <span className="flex items-center gap-1" title="WhatsApp Messages">
                      <MessageSquare size={10} className={lead.whatsappCount ? 'text-emerald-400' : 'text-zinc-600'} />
                      {lead.whatsappCount || 0}
                    </span>
                    <span className="flex items-center gap-1" title="Site Visits">
                      <MapPin size={10} className={lead.siteVisitCount ? 'text-blue-400' : 'text-zinc-600'} />
                      {lead.siteVisitCount || 0}
                    </span>
                    {lead.materialsSent && lead.materialsSent.length > 0 && (
                      <span className="ml-auto px-1.5 py-0.2 rounded bg-purple-950/60 text-purple-400 text-[9px] font-semibold border border-purple-500/20">
                        {lead.materialsSent.length} Doc{lead.materialsSent.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </div>
              ))}

              {stageLeads.length === 0 && (
                <div className="h-24 border border-dashed border-zinc-800/80 rounded-xl flex items-center justify-center text-[11px] text-zinc-600">
                  Drop leads here
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
