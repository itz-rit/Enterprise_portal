import React from 'react';
import { NavLink } from 'react-router-dom';
import { LogOut } from 'lucide-react';

const Sidebar = ({ isOpen, onClose, navItems, brandTitle, brandSubtitle, footerContent, onLogout }) => {
  return (
    <>
      {/* Overlay for mobile */}
      <div 
        className={`fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-[1500] transition-opacity duration-300 lg:hidden ${
          isOpen ? 'opacity-100 visible' : 'opacity-0 invisible'
        }`} 
        onClick={onClose}
      />
      
      {/* Sidebar Content */}
      <aside className={`fixed top-0 left-0 h-full w-[280px] bg-slate-950 text-slate-200 z-[2000] transition-transform duration-300 ease-in-out lg:translate-x-0 lg:sticky lg:h-screen lg:z-10 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="p-6 flex flex-col h-full bg-gradient-to-b from-slate-950 to-slate-900">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 flex items-center justify-center flex-shrink-0">
              <img 
                src="/logoPE.jpeg" 
                alt="Pradeep Enterprises Logo" 
                className="w-full h-full object-contain rounded-full shadow-[0_0_8px_rgba(212,160,23,0.4)]"
              />
            </div>
            <div>
              <h1 className="text-sm font-black text-white leading-tight uppercase tracking-tight">{brandTitle}</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{brandSubtitle}</p>
            </div>
          </div>

          <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-600 mb-4 px-2">Navigation</div>
          <nav className="flex flex-col gap-1 flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink 
                  key={item.to} 
                  to={item.to} 
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-4 py-3 rounded-xl font-semibold transition-all duration-200 group ${
                      isActive 
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20 active-nav-item' 
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                    }`
                  }
                >
                  <Icon size={20} className={`flex-shrink-0 ${isOpen ? 'animate-in fade-in zoom-in duration-300' : ''}`} />
                  <span className="text-sm truncate flex-1 whitespace-nowrap">{item.label}</span>
                </NavLink>
              );
            })}
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-800/50">
            {footerContent}
            {onLogout && (
              <button 
                onClick={onLogout}
                className="w-full mt-4 flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-800/50 text-slate-200 font-semibold hover:bg-red-500/10 hover:text-red-500 transition-all duration-200"
              >
                <LogOut size={20} className="flex-shrink-0" />
                <span className="text-sm truncate">Logout</span>
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
