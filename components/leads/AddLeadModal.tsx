import React, { useState } from 'react';
import { Customer, PipelineStage, PIPELINE_STAGES, LeadCategory, LeadSource, PriorityLevel } from '../../types';
import { mockDb } from '../../services/mockDb';
import { useAuth } from '../../context/AuthContext';
import { X, UserPlus, Phone, Mail, Building, DollarSign, Calendar, Tag } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface AddLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadAdded: () => void;
}

export const AddLeadModal: React.FC<AddLeadModalProps> = ({ isOpen, onClose, onLeadAdded }) => {
  const { user } = useAuth();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [email, setEmail] = useState('');
  const [category, setCategory] = useState<LeadCategory>('Prospective Client');
  const [source, setSource] = useState<LeadSource>('WhatsApp');
  const [priority, setPriority] = useState<PriorityLevel>('Medium');
  const [budget, setBudget] = useState<number>(3500000);
  const [interestedProject, setInterestedProject] = useState('Sunset Villa');
  const [preferredLocation, setPreferredLocation] = useState('');
  const [projectType, setProjectType] = useState<'Apartment' | 'House' | 'Villa' | 'Commercial' | 'Land' | 'Penthouse' | 'Duplex'>('Villa');
  const [unitSize, setUnitSize] = useState('');
  const [timeline, setTimeline] = useState<'Immediate (0-30 days)' | '1-3 Months' | '3-6 Months' | 'Exploring / Flexible'>('Immediate (0-30 days)');
  const [requirementsNotes, setRequirementsNotes] = useState('');
  const [nextFollowUpDate, setNextFollowUpDate] = useState('');
  const [nextFollowUpTime, setNextFollowUpTime] = useState('10:00 AM');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) return;

    await mockDb.addCustomer({
      name: name.trim(),
      phone: phone.trim(),
      whatsappNumber: (whatsappNumber.trim() || phone.trim()),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@client.com`,
      category,
      source,
      status: 'New / Unassigned',
      priority,
      budget: Number(budget) || 0,
      interestedProject,
      preferredLocation,
      projectType,
      unitSize,
      timeline,
      requirementsNotes,
      agentId: user?.role === 'agent' ? user.id : undefined,
      agentName: user?.role === 'agent' ? user.name : undefined,
      nextFollowUpDate: nextFollowUpDate || undefined,
      nextFollowUpTime: nextFollowUpDate ? nextFollowUpTime : undefined,
    }, user || undefined);

    onLeadAdded();
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-[#0c0c0c] border border-zinc-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl"
        >
          {/* Header */}
          <div className="p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-red-950 rounded-xl text-red-500 border border-red-500/20">
                <UserPlus size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-display">Register New Lead</h2>
                <p className="text-xs text-zinc-400">Newly added leads enter the <strong className="text-zinc-200">New / Unassigned</strong> stage automatically.</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Client Full Name *</label>
                <input 
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Johnathan Vance"
                  className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Phone Number *</label>
                <input 
                  type="text"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+1 (555) 019-2834"
                  className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300">WhatsApp Number</label>
                <input 
                  type="text"
                  value={whatsappNumber}
                  onChange={(e) => setWhatsappNumber(e.target.value)}
                  placeholder="Leave empty to use phone number"
                  className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Email Address</label>
                <input 
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="client@investor.com"
                  className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Lead Category</label>
                <select 
                  value={category}
                  onChange={(e) => setCategory(e.target.value as any)}
                  className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Prospective Client">Prospective Client</option>
                  <option value="Outbound Lead">Outbound Lead</option>
                  <option value="Inbound Lead">Inbound Lead</option>
                  <option value="VIP Investor">VIP Investor</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Lead Source</label>
                <select 
                  value={source}
                  onChange={(e) => setSource(e.target.value as any)}
                  className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="WhatsApp">WhatsApp</option>
                  <option value="Website Inquiry">Website Inquiry</option>
                  <option value="Facebook Ads">Facebook Ads</option>
                  <option value="Google Search">Google Search</option>
                  <option value="Referral">Referral</option>
                  <option value="Cold Call">Cold Call</option>
                  <option value="Property Expo">Property Expo</option>
                  <option value="Broker Network">Broker Network</option>
                  <option value="Walk-In">Walk-In</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Priority Level</label>
                <select 
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Urgent">Urgent</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Estimated Budget ($)</label>
                <input 
                  type="number"
                  value={budget}
                  onChange={(e) => setBudget(Number(e.target.value))}
                  className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Interested Project</label>
                <input 
                  type="text"
                  value={interestedProject}
                  onChange={(e) => setInterestedProject(e.target.value)}
                  placeholder="e.g. Sunset Villa"
                  className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Property Type</label>
                <select 
                  value={projectType}
                  onChange={(e) => setProjectType(e.target.value as any)}
                  className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Villa">Villa</option>
                  <option value="Apartment">Apartment</option>
                  <option value="House">House</option>
                  <option value="Penthouse">Penthouse</option>
                  <option value="Duplex">Duplex</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Land">Land</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Preferred Location</label>
                <input 
                  type="text"
                  value={preferredLocation}
                  onChange={(e) => setPreferredLocation(e.target.value)}
                  placeholder="e.g. Coastal View"
                  className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-zinc-300">Timeline</label>
                <select 
                  value={timeline}
                  onChange={(e) => setTimeline(e.target.value as any)}
                  className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Immediate (0-30 days)">Immediate (0-30 days)</option>
                  <option value="1-3 Months">1-3 Months</option>
                  <option value="3-6 Months">3-6 Months</option>
                  <option value="Exploring / Flexible">Exploring / Flexible</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300">Initial Requirements & Remarks</label>
              <textarea 
                rows={2}
                value={requirementsNotes}
                onChange={(e) => setRequirementsNotes(e.target.value)}
                placeholder="Inquired about sea-facing units with private pools..."
                className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500"
              />
            </div>

            <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-2">
              <span className="text-xs font-bold text-zinc-300 flex items-center gap-2">
                <Calendar size={14} className="text-amber-400" /> Initial Follow-Up Checkpoint
              </span>
              <div className="grid grid-cols-2 gap-4">
                <input 
                  type="date"
                  value={nextFollowUpDate}
                  onChange={(e) => setNextFollowUpDate(e.target.value)}
                  className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
                <input 
                  type="text"
                  value={nextFollowUpTime}
                  onChange={(e) => setNextFollowUpTime(e.target.value)}
                  placeholder="e.g. 10:00 AM"
                  className="bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-xs font-semibold text-zinc-300"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-lg"
              >
                Save Lead to CRM
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
