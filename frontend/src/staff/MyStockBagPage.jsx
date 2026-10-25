import React, { useEffect, useState, useCallback } from 'react';
import { Package, Inbox, TrendingUp, ShieldCheck, RefreshCcw } from 'lucide-react';
import { motion } from 'framer-motion';
import { useStaffAuth } from '../context/StaffAuthContext';

const MyStockBagPage = () => {
    const { api } = useStaffAuth();
    const [myStock, setMyStock] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchBag = useCallback(async () => {
        try {
            const { data } = await api('get', '/api/v1/staff-stock/my-bag');
            setMyStock(data);
        } catch (err) {
            console.error('Failed to fetch stock bag');
        } finally {
            setLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchBag();
        const interval = setInterval(fetchBag, 30000);
        return () => clearInterval(interval);
    }, [fetchBag]);

    return (
        <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
            {/* Page Header */}
            <header className="text-center space-y-3">
                <div className="w-16 h-16 bg-emerald-600 text-white rounded-[2rem] flex items-center justify-center mx-auto shadow-xl shadow-emerald-100 mb-4 transition-transform hover:rotate-6">
                    <Package size={32} />
                </div>
                <h1 className="text-3xl font-black text-slate-900 tracking-tight">Personal Resource Bag</h1>
                <p className="text-slate-500 font-medium italic">Verified hardware and assets in your current possession</p>
            </header>

            {loading ? (
                <div className="bg-white rounded-[3rem] p-20 border border-slate-100 flex flex-col items-center justify-center gap-6 shadow-sm">
                    <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Auditing possession registry...</p>
                </div>
            ) : myStock.length === 0 ? (
                <div className="bg-white rounded-[3rem] p-20 border border-dashed border-slate-200 text-center space-y-4">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-200 mx-auto">
                        <Inbox size={32} />
                    </div>
                    <div>
                      <p className="text-slate-900 font-black text-sm uppercase">Registry Clear</p>
                      <p className="text-slate-400 font-bold text-xs mt-1">HQ has not issued any assets to your account yet.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6">
                    {myStock.map((item) => (
                        <motion.div 
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          key={item._id}
                          className="bg-white p-8 rounded-[3rem] border border-slate-100 shadow-xl shadow-slate-200/40 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-6">
                               <div className="bg-slate-50 border border-slate-100 px-4 py-2 rounded-2xl">
                                  <span className="text-2xl font-black text-slate-900 leading-none">x{item.balanceQuantity}</span>
                               </div>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center shadow-inner">
                                    <TrendingUp size={24} />
                                </div>
                                <div className="space-y-1">
                                    <h4 className="text-lg font-black text-slate-900 uppercase tracking-tight leading-none">{item.itemName}</h4>
                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-500 uppercase tracking-widest">
                                        <ShieldCheck size={12} /> Live Inventory Verified
                                    </div>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between text-[9px] font-black text-slate-300 uppercase tracking-widest leading-loose">
                                <span>Updated: {new Date(item.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="flex items-center gap-1">HQ SECURE <RefreshCcw size={10} /></span>
                            </div>
                        </motion.div>
                    ))}
                </div>
            )}

            {/* Verification Footer */}
            <footer className="text-center bg-slate-50 p-6 rounded-[2rem] border border-slate-200">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-relaxed">
                   The above assets are registered to your field node and must remain within 20m of your GPS position at all times.
                </p>
                <div className="mt-4 flex items-center justify-center gap-3">
                   <div className="px-3 py-1 bg-white rounded-full border border-slate-100 text-[9px] font-black text-slate-400">SYNC ACTIVE</div>
                   <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                </div>
            </footer>
        </div>
    );
};

export default MyStockBagPage;
