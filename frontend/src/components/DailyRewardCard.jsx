import React, { useState, useEffect } from 'react';
import { Award } from 'lucide-react';
import communiService from '../config/communiService';

const DailyRewardCard = () => {
  const [reward, setReward] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReward = async () => {
      try {
        const data = await communiService.getTodayReward().catch(() => null);
        setReward(data);
      } catch (err) {
        console.error("Error fetching today's reward", err);
      } finally {
        setLoading(false);
      }
    };
    fetchReward();
  }, []);

  if (loading && !reward) {
    return (
      <div className="h-32 bg-slate-50 rounded-[2rem] border border-slate-200 animate-pulse" />
    );
  }

  if (!reward) return null;

  return (
    <section className="relative overflow-hidden p-6 lg:p-8 rounded-[2rem] bg-gradient-to-br from-amber-500 via-orange-600 to-yellow-700 text-white shadow-xl shadow-orange-500/20 transition-all hover:shadow-2xl hover:shadow-orange-500/30">
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm border border-white/20">
            <Award size={20} className="text-white" />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-orange-100 italic">Daily Achievement Goal</h3>
        </div>
        <h2 className="text-2xl lg:text-3xl font-black uppercase tracking-tight mb-2">
          Today's Reward: <span className="text-yellow-200">{reward.title}</span>
        </h2>
        <p className="text-sm lg:text-base font-medium text-orange-50 leading-relaxed max-w-2xl">
          {reward.description}
        </p>
      </div>
      {/* Decorative elements */}
      <div className="absolute -right-12 -top-12 w-48 h-48 bg-white/10 rounded-full blur-3xl opacity-50" />
      <div className="absolute right-8 bottom-8 opacity-20 transform rotate-12 transition-transform hover:rotate-6">
        <Award size={120} />
      </div>
    </section>
  );
};

export default DailyRewardCard;
