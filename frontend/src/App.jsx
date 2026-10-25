import React from 'react';
import './index.css';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { StaffAuthProvider, useStaffAuth } from './context/StaffAuthContext';

// Admin
import Login        from './pages/Login';
import Dashboard    from './pages/Dashboard';
import StaffMgmt    from './pages/StaffManagement';
import StaffDetail  from './pages/StaffDetail';
import TaskMgmt     from './pages/TaskManagement';
import Attendance   from './pages/AttendanceModule';
import Inventory    from './pages/InventoryModule';
import Finance      from './pages/TransactionModule';
import Performance  from './pages/PerformanceModule';
import Communication from './pages/Communication';
import StaffTracking  from './pages/StaffTracking';
import StaffHoldings  from './pages/StaffHoldings';
import AdminLayout  from './components/Layout';

// Staff
import StaffLogin      from './staff/StaffLogin';
import StaffLayout     from './staff/StaffLayout';
import StaffDashboard  from './staff/StaffDashboard';
import StaffTasks      from './staff/StaffTasks';
import StaffAttendance from './staff/StaffAttendance';
import StaffCommunication from './staff/StaffCommunication';
import StaffProfile    from './staff/StaffProfile';
import StaffPayments   from './staff/StaffPayments';
import MyStockBagPage  from './staff/MyStockBagPage';

const AdminRoute = ({ children }) => {
  return children;
};

const StaffRoute = ({ children }) => {
  return children;
};


import LocationTracker from './components/LocationTracker';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <StaffAuthProvider>
          <LocationTracker />
          <Routes>
            {/* Admin */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<AdminRoute><AdminLayout /></AdminRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="team"          element={<StaffMgmt />} />
              <Route path="team/:id"      element={<StaffDetail />} />
              <Route path="tasks"        element={<TaskMgmt />} />
              <Route path="attendance"   element={<Attendance />} />
              <Route path="performance"  element={<Performance />} />
              <Route path="inventory"    element={<Inventory />} />
              <Route path="transactions" element={<Finance />} />
              <Route path="communication" element={<Communication />} />
              <Route path="tracking"     element={<StaffTracking />} />
              <Route path="staff-holdings" element={<StaffHoldings />} />
            </Route>

            {/* Staff */}
            <Route path="/staff-login" element={<StaffLogin />} />
            <Route path="/staff" element={<StaffRoute><StaffLayout /></StaffRoute>}>
              <Route index element={<StaffDashboard />} />
              <Route path="tasks"      element={<StaffTasks />} />
              <Route path="attendance" element={<StaffAttendance />} />
              <Route path="communication" element={<StaffCommunication />} />
              <Route path="payments"   element={<StaffPayments />} />
              <Route path="profile"    element={<StaffProfile />} />
              <Route path="bag"        element={<MyStockBagPage />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </StaffAuthProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
