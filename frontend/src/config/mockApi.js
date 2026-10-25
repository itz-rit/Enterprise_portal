// ─────────────────────────────────────────────────────────────────────────────
// PRADEEP ENTERPRISES — MOCK API INTERCEPTOR
// Intercepts all axios calls and returns sample data (no backend needed)
// ─────────────────────────────────────────────────────────────────────────────
import axios from 'axios';
import {
  MOCK_USERS,
  MOCK_TASKS,
  MOCK_ATTENDANCE,
  MOCK_TRANSACTIONS,
  MOCK_INVENTORY,
  MOCK_STAFF_STOCK_SUMMARY,
  MOCK_TODAY_SUMMARY,
  MOCK_STAFF_PROFILE,
  MOCK_STAFF_TASKS,
  MOCK_STAFF_ATTENDANCE,
  MOCK_STAFF_TRANSACTIONS,
  MOCK_STOCK_BAGS,
  MOCK_STAFF_HOLDINGS,
  MOCK_LOCATIONS,
} from './mockData';

const delay = (ms = 350) => new Promise((res) => setTimeout(res, ms));

const mockResponse = (data) => ({ data, status: 200, statusText: 'OK', headers: {}, config: {} });

// ── ROUTE MATCHER ─────────────────────────────────────────────────────────────
const match = (url = '', ...patterns) =>
  patterns.some((p) => (typeof p === 'string' ? url.includes(p) : p.test(url)));

// ── MOCK HANDLER ──────────────────────────────────────────────────────────────
const handleMock = async (config) => {
  await delay();
  const url = config.url || '';
  const method = (config.method || 'get').toLowerCase();

  // ── AUTH ───────────────────────────────────────────────────────────────────
  if (match(url, '/auth/login')) {
    const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
    const phone = body.phone;
    const user = MOCK_USERS.find((u) => u.phone === phone);
    if (!user) throw { response: { data: { message: 'User not found' }, status: 401 } };
    return mockResponse({ ...user, token: `demo_token_${user._id}` });
  }

  // ── ADMIN USERS ────────────────────────────────────────────────────────────
  if (match(url, '/api/admin/users')) {
    return mockResponse(MOCK_USERS);
  }

  // ── ADMIN TASKS ────────────────────────────────────────────────────────────
  if (match(url, '/api/admin/tasks')) {
    const pending   = MOCK_TASKS.filter(t => t.status === 'Pending').length;
    const completed = MOCK_TASKS.filter(t => t.status === 'Completed').length;
    return mockResponse({
      tasks: MOCK_TASKS,
      totalTasks: MOCK_TASKS.length,
      pendingTasks: pending,
      completedTasks: completed,
    });
  }

  // ── INDIVIDUAL TASK ────────────────────────────────────────────────────────
  if (match(url, '/api/admin/task/')) {
    const id = url.split('/').pop();
    const task = MOCK_TASKS.find(t => t._id === id) || MOCK_TASKS[0];
    if (method === 'put' || method === 'patch') return mockResponse({ ...task, status: 'Completed' });
    if (method === 'delete') return mockResponse({ message: 'Task deleted' });
    return mockResponse(task);
  }

  // ── ADMIN ATTENDANCE ───────────────────────────────────────────────────────
  if (match(url, '/api/admin/attendance/today-summary')) {
    return mockResponse(MOCK_TODAY_SUMMARY);
  }
  if (match(url, '/api/admin/attendance')) {
    return mockResponse(MOCK_ATTENDANCE);
  }

  // ── ADMIN TRANSACTIONS ─────────────────────────────────────────────────────
  if (match(url, '/api/admin/transactions')) {
    if (method === 'post') {
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
      return mockResponse({ _id: `txn_new_${Date.now()}`, ...body, createdAt: new Date().toISOString() });
    }
    return mockResponse(MOCK_TRANSACTIONS);
  }

  // ── ADMIN INVENTORY ────────────────────────────────────────────────────────
  if (match(url, '/api/admin/inventory', '/api/inventory')) {
    if (method === 'post') {
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
      return mockResponse({ _id: `inv_new_${Date.now()}`, ...body, updatedAt: new Date().toISOString() });
    }
    if (method === 'put' || method === 'patch') {
      return mockResponse({ message: 'Updated' });
    }
    if (method === 'delete') return mockResponse({ message: 'Deleted' });
    return mockResponse(MOCK_INVENTORY);
  }

  // ── ADMIN PERFORMANCE ──────────────────────────────────────────────────────
  if (match(url, '/api/admin/performance', '/api/performance')) {
    const perfData = MOCK_USERS.filter(u => u.role === 'Staff').map(u => ({
      _id: u._id,
      staffId: { _id: u._id, name: u.name },
      name: u.name,
      area: u.area,
      tasksCompleted: Math.floor(Math.random() * 20) + 10,
      attendancePercent: Math.floor(Math.random() * 20) + 78,
      totalTasks: Math.floor(Math.random() * 30) + 15,
      pendingTasks: Math.floor(Math.random() * 5),
      rating: (Math.random() * 2 + 3).toFixed(1),
    }));
    return mockResponse(perfData);
  }

  // ── STAFF STOCK SUMMARY ────────────────────────────────────────────────────
  if (match(url, '/api/v1/staff-stock/summary')) {
    return mockResponse(MOCK_STAFF_STOCK_SUMMARY);
  }
  if (match(url, '/api/v1/staff-stock')) {
    return mockResponse(MOCK_STOCK_BAGS);
  }

  // ── STAFF HOLDINGS ─────────────────────────────────────────────────────────
  if (match(url, '/api/admin/staff-holdings', '/api/staff-holdings')) {
    return mockResponse(MOCK_STAFF_HOLDINGS);
  }

  // ── STAFF TRACKING / LOCATION ──────────────────────────────────────────────
  if (match(url, '/api/admin/tracking', '/api/tracking', '/api/location')) {
    return mockResponse(MOCK_LOCATIONS);
  }

  // ── STAFF PROFILE ──────────────────────────────────────────────────────────
  if (match(url, '/api/staff/profile')) {
    if (method === 'put' || method === 'patch') {
      return mockResponse({ ...MOCK_STAFF_PROFILE, ...JSON.parse(config.data || '{}') });
    }
    return mockResponse(MOCK_STAFF_PROFILE);
  }

  // ── STAFF TASKS ────────────────────────────────────────────────────────────
  if (match(url, '/api/staff/tasks')) {
    if (method === 'put' || method === 'patch') {
      const body = typeof config.data === 'string' ? JSON.parse(config.data) : config.data || {};
      return mockResponse({ message: 'Task updated', ...body });
    }
    return mockResponse(MOCK_STAFF_TASKS);
  }

  // ── STAFF ATTENDANCE ───────────────────────────────────────────────────────
  if (match(url, '/api/staff/attendance')) {
    if (method === 'post') {
      return mockResponse({ _id: `att_new_${Date.now()}`, userId: MOCK_STAFF_PROFILE._id, status: 'Present', createdAt: new Date().toISOString() });
    }
    return mockResponse(MOCK_STAFF_ATTENDANCE);
  }

  // ── STAFF TRANSACTIONS ─────────────────────────────────────────────────────
  if (match(url, '/api/staff/transactions')) {
    return mockResponse(MOCK_STAFF_TRANSACTIONS);
  }

  // ── STAFF PAYMENTS ─────────────────────────────────────────────────────────
  if (match(url, '/api/staff/payments')) {
    return mockResponse(MOCK_STAFF_TRANSACTIONS);
  }

  // ── COMMUNICATION / MESSAGES ───────────────────────────────────────────────
  if (match(url, '/api/communication', '/api/messages', '/api/comm')) {
    if (method === 'post') return mockResponse({ _id: `msg_${Date.now()}`, message: 'Message sent' });
    return mockResponse([
      { _id: 'msg_001', from: 'Pradeep Admin', text: 'Good morning team! Today\'s targets updated.',  createdAt: new Date(Date.now() - 3600000).toISOString() },
      { _id: 'msg_002', from: 'Ravi Kumar',    text: 'Reached Sri Lakshmi Traders. Starting work.',   createdAt: new Date(Date.now() - 1800000).toISOString() },
      { _id: 'msg_003', from: 'Pradeep Admin', text: 'Suresh - please confirm Harur visit by 3PM.',   createdAt: new Date(Date.now() - 900000).toISOString()  },
      { _id: 'msg_004', from: 'Meena Devi',    text: 'Krishna Rice Mills job completed successfully!', createdAt: new Date(Date.now() - 300000).toISOString()  },
    ]);
  }

  // ── QR CODE ────────────────────────────────────────────────────────────────
  if (match(url, '/api/admin/qr', '/api/qr')) {
    return mockResponse({ qrCode: null, message: 'QR not available in demo mode' });
  }

  // ── DAILY REWARD ───────────────────────────────────────────────────────────
  if (match(url, '/api/reward', '/api/daily-reward')) {
    return mockResponse({ reward: 50, streak: 5, message: '5-day streak!' });
  }

  // ── FALLBACK ───────────────────────────────────────────────────────────────
  console.warn('[MOCK API] Unhandled route:', method.toUpperCase(), url);
  return mockResponse({ message: 'Demo mode — endpoint not mocked', url });
};

// ── INSTALL INTERCEPTOR ───────────────────────────────────────────────────────
export const installMockInterceptor = () => {
  axios.interceptors.request.use(async (config) => {
    // Intercept and short-circuit with mock data
    const response = await handleMock(config);

    // Throw as an axios adapter response
    const err = new axios.Cancel('__MOCK_RESPONSE__');
    err.__mockResponse = response;
    throw err;
  });

  axios.interceptors.response.use(
    (res) => res,
    (err) => {
      if (err.__mockResponse) return Promise.resolve(err.__mockResponse);
      return Promise.reject(err);
    }
  );

  console.log('[MOCK API] Interceptor installed — running in demo mode 🎯');
};
