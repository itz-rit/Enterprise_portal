import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { installMockInterceptor } from './config/mockApi.js'
import { MOCK_USERS, MOCK_STAFF_PROFILE } from './config/mockData.js'

// ── DEMO MODE: Install mock API + seed auth sessions ─────────────────────────
installMockInterceptor();

// Seed admin session (so AdminRoute context has a user)
const adminUser = MOCK_USERS.find(u => u.role === 'Admin');
if (adminUser && !localStorage.getItem('fsm_user')) {
  localStorage.setItem('fsm_user', JSON.stringify({ ...adminUser, token: 'demo_token_admin_001' }));
}

// Seed staff session (so StaffRoute context has a staffUser)
if (!localStorage.getItem('fsm_staff')) {
  localStorage.setItem('fsm_staff', JSON.stringify({ ...MOCK_STAFF_PROFILE, token: 'demo_token_staff_001' }));
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
