import React, { useEffect, useState, useCallback } from 'react';
import { Package, Inbox, TrendingUp, ShieldCheck } from 'lucide-react';
import { useStaffAuth } from '../context/StaffAuthContext';

const StaffStockBag = () => {
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
        // Poll every 30 seconds for admin updates
        const interval = setInterval(fetchBag, 30000);
        return () => clearInterval(interval);
    }, [fetchBag]);

    if (loading) {
        return (
            <div className="bg-white p-8 rounded-[2rem] border border-slate-100 animate-pulse min-h-[200px] flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Package className="text-slate-200 animate-bounce" size={40} />
                    <div className="h-2 w-24 bg-slate-100 rounded-full" />
                </div>
            </div>
        );
    }

    return (
        <section className="relative overflow-hidden bg-white p-6 lg:p-8 rounded-[2rem] border border-slate-200 shadow-sm">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-sm lg:text-base font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                        <Package className="text-blue-600" size={20} /> My Stock Bag
                    </h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Assets assigned to you</p>
                </div>
                <div className="bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                    <span className="text-[10px] font-black text-blue-600 uppercase">Live Inventory</span>
                </div>
            </div>

            {myStock.length === 0 ? (
                <div className="py-10 flex flex-col items-center justify-center text-center">
                    <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-300 mb-4">
                        <Inbox size={32} />
                    </div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-tight">Your bag is empty</p>
                    <p className="text-[10px] text-slate-300 mt-1 max-w-[200px] uppercase font-black">Admin has not issued any hardware to you yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {myStock.map((item) => (
                        <div key={item._id} className="group relative bg-slate-50 hover:bg-blue-50/50 p-4 rounded-2xl border border-slate-100 hover:border-blue-200 transition-all cursor-default">
                            <div className="flex justify-between items-start mb-3">
                                <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                    <TrendingUp size={20} />
                                </div>
                                <div className="text-right">
                                    <p className="text-[9px] font-black text-slate-400 uppercase">Quantity</p>
                                    <p className="text-xl font-black text-slate-900 leading-none">{item.balanceQuantity}</p>
                                </div>
                            </div>
                            <h4 className="text-xs font-black text-slate-800 uppercase tracking-tight mb-1">{item.itemName}</h4>
                            <div className="flex items-center gap-1.5 text-[9px] font-black text-emerald-500 uppercase">
                                <ShieldCheck size={10} /> Verified Possession
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none">Last Audit: {new Date().toLocaleDateString('en-IN')}</span>
                </div>
                <p className="text-[9px] font-black text-blue-500/50 uppercase italic">Pradeep Enterprises Fleet Tracking</p>
            </div>
        </section>
    );
};

export default StaffStockBag;
