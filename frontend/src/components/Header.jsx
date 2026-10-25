import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Bell, LogOut, Menu, Phone, ArrowLeftRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const TITLES = {
  '/': ['Operations Overview', 'Monitor staff, jobs, finance and field activity from one control room.'],
  '/team': ['Staff Management', 'Manage staff profiles, access, salary and account status.'],
  '/tasks': ['Task Board', 'Track active jobs, assignments and field execution in real time.'],
  '/attendance': ['Attendance Control', 'Review daily check-ins, timing and map verification.'],
  '/performance': ['Performance Analytics', 'Compare trends, attendance and financial output by staff member.'],
  '/inventory': ['Inventory Control', 'Keep equipment, quantities and reorder thresholds in sync.'],
  '/transactions': ['Financial Registry', 'Track salary, advances and collections with clean records.'],
};

const Header = ({ onMenuClick, user, logout, titles }) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const currentTitles = titles || TITLES;
  const titleData = currentTitles[pathname] || currentTitles['/'] || ['Operations', 'Command Center'];
  const title = titleData[0];
  const subtitle = titleData[1];

  const isStaffPortal = pathname.startsWith('/staff');

  const handlePortalSwitch = () => {
    if (isStaffPortal) {
      navigate('/');
    } else {
      navigate('/staff');
    }
  };

  return (
    <header className="h-16 lg:h-20 bg-white/80 backdrop-blur-md border-b border-slate-200 sticky top-0 z-[100] px-4 lg:px-8 flex items-center justify-between">
      <div className="flex items-center gap-3 lg:gap-4 overflow-hidden">
        <button 
          onClick={onMenuClick} 
          className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
        >
          <Menu size={24} />
        </button>
        
        <div className="flex flex-col overflow-hidden">
          <h1 className="text-base lg:text-xl font-black text-slate-900 truncate tracking-tight uppercase">
            {title}
          </h1>
          <p className="hidden md:block text-[10px] lg:text-xs text-slate-500 font-bold uppercase tracking-widest truncate mt-0.5">
            {subtitle}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 lg:gap-3 ml-4">
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-full border border-slate-200 text-[10px] font-black uppercase text-slate-500 tracking-wider">
          <Phone size={12} className="text-blue-600" />
          7010425239 | 9384424111
        </div>
        
        {/* ── PORTAL SWITCHER ── */}
        <button
          onClick={handlePortalSwitch}
          title={isStaffPortal ? 'Switch to Admin Portal' : 'Switch to Staff Portal'}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-wider transition-all duration-200 hover:scale-105 active:scale-95 whitespace-nowrap ${
            isStaffPortal
              ? 'bg-blue-600 text-white border-blue-700 hover:bg-blue-700 shadow-md shadow-blue-500/30'
              : 'bg-teal-600 text-white border-teal-700 hover:bg-teal-700 shadow-md shadow-teal-500/30'
          }`}
        >
          <ArrowLeftRight size={12} />
          <span className="hidden sm:inline">
            {isStaffPortal ? 'Admin Portal' : 'Staff Portal'}
          </span>
          <span className="sm:hidden">Switch</span>
        </button>

        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 rounded-full border border-blue-100 text-[10px] font-black uppercase text-blue-700 tracking-wider whitespace-nowrap">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
          {user?.name || 'User'}
        </div>

        {logout && (
          <button 
            onClick={logout} 
            className="p-2 lg:px-4 lg:py-2 text-red-600 lg:bg-red-50 hover:bg-red-100 rounded-xl border border-transparent lg:border-red-100 transition-all font-bold flex items-center gap-2"
            aria-label="Logout"
          >
            <LogOut size={18} />
            <span className="hidden lg:inline text-xs mt-0.5 uppercase tracking-wider">Sign Out</span>
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
