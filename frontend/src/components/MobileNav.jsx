import React from 'react';
import { NavLink } from 'react-router-dom';

const MobileNav = ({ navItems }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-16 bg-white border-t border-slate-200 flex items-center justify-around z-[1000] lg:hidden px-2 rounded-t-2xl shadow-lg">
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            className={({ isActive }) => 
              `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors ${
                isActive ? 'text-blue-600' : 'text-slate-500 hover:text-slate-700'
              }`
            }
          >
            <Icon size={20} className="stroke-[2.5px]" />
            <span className="text-[10px] font-bold uppercase tracking-wider">{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
};

export default MobileNav;
