import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Package, Search, Trash2, History, RefreshCcw, Inbox, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const StaffHoldings = () => {
  const { api } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api('get', '/api/v1/staff-stock/summary');
      setData(res.data);
    } catch (err) {
      console.error('Fetch holdings failed:', err);
      setError('Unable to sync with field units.');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleDelete = async (id) => {
    if (!window.confirm('PERMANENT DELETE: This will remove the record WITHOUT returning items to the warehouse. Use this ONLY for lost items or data corrections. Proceed?')) return;
    try {
      await api('delete', `/api/v1/staff-stock/${id}`);
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
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
      await loadData();
    } catch (err) {
      setError(err.response?.data?.message || 'Return to inventory failed');
    }
  };

  const filteredData = data.filter(item => 
    item.staffId?.name?.toLowerCase().includes(search.toLowerCase()) || 
    item.itemName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-6 lg:p-10 space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <section className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[2.5rem] border border-slate-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-200">
            <Users size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight uppercase">Live Staff Holdings</h1>
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1 flex items-center gap-2">
              Global Field Inventory <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </p>
          </div>
        </div>

        <div className="relative min-w-[320px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            type="text"
            placeholder="Search staff or item name..."
            className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-blue-500 rounded-2xl pl-12 pr-6 py-4 text-xs font-bold text-slate-700 outline-none transition-all shadow-inner"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </section>

      {error && (
        <div className="p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-xs font-black flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
          {error}
        </div>
      )}

      {/* Main Table */}
      <section className="bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/50">
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Staff Member</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Asset Model</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Qty on Hand</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-center">Last Update</th>
                <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading && data.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                       <RefreshCcw className="text-blue-600 animate-spin" size={32} />
                       <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Polling field data...</p>
                    </div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-8 py-32 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 bg-slate-50 rounded-[2.5rem] flex items-center justify-center text-slate-200">
                        <Inbox size={40} />
                      </div>
                      <p className="text-sm font-black text-slate-400 uppercase tracking-tight">No matching holdings found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredData.map((record) => (
                  <motion.tr 
                    layout
                    key={record._id}
                    className="hover:bg-slate-50/50 transition-colors group"
                  >
                    <td className="px-8 py-5">
                      <div className="font-black text-slate-900 text-sm uppercase tracking-tight">{record.staffId?.name || 'Unknown'}</div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{record.staffId?.phone || 'No phone'}</div>
                    </td>
                    <td className="px-8 py-5">
                       <span className="font-black text-blue-600 text-xs uppercase bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100 flex items-center gap-2 w-fit">
                         <Package size={14} /> {record.itemName}
                       </span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <span className="text-xl font-black text-slate-900">{record.balanceQuantity}</span>
                    </td>
                    <td className="px-8 py-5 text-center">
                      <div className="flex flex-col items-center">
                         <div className="text-[10px] font-black text-slate-900 uppercase">
                           {new Date(record.updatedAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short' })}
                         </div>
                         <div className="text-[9px] font-bold text-slate-400 uppercase mt-1">
                           {new Date(record.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                         </div>
                      </div>
                    </td>
                    <td className="px-8 py-5 text-right">
                       <div className="flex items-center justify-end gap-2">
                         <button 
                           onClick={() => handleReturnToInventory(record)}
                           className="p-3 text-blue-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all"
                           title="Return All to Inventory"
                         >
                            <RefreshCcw size={18} />
                         </button>
                         <button 
                           onClick={() => handleDelete(record._id)}
                           className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all"
                           title="Force Delete (No Inventory Return)"
                         >
                            <Trash2 size={18} />
                         </button>
                       </div>
                    </td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Footer info */}
        <div className="p-6 bg-slate-50 flex items-center justify-between border-t border-slate-100 text-[9px] font-black text-slate-300 uppercase tracking-[0.3em]">
           <span>Field HQ Security Node v1.2</span>
           <span className="flex items-center gap-1">HQ SYNC <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /></span>
        </div>
      </section>
    </div>
  );
};

export default StaffHoldings;
