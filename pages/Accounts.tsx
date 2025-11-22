
import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../services/mockDb';
import { FinancialConfig } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { MonthControl } from '../components/ui/MonthControl';
import { DollarSign, TrendingUp, TrendingDown, Save, AlertCircle, ChevronDown, ChevronUp, Briefcase, Home, FileText, RefreshCw } from 'lucide-react';
import { useDateFilter } from '../context/DateFilterContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Accounts: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState<any>(null);
  const [config, setConfig] = useState<FinancialConfig | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  
  const [showSalesBreakdown, setShowSalesBreakdown] = useState(false);
  const [showCommBreakdown, setShowCommBreakdown] = useState(false);

  const { startDate, endDate, activeMonthName } = useDateFilter();

  const fetchData = async () => {
    setLoading(true);
    const rep = await db.getFinancialReport(startDate, endDate);
    const conf = await db.getFinancialConfig(endDate);
    setReport(rep);
    setConfig(conf);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    setIsDirty(false);
  }, [startDate, endDate]);

  const handleConfigChange = (key: keyof FinancialConfig, value: string) => {
    if (!config) return;
    const numVal = value === '' ? 0 : parseFloat(value);
    setConfig({ ...config, [key]: isNaN(numVal) ? 0 : numVal });
    setIsDirty(true);
  };

  const saveConfig = async () => {
    if (!config) return;
    setIsSaving(true);
    await db.updateFinancialConfig(config);
    await fetchData();
    setIsSaving(false);
    setIsDirty(false);
  };

  // --- REAL-TIME CALCULATIONS ---
  const liveFinancials = useMemo(() => {
      if (!report || !config) return null;

      // Auto Data (ReadOnly)
      const salesRevenue = report.income.salesRevenue || 0;
      const serviceRevenue = report.income.serviceRevenue || 0;
      const propertyCosts = report.expenses.propertyTransactionCosts || 0;
      const commissions = report.expenses.details.commissions.reduce((a:any,b:any)=>a+b.amount,0) || 0;

      // Manual Data (Live State)
      const interestIncome = config.interestIncome || 0;
      const otherIncome = config.otherIncome || 0;
      
      const baseSalaries = config.baseSalaries || 0;
      const rent = config.rent || 0;
      const utilities = config.utilities || 0;
      const marketing = config.marketing || 0;
      const insurance = config.insurance || 0;
      const maintenance = config.maintenance || 0;
      const supplies = config.supplies || 0;
      const misc = config.misc || 0;
      const taxes = config.taxes || 0;
      const depreciation = config.depreciation || 0;

      const totalIncome = salesRevenue + serviceRevenue + interestIncome + otherIncome;
      
      const operatingExpenses = rent + utilities + marketing + insurance + maintenance + supplies + misc;
      const totalExpenses = propertyCosts + commissions + baseSalaries + operatingExpenses + taxes + depreciation;

      const netProfitLoss = totalIncome - totalExpenses;

      return {
          totalIncome,
          totalExpenses,
          netProfitLoss,
          operatingExpenses,
          commissions
      };
  }, [report, config]);

  if (loading || !config || !report || !liveFinancials) return <Loader />;

  const fmt = (n: number) => `৳${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  
  const netProfit = liveFinancials.netProfitLoss > 0 ? liveFinancials.netProfitLoss : 0;
  const netLoss = liveFinancials.netProfitLoss < 0 ? Math.abs(liveFinancials.netProfitLoss) : 0;

  return (
    <div className="space-y-8 relative max-w-7xl mx-auto pb-12">
      <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-6 border-b border-white/5">
        <div>
            <h2 className="text-4xl font-bold text-white font-display tracking-tight">Accounts</h2>
            <p className="text-zinc-400 mt-2">Financial Ledger for <span className="text-red-500 font-bold">{activeMonthName}</span></p>
        </div>
        <div className="flex flex-col items-end gap-3">
             <div className="flex items-center gap-4">
                {isDirty && (
                    <motion.span 
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-[10px] font-bold uppercase tracking-widest text-blue-400 flex items-center gap-1 bg-blue-900/20 px-2 py-1 rounded-full border border-blue-500/30"
                    >
                        <RefreshCw size={10} className="animate-spin" /> Live Preview
                    </motion.span>
                )}
                <MonthControl />
             </div>
             <div className="flex gap-4">
                <div className={`px-6 py-4 rounded-2xl border transition-colors duration-300 ${netProfit > 0 ? 'bg-gradient-to-r from-green-900/40 to-zinc-900 border-green-500/30' : 'bg-zinc-900/50 border-zinc-800'} flex items-center gap-4 shadow-xl backdrop-blur-md`}>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Net Profit</span>
                        <span className={`text-2xl font-bold font-display ${netProfit > 0 ? 'text-green-400' : 'text-zinc-600'}`}>
                            {fmt(netProfit)}
                        </span>
                    </div>
                </div>
                <div className={`px-6 py-4 rounded-2xl border transition-colors duration-300 ${netLoss > 0 ? 'bg-gradient-to-r from-red-900/40 to-zinc-900 border-red-500/30' : 'bg-zinc-900/50 border-zinc-800'} flex items-center gap-4 shadow-xl backdrop-blur-md`}>
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Net Loss</span>
                        <span className={`text-2xl font-bold font-display ${netLoss > 0 ? 'text-red-400' : 'text-zinc-600'}`}>
                            {fmt(netLoss)}
                        </span>
                    </div>
                </div>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: MANUAL LEDGER (Inputs) */}
          <div className="xl:col-span-4 space-y-6">
              <Card title="Manual Ledger (Inputs)" className="h-full" contentClassName="flex flex-col h-full">
                <div className="mb-4 p-3 bg-blue-900/10 border border-blue-500/20 rounded-xl text-xs text-blue-300 flex items-start gap-2">
                    <AlertCircle size={16} className="flex-shrink-0" />
                    <p>Values entered here update the financial statement in real-time.</p>
                </div>

                <div className="flex-1 space-y-6 overflow-y-auto pr-2 custom-scrollbar max-h-[600px]">
                    {/* Income Section */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-900 p-2 rounded">Manual Income Sources</h3>
                        <div className="space-y-3">
                            <Input label="Interest Income" type="number" value={config.interestIncome || ''} onChange={(e) => handleConfigChange('interestIncome', e.target.value)} />
                            <Input label="Misc. Income" type="number" value={config.otherIncome || ''} onChange={(e) => handleConfigChange('otherIncome', e.target.value)} />
                        </div>
                    </div>

                    {/* Expenses Section */}
                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-900 p-2 rounded">Operating Expenses</h3>
                        <Input label="Office Rent" type="number" value={config.rent || ''} onChange={(e) => handleConfigChange('rent', e.target.value)} />
                        <Input label="Fixed Salaries (Staff)" type="number" value={config.baseSalaries || ''} onChange={(e) => handleConfigChange('baseSalaries', e.target.value)} />
                        <Input label="Marketing" type="number" value={config.marketing || ''} onChange={(e) => handleConfigChange('marketing', e.target.value)} />
                        <Input label="Utilities" type="number" value={config.utilities || ''} onChange={(e) => handleConfigChange('utilities', e.target.value)} />
                        <Input label="Maintenance" type="number" value={config.maintenance || ''} onChange={(e) => handleConfigChange('maintenance', e.target.value)} />
                        <Input label="Supplies" type="number" value={config.supplies || ''} onChange={(e) => handleConfigChange('supplies', e.target.value)} />
                        <Input label="Insurance" type="number" value={config.insurance || ''} onChange={(e) => handleConfigChange('insurance', e.target.value)} />
                        <Input label="Misc. Expenses" type="number" value={config.misc || ''} onChange={(e) => handleConfigChange('misc', e.target.value)} />
                    </div>

                    <div className="space-y-3">
                        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider bg-zinc-900 p-2 rounded">Tax & Depreciation</h3>
                        <Input label="Corporate Taxes" type="number" value={config.taxes || ''} onChange={(e) => handleConfigChange('taxes', e.target.value)} />
                        <Input label="Depreciation" type="number" value={config.depreciation || ''} onChange={(e) => handleConfigChange('depreciation', e.target.value)} />
                    </div>
                </div>

                <AnimatePresence>
                    {isDirty && (
                        <motion.div 
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-6 pt-4 border-t border-white/5"
                        >
                            <Button onClick={saveConfig} isLoading={isSaving} icon={<Save size={16} />} className="w-full">
                                Save Updates
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
              </Card>
          </div>

          {/* MIDDLE/RIGHT COLUMN: AUTOMATED DATA & CONSOLIDATED REPORT */}
          <div className="xl:col-span-8 space-y-8">
              
              {/* Automated Data Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 {/* Sales Source */}
                 <Card className="bg-zinc-900/50 border-zinc-800" noTilt>
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-900/20 rounded-lg text-green-400"><Home size={20}/></div>
                            <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase">Sales Revenue (Auto)</p>
                                <p className="text-xl font-bold text-white">{fmt(report.income.salesRevenue)}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowSalesBreakdown(!showSalesBreakdown)} className="text-zinc-500 hover:text-white"><ChevronDown size={20} /></button>
                     </div>
                     <p className="text-[10px] text-zinc-500 mb-2">Derived from closed deals.</p>
                     {showSalesBreakdown && (
                        <div className="border-t border-white/5 pt-2 space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                            {report.income.details.soldProducts.length > 0 ? report.income.details.soldProducts.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between text-xs text-zinc-400"><span className="truncate w-2/3">{item.title}</span><span className="text-green-500">{fmt(item.price)}</span></div>
                            )) : <span className="text-xs text-zinc-600 italic">No sales yet.</span>}
                        </div>
                     )}
                 </Card>

                 {/* Commissions Source */}
                 <Card className="bg-zinc-900/50 border-zinc-800" noTilt>
                     <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-yellow-900/20 rounded-lg text-yellow-400"><Briefcase size={20}/></div>
                            <div>
                                <p className="text-xs font-bold text-zinc-500 uppercase">Commissions (Auto)</p>
                                <p className="text-xl font-bold text-white">{fmt(liveFinancials.commissions)}</p>
                            </div>
                        </div>
                        <button onClick={() => setShowCommBreakdown(!showCommBreakdown)} className="text-zinc-500 hover:text-white"><ChevronDown size={20} /></button>
                     </div>
                     <p className="text-[10px] text-zinc-500 mb-2">Calculated from agent points.</p>
                     {showCommBreakdown && (
                        <div className="border-t border-white/5 pt-2 space-y-1 max-h-32 overflow-y-auto custom-scrollbar">
                            {report.expenses.details.commissions.map((item: any, i: number) => (
                                <div key={i} className="flex justify-between text-xs text-zinc-400"><span>{item.name}</span><span className="text-yellow-500">{fmt(item.amount)}</span></div>
                            ))}
                        </div>
                     )}
                 </Card>
              </div>

              {/* THE CONSOLIDATED STATEMENT */}
              <Card title="Consolidated Income Statement" className="border-t-4 border-t-red-600 bg-black/40" contentClassName="p-6">
                 <div className="space-y-6 font-mono text-sm">
                    
                    {/* REVENUE SECTION */}
                    <div>
                        <div className="flex justify-between items-end border-b border-zinc-700 pb-2 mb-3">
                            <h4 className="text-white font-bold uppercase tracking-wider">Revenues</h4>
                            <span className="text-xs text-zinc-500">Source</span>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-zinc-300 pl-2">Sales Revenue</span>
                                <div className="flex gap-8">
                                    <span className="text-[10px] text-green-500 uppercase bg-green-900/10 px-1 rounded">Auto</span>
                                    <span className="text-white w-24 text-right">{fmt(report.income.salesRevenue)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-300 pl-2">Service Revenue (3%)</span>
                                <div className="flex gap-8">
                                    <span className="text-[10px] text-green-500 uppercase bg-green-900/10 px-1 rounded">Auto</span>
                                    <span className="text-white w-24 text-right">{fmt(report.income.serviceRevenue)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400 pl-2">Interest Income</span>
                                <div className="flex gap-8">
                                    <span className="text-[10px] text-blue-500 uppercase bg-blue-900/10 px-1 rounded">Manual</span>
                                    <span className={`text-zinc-400 w-24 text-right transition-colors ${isDirty ? 'text-blue-300' : ''}`}>{fmt(config.interestIncome)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400 pl-2">Other Income</span>
                                <div className="flex gap-8">
                                    <span className="text-[10px] text-blue-500 uppercase bg-blue-900/10 px-1 rounded">Manual</span>
                                    <span className={`text-zinc-400 w-24 text-right transition-colors ${isDirty ? 'text-blue-300' : ''}`}>{fmt(config.otherIncome)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-zinc-800 font-bold">
                                <span className="text-green-400">TOTAL REVENUE</span>
                                <span className="text-green-400">{fmt(liveFinancials.totalIncome)}</span>
                            </div>
                        </div>
                    </div>

                    {/* EXPENSE SECTION */}
                    <div>
                        <div className="flex justify-between items-end border-b border-zinc-700 pb-2 mb-3">
                            <h4 className="text-white font-bold uppercase tracking-wider">Expenses</h4>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="text-zinc-300 pl-2">Cost of Sales (Property VAT/Fees)</span>
                                <div className="flex gap-8">
                                    <span className="text-[10px] text-green-500 uppercase bg-green-900/10 px-1 rounded">Auto</span>
                                    <span className="text-white w-24 text-right">{fmt(report.expenses.propertyTransactionCosts)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-300 pl-2">Agent Commissions</span>
                                <div className="flex gap-8">
                                    <span className="text-[10px] text-green-500 uppercase bg-green-900/10 px-1 rounded">Auto</span>
                                    <span className="text-white w-24 text-right">{fmt(liveFinancials.commissions)}</span>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400 pl-2">Fixed Salaries</span>
                                <div className="flex gap-8">
                                    <span className="text-[10px] text-blue-500 uppercase bg-blue-900/10 px-1 rounded">Manual</span>
                                    <span className={`text-zinc-400 w-24 text-right transition-colors ${isDirty ? 'text-blue-300' : ''}`}>{fmt(config.baseSalaries)}</span>
                                </div>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-zinc-400 pl-2">Operating Expenses (Rent, Utils, etc.)</span>
                                <div className="flex gap-8">
                                    <span className="text-[10px] text-blue-500 uppercase bg-blue-900/10 px-1 rounded">Manual</span>
                                    <span className={`text-zinc-400 w-24 text-right transition-colors ${isDirty ? 'text-blue-300' : ''}`}>
                                        {fmt(liveFinancials.operatingExpenses)}
                                    </span>
                                </div>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-zinc-400 pl-2">Corporate Taxes</span>
                                <div className="flex gap-8">
                                    <span className="text-[10px] text-blue-500 uppercase bg-blue-900/10 px-1 rounded">Manual</span>
                                    <span className={`text-zinc-400 w-24 text-right transition-colors ${isDirty ? 'text-blue-300' : ''}`}>{fmt(config.taxes)}</span>
                                </div>
                            </div>
                             <div className="flex justify-between">
                                <span className="text-zinc-400 pl-2">Depreciation</span>
                                <div className="flex gap-8">
                                    <span className="text-[10px] text-blue-500 uppercase bg-blue-900/10 px-1 rounded">Manual</span>
                                    <span className={`text-zinc-400 w-24 text-right transition-colors ${isDirty ? 'text-blue-300' : ''}`}>{fmt(config.depreciation)}</span>
                                </div>
                            </div>
                            
                            <div className="flex justify-between pt-2 border-t border-zinc-800 font-bold">
                                <span className="text-red-400">TOTAL EXPENSES</span>
                                <span className="text-red-400">({fmt(liveFinancials.totalExpenses)})</span>
                            </div>
                        </div>
                    </div>

                    {/* NET PROFIT / LOSS */}
                    <div className="mt-6 pt-4 border-t-2 border-white/10 space-y-2">
                        {netProfit > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-white uppercase tracking-widest">Net Profit</span>
                                <span className="text-2xl font-bold text-green-400">
                                    {fmt(netProfit)}
                                </span>
                            </div>
                        )}
                        {netLoss > 0 && (
                            <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-white uppercase tracking-widest">Net Loss</span>
                                <span className="text-2xl font-bold text-red-500">
                                    {fmt(netLoss)}
                                </span>
                            </div>
                        )}
                         {/* Fallback if exactly 0 */}
                        {netProfit === 0 && netLoss === 0 && (
                             <div className="flex justify-between items-center">
                                <span className="text-xl font-bold text-white uppercase tracking-widest">Net Profit / Loss</span>
                                <span className="text-2xl font-bold text-zinc-400">
                                    {fmt(0)}
                                </span>
                            </div>
                        )}
                    </div>
                 </div>
              </Card>
          </div>
      </div>
    </div>
  );
};
