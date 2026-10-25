import React, { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  Package, 
  Trash2, 
  Search, 
  Plus, 
  ArrowRight, 
  RefreshCcw,
  AlertCircle,
  X,
  History,
  TrendingDown
} from 'lucide-react';

const InventoryModule = () => {
  const { api } = useAuth();
  const [stocks, setStocks] = useState([]);
  const [staffs, setStaffs] = useState([]);
  const [modal, setModal] = useState(false);
  const [allotModal, setAllotModal] = useState(false);
  const [summary, setSummary] = useState([]);
  const [form, setForm] = useState({ itemName: '', quantity: 0, price: 0, minLevel: 5 });
  const [allotForm, setAllotForm] = useState({ staffId: '', stockId: '', quantity: 1, type: 'ISSUE' });
  const [saving, setSaving] = useState(false);
  const [allotting, setAllotting] = useState(false);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [staffSearch, setStaffSearch] = useState('');

  const load = useCallback(async () => {
    try {
      const results = await Promise.allSettled([
        api('get', '/api/admin/stocks'),
        api('get', '/api/admin/users'),
        api('get', '/api/v1/staff-stock/summary')
      ]);

      if (results[0].status === 'fulfilled') setStocks(results[0].value.data);
      if (results[1].status === 'fulfilled') setStaffs(results[1].value.data.filter(u => u.role === 'Staff'));
      if (results[2].status === 'fulfilled') setSummary(results[2].value.data);

      if (results.some(r => r.status === 'rejected')) {
        console.warn('Some inventory sub-data failed to load gracefully.');
      }
    } catch (err) {
      console.error('Core inventory fetch fail', err);
      setError('Failed to fetch items');
    }
  }, [api]);

  useEffect(() => { load(); }, [load]);

  const handleCreate = async () => {
    if (!form.itemName) return setError('Item name is required');
    if (form.price <= 0) return setError('Price must be greater than 0');
    setSaving(true);
    try { await api('post', '/api/admin/stocks', form); setModal(false); setForm({ itemName: '', quantity: 0, price: 0, minLevel: 5 }); await load(); }
    catch (e) { setError(e.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const del = async (id) => { if (window.confirm('Delete item?')) { await api('delete', `/api/admin/stocks/${id}`); await load(); } };

  const addQty = async (id, currentQty, amount) => {
    const newQty = Math.max(0, currentQty + amount);
    // Optimistic UI update for zero latency
    setStocks(prev => prev.map(s => s._id === id ? { ...s, quantity: newQty } : s));
    
    try {
      // Background sync
      await api('put', `/api/admin/stocks/${id}`, { quantity: newQty });
    } catch {
      console.error('Quantity update failed');
      // Revert changes if API fails
      setStocks(prev => prev.map(s => s._id === id ? { ...s, quantity: currentQty } : s));
      alert('Network sync failed, check connection.');
    }
  };

  const handleDeleteRecord = async (recordId) => {
    if (!window.confirm('PERMANENT DELETE: This will remove the record WITHOUT returning items to the warehouse. Proceed?')) return;
    try {
      await api('delete', `/api/v1/staff-stock/${recordId}`);
      await load();
    } catch (e) {
      setError(e.response?.data?.message || 'Delete failed');
    }
  };

  const handleReturnToInventory = async (record) => {
    if (!window.confirm(`RETURN TO WAREHOUSE: This will remove ${record.balanceQuantity} ${record.itemName} from ${record.staffId?.name} and add them back to main inventory. Proceed?`)) return;
    try {
      await api('post', '/api/v1/staff-stock/return', {
        staffId: record.staffId?._id,
        stockId: record.stockId,
        quantity: record.balanceQuantity
      });
      await load();
    } catch (err) {
      setError(err.response?.data?.message || 'Return failed');
    }
  };

  const handleAllot = async () => {
    if (!allotForm.staffId || !allotForm.stockId || allotForm.quantity <= 0) {
      return setError('Please select staff, item and valid quantity');
    }
    setAllotting(true);
    setError('');
    try {
      const endpoint = allotForm.type === 'ISSUE' ? '/api/v1/staff-stock/issue' : '/api/v1/staff-stock/return';
      await api('post', endpoint, {
        staffId: allotForm.staffId,
        stockId: allotForm.stockId,
        quantity: parseInt(allotForm.quantity)
      });
      setAllotModal(false);
      await load();
      alert(`Success: Stock ${allotForm.type === 'ISSUE' ? 'issued to' : 'received from'} staff.`);
    } catch (e) {
      setError(e.response?.data?.message || 'Operation failed');
    } finally {
      setAllotting(false);
    }
  };

  const filtered = stocks.filter(s => 
    s.itemName ? s.itemName.toLowerCase().includes(search.toLowerCase()) : false
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3 tracking-tight">
             <Package size={32} className="text-blue-600" /> Asset Control
          </h1>
          <p className="text-gray-500 font-medium tracking-tight">Manage hardware and field equipment</p>
        </div>
        <div className="flex items-center gap-4">
           <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text" 
                placeholder="Search assets..." 
                className="pl-12 pr-6 py-3.5 bg-white border border-gray-100 rounded-2xl w-full md:w-64 focus:outline-none focus:ring-4 focus:ring-blue-50 shadow-sm transition-all font-bold"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
           </div>
           <button 
              className="bg-gray-900 hover:bg-black text-white font-black px-6 py-4 rounded-2xl flex items-center gap-2 shadow-xl transition-all active:scale-95"
              onClick={() => { setModal(true); setError(''); }}
           >
              <Plus size={20} /> REGISTER ASSET
           </button>
        </div>
      </div>

      {/* Assets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(s => (
          <div key={s._id} className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
            {s.quantity <= s.minLevel && (
               <div className="absolute top-0 right-0 p-3 bg-red-500 text-white rounded-bl-3xl text-[9px] font-black uppercase tracking-widest animate-pulse">
                  LOW STOCK
               </div>
            )}
            
            <div className="flex justify-between items-start mb-6">
               <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${s.quantity <= s.minLevel ? 'bg-red-50 text-red-600' : 'bg-blue-50 text-blue-600'}`}>
                  <Package size={28} />
               </div>
               <button onClick={() => del(s._id)} className="p-2 text-gray-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                  <Trash2 size={18} />
               </button>
            </div>

            <div className="flex justify-between items-start gap-4 mb-6">
               <div>
                  <h3 className="text-xl font-black text-gray-900 mb-1">{s.itemName}</h3>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                     <History size={12} /> RE-ORDER LEVEL: {s.minLevel}
                  </p>
               </div>
               <div className="text-right bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100 shrink-0 shadow-sm">
                  <p className="text-[8px] font-black text-emerald-600/70 uppercase tracking-widest">Total Value</p>
                  <p className="text-sm font-black text-emerald-700">₹{(s.quantity * (s.price || 0)).toLocaleString('en-IN')}</p>
               </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-3xl border border-gray-100 mb-6">
               <div>
                  <p className="text-[10px] font-black text-gray-400 uppercase">Available</p>
                  <p className={`text-4xl font-black ${s.quantity <= s.minLevel ? 'text-red-600' : 'text-gray-900'}`}>{s.quantity}</p>
               </div>
               <div className="flex flex-col gap-2">
                  <button onClick={() => addQty(s._id, s.quantity, 1)} className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center text-blue-600 hover:bg-blue-600 hover:text-white transition-all">
                     <Plus size={20} />
                  </button>
                  <button onClick={() => addQty(s._id, s.quantity, -1)} className="w-10 h-10 bg-white shadow-sm border border-gray-100 rounded-xl flex items-center justify-center text-gray-400 hover:bg-gray-100 transition-all">
                     <TrendingDown size={20} className="rotate-90" />
                  </button>
               </div>
            </div>
            
            <button 
              onClick={() => {
                setAllotForm({ staffId: staffs[0]?._id || '', stockId: s._id, quantity: 1, type: 'ISSUE' });
                setAllotModal(true);
                setError('');
              }}
              className="w-full py-4 bg-gray-900 hover:bg-black text-white text-[10px] font-black uppercase tracking-widest rounded-3xl flex items-center justify-center gap-2 transition-all mb-4"
            >
               <ArrowRight size={14} /> Allot to Staff
            </button>

            <div className="pt-4 border-t border-gray-50 flex items-center justify-between text-[10px] font-black text-gray-300 uppercase tracking-widest leading-loose">
               <span>Pradeep Enterprises</span>
               <span className="flex items-center gap-1">SYNCED <RefreshCcw size={10} /></span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
           <div className="lg:col-span-3 py-20 bg-white rounded-[3rem] border border-dashed border-gray-200 flex flex-col items-center justify-center gap-4">
              <Package size={48} className="text-gray-200" />
              <p className="font-bold text-gray-400">No matching assets found in local registry.</p>
           </div>
        )}
      </div>

      {/* Staff Stock Summary Table */}
      <section className="bg-white rounded-[2.5rem] border border-gray-100 p-8 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center">
                  <History size={20} />
               </div>
               <div>
                  <h2 className="text-xl font-black text-gray-900 leading-none">Live Staff Holdings</h2>
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Current assets issued to field units</p>
               </div>
            </div>
            
            <div className="relative min-w-[240px]">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={14} />
               <input 
                 className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-emerald-500 rounded-xl pl-9 pr-4 py-2.5 text-xs font-bold text-gray-700 outline-none transition-all placeholder:text-gray-300"
                 placeholder="Search by staff name..."
                 value={staffSearch}
                 onChange={e => setStaffSearch(e.target.value)}
               />
            </div>
          </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-gray-50">
                <th className="pb-4 text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Staff Member</th>
                <th className="pb-4 text-[10px] font-black uppercase text-gray-400 tracking-widest px-2">Asset Name</th>
                <th className="pb-4 text-[10px] font-black uppercase text-gray-400 tracking-widest px-2 text-center">Qty on Hand</th>
                <th className="pb-4 text-[10px] font-black uppercase text-gray-400 tracking-widest px-2 text-center">Last Update</th>
                <th className="pb-4 text-[10px] font-black uppercase text-gray-400 tracking-widest px-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {summary
                .filter(rec => rec.staffId?.name?.toLowerCase().includes(staffSearch.toLowerCase()))
                .length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-sm font-bold text-gray-400 uppercase tracking-widest">No matching staff holdings found</td>
                </tr>
              ) : (
                summary
                  .filter(rec => rec.staffId?.name?.toLowerCase().includes(staffSearch.toLowerCase()))
                  .map((record) => (
                  <tr key={record._id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="py-4 px-2">
                      <div className="font-black text-gray-900 text-sm">{record.staffId?.name || 'Unknown'}</div>
                      <div className="text-[10px] font-bold text-gray-400">{record.staffId?.phone || 'No phone'}</div>
                    </td>
                    <td className="py-4 px-2">
                       <span className="font-black text-blue-600 text-xs uppercase bg-blue-50 px-2.5 py-1 rounded-lg">{record.itemName}</span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <span className="text-lg font-black text-gray-900">{record.balanceQuantity}</span>
                    </td>
                    <td className="py-4 px-2 text-center">
                      <div className="text-[10px] font-black text-gray-400 uppercase">
                        {new Date(record.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                      </div>
                    </td>
                    <td className="py-4 px-2 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => handleReturnToInventory(record)}
                           className="p-2 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                           title="Return All to Inventory"
                         >
                            <RefreshCcw size={16} />
                         </button>
                         <button 
                           onClick={() => handleDeleteRecord(record._id)}
                           className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                           title="Force Delete"
                         >
                            <Trash2 size={16} />
                         </button>
                       </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modals */}
      {modal && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
          <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
            <ModalHeader title="New Asset" sub="Inventory Registry Control" onClose={() => setModal(false)} />
            <div className="p-10 space-y-6">
              {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center gap-3 text-sm font-black"><AlertCircle size={18} /> {error}</div>}
              <div className="space-y-2">
                 <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Hardware / Part Name</label>
                 <input className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-2xl p-4 text-gray-900 font-bold outline-none transition-all placeholder:text-gray-300" value={form.itemName} onChange={e => setForm(x => ({...x, itemName: e.target.value}))} placeholder="e.g. Wi-Fi Router Model X" />
              </div>
              <div className="grid grid-cols-3 gap-6">
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Initial Qty</label>
                    <input type="number" className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-2xl p-4 text-gray-900 font-bold outline-none transition-all" value={form.quantity} onChange={e => setForm(x => ({...x, quantity: parseInt(e.target.value)}))} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Price (₹)</label>
                    <input type="number" className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-2xl p-4 text-gray-900 font-bold outline-none transition-all" value={form.price} onChange={e => setForm(x => ({...x, price: parseFloat(e.target.value)}))} />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Min Level</label>
                    <input type="number" className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-2xl p-4 text-gray-900 font-bold outline-none transition-all" value={form.minLevel} onChange={e => setForm(x => ({...x, minLevel: parseInt(e.target.value)}))} />
                 </div>
              </div>
            </div>
            <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex gap-4">
              <button className="flex-1 bg-white hover:bg-gray-100 text-gray-500 font-black py-4 rounded-2xl border border-gray-100 shadow-sm" onClick={() => setModal(false)}>CANCEL</button>
              <button className="flex-[2] bg-blue-600 hover:bg-blue-700 text-white font-black py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all font-black uppercase tracking-widest" onClick={handleCreate} disabled={saving}>{saving ? 'PROCESSING...' : 'AUTHORIZE ENTRY'}</button>
            </div>
          </div>
        </div>
      )}

      {allotModal && (
        <AllotModal 
          staffs={staffs} 
          allotForm={allotForm} 
          setAllotForm={setAllotForm} 
          handleAllot={handleAllot} 
          allotting={allotting} 
          error={error} 
          onClose={() => setAllotModal(false)} 
        />
      )}
    </div>
  );
};

// Internal Modal components to keep things clean
const ModalHeader = ({ title, sub, onClose }) => (
  <div className="p-8 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
    <div>
      <h3 className="text-2xl font-black text-gray-900 tracking-tight">{title}</h3>
      <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{sub}</p>
    </div>
    <button onClick={onClose} className="p-3 bg-white hover:bg-gray-100 rounded-2xl text-gray-400 border border-gray-100 shadow-sm transition">
      <X size={20} />
    </button>
  </div>
);

const AllotModal = ({ staffs, allotForm, setAllotForm, handleAllot, allotting, error, onClose }) => (
  <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm z-[110] flex items-center justify-center p-4">
    <div className="bg-white rounded-[3rem] w-full max-w-lg shadow-2xl relative overflow-hidden animate-in zoom-in-95 duration-200">
      <ModalHeader title="Inventory Allotment" sub="Asset Issue & Return Control" onClose={onClose} />
      
      <div className="p-10 space-y-6">
        {error && <div className="bg-red-50 text-red-600 p-4 rounded-2xl border border-red-100 flex items-center gap-3 text-sm font-black"><AlertCircle size={18} /> {error}</div>}
        
        <div className="flex bg-gray-100 p-1.5 rounded-2xl">
          <button 
            onClick={() => setAllotForm({...allotForm, type: 'ISSUE'})}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${allotForm.type === 'ISSUE' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-400'}`}
          >
            Issue to Staff
          </button>
          <button 
            onClick={() => setAllotForm({...allotForm, type: 'RETURN'})}
            className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${allotForm.type === 'RETURN' ? 'bg-white shadow-sm text-amber-600' : 'text-gray-400'}`}
          >
            Receive Return
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Assign To Staff</label>
          <select 
            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-2xl p-4 text-gray-900 font-bold outline-none transition-all appearance-none cursor-pointer"
            value={allotForm.staffId}
            onChange={e => setAllotForm({...allotForm, staffId: e.target.value})}
          >
            <option value="" disabled>Select Staff Member</option>
            {staffs.map(st => (
              <option key={st._id} value={st._id}>{st.name} ({st.phone})</option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Units to {allotForm.type === 'ISSUE' ? 'Issue' : 'Return'}</label>
          <input 
            type="number" 
            min="1"
            className="w-full bg-gray-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-2xl p-4 text-gray-900 font-bold outline-none transition-all" 
            value={allotForm.quantity} 
            onChange={e => setAllotForm({...allotForm, quantity: e.target.value})} 
          />
        </div>
      </div>

      <div className="p-8 bg-gray-50/50 border-t border-gray-50 flex gap-4">
        <button className="flex-1 bg-white hover:bg-gray-100 text-gray-500 font-black py-4 rounded-2xl border border-gray-100 shadow-sm" onClick={onClose}>CANCEL</button>
        <button 
          className={`flex-[2] text-white font-black py-4 rounded-2xl shadow-lg transition-all uppercase tracking-widest ${allotForm.type === 'ISSUE' ? 'bg-blue-600 hover:bg-blue-700 shadow-blue-200' : 'bg-amber-600 hover:bg-amber-700 shadow-amber-200'}`}
          onClick={handleAllot}
          disabled={allotting}
        >
          {allotting ? 'TRANSACTING...' : `AUTHORIZE ${allotForm.type}`}
        </button>
      </div>
    </div>
  </div>
);

export default InventoryModule;
