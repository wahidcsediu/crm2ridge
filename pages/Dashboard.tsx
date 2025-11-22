
import React, { useEffect, useState, useMemo } from 'react';
import { useAuth } from '../context/AuthContext';
import { useDateFilter } from '../context/DateFilterContext';
import { db } from '../services/mockDb';
import { Card } from '../components/ui/Card';
import { Loader } from '../components/ui/Loader';
import { MonthControl } from '../components/ui/MonthControl';
import { useNavigate } from 'react-router-dom';
import { Agent } from '../types';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import { Users, Home, TrendingUp, ExternalLink, Trophy, Crown, Activity, Clock, Archive, PieChart as PieIcon, BarChart as BarIcon, Activity as LineIcon, X, Medal, Award, CheckCircle2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type ChartType = 'area' | 'bar' | 'line' | 'pie' | 'scatter' | 'histogram';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { startDate, endDate, isCurrentMonth, activeMonthName } = useDateFilter();
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [financials, setFinancials] = useState<any>(null);
  const [topAgents, setTopAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [chartType, setChartType] = useState<ChartType>('area');

  useEffect(() => {
    const fetchStats = async () => {
      setIsRefreshing(true);
      const data = await db.getStats(startDate, endDate);
      const finData = await db.getFinancialReport(startDate, endDate);
      
      if (user?.role === 'admin') {
        // Pass endDate to filter out agents who didn't exist yet
        const agentsData = await db.getAgents(startDate, endDate);
        const sortedAgents = agentsData
            .filter(a => a.active)
            .sort((a, b) => b.points - a.points);
        setTopAgents(sortedAgents);
      }

      setStats(data);
      setFinancials(finData);
      setLoading(false);
      setIsRefreshing(false);
    };
    fetchStats();
  }, [user, startDate, endDate]);

  // Data for Trend Charts (Area, Bar, Line)
  const trendData = useMemo(() => {
      const totalRev = financials?.income.salesRevenue || 0;
      return [
          { name: 'Week 1', sales: totalRev * 0.20 },
          { name: 'Week 2', sales: totalRev * 0.30 },
          { name: 'Week 3', sales: totalRev * 0.15 },
          { name: 'Week 4', sales: totalRev * 0.35 },
      ];
  }, [financials]);

  // Data for Distribution Charts (Scatter, Histogram)
  const soldProductsData = useMemo(() => {
      return financials?.income.details.soldProducts.map((item: any, index: number) => ({
          x: index + 1, // Simple index for x-axis
          y: item.price,
          z: 100, // Size
          name: item.title,
          date: new Date(item.date).getDate() // Day of month
      })) || [];
  }, [financials]);

  // Data for Histogram (Binning prices)
  const histogramData = useMemo(() => {
      const prices = soldProductsData.map((p: any) => p.y);
      if (prices.length === 0) return [];
      const min = Math.min(...prices);
      const max = Math.max(...prices);
      const range = max - min || 100000;
      const binSize = range / 5; // 5 bins
      
      const bins = Array.from({ length: 5 }, (_, i) => ({
          name: `৳${((min + i * binSize)/100000).toFixed(1)}L - ৳${((min + (i+1) * binSize)/100000).toFixed(1)}L`,
          count: 0
      }));

      prices.forEach((price: number) => {
          const binIndex = Math.min(Math.floor((price - min) / binSize), 4);
          bins[binIndex].count += 1;
      });
      return bins;
  }, [soldProductsData]);

  const allLogs = useMemo(() => [
    { event: 'New property listed', detail: 'Sarah Connor • Downtown Loft', time: new Date(Date.now() - 7200000).toISOString(), type: 'listing', description: "A new premium loft property located in the heart of the city was added to the system inventory by Sarah Connor. It features modern amenities and is listed at market competitive rates." },
    { event: 'Lead converted', detail: 'James Bond • Alice Wonderland', time: new Date(Date.now() - 14400000).toISOString(), type: 'sale', description: "Lead Alice Wonderland was successfully converted to 'Closed' status by James Bond. The deal involved the sale of a 3BHK apartment. Commission points have been awarded." },
    { event: 'Price updated', detail: 'Sunset Villa • ৳1.2C -> ৳1.15C', time: new Date(Date.now() - 21600000).toISOString(), type: 'update', description: "The listing price for Sunset Villa was adjusted downward by ৳5 Lakhs to align with current market trends and attract more potential buyers." },
    { event: 'Property sold', detail: 'James Bond • Oceanview Condo', time: new Date(Date.now() - 172800000).toISOString(), type: 'sale', description: "Oceanview Condo was sold. The property has been removed from active inventory and the revenue has been recorded in the financial ledger." },
  ], []);

  const logs = useMemo(() => {
    const isInRange = (dateStr: string) => {
        const d = new Date(dateStr).getTime();
        const s = new Date(startDate).getTime();
        const e = new Date(endDate).getTime();
        return d >= s && d <= e;
    };
    return allLogs.filter(log => isInRange(log.time));
  }, [allLogs, startDate, endDate]);

  const formatBDTime = (isoString: string) => {
    return new Date(isoString).toLocaleString('en-GB', {
        timeZone: 'Asia/Dhaka',
        hour: '2-digit', minute: '2-digit', hour12: true, day: 'numeric', month: 'short'
    });
  };

  const TakaIcon = ({ size = 24, className = "" }) => <span className={`font-bold font-display ${className}`} style={{ fontSize: size }}>৳</span>;
  const PIE_COLORS = ['#ef4444', '#3b82f6', '#10b981', '#f59e0b'];

  const StatBox = ({ title, value, icon: Icon, delay, prefix = '' }: any) => (
    <Card delay={delay} className="flex flex-col justify-between h-48 hover:border-red-500/30 transition-colors">
      <div className="flex justify-between items-start">
        <motion.div 
          initial={{ rotateY: 0 }}
          whileHover={{ rotateY: 180, scale: 1.1 }}
          className="p-3.5 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-xl border border-white/5 shadow-lg flex items-center justify-center"
        >
          {Icon ? <Icon className="text-red-500" size={24} /> : null}
        </motion.div>
        {!isCurrentMonth && (
            <div className="px-2 py-1 rounded bg-blue-500/10 text-blue-400 text-[10px] font-bold uppercase border border-blue-500/20">
                History
            </div>
        )}
      </div>
      <div>
        <motion.h3 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: delay + 0.2 }}
          className="text-4xl font-bold text-white mt-4 mb-1 font-display tracking-tight"
        >
          {prefix}{typeof value === 'number' ? value.toLocaleString() : value}
        </motion.h3>
        <p className="text-zinc-500 text-xs font-bold uppercase tracking-widest">{title}</p>
      </div>
    </Card>
  );

  const renderChart = () => {
    const commonProps = {
        width: "100%",
        height: "100%"
    };

    // If no data in trends (empty month), show empty state in chart
    if (trendData.every(d => d.sales === 0)) {
        return (
            <div className="w-full h-full flex items-center justify-center text-zinc-600 italic text-xs">
                No revenue data for {activeMonthName}
            </div>
        );
    }

    switch (chartType) {
        case 'area':
            return (
                <ResponsiveContainer {...commonProps}>
                    <AreaChart data={trendData}>
                        <defs>
                            <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#dc2626" stopOpacity={0.4}/>
                                <stop offset="95%" stopColor="#dc2626" stopOpacity={0}/>
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} />
                        <XAxis dataKey="name" stroke="#444" tick={{fill: '#666', fontSize: 12}} axisLine={false} tickLine={false} dy={10} />
                        <YAxis stroke="#444" tick={{fill: '#666', fontSize: 12}} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{backgroundColor: '#111', border: '1px solid #333', borderRadius:'8px'}} itemStyle={{ color: '#fff' }} />
                        <Area type="monotone" dataKey="sales" stroke="#dc2626" strokeWidth={3} fill="url(#colorSales)" />
                    </AreaChart>
                </ResponsiveContainer>
            );
        // ... (Other cases remain same, just condensed for response)
        case 'bar':
             return <ResponsiveContainer {...commonProps}><BarChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} /><XAxis dataKey="name" stroke="#444" /><YAxis stroke="#444" /><Tooltip contentStyle={{backgroundColor: '#111'}} /><Bar dataKey="sales" fill="#dc2626" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>;
        case 'line':
             return <ResponsiveContainer {...commonProps}><LineChart data={trendData}><CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} /><XAxis dataKey="name" stroke="#444" /><YAxis stroke="#444" /><Tooltip contentStyle={{backgroundColor: '#111'}} /><Line type="monotone" dataKey="sales" stroke="#dc2626" strokeWidth={3} dot={{r: 4, fill:'#dc2626'}} /></LineChart></ResponsiveContainer>;
        case 'pie':
             return <ResponsiveContainer {...commonProps}><PieChart><Pie data={trendData} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="sales">{trendData.map((entry, index) => (<Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />))}</Pie><Tooltip contentStyle={{backgroundColor: '#111'}} /></PieChart></ResponsiveContainer>;
        case 'scatter':
             return <ResponsiveContainer {...commonProps}><ScatterChart><CartesianGrid strokeDasharray="3 3" stroke="#222" /><XAxis type="number" dataKey="date" name="Day" stroke="#444" /><YAxis type="number" dataKey="y" name="Price" stroke="#444" /><ZAxis type="number" dataKey="z" range={[50, 400]} /><Tooltip contentStyle={{backgroundColor: '#111'}} /><Scatter name="Sales" data={soldProductsData} fill="#dc2626" /></ScatterChart></ResponsiveContainer>;
        case 'histogram':
             return <ResponsiveContainer {...commonProps}><BarChart data={histogramData}><CartesianGrid strokeDasharray="3 3" stroke="#222" vertical={false} /><XAxis dataKey="name" stroke="#444" fontSize={10} /><YAxis stroke="#444" /><Tooltip contentStyle={{backgroundColor: '#111'}} /><Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]} /></BarChart></ResponsiveContainer>;
        default: return null;
    }
  };

  if (loading) return <Loader />;

  const netProfit = financials?.netProfitLoss > 0 ? financials.netProfitLoss : 0;
  const netLoss = financials?.netProfitLoss < 0 ? Math.abs(financials.netProfitLoss) : 0;

  return (
    <div className="space-y-10 relative">
      {/* Refresh Overlay */}
      <AnimatePresence>
        {isRefreshing && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[1px] z-50 rounded-3xl flex items-center justify-center pointer-events-none"
          >
             <div className="p-3 bg-black rounded-full border border-white/10 shadow-2xl">
                <div className="w-5 h-5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Log Detail Modal */}
      <AnimatePresence>
        {selectedLog && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
                <motion.div 
                    initial={{ opacity: 0, scale: 0.9 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="w-full max-w-md"
                >
                    <Card title="Activity Detail" className="bg-zinc-900 border border-zinc-800 shadow-2xl" noTilt>
                         <div className="p-1 space-y-4">
                             <div className="flex items-start gap-4 p-4 bg-zinc-950/50 rounded-xl border border-white/5">
                                 <div className="p-3 bg-zinc-900 rounded-full border border-white/5 text-zinc-400">
                                     <Activity size={24} />
                                 </div>
                                 <div>
                                     <h4 className="font-bold text-white text-lg">{selectedLog.event}</h4>
                                     <p className="text-sm text-zinc-500">{selectedLog.detail}</p>
                                 </div>
                             </div>
                             <div className="space-y-2">
                                 <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Description</p>
                                 <p className="text-sm text-zinc-300 leading-relaxed">{selectedLog.description}</p>
                             </div>
                             <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                 <div className="flex items-center gap-2 text-xs text-zinc-500 font-mono">
                                     <Calendar size={12} />
                                     {formatBDTime(selectedLog.time)}
                                 </div>
                                 <div className="px-2 py-1 rounded bg-zinc-800 text-xs font-bold uppercase text-zinc-400 border border-white/5">
                                     {selectedLog.type}
                                 </div>
                             </div>
                             <button onClick={() => setSelectedLog(null)} className="w-full py-3 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl font-bold transition-colors mt-2">Close</button>
                         </div>
                    </Card>
                </motion.div>
            </div>
        )}
      </AnimatePresence>

      <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-6 border-b border-white/5">
        <div>
          <h2 className="text-4xl font-bold text-white font-display tracking-tight">Dashboard</h2>
          <p className="text-zinc-400 mt-2">Overview for <span className={`font-bold border-b ${isCurrentMonth ? 'text-red-500 border-red-500' : 'text-blue-400 border-blue-500'}`}>{activeMonthName}</span></p>
        </div>
        <div className="flex flex-col md:flex-row items-end md:items-center gap-4">
           <MonthControl />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatBox title="Total Revenue" value={stats?.totalSales || 0} prefix="৳" icon={TakaIcon} delay={0.1} />
        <StatBox title="Active Listings" value={stats?.activeListings || 0} icon={Home} delay={0.2} />
        <StatBox title="New Customers" value={stats?.totalCustomers || 0} icon={Users} delay={0.3} />
        <StatBox title="Active Agents" value={stats?.totalAgents || 0} icon={Users} delay={0.4} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="min-h-[550px] flex flex-col overflow-hidden" title="Monthly Financials" delay={0.45}>
            <div className="flex-1 overflow-y-auto custom-scrollbar pr-2 relative z-40 space-y-6">
                {/* Net Profit / Loss Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="p-3 rounded-xl bg-green-900/10 border border-green-500/20">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Income</p>
                        <p className="text-lg font-bold text-green-400">৳{(financials?.income.totalIncome / 100000).toFixed(1)}L</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-900/10 border border-red-500/20">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Expense</p>
                        <p className="text-lg font-bold text-red-400">৳{(financials?.expenses.totalExpenses / 100000).toFixed(1)}L</p>
                    </div>
                     <div className="p-3 rounded-xl bg-green-950/20 border border-green-500/20">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Net Profit</p>
                        <p className="text-lg font-bold text-green-400">৳{(netProfit / 100000).toFixed(1)}L</p>
                    </div>
                    <div className="p-3 rounded-xl bg-red-950/20 border border-red-500/20">
                        <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-wider mb-1">Net Loss</p>
                        <p className="text-lg font-bold text-red-500">৳{(netLoss / 100000).toFixed(1)}L</p>
                    </div>
                </div>
                 <div className="space-y-1 border-t border-white/5 pt-4">
                    <p className="text-[10px] uppercase font-bold text-zinc-500 mb-2">Revenue Breakdown</p>
                    <div className="flex justify-between text-sm text-zinc-300 py-1"><span>Sales Revenue</span><span>৳{financials?.income.salesRevenue.toLocaleString()}</span></div>
                    <div className="flex justify-between text-sm text-zinc-300 py-1"><span>Service Revenue</span><span>৳{financials?.income.serviceRevenue.toLocaleString()}</span></div>
                </div>

                {user?.role === 'admin' && (
                    <button 
                        onClick={() => navigate('/accounts')}
                        className="mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-zinc-900 border border-zinc-700 hover:bg-zinc-800 hover:border-red-500/30 transition-all group text-sm font-bold text-zinc-400 hover:text-white"
                    >
                        <ExternalLink size={16} />
                        View Detailed Accounts
                    </button>
                )}
            </div>
        </Card>

        <Card className="lg:col-span-2 min-h-[550px] flex flex-col" title={`${activeMonthName} Revenue Trend`} delay={0.5}>
            <div className="flex flex-col h-full">
                {/* Chart Type Selector */}
                <div className="flex gap-2 mb-4 overflow-x-auto custom-scrollbar pb-2 px-1">
                    {(['area', 'bar', 'line', 'pie', 'scatter', 'histogram'] as ChartType[]).map(t => (
                        <button 
                        key={t} 
                        onClick={() => setChartType(t)} 
                        className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all border ${
                            chartType === t 
                            ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-900/20' 
                            : 'bg-zinc-900 text-zinc-500 border-zinc-800 hover:border-zinc-600 hover:text-zinc-300'
                        }`}
                        >
                        {t}
                        </button>
                    ))}
                </div>

                <div className="flex-1 w-full min-h-[300px] relative z-40">
                    {renderChart()}
                </div>
            </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2" title="Monthly Activity Log" delay={0.6}>
            <div className="max-h-[300px] overflow-y-auto custom-scrollbar pr-2 space-y-3">
                {logs.length > 0 ? logs.map((log, i) => (
                    <motion.div 
                        key={i}
                        layoutId={`log-${i}`}
                        className="flex items-center justify-between p-3 rounded-xl bg-zinc-900/50 border border-white/5 hover:bg-zinc-900 hover:border-red-500/30 transition-all cursor-pointer group relative overflow-hidden"
                        onClick={() => setSelectedLog(log)}
                    >
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-center gap-4">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center bg-zinc-800 text-zinc-400 group-hover:text-white group-hover:bg-red-600/20 transition-colors`}>
                                <Activity size={16} />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">{log.event}</p>
                                <p className="text-xs text-zinc-500">{log.detail}</p>
                            </div>
                        </div>
                        <div className="text-xs font-mono text-zinc-500 flex items-center gap-2">
                             <Clock size={12} />
                             {formatBDTime(log.time)}
                        </div>
                    </motion.div>
                )) : (
                    <div className="py-12 flex flex-col items-center justify-center text-zinc-500 opacity-50">
                        <Archive size={32} className="mb-2" />
                        <span className="italic text-sm">No logs for {activeMonthName}</span>
                    </div>
                )}
            </div>
        </Card>

        {user?.role === 'admin' && (
            <Card title="Top Agents (Monthly)" delay={0.7}>
                <div className="space-y-4">
                    {topAgents.map((agent, idx) => {
                         let rankStyle = "bg-zinc-900/50 border-white/5 text-zinc-500";
                         let rankIcon = <div className="font-bold text-xs">#{idx + 1}</div>;
                         let glow = "";

                         if (idx === 0) {
                             rankStyle = "bg-gradient-to-r from-yellow-900/20 to-yellow-600/10 border-yellow-500/30 shadow-[inset_0_0_20px_rgba(234,179,8,0.1)]";
                             rankIcon = <Trophy size={16} className="text-yellow-400 drop-shadow-md" />;
                             glow = "text-yellow-400";
                         } else if (idx === 1) {
                             rankStyle = "bg-gradient-to-r from-zinc-400/20 to-zinc-600/10 border-zinc-400/30";
                             rankIcon = <Medal size={16} className="text-zinc-300" />;
                             glow = "text-zinc-300";
                         } else if (idx === 2) {
                             rankStyle = "bg-gradient-to-r from-orange-900/20 to-orange-700/10 border-orange-500/30";
                             rankIcon = <Award size={16} className="text-orange-400" />;
                             glow = "text-orange-400";
                         }

                         return (
                             <motion.div 
                                key={agent.id} 
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: 0.8 + (idx * 0.1) }}
                                className={`flex items-center gap-4 p-3 rounded-xl border transition-transform hover:scale-[1.02] ${rankStyle}`}
                             >
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center bg-black/40 shadow-inner border border-white/5 ${glow}`}>
                                     {rankIcon}
                                 </div>
                                 
                                 <div className="flex-1 min-w-0">
                                     <div className="flex justify-between items-center mb-0.5">
                                         <p className={`text-sm font-bold truncate ${idx === 0 ? 'text-yellow-200' : 'text-white'}`}>{agent.name}</p>
                                         {idx === 0 && <Crown size={12} className="text-yellow-500 animate-pulse ml-2" />}
                                     </div>
                                     <div className="flex items-center gap-3 text-[10px] text-zinc-500 font-mono uppercase">
                                         <span>{agent.points} Pts</span>
                                         <span className="w-1 h-1 rounded-full bg-zinc-700" />
                                         <span>{agent.salesCount} Sales</span>
                                     </div>
                                 </div>

                                 <div className="text-right">
                                    <div className="text-xs font-bold text-zinc-400">Rev</div>
                                    <div className={`text-xs font-bold font-display ${idx === 0 ? 'text-green-400' : 'text-white'}`}>
                                        ৳{((agent.points / 10) * agent.commissionRate / 1000).toFixed(1)}k
                                    </div>
                                 </div>
                            </motion.div>
                         );
                    })}
                    
                    {topAgents.length === 0 && (
                        <div className="text-center py-8 text-zinc-500 italic text-sm">
                            No active agents in this period.
                        </div>
                    )}
                </div>
            </Card>
        )}
      </div>
    </div>
  );
};
