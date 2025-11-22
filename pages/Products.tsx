
import React, { useEffect, useState, useMemo } from 'react';
import { db } from '../services/mockDb';
import { Product } from '../types';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Loader } from '../components/ui/Loader';
import { MonthControl } from '../components/ui/MonthControl';
import { ConfirmationModal } from '../components/ui/ConfirmationModal';
import { Plus, MapPin, Trash, Pencil, Layers, Home, Image as ImageIcon, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useDateFilter } from '../context/DateFilterContext';
import { useAuth } from '../context/AuthContext';

export const Products: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { startDate, endDate, activeMonthName } = useDateFilter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [form, setForm] = useState<Partial<Product>>({
    title: '', address: '', price: 0, quantity: 1, type: 'House', status: 'Available', vatTax: 0, otherCost: 0, images: []
  });
  
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchProducts = async () => {
    setLoading(true);
    // Pass endDate to filter out future products
    const data = await db.getProducts(endDate);
    setProducts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchProducts();
  }, [endDate]); // Refetch when end date changes

  const filteredProducts = useMemo(() => {
      const s = new Date(startDate).getTime();
      const e = new Date(endDate).getTime();
      return products.filter(p => {
          const d = new Date(p.createdAt).getTime();
          // Just check existence in this month view
          // Products created before this month should still show up (as stock), unless sold/deleted.
          // But the DB call already handled "Created Before EndDate".
          // We might want to highlight NEW products in this month, but showing all stock is standard CRM behavior.
          // If "Available", it should show up.
          return true;
      });
  }, [products, startDate, endDate]);

  const handleOpenModal = (product?: Product) => {
      if (product) {
          setEditingId(product.id);
          setForm({
              title: product.title,
              address: product.address,
              price: product.price,
              quantity: product.quantity ?? 0,
              type: product.type || 'House',
              status: product.status || 'Available',
              vatTax: product.vatTax ?? 0,
              otherCost: product.otherCost ?? 0,
              images: product.images || []
          });
      } else {
          setEditingId(null);
          setForm({ title: '', address: '', price: 0, quantity: 1, type: 'House', status: 'Available', vatTax: 0, otherCost: 0, images: [] });
      }
      setIsModalOpen(true);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const files = Array.from(e.target.files);
        const promises = files.map((file: File) => new Promise<string>((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.readAsDataURL(file);
        }));
        Promise.all(promises).then(base64Images => {
            setForm(prev => ({ ...prev, images: [...(prev.images || []), ...base64Images] }));
        });
    }
  };

  const removeImage = (index: number) => {
      setForm(prev => ({ ...prev, images: prev.images?.filter((_, i) => i !== index) }));
  };

  const handleSubmit = async (e: React.FormEvent) => { 
      e.preventDefault(); 
      const payload = { ...form, price: Number(form.price), quantity: Number(form.quantity), vatTax: Number(form.vatTax), otherCost: Number(form.otherCost), images: form.images };
      if (editingId) { await db.updateProduct(editingId, payload); } 
      else { await db.createProduct(payload as any); }
      setIsModalOpen(false); 
      fetchProducts(); 
  };

  const confirmDelete = async () => { if(deleteId){ await db.deleteProduct(deleteId); setDeleteId(null); fetchProducts();} };
  const handleNumberChange = (field: keyof Product, value: string) => {
      const numValue = value === '' ? 0 : parseFloat(value);
      setForm(prev => ({ ...prev, [field]: numValue }));
  };

  if (loading) return <Loader />;

  const isAdmin = user?.role === 'admin';

  return (
    <div className="space-y-8 relative">
       <ConfirmationModal isOpen={!!deleteId} title="Delete Property" message="Confirm deletion?" onConfirm={confirmDelete} onCancel={() => setDeleteId(null)} />

       <div className="flex flex-col md:flex-row justify-between items-end gap-4 pb-6 border-b border-white/5">
        <div>
            <h2 className="text-4xl font-bold text-white font-display tracking-tight">Properties</h2>
            <p className="text-zinc-400 mt-2">Listings for <span className="text-red-500 font-bold">{activeMonthName}</span></p>
        </div>
        <div className="flex items-center gap-4">
           <MonthControl />
           {isAdmin && (
             <Button icon={<Plus size={18} />} onClick={() => handleOpenModal()}>Add Property</Button>
           )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
        <AnimatePresence>
        {filteredProducts.map((p, idx) => (
          <Card key={p.id} delay={idx * 0.05} className="flex flex-col h-full group" contentClassName="!p-0">
            <div className="relative h-48 bg-zinc-900 overflow-hidden">
                 {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity transition-transform duration-700 group-hover:scale-110" alt={p.title}/>
                 ) : (
                    <img src={`https://picsum.photos/seed/${p.id}/800/600`} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" alt={p.title}/>
                 )}
                 <div className={`absolute bottom-2 left-2 px-2 py-1 text-white text-xs font-bold rounded backdrop-blur-md ${p.quantity > 0 ? 'bg-green-600/80' : 'bg-red-600/80'}`}>
                     {p.quantity > 0 ? 'Available' : 'Sold Out'}
                 </div>
                 <div className="absolute top-2 right-2 px-2 py-1 bg-black/60 text-white text-xs font-bold rounded backdrop-blur-md flex items-center gap-1 border border-white/10">
                     <Layers size={12} className="text-blue-400" /> 
                     {p.quantity} Units
                 </div>
            </div>
            <div className="p-4 flex-1 flex flex-col">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-bold text-white truncate pr-2">{p.title}</h3>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-zinc-800 text-zinc-400 font-bold uppercase tracking-wider">{p.type}</span>
                </div>
                <p className="text-zinc-400 text-sm flex items-center gap-1 mb-2"><MapPin size={12}/> {p.address}</p>
                
                <div className="grid grid-cols-2 gap-2 mb-3 mt-auto">
                    <div className="bg-zinc-950 border border-white/5 rounded-lg p-2">
                         <p className="text-[10px] text-zinc-500 uppercase font-bold">Est. Tax</p>
                         <p className="text-xs font-bold text-zinc-300">৳{p.vatTax?.toLocaleString() || 0}</p>
                    </div>
                    <div className="bg-zinc-950 border border-white/5 rounded-lg p-2">
                         <p className="text-[10px] text-zinc-500 uppercase font-bold">Costs</p>
                         <p className="text-xs font-bold text-zinc-300">৳{p.otherCost?.toLocaleString() || 0}</p>
                    </div>
                </div>

                <div className="flex justify-between items-center border-t border-white/5 pt-3">
                    <span className="text-xl font-bold text-white">৳{p.price.toLocaleString()}</span>
                    {isAdmin && (
                        <div className="flex gap-2">
                            <button onClick={()=>handleOpenModal(p)} className="p-2 bg-zinc-800 rounded-lg hover:bg-blue-600 hover:text-white text-zinc-400 transition-colors">
                                <Pencil size={16} />
                            </button>
                            <button onClick={()=>setDeleteId(p.id)} className="p-2 bg-zinc-800 rounded-lg hover:bg-red-600 hover:text-white text-red-500 transition-colors">
                                <Trash size={16}/>
                            </button>
                        </div>
                    )}
                </div>
            </div>
          </Card>
        ))}
        </AnimatePresence>
        {filteredProducts.length === 0 && (
            <div className="col-span-full text-center py-12 text-zinc-500 italic">No properties listed by {activeMonthName}.</div>
        )}
      </div>

      {/* Modal Code (Abbreviated as it's same as before) */}
      {isModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm overflow-y-auto">
             <div className="flex min-h-full items-center justify-center p-4 py-8">
                 <Card title={editingId ? "Edit Property" : "Add Property"} className="w-full max-w-lg" noTilt>
                     <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                         <Input label="Title" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
                         <Input label="Address" value={form.address} onChange={e=>setForm({...form, address:e.target.value})} required />
                         <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">Type</label>
                                <select value={form.type} onChange={e=>setForm({...form, type:e.target.value as any})} className="w-full bg-[#0F0F0F] border border-zinc-800 text-white px-4 py-3.5 rounded-xl outline-none focus:border-red-500 cursor-pointer">
                                    <option value="House">House</option><option value="Apartment">Apartment</option><option value="Condo">Condo</option><option value="Land">Land</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">Status</label>
                                <select value={form.status} onChange={e=>setForm({...form, status:e.target.value as any})} className="w-full bg-[#0F0F0F] border border-zinc-800 text-white px-4 py-3.5 rounded-xl outline-none focus:border-red-500 cursor-pointer">
                                    <option value="Available">Available</option><option value="Pending">Pending</option><option value="Sold">Sold</option>
                                </select>
                            </div>
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <Input label="Price (৳)" type="number" value={form.price} onChange={e=>handleNumberChange('price', e.target.value)} required />
                            <Input label="Quantity (Units)" type="number" value={form.quantity} onChange={e=>handleNumberChange('quantity', e.target.value)} required />
                         </div>
                         <div className="grid grid-cols-2 gap-4">
                            <Input label="VAT / Tax (৳)" type="number" value={form.vatTax} onChange={e=>handleNumberChange('vatTax', e.target.value)} />
                            <Input label="Other Costs (৳)" type="number" value={form.otherCost} onChange={e=>handleNumberChange('otherCost', e.target.value)} />
                         </div>
                         <div>
                            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 mb-2 ml-1">Property Images</label>
                            <div className="bg-zinc-950/50 rounded-xl border border-zinc-800 p-3">
                                <div className="grid grid-cols-4 gap-2 mb-3">
                                    {form.images?.map((img, idx) => (
                                        <div key={idx} className="relative aspect-square rounded-lg overflow-hidden group border border-zinc-700">
                                            <img src={img} alt="preview" className="w-full h-full object-cover" />
                                            <button type="button" onClick={() => removeImage(idx)} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white"><X size={16} /></button>
                                        </div>
                                    ))}
                                    <label className="relative aspect-square rounded-lg border-2 border-dashed border-zinc-700 hover:border-red-500 hover:bg-red-500/10 transition-all cursor-pointer flex flex-col items-center justify-center gap-1 group">
                                        <ImageIcon size={20} className="text-zinc-500 group-hover:text-red-400" /><span className="text-[9px] font-bold text-zinc-500 group-hover:text-red-400 uppercase">Add</span>
                                        <input type="file" multiple accept="image/*" className="hidden" onChange={handleImageUpload}/>
                                    </label>
                                </div>
                            </div>
                         </div>
                         <div className="flex gap-2 pt-4 border-t border-white/5">
                             <Button type="submit" className="flex-1" variant="primary">{editingId ? "Save Changes" : "Create Property"}</Button>
                             <Button type="button" variant="ghost" onClick={()=>setIsModalOpen(false)}>Cancel</Button>
                         </div>
                     </form>
                 </Card>
             </div>
          </div>
      )}
    </div>
  );
};
