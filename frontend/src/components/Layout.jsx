import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import {
  BadgeIndianRupee,
  BarChart3,
  Calendar,
  CheckSquare,
  LayoutDashboard,
  MessageSquare,
  Package,
  Users,
  Navigation
} from 'lucide-react';
import Header from './Header';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/communication', label: 'Hub', icon: MessageSquare },
  { to: '/team', label: 'Staff', icon: Users },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/attendance', label: 'Attendance', icon: Calendar },
  { to: '/performance', label: 'Stats', icon: BarChart3 },
  { to: '/inventory', label: 'Stock', icon: Package },
  { to: '/staff-holdings', label: 'Holdings', icon: Users },
  { to: '/transactions', label: 'Finance', icon: BadgeIndianRupee },
  { to: '/tracking', label: 'Tracking', icon: Navigation },
];

const MOBILE_NAV = [
  { to: '/', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/tasks', label: 'Tasks', icon: CheckSquare },
  { to: '/attendance', label: 'Attendance', icon: Calendar },
  { to: '/communication', label: 'Hub', icon: MessageSquare },
  { to: '/team', label: 'Staff', icon: Users },
];

const Layout = () => {
  const { user, logout } = useAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-shell h-screen overflow-hidden bg-slate-50 font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        navItems={NAV}
        brandTitle="Pradeep Enterprises"
        brandSubtitle="Command Center"
        onLogout={logout}
        footerContent={(
          <div className="p-4 bg-blue-600/10 rounded-2xl border border-blue-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-2">System Status</p>
            <p className="text-xs font-bold text-slate-300 leading-relaxed">Admin nodes active. Field data syncing in real-time.</p>
          </div>
        )}
      />

      <div className="shell-main flex flex-col min-w-0">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          user={user}
          logout={logout}
        />
        <main className="shell-content flex-1">
          <Outlet />
        </main>
        <MobileNav navItems={MOBILE_NAV} />
      </div>
    </div>
  );
};

export default Layout;
