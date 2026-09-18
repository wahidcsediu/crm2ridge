import React, { useState, useEffect } from 'react';
import { Customer, ActivityLog, WhatsAppMessage, SharedMaterial, PIPELINE_STAGES, PipelineStage } from '../../types';
import { mockDb } from '../../services/mockDb';
import { useAuth } from '../../context/AuthContext';
import confetti from 'canvas-confetti';
import { 
  X, Phone, MessageSquare, Send, Calendar, CheckCircle2, 
  Clock, MapPin, Building, DollarSign, FileText, 
  Share2, AlertCircle, ArrowRight, User, Tag, 
  ExternalLink, Plus, RefreshCw, XCircle, Trophy
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface LeadDetailsModalProps {
  leadId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onLeadUpdated: () => void;
}

export const LeadDetailsModal: React.FC<LeadDetailsModalProps> = ({
  leadId,
  isOpen,
  onClose,
  onLeadUpdated
}) => {
  const { user } = useAuth();
  const [lead, setLead] = useState<Customer | null>(null);
  const [activities, setActivities] = useState<ActivityLog[]>([]);
  const [whatsappMessages, setWhatsappMessages] = useState<WhatsAppMessage[]>([]);
  const [activeTab, setActiveTab] = useState<'overview' | 'whatsapp' | 'call' | 'visit' | 'negotiation' | 'deal' | 'timeline'>('overview');
  
  // WhatsApp State
  const [waText, setWaText] = useState('');
  const [selectedMaterialType, setSelectedMaterialType] = useState<string>('Brochure');
  const [materialTitle, setMaterialTitle] = useState('');
  const [isSendingWa, setIsSendingWa] = useState(false);

  // Call Logger State
  const [callOutcome, setCallOutcome] = useState<'Connected' | 'No Answer' | 'Busy' | 'Unreachable'>('Connected');
  const [callDuration, setCallDuration] = useState<number>(5);
  const [callNotes, setCallNotes] = useState('');
  const [callNextFollowUpDate, setCallNextFollowUpDate] = useState('');
  const [callNextFollowUpTime, setCallNextFollowUpTime] = useState('10:00');

  // Site Visit State
  const [visitAction, setVisitAction] = useState<'schedule' | 'complete'>('schedule');
  const [visitProject, setVisitProject] = useState('');
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [visitTime, setVisitTime] = useState('11:00 AM');
  const [visitHours, setVisitHours] = useState<number>(1.5);
  const [visitAttendees, setVisitAttendees] = useState<number>(2);
  const [visitFeedback, setVisitFeedback] = useState('');
  const [visitInterest, setVisitInterest] = useState<'High' | 'Medium' | 'Low'>('High');
  const [visitObjections, setVisitObjections] = useState('');

  // Negotiation State
  const [negOfferAmount, setNegOfferAmount] = useState<number>(0);
  const [negDiscount, setNegDiscount] = useState<number>(0);
  const [negPaymentPlan, setNegPaymentPlan] = useState('20% Down + 24 Month Installment');
  const [negBookingAmount, setNegBookingAmount] = useState<number>(0);
  const [negUnit, setNegUnit] = useState('');
  const [negNotes, setNegNotes] = useState('');

  // Deal Won / Lost State
  const [dealFinalPrice, setDealFinalPrice] = useState<number>(0);
  const [dealBookingAmount, setDealBookingAmount] = useState<number>(0);
  const [dealPaymentPlan, setDealPaymentPlan] = useState('Escrow Cash Settlement');
  const [dealNotes, setDealNotes] = useState('');
  const [lossReason, setLossReason] = useState('High price');
  const [lossNotes, setLossNotes] = useState('');

  // Edit Requirements State
  const [isEditingReqs, setIsEditingReqs] = useState(false);
  const [editBudget, setEditBudget] = useState(0);
  const [editLocation, setEditLocation] = useState('');
  const [editProjectType, setEditProjectType] = useState<'Apartment' | 'House' | 'Villa' | 'Commercial' | 'Land' | 'Penthouse' | 'Duplex'>('Villa');
  const [editUnitSize, setEditUnitSize] = useState('');
  const [editTimeline, setEditTimeline] = useState<'Immediate (0-30 days)' | '1-3 Months' | '3-6 Months' | 'Exploring / Flexible'>('Immediate (0-30 days)');
  const [editReqNotes, setEditReqNotes] = useState('');

  useEffect(() => {
    if (leadId && isOpen) {
      loadLeadData(leadId);
    }
  }, [leadId, isOpen]);

  const loadLeadData = async (id: string) => {
    const cust = await mockDb.getCustomerById(id);
    if (cust) {
      setLead(cust);
      setVisitProject(cust.interestedProject || 'Sunset Villa');
      setNegOfferAmount(cust.budget);
      setDealFinalPrice(cust.budget);
      setNegUnit(cust.preferredUnit || '');
      setEditBudget(cust.budget);
      setEditLocation(cust.preferredLocation || '');
      setEditProjectType(cust.projectType || 'Villa');
      setEditUnitSize(cust.unitSize || '');
      setEditTimeline(cust.timeline || 'Immediate (0-30 days)');
      setEditReqNotes(cust.requirementsNotes || '');

      const acts = await mockDb.getActivities({ leadId: id });
      setActivities(acts);

      const msgs = await mockDb.getWhatsAppMessages(id);
      setWhatsappMessages(msgs);
    }
  };

  if (!isOpen || !lead) return null;

  const handleStageChange = async (newStage: PipelineStage) => {
    if (newStage === lead.status) return;

    if (newStage === 'Closed - Won / Deal Booked') {
      setActiveTab('deal');
      return;
    }
    if (newStage === 'Closed - Lost / Cancelled / Cold') {
      setActiveTab('deal');
      return;
    }

    await mockDb.updateCustomer(lead.id, { status: newStage }, user || undefined);
    await loadLeadData(lead.id);
    onLeadUpdated();
  };

  const handleSendWhatsApp = async (includeAttachment = false) => {
    if (!waText.trim() && !includeAttachment) return;
    setIsSendingWa(true);

    const attachments = includeAttachment && materialTitle.trim() ? [
      {
        type: selectedMaterialType.toLowerCase().replace(' ', '_') as any,
        name: materialTitle.trim(),
        size: '4.8 MB'
      }
    ] : undefined;

    await mockDb.sendWhatsAppMessage({
      leadId: lead.id,
      leadName: lead.name,
      senderType: 'agent',
      senderId: user?.id || 'agent-1',
      senderName: user?.name || 'Agent',
      phone: lead.whatsappNumber || lead.phone,
      text: waText.trim() || `Sent ${materialTitle}`,
      attachments
    });

    setWaText('');
    setMaterialTitle('');
    setIsSendingWa(false);
    await loadLeadData(lead.id);
    onLeadUpdated();
  };

  const handleLogCall = async () => {
    let nextStage = lead.status;
    if (lead.status === 'New / Unassigned' || lead.status === 'Attempted Contact') {
      if (callOutcome === 'Connected') {
        nextStage = 'Connected / Contacted';
      } else {
        nextStage = 'Attempted Contact';
      }
    }

    await mockDb.logActivity({
      leadId: lead.id,
      leadName: lead.name,
      agentId: user?.id || lead.agentId || 'agent-1',
      agentName: user?.name || lead.agentName || 'Agent',
      type: 'call',
      title: `Outbound Call (${callOutcome})`,
      description: callNotes || `Call logged with outcome: ${callOutcome}. Duration: ${callDuration} mins.`,
      outcome: callOutcome,
      durationMinutes: callDuration,
      previousStatus: lead.status,
      newStatus: nextStage,
      nextFollowUpDate: callNextFollowUpDate || undefined
    });

    setCallNotes('');
    setCallNextFollowUpDate('');
    await loadLeadData(lead.id);
    onLeadUpdated();
    setActiveTab('timeline');
  };

  const handleSaveSiteVisit = async () => {
    if (visitAction === 'schedule') {
      await mockDb.logActivity({
        leadId: lead.id,
        leadName: lead.name,
        agentId: user?.id || lead.agentId || 'agent-1',
        agentName: user?.name || lead.agentName || 'Agent',
        type: 'site_visit_scheduled',
        title: `Site Visit Scheduled: ${visitProject}`,
        description: `Scheduled walkthrough for ${lead.name} at ${visitProject} on ${visitDate} at ${visitTime}. Expected attendees: ${visitAttendees}.`,
        outcome: 'Visit Scheduled',
        previousStatus: lead.status,
        newStatus: 'Site Visit Scheduled',
        siteVisitDetails: {
          project: visitProject,
          visitDate,
          visitTime,
          durationHours: visitHours,
          attendeesCount: visitAttendees,
          interestLevel: visitInterest
        }
      });
      await mockDb.updateCustomer(lead.id, { status: 'Site Visit Scheduled' }, user || undefined);
    } else {
      await mockDb.logActivity({
        leadId: lead.id,
        leadName: lead.name,
        agentId: user?.id || lead.agentId || 'agent-1',
        agentName: user?.name || lead.agentName || 'Agent',
        type: 'site_visit_completed',
        title: `Site Visit Completed: ${visitProject}`,
        description: `Walkthrough completed (${visitHours} hrs). Client interest: ${visitInterest}. Feedback: ${visitFeedback || 'Positive inspection.'} Objections: ${visitObjections || 'None noted.'}`,
        outcome: 'Visit Done',
        previousStatus: lead.status,
        newStatus: 'Site Visit Completed',
        siteVisitDetails: {
          project: visitProject,
          visitDate,
          visitTime,
          durationHours: visitHours,
          attendeesCount: visitAttendees,
          clientFeedback: visitFeedback,
          interestLevel: visitInterest,
          objections: visitObjections
        }
      });
      await mockDb.updateCustomer(lead.id, { status: 'Site Visit Completed' }, user || undefined);
    }

    await loadLeadData(lead.id);
    onLeadUpdated();
    setActiveTab('timeline');
  };

  const handleSaveNegotiation = async () => {
    await mockDb.logActivity({
      leadId: lead.id,
      leadName: lead.name,
      agentId: user?.id || lead.agentId || 'agent-1',
      agentName: user?.name || lead.agentName || 'Agent',
      type: 'negotiation',
      title: `Negotiation: Offer for $${negOfferAmount.toLocaleString()}`,
      description: `Discussed terms for unit ${negUnit || 'selected unit'}. Payment plan: ${negPaymentPlan}. Requested discount: $${negDiscount.toLocaleString()}. Notes: ${negNotes}`,
      outcome: 'Negotiation Ongoing',
      previousStatus: lead.status,
      newStatus: 'Negotiation / Offer Stage',
      negotiationDetails: {
        offerAmount: negOfferAmount,
        discountRequested: negDiscount,
        paymentPlanProposed: negPaymentPlan,
        bookingAmountProposed: negBookingAmount,
        unitProposed: negUnit,
        termsDiscussed: negNotes
      }
    });

    await mockDb.updateCustomer(lead.id, { 
      status: 'Negotiation / Offer Stage',
      preferredUnit: negUnit || lead.preferredUnit
    }, user || undefined);

    await loadLeadData(lead.id);
    onLeadUpdated();
    setActiveTab('timeline');
  };

  const handleCloseWon = async () => {
    confetti({
      particleCount: 120,
      spread: 70,
      origin: { y: 0.6 }
    });

    await mockDb.updateCustomer(lead.id, {
      status: 'Closed - Won / Deal Booked',
      dealInfo: {
        project: lead.interestedProject || 'Sunset Villa',
        unit: lead.preferredUnit || 'Selected Unit',
        finalPrice: dealFinalPrice,
        discount: 0,
        paymentPlan: dealPaymentPlan,
        bookingAmount: dealBookingAmount,
        bookingDate: new Date().toISOString().split('T')[0],
        responsibleAgentId: lead.agentId || user?.id || 'agent-1',
        responsibleAgentName: lead.agentName || user?.name || 'Agent',
        dealValue: dealFinalPrice,
        notes: dealNotes
      }
    }, user || undefined);

    await loadLeadData(lead.id);
    onLeadUpdated();
    setActiveTab('timeline');
  };

  const handleCloseLost = async () => {
    await mockDb.updateCustomer(lead.id, {
      status: 'Closed - Lost / Cancelled / Cold',
      lossReason,
      lossNotes
    }, user || undefined);

    await loadLeadData(lead.id);
    onLeadUpdated();
    setActiveTab('timeline');
  };

  const handleSaveRequirements = async () => {
    await mockDb.updateCustomer(lead.id, {
      budget: editBudget,
      preferredLocation: editLocation,
      projectType: editProjectType,
      unitSize: editUnitSize,
      timeline: editTimeline,
      requirementsNotes: editReqNotes
    }, user || undefined);

    setIsEditingReqs(false);
    await loadLeadData(lead.id);
    onLeadUpdated();
  };

  const formatCurrency = (val?: number) => {
    if (!val) return '$0';
    return `$${val.toLocaleString()}`;
  };

  const getStageColor = (st: string) => {
    if (st.includes('Won')) return 'bg-emerald-950/60 text-emerald-400 border-emerald-500/30';
    if (st.includes('Lost')) return 'bg-red-950/60 text-red-400 border-red-500/30';
    if (st.includes('Negotiation')) return 'bg-amber-950/60 text-amber-400 border-amber-500/30';
    if (st.includes('Site Visit')) return 'bg-blue-950/60 text-blue-400 border-blue-500/30';
    if (st.includes('Brochure') || st.includes('Interest')) return 'bg-purple-950/60 text-purple-400 border-purple-500/30';
    return 'bg-zinc-900 text-zinc-300 border-zinc-700';
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#0c0c0c] border border-zinc-800/80 rounded-2xl w-full max-w-5xl h-[90vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Header Bar */}
          <div className="p-5 bg-zinc-950 border-b border-zinc-800/80 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center text-white font-bold font-display text-xl shadow-lg border border-red-500/20">
                {lead.name.charAt(0)}
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-xl font-bold text-white font-display">{lead.name}</h2>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getStageColor(lead.status)}`}>
                    {lead.status}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider bg-zinc-900 text-zinc-400 border border-zinc-800">
                    {lead.category}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-xs text-zinc-400">
                  <span className="flex items-center gap-1"><Phone size={12} /> {lead.phone}</span>
                  <span className="flex items-center gap-1"><User size={12} /> Assigned: <span className="text-zinc-200 font-medium">{lead.agentName || 'Unassigned'}</span></span>
                  <span className="flex items-center gap-1"><DollarSign size={12} /> Budget: <span className="text-emerald-400 font-bold">{formatCurrency(lead.budget)}</span></span>
                </div>
              </div>
            </div>

            {/* Stage Selector & Close */}
            <div className="flex items-center gap-3">
              <div className="hidden lg:flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                <span className="text-[11px] text-zinc-500 px-2 font-medium">Stage:</span>
                <select 
                  value={lead.status}
                  onChange={(e) => handleStageChange(e.target.value as PipelineStage)}
                  className="bg-zinc-950 text-xs text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-800 focus:outline-none focus:border-red-500 font-medium"
                >
                  {PIPELINE_STAGES.map(st => (
                    <option key={st} value={st}>{st}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={onClose}
                className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white transition-colors border border-zinc-800"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 px-5 py-2.5 bg-[#0e0e0e] border-b border-zinc-800/80 overflow-x-auto">
            {[
              { id: 'overview', label: 'Lead Overview & Reqs', icon: <FileText size={15} /> },
              { id: 'whatsapp', label: 'WhatsApp & Materials', icon: <MessageSquare size={15} />, badge: lead.whatsappCount },
              { id: 'call', label: 'Log Call', icon: <Phone size={15} />, badge: lead.callCount },
              { id: 'visit', label: 'Site Visits', icon: <MapPin size={15} />, badge: lead.siteVisitCount },
              { id: 'negotiation', label: 'Negotiation', icon: <DollarSign size={15} />, badge: lead.negotiationCount },
              { id: 'deal', label: 'Deal Closure / Loss', icon: <Trophy size={15} /> },
              { id: 'timeline', label: 'Activity Timeline', icon: <Clock size={15} />, badge: activities.length },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  activeTab === tab.id 
                    ? 'bg-red-950/80 text-red-400 border border-red-500/30 shadow-[0_0_12px_rgba(220,38,38,0.2)]' 
                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60 border border-transparent'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="w-4 h-4 rounded-full bg-zinc-800 text-[10px] text-zinc-300 flex items-center justify-center font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab Content Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Requirements */}
                <div className="md:col-span-2 space-y-6">
                  <div className="bg-zinc-950/70 rounded-2xl p-5 border border-zinc-800/80 space-y-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <Building size={16} className="text-red-500" /> Client Property Requirements
                      </h3>
                      <button 
                        onClick={() => setIsEditingReqs(!isEditingReqs)}
                        className="text-xs text-red-400 hover:text-red-300 font-semibold px-2.5 py-1 rounded-lg bg-red-950/40 border border-red-500/20"
                      >
                        {isEditingReqs ? 'Cancel' : 'Edit Requirements'}
                      </button>
                    </div>

                    {isEditingReqs ? (
                      <div className="space-y-4 pt-2">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-zinc-400 font-medium">Budget ($)</label>
                            <input 
                              type="number"
                              value={editBudget}
                              onChange={(e) => setEditBudget(Number(e.target.value))}
                              className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 font-medium">Project Type</label>
                            <select 
                              value={editProjectType}
                              onChange={(e) => setEditProjectType(e.target.value as any)}
                              className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                            >
                              <option value="Apartment">Apartment</option>
                              <option value="House">House</option>
                              <option value="Villa">Villa</option>
                              <option value="Penthouse">Penthouse</option>
                              <option value="Duplex">Duplex</option>
                              <option value="Commercial">Commercial</option>
                              <option value="Land">Land</option>
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs text-zinc-400 font-medium">Preferred Location</label>
                            <input 
                              type="text"
                              value={editLocation}
                              onChange={(e) => setEditLocation(e.target.value)}
                              className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                          <div>
                            <label className="text-xs text-zinc-400 font-medium">Unit Size</label>
                            <input 
                              type="text"
                              value={editUnitSize}
                              onChange={(e) => setEditUnitSize(e.target.value)}
                              placeholder="e.g. 4,500 sq.ft (5 Bed)"
                              className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-xs text-zinc-400 font-medium">Purchase Timeline</label>
                          <select 
                            value={editTimeline}
                            onChange={(e) => setEditTimeline(e.target.value as any)}
                            className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                          >
                            <option value="Immediate (0-30 days)">Immediate (0-30 days)</option>
                            <option value="1-3 Months">1-3 Months</option>
                            <option value="3-6 Months">3-6 Months</option>
                            <option value="Exploring / Flexible">Exploring / Flexible</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs text-zinc-400 font-medium">Requirements & Notes</label>
                          <textarea 
                            rows={3}
                            value={editReqNotes}
                            onChange={(e) => setEditReqNotes(e.target.value)}
                            className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-red-500"
                          />
                        </div>

                        <button 
                          onClick={handleSaveRequirements}
                          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
                        >
                          Save Requirements
                        </button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-2">
                        <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/60">
                          <span className="text-[11px] text-zinc-500 block">Target Project</span>
                          <span className="text-sm font-semibold text-white">{lead.interestedProject || 'Any Project'}</span>
                        </div>
                        <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/60">
                          <span className="text-[11px] text-zinc-500 block">Unit Size</span>
                          <span className="text-sm font-semibold text-white">{lead.unitSize || 'Flexible'}</span>
                        </div>
                        <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/60">
                          <span className="text-[11px] text-zinc-500 block">Preferred Unit</span>
                          <span className="text-sm font-semibold text-white">{lead.preferredUnit || 'Pending Selection'}</span>
                        </div>
                        <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/60">
                          <span className="text-[11px] text-zinc-500 block">Location</span>
                          <span className="text-sm font-semibold text-white">{lead.preferredLocation || 'Metropolitan'}</span>
                        </div>
                        <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/60">
                          <span className="text-[11px] text-zinc-500 block">Property Type</span>
                          <span className="text-sm font-semibold text-white">{lead.projectType || 'Residential'}</span>
                        </div>
                        <div className="p-3 bg-zinc-900/50 rounded-xl border border-zinc-800/60">
                          <span className="text-[11px] text-zinc-500 block">Timeline</span>
                          <span className="text-sm font-semibold text-emerald-400">{lead.timeline || 'Flexible'}</span>
                        </div>

                        <div className="col-span-full p-4 bg-zinc-900/30 rounded-xl border border-zinc-800/60">
                          <span className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider block mb-1">Detailed Requirements & Notes</span>
                          <p className="text-sm text-zinc-300 leading-relaxed">
                            {lead.requirementsNotes || 'No specific requirement notes recorded yet. Use Edit Requirements to record client preferences.'}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Materials Sent Summary */}
                  <div className="bg-zinc-950/70 rounded-2xl p-5 border border-zinc-800/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-2">
                        <Share2 size={16} className="text-purple-400" /> Dispatched Materials & Brochures
                      </h3>
                      <button 
                        onClick={() => setActiveTab('whatsapp')}
                        className="text-xs text-purple-400 hover:text-purple-300 font-semibold"
                      >
                        + Send New Material
                      </button>
                    </div>

                    {lead.materialsSent && lead.materialsSent.length > 0 ? (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {lead.materialsSent.map(mat => (
                          <div key={mat.id} className="p-3 bg-zinc-900/40 rounded-xl border border-purple-500/20 flex items-center justify-between">
                            <div className="flex items-center gap-3 truncate">
                              <div className="p-2 rounded-lg bg-purple-950/50 text-purple-400 border border-purple-500/20">
                                <FileText size={16} />
                              </div>
                              <div className="truncate">
                                <p className="text-xs font-semibold text-white truncate">{mat.title}</p>
                                <p className="text-[10px] text-zinc-400">{mat.type} • via {mat.channel}</p>
                              </div>
                            </div>
                            <span className="text-[10px] text-zinc-500 whitespace-nowrap">
                              {new Date(mat.sentAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-500 italic py-2">
                        No brochures, price sheets or blueprints have been sent to this client yet.
                      </p>
                    )}
                  </div>
                </div>

                {/* Right Column: Lead Metadata & Follow-up */}
                <div className="space-y-6">
                  {/* Next Follow Up Box */}
                  <div className="bg-gradient-to-br from-amber-950/40 to-zinc-950 rounded-2xl p-5 border border-amber-500/20 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider">
                      <Clock size={16} /> Next Follow-Up Schedule
                    </div>
                    {lead.nextFollowUpDate ? (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-base font-bold text-white">
                            {lead.nextFollowUpDate} {lead.nextFollowUpTime ? `@ ${lead.nextFollowUpTime}` : ''}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-900/40 text-amber-300 border border-amber-500/30">
                            Active
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 bg-zinc-900/60 p-2.5 rounded-xl border border-zinc-800">
                          {lead.nextFollowUpNotes || 'Routine scheduled checkpoint.'}
                        </p>
                      </div>
                    ) : (
                      <p className="text-xs text-zinc-400">No upcoming follow-up scheduled.</p>
                    )}
                    <button 
                      onClick={() => setActiveTab('call')}
                      className="w-full mt-2 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 text-xs font-bold border border-amber-500/30 transition-all flex items-center justify-center gap-2"
                    >
                      <Phone size={14} /> Schedule / Log Call
                    </button>
                  </div>

                  {/* Lead Metadata */}
                  <div className="bg-zinc-950/70 rounded-2xl p-5 border border-zinc-800/80 space-y-3">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Lead Metadata</h3>
                    <div className="space-y-2.5 text-xs">
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-500">Lead Source</span>
                        <span className="font-semibold text-zinc-200">{lead.source}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-500">Priority Level</span>
                        <span className={`font-semibold ${lead.priority === 'Urgent' ? 'text-red-400' : (lead.priority === 'High' ? 'text-amber-400' : 'text-zinc-300')}`}>
                          {lead.priority}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-500">Total Calls</span>
                        <span className="font-semibold text-zinc-200">{lead.callCount || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-500">WhatsApp Messages</span>
                        <span className="font-semibold text-zinc-200">{lead.whatsappCount || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-500">Site Visits Done</span>
                        <span className="font-semibold text-zinc-200">{lead.siteVisitCount || 0}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-zinc-900">
                        <span className="text-zinc-500">Created Date</span>
                        <span className="font-semibold text-zinc-400">{new Date(lead.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-zinc-500">Last Activity</span>
                        <span className="font-semibold text-zinc-400">{new Date(lead.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* WHATSAPP & MATERIALS TAB */}
            {activeTab === 'whatsapp' && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Chat Stream */}
                <div className="md:col-span-2 bg-zinc-950 rounded-2xl border border-zinc-800/80 flex flex-col h-[520px] overflow-hidden">
                  <div className="p-3.5 bg-zinc-900/70 border-b border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></div>
                      <span className="text-xs font-bold text-white font-display">WhatsApp Client Session: {lead.name}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 font-mono">{lead.whatsappNumber || lead.phone}</span>
                  </div>

                  {/* Messages Feed */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-[#080808]">
                    {whatsappMessages.length > 0 ? (
                      whatsappMessages.map(msg => {
                        const isAgent = msg.senderType === 'agent';
                        return (
                          <div 
                            key={msg.id} 
                            className={`flex flex-col ${isAgent ? 'items-end' : 'items-start'}`}
                          >
                            <div className={`max-w-[80%] rounded-2xl p-3.5 ${
                              isAgent 
                                ? 'bg-emerald-950/80 text-emerald-100 border border-emerald-500/30 rounded-tr-none' 
                                : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none'
                            }`}>
                              <div className="flex items-center justify-between gap-4 mb-1 text-[10px] text-zinc-400">
                                <span className="font-bold">{msg.senderName}</span>
                                <span>{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="text-xs leading-relaxed">{msg.text}</p>

                              {/* Attachments */}
                              {msg.attachments && msg.attachments.length > 0 && (
                                <div className="mt-2 space-y-1.5 pt-2 border-t border-white/10">
                                  {msg.attachments.map((att, idx) => (
                                    <div key={idx} className="flex items-center gap-2 p-2 bg-black/40 rounded-xl text-xs border border-white/10">
                                      <FileText size={14} className="text-emerald-400" />
                                      <span className="font-medium truncate">{att.name}</span>
                                      <span className="text-[10px] text-zinc-400 ml-auto">{att.size}</span>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                            <span className="text-[10px] text-zinc-500 mt-1 px-1">
                              {isAgent ? '✓✓ Delivered & Read' : 'Received via WhatsApp'}
                            </span>
                          </div>
                        );
                      })
                    ) : (
                      <div className="h-full flex flex-col items-center justify-center text-zinc-500 text-xs">
                        <MessageSquare size={32} className="text-zinc-700 mb-2" />
                        <p>No WhatsApp messages exchanged yet.</p>
                        <p className="text-[11px] text-zinc-600 mt-1">Send a greeting or property brochure below.</p>
                      </div>
                    )}
                  </div>

                  {/* Message Input */}
                  <div className="p-3 bg-zinc-900/80 border-t border-zinc-800 flex items-center gap-2">
                    <input 
                      type="text"
                      value={waText}
                      onChange={(e) => setWaText(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSendWhatsApp(false)}
                      placeholder="Type a WhatsApp message to client..."
                      className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => handleSendWhatsApp(false)}
                      disabled={isSendingWa || !waText.trim()}
                      className="p-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white transition-all shadow-md"
                    >
                      <Send size={16} />
                    </button>
                  </div>
                </div>

                {/* Right Column: Send Material / Quick Dispatch */}
                <div className="space-y-4">
                  <div className="bg-zinc-950 rounded-2xl p-5 border border-zinc-800/80 space-y-4">
                    <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-2">
                      <Share2 size={16} /> Share Material on WhatsApp
                    </h3>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      Dispatch verified project brochures, floor plans, price sheets, or 4K drone video tours directly to client.
                    </p>

                    <div>
                      <label className="text-xs text-zinc-400 font-medium">Material Type</label>
                      <select 
                        value={selectedMaterialType}
                        onChange={(e) => setSelectedMaterialType(e.target.value)}
                        className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      >
                        <option value="Brochure">Brochure Catalog</option>
                        <option value="Project Profile">Project Profile</option>
                        <option value="Price Sheet">Official Price Sheet</option>
                        <option value="Floor Plan">Architectural Floor Plan</option>
                        <option value="Video Tour">4K Drone / Video Tour</option>
                        <option value="Payment Plan">Installment Payment Plan</option>
                      </select>
                    </div>

                    <div>
                      <label className="text-xs text-zinc-400 font-medium">Document Title</label>
                      <input 
                        type="text"
                        value={materialTitle}
                        onChange={(e) => setMaterialTitle(e.target.value)}
                        placeholder={`e.g. ${lead.interestedProject || 'Sunset Villa'} Official Pack 2026.pdf`}
                        className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500"
                      />
                    </div>

                    <button
                      onClick={() => handleSendWhatsApp(true)}
                      disabled={!materialTitle.trim()}
                      className="w-full py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-lg flex items-center justify-center gap-2"
                    >
                      <Send size={14} /> Send Material & Record Timeline
                    </button>
                  </div>

                  {/* Quick Pre-canned Templates */}
                  <div className="bg-zinc-950 rounded-2xl p-4 border border-zinc-800/80 space-y-2">
                    <span className="text-[11px] text-zinc-500 uppercase font-bold tracking-wider block">Quick Templates</span>
                    {[
                      { label: '👋 Initial Intro & Brochure', text: `Hi ${lead.name}, thank you for your interest in Ridge Park Real Estate. Here is the requested project catalog and unit specifications.` },
                      { label: '🏡 Site Walkthrough Confirmation', text: `Dear ${lead.name}, confirming your scheduled private site walkthrough this week. Our project manager will welcome you at the gate.` },
                      { label: '💰 Installment Structure Update', text: `Hi ${lead.name}, our finance committee has reviewed your payment terms and prepared a tailored 24-month milestone breakdown.` },
                    ].map((tpl, i) => (
                      <button
                        key={i}
                        onClick={() => setWaText(tpl.text)}
                        className="w-full text-left p-2.5 bg-zinc-900/60 hover:bg-zinc-900 text-xs text-zinc-300 rounded-xl border border-zinc-800 transition-all truncate"
                      >
                        {tpl.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* LOG CALL TAB */}
            {activeTab === 'call' && (
              <div className="max-w-2xl mx-auto bg-zinc-950 rounded-2xl p-6 border border-zinc-800/80 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-red-950/80 rounded-xl text-red-400 border border-red-500/20">
                    <Phone size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">Log Phone Call Interaction</h3>
                    <p className="text-xs text-zinc-400">Record call outcome, client sentiment, and schedule automatic follow-up.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Call Outcome</label>
                    <select 
                      value={callOutcome}
                      onChange={(e) => setCallOutcome(e.target.value as any)}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="Connected">Connected / Direct Conversation</option>
                      <option value="No Answer">No Answer / Ringing</option>
                      <option value="Busy">Busy / Line Engaged</option>
                      <option value="Unreachable">Unreachable / Switched Off</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Call Duration (Minutes)</label>
                    <input 
                      type="number"
                      value={callDuration}
                      onChange={(e) => setCallDuration(Number(e.target.value))}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-medium">Call Summary & Client Feedback</label>
                  <textarea 
                    rows={4}
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    placeholder="Discussed unit pricing, requested floor plan comparison with rival developer, family consultation pending..."
                    className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 leading-relaxed"
                  />
                </div>

                <div className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-3">
                  <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                    <Calendar size={14} className="text-amber-400" /> Schedule Next Follow-up Checkpoint
                  </span>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] text-zinc-500">Date</label>
                      <input 
                        type="date"
                        value={callNextFollowUpDate}
                        onChange={(e) => setCallNextFollowUpDate(e.target.value)}
                        className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-zinc-500">Time</label>
                      <input 
                        type="time"
                        value={callNextFollowUpTime}
                        onChange={(e) => setCallNextFollowUpTime(e.target.value)}
                        className="w-full mt-1 bg-zinc-950 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleLogCall}
                  className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-all shadow-lg"
                >
                  Save Call Log & Update Lead Status
                </button>
              </div>
            )}

            {/* SITE VISITS TAB */}
            {activeTab === 'visit' && (
              <div className="max-w-2xl mx-auto bg-zinc-950 rounded-2xl p-6 border border-zinc-800/80 space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-blue-950/80 rounded-xl text-blue-400 border border-blue-500/20">
                      <MapPin size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white font-display">Project / Site Visit Manager</h3>
                      <p className="text-xs text-zinc-400">Schedule on-site client inspections or record completed visit feedback.</p>
                    </div>
                  </div>

                  <div className="flex bg-zinc-900 p-1 rounded-xl border border-zinc-800">
                    <button
                      onClick={() => setVisitAction('schedule')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        visitAction === 'schedule' ? 'bg-blue-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Schedule Visit
                    </button>
                    <button
                      onClick={() => setVisitAction('complete')}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                        visitAction === 'complete' ? 'bg-emerald-600 text-white shadow-md' : 'text-zinc-400 hover:text-zinc-200'
                      }`}
                    >
                      Log Completed Visit
                    </button>
                  </div>
                </div>

                <div className="space-y-4 pt-2">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-zinc-400 font-medium">Project Name</label>
                      <input 
                        type="text"
                        value={visitProject}
                        onChange={(e) => setVisitProject(e.target.value)}
                        className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 font-medium">Visit Date</label>
                      <input 
                        type="date"
                        value={visitDate}
                        onChange={(e) => setVisitDate(e.target.value)}
                        className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="text-xs text-zinc-400 font-medium">Visit Time</label>
                      <input 
                        type="text"
                        value={visitTime}
                        onChange={(e) => setVisitTime(e.target.value)}
                        placeholder="e.g. 11:00 AM"
                        className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 font-medium">Duration (Hours)</label>
                      <input 
                        type="number"
                        step="0.5"
                        value={visitHours}
                        onChange={(e) => setVisitHours(Number(e.target.value))}
                        className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-zinc-400 font-medium">Attendees</label>
                      <input 
                        type="number"
                        value={visitAttendees}
                        onChange={(e) => setVisitAttendees(Number(e.target.value))}
                        className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {visitAction === 'complete' && (
                    <div className="space-y-4 pt-2 border-t border-zinc-800">
                      <div>
                        <label className="text-xs text-zinc-400 font-medium">Client Interest Level</label>
                        <select 
                          value={visitInterest}
                          onChange={(e) => setVisitInterest(e.target.value as any)}
                          className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        >
                          <option value="High">High - Ready to proceed with offer / booking</option>
                          <option value="Medium">Medium - Likes property, comparing options</option>
                          <option value="Low">Low - Objections on layout or pricing</option>
                        </select>
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 font-medium">Client Feedback</label>
                        <textarea 
                          rows={2}
                          value={visitFeedback}
                          onChange={(e) => setVisitFeedback(e.target.value)}
                          placeholder="Client inspected master bedroom and panoramic balcony. Expressed enthusiasm for private elevator..."
                          className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>

                      <div>
                        <label className="text-xs text-zinc-400 font-medium">Client Objections / Concerns</label>
                        <input 
                          type="text"
                          value={visitObjections}
                          onChange={(e) => setVisitObjections(e.target.value)}
                          placeholder="e.g. HOA fee structure, parking slot assignment"
                          className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                        />
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleSaveSiteVisit}
                    className={`w-full py-3 rounded-xl font-bold text-xs text-white transition-all shadow-lg ${
                      visitAction === 'schedule' ? 'bg-blue-600 hover:bg-blue-700' : 'bg-emerald-600 hover:bg-emerald-700'
                    }`}
                  >
                    {visitAction === 'schedule' ? 'Confirm Scheduled Visit' : 'Save Completed Site Visit & Record Hours'}
                  </button>
                </div>
              </div>
            )}

            {/* NEGOTIATION TAB */}
            {activeTab === 'negotiation' && (
              <div className="max-w-2xl mx-auto bg-zinc-950 rounded-2xl p-6 border border-zinc-800/80 space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-950/80 rounded-xl text-amber-400 border border-amber-500/20">
                    <DollarSign size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-white font-display">Negotiation & Offer Record</h3>
                    <p className="text-xs text-zinc-400">Track price negotiations, requested discounts, payment milestones and terms.</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Proposed Offer Amount ($)</label>
                    <input 
                      type="number"
                      value={negOfferAmount}
                      onChange={(e) => setNegOfferAmount(Number(e.target.value))}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Discount Requested ($)</label>
                    <input 
                      type="number"
                      value={negDiscount}
                      onChange={(e) => setNegDiscount(Number(e.target.value))}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Target Unit</label>
                    <input 
                      type="text"
                      value={negUnit}
                      onChange={(e) => setNegUnit(e.target.value)}
                      placeholder="e.g. Unit 4B / Penthouse Suite"
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Down Payment / Booking Money ($)</label>
                    <input 
                      type="number"
                      value={negBookingAmount}
                      onChange={(e) => setNegBookingAmount(Number(e.target.value))}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-medium">Payment Plan Terms Discussed</label>
                  <input 
                    type="text"
                    value={negPaymentPlan}
                    onChange={(e) => setNegPaymentPlan(e.target.value)}
                    className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div>
                  <label className="text-xs text-zinc-400 font-medium">Negotiation Notes & Special Clauses</label>
                  <textarea 
                    rows={3}
                    value={negNotes}
                    onChange={(e) => setNegNotes(e.target.value)}
                    placeholder="Client agreeable if 2nd parking stall is complimentary and handover is scheduled by Q4 2026..."
                    className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <button
                  onClick={handleSaveNegotiation}
                  className="w-full py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl font-bold text-xs transition-all shadow-lg"
                >
                  Save Negotiation Record & Move to Negotiation Stage
                </button>
              </div>
            )}

            {/* DEAL CLOSURE / LOSS TAB */}
            {activeTab === 'deal' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Win Section */}
                <div className="bg-emerald-950/30 rounded-2xl p-6 border border-emerald-500/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-emerald-900/60 rounded-xl text-emerald-400 border border-emerald-500/30">
                      <Trophy size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-emerald-300 font-display">Mark as Closed - Won (Deal Booked)</h3>
                      <p className="text-xs text-zinc-400">Record final sale value, booking deposit, and celebrate win.</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Final Deal Value ($)</label>
                    <input 
                      type="number"
                      value={dealFinalPrice}
                      onChange={(e) => setDealFinalPrice(Number(e.target.value))}
                      className="w-full mt-1 bg-zinc-900 border border-emerald-500/30 rounded-xl px-3 py-2 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Earnest Booking Amount ($)</label>
                    <input 
                      type="number"
                      value={dealBookingAmount}
                      onChange={(e) => setDealBookingAmount(Number(e.target.value))}
                      placeholder="e.g. 500,000"
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Payment Plan Structure</label>
                    <input 
                      type="text"
                      value={dealPaymentPlan}
                      onChange={(e) => setDealPaymentPlan(e.target.value)}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Booking Remarks</label>
                    <textarea 
                      rows={2}
                      value={dealNotes}
                      onChange={(e) => setDealNotes(e.target.value)}
                      placeholder="Earnest deposit verified in escrow, purchase contract signed."
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <button
                    onClick={handleCloseWon}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <Trophy size={16} /> Execute Closed - Won Booking
                  </button>
                </div>

                {/* Lost Section */}
                <div className="bg-red-950/30 rounded-2xl p-6 border border-red-500/30 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-red-900/60 rounded-xl text-red-400 border border-red-500/30">
                      <XCircle size={20} />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-red-300 font-display">Mark as Closed - Lost / Cancelled</h3>
                      <p className="text-xs text-zinc-400">Select reason for loss for team reporting and future re-engagement.</p>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Loss Reason (Mandatory)</label>
                    <select 
                      value={lossReason}
                      onChange={(e) => setLossReason(e.target.value)}
                      className="w-full mt-1 bg-zinc-900 border border-red-500/30 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                    >
                      <option value="High price">High price</option>
                      <option value="Location mismatch">Location mismatch</option>
                      <option value="Budget problem">Budget problem</option>
                      <option value="Competitor purchased">Competitor purchased</option>
                      <option value="Not interested">Not interested</option>
                      <option value="No response for a long period">No response for a long period</option>
                      <option value="Project mismatch">Project mismatch</option>
                      <option value="Deal cancelled">Deal cancelled</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs text-zinc-400 font-medium">Detailed Loss Explanation</label>
                    <textarea 
                      rows={4}
                      value={lossNotes}
                      onChange={(e) => setLossNotes(e.target.value)}
                      placeholder="Explain what caused the client not to convert or cancel..."
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <button
                    onClick={handleCloseLost}
                    className="w-full py-3 bg-red-600 hover:bg-red-700 text-white rounded-xl font-bold text-xs transition-all shadow-lg flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} /> Mark as Closed - Lost
                  </button>
                </div>
              </div>
            )}

            {/* TIMELINE TAB */}
            {activeTab === 'timeline' && (
              <div className="max-w-3xl mx-auto space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white font-display">Chronological Audit Timeline</h3>
                  <span className="text-xs text-zinc-500">{activities.length} total activity records</span>
                </div>

                <div className="relative pl-6 border-l border-zinc-800 space-y-6">
                  {activities.map((act) => (
                    <div key={act.id} className="relative group">
                      {/* Timeline Node Dot */}
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-zinc-900 border-2 border-red-500 group-hover:scale-125 transition-transform shadow-[0_0_8px_rgba(220,38,38,0.5)]"></div>

                      <div className="p-4 bg-zinc-950/80 rounded-2xl border border-zinc-800/80 hover:border-zinc-700 transition-colors space-y-2">
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{act.title}</span>
                            {act.outcome && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-zinc-900 text-zinc-300 border border-zinc-800">
                                {act.outcome}
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-zinc-500">
                            {new Date(act.timestamp).toLocaleString()}
                          </span>
                        </div>

                        <p className="text-xs text-zinc-300 leading-relaxed">
                          {act.description}
                        </p>

                        {/* Additional Structured Details if present */}
                        {act.siteVisitDetails && (
                          <div className="p-2.5 bg-blue-950/30 rounded-xl border border-blue-500/20 text-xs text-blue-300 flex items-center gap-4">
                            <span>Project: <strong>{act.siteVisitDetails.project}</strong></span>
                            <span>Duration: <strong>{act.siteVisitDetails.durationHours} hrs</strong></span>
                            <span>Interest: <strong>{act.siteVisitDetails.interestLevel || 'N/A'}</strong></span>
                          </div>
                        )}

                        {act.negotiationDetails && (
                          <div className="p-2.5 bg-amber-950/30 rounded-xl border border-amber-500/20 text-xs text-amber-300 flex items-center gap-4">
                            <span>Offer: <strong>${act.negotiationDetails.offerAmount.toLocaleString()}</strong></span>
                            {act.negotiationDetails.discountRequested && (
                              <span>Discount: <strong>${act.negotiationDetails.discountRequested.toLocaleString()}</strong></span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-900">
                          <span>By: <strong className="text-zinc-400">{act.agentName}</strong></span>
                          {act.previousStatus && act.newStatus && (
                            <span className="flex items-center gap-1 text-[10px]">
                              {act.previousStatus} <ArrowRight size={10} /> <span className="text-red-400 font-semibold">{act.newStatus}</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
