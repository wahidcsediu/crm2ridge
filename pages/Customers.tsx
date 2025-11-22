
import React, { useEffect, useState } from 'react';
import { db } from '../services/mockDb';
import { Customer, Product } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { MonthControl } from '../components/ui/MonthControl';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { Plus, Phone, Mail, Pencil, Clock, Target, Home, Search, CheckCircle, MapPin } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { useDateFilter } from '../context/DateFilterContext';

export const Customers: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();
  const { startDate, endDate, activeMonthName } = useDateFilter();
  
  const [form, setForm] = useState({ name: '', email: '', phone: '', budget: 0, status: 'Lead', propertyId: '' });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Search state for property selector
  const [propertySearch, setPropertySearch] = useState('');

  const fetchCustomers = async () => {
    setLoading(true);
    const data = await db.getCustomers(startDate, endDate);
    const prods = await db.getProducts();
    setAllProducts(prods);
    setCustomers(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCustomers();
  }, [startDate, endDate]);

  const handleOpenModal = (customer?: Customer) => { 
      setPropertySearch('');
      if (customer) { 
          setEditingId(customer.id); 
          setForm({ 
              name: customer.name, 
              email: customer.email, 
              phone: customer.phone, 
              budget: customer.budget, 
              status: customer.status,
              propertyId: customer.propertyId || '' 
          }); 
      } else { 
          setEditingId(null); 
          setForm({ name: '', email: '', phone: '', budget: 0, status: 'Lead', propertyId: '' }); 
      } 
      setIsModalOpen(true); 
  }

  const handleSubmit = async (e: React.FormEvent) => { 
      e.preventDefault(); 
      const submission = { ...form, budget: Number(form.budget) };
      
      if (editingId) { 
          await db.updateCustomer(editingId, submission); 
      } else { 
          await db.createCustomer({ ...submission, agentId: user?.id }); 
      } 
      setIsModalOpen(false); 
      fetchCustomers(); 
  };

  const confirmDelete = async () => { if(deleteId) { setIsDeleting(true); await db.deleteCustomer(deleteId); setIsDeleting(false); setDeleteId(null); fetchCustomers(); } }
  const getWinProbability = (status: string) => { switch(status) { case 'Closed': return 100; case 'Negotiation': return 75; case 'Lead': return 25; default: return 10; } }
  const formatBDTime = (isoString: string) => { return new Date(isoString).toLocaleString('en-GB', { timeZone: 'Asia/Dhaka', month: 'short', day: 'numeric' }); };

  // Filter properties: Show ALL properties filtered by search (removed availability check)
  const filteredProperties = allProducts.filter(p => 
      p.title.toLowerCase().includes(propertySearch.toLowerCase()) ||
      p.address.toLowerCase().includes(propertySearch.toLowerCase())
  );

  if (loading) return <Loader />;

  return (
    <div className="space-y-6 relative">
       <ConfirmationModal isOpen={!!deleteId} title="Delete Customer" message="Are you sure?" onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />

       <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-6 border-b border-white/5">
        <div>
            <h2 className="text-3xl font-bold text-white font-display">Customers</h2>
            <p className="text-zinc-400 text-sm mt-1">Leads for <span className="text-red-500 font-bold">{activeMonthName}</span></p>
        </div>
        <div className="flex items-center gap-4">
            <MonthControl />
            <Button icon={<Plus size={18} />} onClick={() => handleOpenModal()}>Add Customer</Button>
        </div>
      </div>

      <Card className="overflow-visible p-0 bg-transparent border-0 shadow-none" noTilt>
        <div className="overflow-x-auto perspective-1000 pb-4">
          <table className="w-full text-left text-sm text-zinc-400 border-separate border-spacing-y-3">
            <thead className="uppercase font-bold text-xs tracking-wider text-zinc-600 font-display ml-2">
              <tr><th className="px-6 pb-2">Client</th><th className="px-6 pb-2">Win Probability</th><th className="px-6 pb-2">Budget</th><th className="px-6 pb-2">Status</th><th className="px-6 pb-2">Date</th><th className="px-6 pb-2 text-right">Action</th></tr>
            </thead>
            <tbody>
              <AnimatePresence>
                {customers.map((c, i) => { const winProb = getWinProbability(c.status); return (
                  <motion.tr key={c.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i*0.05 }} className="bg-zinc-900/40 backdrop-blur-sm rounded-2xl border border-transparent hover:bg-zinc-800 transition-colors">
                     <td className="px-6 py-4 rounded-l-2xl border-y border-l border-white/5"><div className="flex items-center gap-3"><div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center font-bold text-white">{c.name.charAt(0)}</div><div><div className="font-bold text-white">{c.name}</div><div className="text-xs text-zinc-500">{c.email}</div></div></div></td>
                     <td className="px-6 py-4 border-y border-white/5"><div className="flex flex-col gap-1"><div className="flex justify-between text-xs font-bold"><span className={winProb > 50 ? 'text-green-400' : 'text-zinc-400'}>{winProb}%</span><Target size={12} /></div><div className="w-20 h-1 bg-zinc-800 rounded-full overflow-hidden"><div style={{width:`${winProb}%`}} className={`h-full ${winProb===100?'bg-green-500':'bg-red-500'}`}></div></div></div></td>
                     <td className="px-6 py-4 border-y border-white/5 font-bold text-white">৳{c.budget.toLocaleString()}</td>
                     <td className="px-6 py-4 border-y border-white/5"><span className={`px-2 py-1 rounded text-xs font-bold uppercase ${c.status==='Closed'?'bg-green-900/20 text-green-400':'bg-blue-900/20 text-blue-400'}`}>{c.status}</span></td>
                     <td className="px-6 py-4 border-y border-white/5 text-xs font-mono">{formatBDTime(c.updatedAt)}</td>
                     <td className="px-6 py-4 rounded-r-2xl border-y border-r border-white/5 text-right"><div className="flex justify-end gap-2"><button onClick={()=>handleOpenModal(c)} className="text-zinc-400 hover:text-white"><Pencil size={16}/></button><button onClick={()=>setDeleteId(c.id)} className="text-red-500 hover:text-white"><div className="text-xs">Delete</div></button></div></td>
                  </motion.tr>
                )})}
              </AnimatePresence>
            </tbody>
          </table>
        </div>
        {customers.length === 0 && <div className="p-12 text-center text-zinc-500 italic">No customers found for {activeMonthName}.</div>}
      </Card>

      {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
              <Card className="w-full max-w-lg bg-[#09090b] border-zinc-800" title={editingId ? "Edit Customer" : "Add Customer"}>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                      <div className="grid grid-cols-2 gap-4">
                          <Input label="Name" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required />
                          <Input label="Phone" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} required />
                      </div>
                      <Input label="Email" value={form.email} onChange={e=>setForm({...form, email:e.target.value})} required />
                      <Input label="Budget (৳)" type="number" value={form.budget} onChange={e=>setForm({...form, budget:Number(e.target.value)})} required />
                      
                      <div>
                          <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">Status</label>
                          <div className="relative">
                            <select 
                                value={form.status} 
                                onChange={e=>setForm({...form, status:e.target.value})} 
                                className="w-full bg-[#0F0F0F] border border-zinc-800 text-white px-4 py-3 rounded-xl outline-none focus:border-red-500 appearance-none cursor-pointer hover:border-zinc-700 transition-colors"
                            >
                                <option value="Lead">Lead</option>
                                <option value="Negotiation">Negotiation</option>
                                <option value="Closed">Closed (Sold)</option>
                            </select>
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-500">
                                <Target size={14} />
                            </div>
                          </div>
                      </div>

                      {/* Enhanced Property Linking for Closing Deals */}
                      {form.status === 'Closed' && (
                          <motion.div 
                            initial={{ opacity: 0, height: 0 }} 
                            animate={{ opacity: 1, height: 'auto' }} 
                            className="pt-2 border-t border-white/5 mt-4"
                          >
                              <label className="block text-xs font-bold uppercase tracking-wider text-green-400 mb-3 ml-1 flex items-center gap-2">
                                  <Home size={12} /> Select Sold Property
                              </label>
                              
                              <div className="bg-zinc-900/50 rounded-xl border border-zinc-800 p-3 space-y-3">
                                  {/* Property Search */}
                                  <div className="relative">
                                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={14} />
                                      <input 
                                          type="text" 
                                          placeholder="Search by title or address..." 
                                          value={propertySearch}
                                          onChange={(e) => setPropertySearch(e.target.value)}
                                          className="w-full bg-black border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:border-green-500 outline-none placeholder-zinc-600"
                                      />
                                  </div>

                                  {/* Property List */}
                                  <div className="max-h-52 overflow-y-auto custom-scrollbar space-y-2 pr-1">
                                      {filteredProperties.length > 0 ? (
                                          filteredProperties.map(p => (
                                              <div 
                                                  key={p.id} 
                                                  onClick={() => setForm({...form, propertyId: p.id})}
                                                  className={`flex items-center gap-3 p-2 rounded-xl border cursor-pointer transition-all duration-200 group ${
                                                      form.propertyId === p.id 
                                                      ? 'bg-green-900/20 border-green-500/50 shadow-[inset_0_0_15px_rgba(34,197,94,0.1)]' 
                                                      : 'bg-zinc-950 border-zinc-800 hover:border-zinc-600'
                                                  }`}
                                              >
                                                  {/* Thumbnail */}
                                                  <div className="w-12 h-12 rounded-lg bg-zinc-900 overflow-hidden flex-shrink-0 relative">
                                                      <img src={`https://picsum.photos/seed/${p.id}/100/100`} className="w-full h-full object-cover" alt={p.title} />
                                                      {form.propertyId === p.id && (
                                                          <div className="absolute inset-0 bg-green-500/40 flex items-center justify-center">
                                                              <CheckCircle size={16} className="text-white drop-shadow-md" />
                                                          </div>
                                                      )}
                                                  </div>
                                                  
                                                  {/* Details */}
                                                  <div className="flex-1 min-w-0">
                                                      <div className={`text-sm font-bold truncate ${form.propertyId === p.id ? 'text-green-300' : 'text-white'}`}>
                                                          {p.title}
                                                      </div>
                                                      <div className="flex items-center gap-1 text-xs text-zinc-500 truncate">
                                                          <MapPin size={10} /> {p.address}
                                                      </div>
                                                  </div>

                                                  {/* Price & Status */}
                                                  <div className="text-right flex flex-col items-end gap-1">
                                                      <div className="text-xs font-bold text-white bg-zinc-800 px-2 py-1 rounded">
                                                          ৳{(p.price / 100000).toFixed(1)}L
                                                      </div>
                                                      {p.status !== 'Available' && (
                                                          <span className={`text-[10px] px-1.5 py-0.5 rounded font-bold uppercase ${p.status === 'Sold' ? 'bg-red-900/50 text-red-400' : 'bg-blue-900/50 text-blue-400'}`}>
                                                              {p.status}
                                                          </span>
                                                      )}
                                                  </div>
                                              </div>
                                          ))
                                      ) : (
                                          <div className="text-center py-6 text-zinc-600 italic text-xs">
                                              {allProducts.length === 0 ? "No properties found." : "No properties match your search."}
                                          </div>
                                      )}
                                  </div>
                              </div>
                          </motion.div>
                      )}

                      <div className="flex gap-2 pt-4 border-t border-white/5 mt-6">
                          <Button type="submit" className="flex-1" icon={editingId ? <Pencil size={14}/> : <Plus size={14}/>}>
                              {editingId ? 'Update Customer' : 'Create Customer'}
                          </Button>
                          <Button type="button" variant="ghost" onClick={()=>setIsModalOpen(false)}>Cancel</Button>
                      </div>
                  </form>
              </Card>
          </div>
      )}
    </div>
  );
};
