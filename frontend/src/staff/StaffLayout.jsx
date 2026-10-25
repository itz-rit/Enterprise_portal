import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Calendar, CheckCircle, Home, MessageSquare, User, CreditCard } from 'lucide-react';
import { useStaffAuth } from '../context/StaffAuthContext';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import MobileNav from '../components/MobileNav';
import { Package } from 'lucide-react';
import useTracking from '../services/useTracking';

const NAV = [
  { to: '/staff', label: 'Dashboard', icon: Home, end: true },
  { to: '/staff/communication', label: 'Hub', icon: MessageSquare },
  { to: '/staff/tasks', label: 'Tasks', icon: CheckCircle },
  { to: '/staff/attendance', label: 'Presence', icon: Calendar },
  { to: '/staff/payments', label: 'Payments', icon: CreditCard },
  { to: '/staff/bag', label: 'My Bag', icon: Package },
  { to: '/staff/profile', label: 'Profile', icon: User },
];

const MOBILE_NAV = [
  { to: '/staff', label: 'Dashboard', icon: Home, end: true },
  { to: '/staff/tasks', label: 'Tasks', icon: CheckCircle },
  { to: '/staff/payments', label: 'Payments', icon: CreditCard },
  { to: '/staff/attendance', label: 'Presence', icon: Calendar },
  { to: '/staff/profile', label: 'Profile', icon: User },
];

const TITLES = {
  '/staff': ['Field Dashboard', 'Track your jobs, attendance and earnings.'],
  '/staff/communication': ['Field Hub', "Check rewards, tasks, and announcements."],
  '/staff/tasks': ['Task Updates', 'Move assigned jobs forward and report progress.'],
  '/staff/attendance': ['Daily Check-In', 'Mark verified presence before your shift.'],
  '/staff/payments': ['Collection Node', 'Show this QR to clients for instant UPI payment.'],
  '/staff/bag': ['My Resource Bag', 'Hardware and assets in your current possession.'],
  '/staff/profile': ['My Profile', 'Review salary and account details.'],
};

const StaffLayout = () => {
  const { staffUser, logout } = useStaffAuth();
  const [isSidebarOpen, setSidebarOpen] = useState(false);

  // Initialize background live tracking (will only run if checked in)
  useTracking();

  return (
    <div className="app-shell staff-shell min-h-screen bg-slate-50 font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        navItems={NAV}
        brandTitle="Staff Portal"
        brandSubtitle="Field Workspace"
        footerContent={(
          <div className="p-4 bg-teal-600/10 rounded-2xl border border-teal-500/20">
            <p className="text-[10px] font-black uppercase tracking-widest text-teal-600 mb-2">Staff Session</p>
            <p className="text-xs font-bold text-slate-400 leading-relaxed">{staffUser?.name}</p>
          </div>
        )}
        onLogout={logout}
      />

      <div className="shell-main flex flex-col min-w-0">
        <Header 
          onMenuClick={() => setSidebarOpen(true)} 
          user={staffUser}
          logout={logout}
          titles={TITLES}
        />
        <main className="shell-content flex-1">
          <Outlet />
        </main>
        <MobileNav navItems={MOBILE_NAV} />
      </div>
    </div>
  );
};

export default StaffLayout;
