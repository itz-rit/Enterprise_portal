import React, { useEffect, useState, useCallback } from 'react';
import { useStaffAuth } from '../context/StaffAuthContext';
import { CreditCard, Smartphone, ShieldCheck, Info } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../config/api';

const StaffPayments = () => {
  const { api } = useStaffAuth();
  const [qrCode, setQrCode] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchQR = useCallback(async () => {
    try {
      const { data } = await api('get', '/api/v1/settings/qr');
      const url = data.qrCodeUrl || data.imageUrl;
      if (url) setQrCode(url);
    } catch (err) {
      console.error('Failed to fetch QR');
    } finally {
      setLoading(false);
    }
  }, [api]);

  useEffect(() => {
    fetchQR();
  }, [fetchQR]);

  return (
    <div className="p-6 md:p-10 max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Collection Point</h1>
        <p className="text-slate-500 font-medium italic">Authorized digital payment receiver for Pradeep Enterprises</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-[2.5rem] p-20 border border-slate-100 flex items-center justify-center">
          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : qrCode ? (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white rounded-[3rem] p-10 border border-slate-100 shadow-xl shadow-blue-100/50 flex flex-col items-center"
        >
          <div className="w-full aspect-square max-w-[320px] bg-slate-50 rounded-[2rem] border-4 border-blue-50 p-6 flex items-center justify-center overflow-hidden mb-8 shadow-inner">
             <img 
               src={qrCode} 
               alt="GPay / PhonePe QR" 
               className="w-full h-full object-contain"
               onError={(e) => {
                 console.error('❌ Staff QR Render Failed for URL:', qrCode);
                 e.target.style.display = 'none';
               }}
             />
          </div>

          <div className="text-center space-y-6 w-full">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Scan to Pay via</p>
              <div className="flex items-center justify-center gap-4 text-slate-900 font-black">
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full text-xs">GPAY</span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full text-xs">PHONEPE</span>
                <span className="flex items-center gap-1.5 bg-slate-50 px-3 py-1 rounded-full text-xs">ANY UPI</span>
              </div>
            </div>

            <div className="bg-blue-600 text-white rounded-2xl p-4 flex items-center gap-4 text-left shadow-lg shadow-blue-200">
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
                <Smartphone size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest opacity-80">Instructions</p>
                <p className="text-xs font-bold">Show this QR to the client. After payment, verify the receipt on their phone before closing the task.</p>
              </div>
            </div>

            <div className="flex items-center justify-center gap-2 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 py-2 rounded-full border border-emerald-100">
              <ShieldCheck size={12} /> SECURE CORPORATE CHANNEL
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="bg-white rounded-[2.5rem] p-20 border border-dashed border-slate-200 text-center space-y-4">
          <Info size={40} className="text-slate-200 mx-auto" />
          <p className="text-slate-400 font-bold">No Payment QR configured by Admin yet.</p>
        </div>
      )}
      
      <div className="text-center px-10">
        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.3em] leading-relaxed">
          Proprietary Fiscal Interface of Pradeep Enterprises © 2024
        </p>
      </div>
    </div>
  );
};

export default StaffPayments;
