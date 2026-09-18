import React, { useState } from 'react';
import { Customer, LeadSource, LeadCategory } from '../../types';
import { mockDb } from '../../services/mockDb';
import { useAuth } from '../../context/AuthContext';
import { X, Upload, FileSpreadsheet, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ImportLeadsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLeadsImported: () => void;
}

export const ImportLeadsModal: React.FC<ImportLeadsModalProps> = ({ isOpen, onClose, onLeadsImported }) => {
  const { user } = useAuth();
  const [source, setSource] = useState<LeadSource>('Facebook Ads');
  const [category, setCategory] = useState<LeadCategory>('Inbound Lead');
  const [rawText, setRawText] = useState('');
  const [isImporting, setIsImporting] = useState(false);
  const [resultCount, setResultCount] = useState<number | null>(null);

  if (!isOpen) return null;

  const handleSampleLoad = () => {
    const sample = `Marcus Aurelius, +1 (555) 441-9011, marcus@emperor.rome, $5200000, Sunset Villa, Villa
Diana Prince, +1 (555) 992-3344, diana@themyscira.gov, $8900000, Downtown Loft, Penthouse
Victor Von Doom, +1 (555) 123-9988, doom@latveria.org, $14500000, Lakeside Cabin, House
Natasha Romanoff, +1 (555) 887-2211, natasha@avengers.io, $3400000, Skyline Terrace, Apartment`;
    setRawText(sample);
  };

  const handleImport = async () => {
    if (!rawText.trim()) return;
    setIsImporting(true);

    const lines = rawText.split('\n').map(l => l.trim()).filter(Boolean);
    let count = 0;

    for (const line of lines) {
      // Split by comma
      const parts = line.split(',').map(p => p.trim());
      if (parts.length >= 2) {
        const name = parts[0] || 'Imported Lead';
        const phone = parts[1] || '+1 (555) 000-0000';
        const email = parts[2] || `${name.toLowerCase().replace(/\s+/g, '')}@import.com`;
        const budgetRaw = parts[3] ? parts[3].replace(/[$,]/g, '') : '2500000';
        const budget = Number(budgetRaw) || 2500000;
        const interestedProject = parts[4] || 'Sunset Villa';
        const projectType = (parts[5] as any) || 'Villa';

        await mockDb.addCustomer({
          name,
          phone,
          whatsappNumber: phone,
          email,
          category,
          source,
          status: 'New / Unassigned',
          priority: 'Medium',
          budget,
          interestedProject,
          projectType,
          timeline: '1-3 Months',
          requirementsNotes: `Bulk imported via ${source} campaign file.`
        }, user || undefined);

        count++;
      }
    }

    setResultCount(count);
    setIsImporting(false);
    onLeadsImported();
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
          <div className="p-5 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-950 rounded-xl text-blue-400 border border-blue-500/20">
                <FileSpreadsheet size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white font-display">Bulk Import Client Leads</h2>
                <p className="text-xs text-zinc-400">Import CSV or spreadsheet rows directly into <strong className="text-zinc-200">New / Unassigned</strong>.</p>
              </div>
            </div>
            <button onClick={onClose} className="p-2 rounded-xl bg-zinc-900 text-zinc-400 hover:text-white">
              <X size={18} />
            </button>
          </div>

          <div className="p-6 space-y-4">
            {resultCount !== null ? (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-emerald-950 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/30">
                  <CheckCircle2 size={36} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-display">Import Successfully Completed!</h3>
                  <p className="text-xs text-zinc-400 mt-1">
                    <strong>{resultCount}</strong> new leads have been added to the CRM and are waiting in the New / Unassigned stage.
                  </p>
                </div>
                <button
                  onClick={onClose}
                  className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-xs font-bold text-white shadow-lg"
                >
                  View in Pipeline
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300">Campaign Source</label>
                    <select 
                      value={source}
                      onChange={(e) => setSource(e.target.value as any)}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Facebook Ads">Facebook Ads Lead Gen</option>
                      <option value="Google Search">Google Search PPC</option>
                      <option value="WhatsApp">WhatsApp Inbound Dump</option>
                      <option value="Website Inquiry">Website Inquiries CSV</option>
                      <option value="Property Expo">Property Expo 2026</option>
                      <option value="Broker Network">External Broker List</option>
                      <option value="Cold Call">Outbound Telemarketing List</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-zinc-300">Default Category</label>
                    <select 
                      value={category}
                      onChange={(e) => setCategory(e.target.value as any)}
                      className="w-full mt-1 bg-zinc-900 border border-zinc-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-blue-500"
                    >
                      <option value="Inbound Lead">Inbound Lead</option>
                      <option value="Outbound Lead">Outbound Lead</option>
                      <option value="Prospective Client">Prospective Client</option>
                      <option value="VIP Investor">VIP Investor</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-zinc-300">
                      Paste CSV Data (Name, Phone, Email, Budget, Project, Type)
                    </label>
                    <button
                      type="button"
                      onClick={handleSampleLoad}
                      className="text-[11px] text-blue-400 hover:text-blue-300 underline font-medium"
                    >
                      Load Sample Rows
                    </button>
                  </div>
                  <textarea
                    rows={6}
                    value={rawText}
                    onChange={(e) => setRawText(e.target.value)}
                    placeholder="Name, Phone, Email, Budget, Project, Type..."
                    className="w-full bg-zinc-950 font-mono text-xs text-zinc-300 border border-zinc-700 rounded-xl p-3 focus:outline-none focus:border-blue-500 leading-relaxed"
                  />
                  <span className="text-[11px] text-zinc-500 block">
                    Format: <code>Client Name, +1 Phone, email@test.com, $5000000, Project Name, Villa</code>
                  </span>
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
                    type="button"
                    disabled={isImporting || !rawText.trim()}
                    onClick={handleImport}
                    className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-xs font-bold text-white shadow-lg flex items-center gap-2"
                  >
                    <Upload size={14} /> {isImporting ? 'Importing...' : 'Execute Import'}
                  </button>
                </div>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
