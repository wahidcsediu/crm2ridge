import React, { useState, useEffect } from 'react';
import { Customer, WhatsAppMessage, PipelineStage, PIPELINE_STAGES } from '../types';
import { mockDb } from '../services/mockDb';
import { useAuth } from '../context/AuthContext';
import { 
  MessageSquare, Send, Paperclip, FileText, 
  Search, CheckCheck, Phone, MapPin, Building, 
  DollarSign, ArrowRight, User, Share2, Sparkles, CheckCircle2, Clock
} from 'lucide-react';
import { motion } from 'framer-motion';

export const WhatsAppHub: React.FC = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState<Customer[]>([]);
  const [selectedLead, setSelectedLead] = useState<Customer | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Material attachment modal state
  const [isAttaching, setIsAttaching] = useState(false);
  const [materialType, setMaterialType] = useState<string>('Brochure');
  const [materialTitle, setMaterialTitle] = useState('');

  const loadData = async () => {
    const fetchedLeads = await mockDb.getCustomers();
    setLeads(fetchedLeads);
    if (fetchedLeads.length > 0 && !selectedLead) {
      setSelectedLead(fetchedLeads[0]);
      loadMessages(fetchedLeads[0].id);
    } else if (selectedLead) {
      const refreshed = fetchedLeads.find(l => l.id === selectedLead.id);
      if (refreshed) setSelectedLead(refreshed);
      loadMessages(selectedLead.id);
    }
  };

  const loadMessages = async (leadId: string) => {
    const msgs = await mockDb.getWhatsAppMessages(leadId);
    setMessages(msgs);
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSelectLead = (lead: Customer) => {
    setSelectedLead(lead);
    loadMessages(lead.id);
    setIsAttaching(false);
  };

  const handleSendMessage = async (includeAttachment = false) => {
    if (!selectedLead) return;
    if (!inputText.trim() && !includeAttachment) return;
    setIsSending(true);

    const attachments = includeAttachment && materialTitle.trim() ? [
      {
        type: materialType.toLowerCase().replace(' ', '_') as any,
        name: materialTitle.trim(),
        size: '5.2 MB'
      }
    ] : undefined;

    await mockDb.sendWhatsAppMessage({
      leadId: selectedLead.id,
      leadName: selectedLead.name,
      senderType: 'agent',
      senderId: user?.id || 'agent-1',
      senderName: user?.name || 'Agent',
      phone: selectedLead.whatsappNumber || selectedLead.phone,
      text: inputText.trim() || `Dispatched ${materialTitle}`,
      attachments
    });

    setInputText('');
    setMaterialTitle('');
    setIsAttaching(false);
    setIsSending(false);
    await loadData();
  };

  const handleStageChange = async (newStage: PipelineStage) => {
    if (!selectedLead) return;
    await mockDb.updateCustomer(selectedLead.id, { status: newStage }, user || undefined);
    await loadData();
  };

  const filteredLeads = leads.filter(l => 
    l.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.phone.includes(searchTerm) ||
    (l.interestedProject && l.interestedProject.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col space-y-4">
      {/* Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white font-display flex items-center gap-3">
            WhatsApp Communication & Material Hub
            <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
              Live Messaging
            </span>
          </h1>
          <p className="text-xs text-zinc-400 mt-0.5">
            Manage WhatsApp conversations with leads, dispatch verified brochures, blueprints, and record communication history.
          </p>
        </div>
      </div>

      {/* Main 3-Column Interface */}
      <div className="flex-1 bg-zinc-950/90 rounded-2xl border border-zinc-800/80 overflow-hidden grid grid-cols-1 md:grid-cols-12">
        {/* LEFT COLUMN: Lead Conversations List */}
        <div className="md:col-span-4 lg:col-span-3 border-r border-zinc-800/80 flex flex-col h-full bg-[#08080a]">
          {/* Search */}
          <div className="p-3 border-b border-zinc-800/80">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search conversations..."
                className="w-full bg-zinc-900 border border-zinc-700/80 rounded-xl pl-8 pr-3 py-1.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
            {filteredLeads.map(lead => {
              const isSelected = selectedLead?.id === lead.id;
              return (
                <div
                  key={lead.id}
                  onClick={() => handleSelectLead(lead)}
                  className={`p-3.5 cursor-pointer transition-colors flex items-start justify-between gap-2 ${
                    isSelected ? 'bg-zinc-900/90 border-l-4 border-l-emerald-500' : 'hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="truncate">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white truncate">{lead.name}</span>
                      {lead.whatsappCount && lead.whatsappCount > 0 ? (
                        <span className="w-4 h-4 rounded-full bg-emerald-950 text-emerald-400 text-[9px] font-bold flex items-center justify-center border border-emerald-500/30">
                          {lead.whatsappCount}
                        </span>
                      ) : null}
                    </div>
                    <span className="text-[11px] text-zinc-400 block truncate mt-0.5 font-mono">
                      {lead.whatsappNumber || lead.phone}
                    </span>
                    <span className="text-[10px] text-zinc-500 block truncate mt-1">
                      {lead.interestedProject || 'Any Project'} • {lead.status}
                    </span>
                  </div>

                  <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                    {new Date(lead.updatedAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* MIDDLE COLUMN: Active WhatsApp Conversation Thread */}
        <div className="md:col-span-8 lg:col-span-6 flex flex-col h-full bg-[#0a0a0c]">
          {selectedLead ? (
            <>
              {/* Chat Header */}
              <div className="p-3.5 bg-zinc-900/60 border-b border-zinc-800/80 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-emerald-900 text-white font-bold flex items-center justify-center text-sm shadow-md border border-emerald-500/20">
                    {selectedLead.name.charAt(0)}
                  </div>
                  <div>
                    <h2 className="text-xs font-bold text-white flex items-center gap-2">
                      {selectedLead.name}
                      <span className="text-[10px] font-normal text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active WhatsApp
                      </span>
                    </h2>
                    <p className="text-[10px] text-zinc-400 font-mono">{selectedLead.whatsappNumber || selectedLead.phone}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-zinc-500">Assigned: <strong className="text-zinc-300">{selectedLead.agentName || 'None'}</strong></span>
                </div>
              </div>

              {/* Messages Body */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#060608]">
                {messages.length > 0 ? (
                  messages.map(msg => {
                    const isAgent = msg.senderType === 'agent';
                    return (
                      <div 
                        key={msg.id}
                        className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                      >
                        <div className={`max-w-[85%] rounded-2xl p-3.5 shadow-md ${
                          isAgent 
                            ? 'bg-emerald-950/70 text-emerald-100 border border-emerald-500/30 rounded-tr-none' 
                            : 'bg-zinc-900/90 text-zinc-200 border border-zinc-800 rounded-tl-none'
                        }`}>
                          <div className="flex items-center justify-between gap-4 mb-1 text-[10px] text-zinc-400">
                            <span className="font-bold">{msg.senderName}</span>
                            <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-xs leading-relaxed">{msg.text}</p>

                          {/* Attachments */}
                          {msg.attachments && msg.attachments.length > 0 && (
                            <div className="mt-2.5 space-y-1.5 pt-2 border-t border-white/10">
                              {msg.attachments.map((att, idx) => (
                                <div key={idx} className="flex items-center gap-2.5 p-2 bg-black/40 rounded-xl text-xs border border-white/10">
                                  <FileText size={16} className="text-emerald-400" />
                                  <span className="font-medium truncate text-white">{att.name}</span>
                                  <span className="text-[10px] text-zinc-400 ml-auto">{att.size}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <span className="text-[10px] text-zinc-500 mt-1 px-1 flex items-center gap-1">
                          {isAgent ? (
                            <>
                              <CheckCheck size={12} className="text-emerald-400" /> Read
                            </>
                          ) : 'Incoming Client WhatsApp'}
                        </span>
                      </div>
                    );
                  })
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
                    <MessageSquare size={36} className="text-zinc-700 mb-2" />
                    <p className="font-semibold text-zinc-400">Start WhatsApp Conversation with {selectedLead.name}</p>
                    <p className="text-[11px] text-zinc-600 mt-1">Send a message or attach an official project brochure below.</p>
                  </div>
                )}
              </div>

              {/* Material Attachment Box if active */}
              {isAttaching && (
                <div className="p-3 bg-zinc-900 border-t border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between text-xs text-zinc-300 font-semibold">
                    <span className="flex items-center gap-2 text-purple-400">
                      <Share2 size={14} /> Attach Real Estate Document
                    </span>
                    <button onClick={() => setIsAttaching(false)} className="text-zinc-500 hover:text-white">
                      Cancel
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <select
                      value={materialType}
                      onChange={(e) => setMaterialType(e.target.value)}
                      className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    >
                      <option value="Brochure">Brochure Catalog</option>
                      <option value="Project Profile">Project Profile</option>
                      <option value="Price Sheet">Official Price Sheet</option>
                      <option value="Floor Plan">Floor Plan Blueprint</option>
                      <option value="Video Tour">4K Video / Drone Tour</option>
                      <option value="Payment Plan">Installment Payment Plan</option>
                    </select>

                    <input
                      type="text"
                      value={materialTitle}
                      onChange={(e) => setMaterialTitle(e.target.value)}
                      placeholder="e.g. Ridge Park Master Plan 2026.pdf"
                      className="bg-zinc-950 border border-zinc-700 rounded-lg px-2.5 py-1.5 text-xs text-white"
                    />
                  </div>
                </div>
              )}

              {/* Quick Template Chips */}
              <div className="px-3 py-2 bg-zinc-900/40 border-t border-zinc-800/80 flex items-center gap-2 overflow-x-auto">
                <span className="text-[10px] text-zinc-500 whitespace-nowrap">Templates:</span>
                {[
                  '👋 Intro & Brochure',
                  '🏡 Site Walkthrough Confirmation',
                  '💰 Installment Breakdown',
                  '⏳ Follow-Up Check'
                ].map((tpl, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      if (i === 0) setInputText(`Hi ${selectedLead.name}, sending you our comprehensive brochure and floor plan.`);
                      if (i === 1) setInputText(`Dear ${selectedLead.name}, confirming your scheduled site visit walkthrough.`);
                      if (i === 2) setInputText(`Hi ${selectedLead.name}, here is the updated installment breakdown for your requested unit.`);
                      if (i === 3) setInputText(`Hello ${selectedLead.name}, just checking in to see if you had any questions regarding the property.`);
                    }}
                    className="px-2 py-1 rounded-md bg-zinc-800/80 hover:bg-zinc-700 text-[10px] text-zinc-300 whitespace-nowrap transition-colors"
                  >
                    {tpl}
                  </button>
                ))}
              </div>

              {/* Chat Input Bar */}
              <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex items-center gap-2">
                <button
                  onClick={() => setIsAttaching(!isAttaching)}
                  className={`p-2 rounded-xl transition-all ${
                    isAttaching ? 'bg-purple-600 text-white' : 'bg-zinc-800 hover:bg-zinc-700 text-zinc-400 hover:text-white'
                  }`}
                  title="Attach Property Brochure / Price Sheet"
                >
                  <Paperclip size={16} />
                </button>

                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(isAttaching)}
                  placeholder="Type a WhatsApp message..."
                  className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                />

                <button
                  onClick={() => handleSendMessage(isAttaching)}
                  disabled={isSending || (!inputText.trim() && !isAttaching)}
                  className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-all shadow-md"
                >
                  <Send size={16} />
                </button>
              </div>
            </>
          ) : (
            <div className="h-full flex items-center justify-center text-zinc-500 text-xs">
              Select a conversation from the left to view WhatsApp chat.
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Client Dossier & Quick Actions */}
        <div className="hidden lg:flex lg:col-span-3 border-l border-zinc-800/80 flex-col h-full bg-[#08080a] p-4 space-y-4 overflow-y-auto">
          {selectedLead ? (
            <>
              <div>
                <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Client Dossier</h3>
                <div className="mt-3 p-3 bg-zinc-900/60 rounded-xl border border-zinc-800/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{selectedLead.name}</span>
                    <span className="text-[10px] font-semibold text-emerald-400">${(selectedLead.budget || 0).toLocaleString()}</span>
                  </div>
                  <div className="text-[11px] text-zinc-400 space-y-1">
                    <div className="flex items-center gap-1.5">
                      <Building size={12} className="text-zinc-500" />
                      <span>{selectedLead.interestedProject || 'Any Project'} ({selectedLead.projectType || 'Villa'})</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <MapPin size={12} className="text-zinc-500" />
                      <span>{selectedLead.preferredLocation || 'Metropolitan'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stage Quick Switcher */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">Current Pipeline Stage</label>
                <select
                  value={selectedLead.status}
                  onChange={(e) => handleStageChange(e.target.value as PipelineStage)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  {PIPELINE_STAGES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              {/* Dispatched Materials */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                  <FileText size={14} /> Shared Materials ({selectedLead.materialsSent?.length || 0})
                </h3>

                {selectedLead.materialsSent && selectedLead.materialsSent.length > 0 ? (
                  <div className="space-y-2">
                    {selectedLead.materialsSent.map(m => (
                      <div key={m.id} className="p-2.5 bg-zinc-900/60 rounded-xl border border-purple-500/20 text-xs">
                        <p className="font-semibold text-white truncate">{m.title}</p>
                        <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-1">
                          <span>{m.type}</span>
                          <span>{new Date(m.sentAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-[11px] text-zinc-500 italic">No materials sent yet via WhatsApp.</p>
                )}
              </div>

              {/* Follow up Schedule */}
              <div className="p-3 bg-amber-950/30 rounded-xl border border-amber-500/20 text-xs space-y-1">
                <div className="text-amber-400 font-bold flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
                  <Clock size={13} /> Next Follow-Up
                </div>
                {selectedLead.nextFollowUpDate ? (
                  <p className="text-zinc-200 font-medium">
                    {selectedLead.nextFollowUpDate} {selectedLead.nextFollowUpTime}
                  </p>
                ) : (
                  <p className="text-zinc-500">None scheduled</p>
                )}
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );
};
